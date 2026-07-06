import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { verifierAcces, trierDemandes } = require('../apps-script/admin.js');

test('un mot de passe erroné est rejeté sans détailler la cause', () => {
  assert.throws(() => verifierAcces({ motDePasse: 'mauvais' }, 'secret'), /mot de passe/i);
});

test('le bon mot de passe donne accès sans bruit', () => {
  assert.doesNotThrow(() => verifierAcces({ motDePasse: 'secret' }, 'secret'));
});

test('une Sheet sans mot de passe configuré crashe en nommant le problème, jamais un accès accordé', () => {
  for (const nonConfigure of ['', '   ', undefined]) {
    assert.throws(
      () => verifierAcces({ motDePasse: '' }, nonConfigure),
      /motDePasseComite/,
      `motDePasseAttendu=${JSON.stringify(nonConfigure)} aurait dû crasher`,
    );
  }
});

test('le refus d\'accès porte le nom ErreurAcces, distinguable d\'une erreur quelconque', () => {
  try {
    verifierAcces({ motDePasse: 'mauvais' }, 'secret');
    assert.fail('aurait dû lancer');
  } catch (erreur) {
    assert.equal(erreur.name, 'ErreurAcces');
  }
});

test('les nouvelles demandes passent en premier (la plus ancienne en tête), les décidées suivent (la plus récente en tête)', () => {
  const demandes = [
    { id: 'refusee-recente', date: '2026-07-03T10:00:00.000Z', statut: 'refusée' },
    { id: 'nouvelle-recente', date: '2026-07-02T10:00:00.000Z', statut: 'nouvelle' },
    { id: 'acceptee-vieille', date: '2026-06-01T10:00:00.000Z', statut: 'acceptée' },
    { id: 'nouvelle-vieille', date: '2026-06-15T10:00:00.000Z', statut: 'nouvelle' },
  ];
  assert.deepEqual(trierDemandes(demandes).map((d) => d.id), [
    'nouvelle-vieille',
    'nouvelle-recente',
    'refusee-recente',
    'acceptee-vieille',
  ]);
});

test('le tri survit à des dates non converties (bug vu en prod : Date au lieu de chaîne ISO)', () => {
  const demandes = [
    { id: 'b', date: new Date('2026-07-02T10:00:00Z'), statut: 'nouvelle' },
    { id: 'a', date: new Date('2026-06-15T10:00:00Z'), statut: 'nouvelle' },
  ];
  assert.deepEqual(trierDemandes(demandes).map((d) => d.id), ['a', 'b']);
});
