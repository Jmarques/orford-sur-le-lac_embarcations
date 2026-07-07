import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { creerClient, interpreterReponse, ErreurApi } = require('../site/client.js');

// --- interpreterReponse : pur, testable sans fetch (le cœur dupliqué 5×) ---

test('une réponse ok renvoie le payload tel quel', () => {
  const payload = { ok: true, structures: [{ id: 'A' }], config: { rues: ['x'] } };
  assert.equal(interpreterReponse(payload), payload);
});

test('une session expirée (code accesRefuse) renvoie la sentinelle, sans lever', () => {
  const resultat = interpreterReponse({ ok: false, code: 'accesRefuse', erreur: 'Accès refusé.' });
  assert.deepEqual(resultat, { accesRefuse: true });
});

test('un refus métier lève ErreurApi en portant le message montrable', () => {
  assert.throws(
    () => interpreterReponse({ ok: false, erreur: 'Hors quota : le quota de 2 est atteint.' }),
    (erreur) => erreur instanceof ErreurApi && erreur.message === 'Hors quota : le quota de 2 est atteint.',
  );
});

test('une réponse vide ou malformée lève ErreurApi avec un message de repli', () => {
  assert.throws(() => interpreterReponse(undefined), (e) => e instanceof ErreurApi && e.message.length > 0);
  assert.throws(() => interpreterReponse({}), (e) => e instanceof ErreurApi && e.message.length > 0);
  assert.throws(() => interpreterReponse({ ok: false }), (e) => e instanceof ErreurApi && e.message.length > 0);
});

// --- poster / obtenir : fetch injecté (le seul seam) ---

// Un faux fetch qui capture son appel et renvoie une enveloppe donnée.
function fauxFetch(enveloppe) {
  const appels = [];
  const fetch = async (url, options) => {
    appels.push({ url, options });
    return { json: async () => enveloppe };
  };
  return { fetch, appels };
}

const API = 'https://exemple.test/exec';

test('poster fait un POST sur apiUrl avec action, champs et le mot de passe du getter dans le corps', async () => {
  const { fetch, appels } = fauxFetch({ ok: true });
  const client = creerClient({ fetch, apiUrl: API, motDePasse: () => 'secret-comité' });

  await client.poster({ action: 'libererEmplacement', numero: 12 });

  assert.equal(appels.length, 1);
  assert.equal(appels[0].url, API);
  assert.equal(appels[0].options.method, 'POST');
  const corps = JSON.parse(appels[0].options.body);
  assert.deepEqual(corps, { action: 'libererEmplacement', numero: 12, motDePasse: 'secret-comité' });
});

test('le getter mot de passe est lu frais à chaque appel (session qui change)', async () => {
  const { fetch, appels } = fauxFetch({ ok: true });
  let motDePasse = 'avant';
  const client = creerClient({ fetch, apiUrl: API, motDePasse: () => motDePasse });

  await client.poster({ action: 'inventaire' });
  motDePasse = 'après';
  await client.poster({ action: 'inventaire' });

  assert.equal(JSON.parse(appels[0].options.body).motDePasse, 'avant');
  assert.equal(JSON.parse(appels[1].options.body).motDePasse, 'après');
});

test('sans getter mot de passe (formulaire public), le corps ne porte aucun motDePasse', async () => {
  const { fetch, appels } = fauxFetch({ ok: true, id: 'nouvel-id' });
  const client = creerClient({ fetch, apiUrl: API });

  const resultat = await client.poster({ rue: 'Rue du Lac', numero: 42, type: 'Kayak' });

  const corps = JSON.parse(appels[0].options.body);
  assert.equal('motDePasse' in corps, false);
  assert.equal(resultat.id, 'nouvel-id');
});

test('obtenir fait un GET sur apiUrl?action=… sans mot de passe', async () => {
  const { fetch, appels } = fauxFetch({ ok: true, config: { rues: [], types: [] } });
  const client = creerClient({ fetch, apiUrl: API, motDePasse: () => 'secret' });

  await client.obtenir('config');

  assert.equal(appels[0].url, API + '?action=config');
  // GET : pas de method POST, pas de corps, donc pas de mot de passe.
  assert.notEqual((appels[0].options && appels[0].options.method) || 'GET', 'POST');
  assert.equal(appels[0].options && appels[0].options.body, undefined);
});

test('poster propage la normalisation : accesRefuse → sentinelle, refus métier → ErreurApi', async () => {
  const refuse = creerClient({ fetch: fauxFetch({ ok: false, code: 'accesRefuse' }).fetch, apiUrl: API, motDePasse: () => 'x' });
  assert.deepEqual(await refuse.poster({ action: 'inventaire' }), { accesRefuse: true });

  const metier = creerClient({ fetch: fauxFetch({ ok: false, erreur: 'déjà attribué' }).fetch, apiUrl: API, motDePasse: () => 'x' });
  await assert.rejects(() => metier.poster({ action: 'deciderDemande' }), (e) => e instanceof ErreurApi && e.message === 'déjà attribué');
});

test('une erreur technique (fetch qui rejette) se propage sans devenir une ErreurApi', async () => {
  const fetch = async () => { throw new TypeError('Failed to fetch'); };
  const client = creerClient({ fetch, apiUrl: API, motDePasse: () => 'x' });
  await assert.rejects(() => client.poster({ action: 'inventaire' }), (e) => e instanceof TypeError && !(e instanceof ErreurApi));
});
