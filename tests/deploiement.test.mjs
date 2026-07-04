import { test } from 'node:test';
import assert from 'node:assert/strict';

import { empreinteDeContenus, mettreAJourApiUrl } from '../tools/deploiement.mjs';

const CONFIG_EXEMPLE = `// GÉNÉRÉ par deploy — ne pas éditer l'URL à la main.
window.OSL_CONFIG = {
  apiUrl: 'https://script.google.com/macros/s/ANCIEN_ID/exec',
  courrielComite: 'comite@exemple.ca',
};
`;

test("mettreAJourApiUrl remplace l'URL de l'API sans toucher au reste du fichier", () => {
  const resultat = mettreAJourApiUrl(CONFIG_EXEMPLE, 'NOUVEL_ID');
  assert.match(resultat, /apiUrl: 'https:\/\/script\.google\.com\/macros\/s\/NOUVEL_ID\/exec'/);
  assert.match(resultat, /courrielComite: 'comite@exemple\.ca'/);
});

test('mettreAJourApiUrl est idempotente quand l\'ID est déjà le bon', () => {
  const deja = mettreAJourApiUrl(CONFIG_EXEMPLE, 'ANCIEN_ID');
  assert.equal(deja, CONFIG_EXEMPLE);
});

test('mettreAJourApiUrl échoue clairement si la ligne apiUrl est introuvable', () => {
  assert.throws(() => mettreAJourApiUrl('window.AUTRE = {};', 'ID'), /apiUrl/);
});

test("l'empreinte est stable et insensible à l'ordre des fichiers", () => {
  const a = empreinteDeContenus([
    { chemin: 'Code.js', contenu: 'function doGet() {}' },
    { chemin: 'sheets.js', contenu: 'var X = 1;' },
  ]);
  const b = empreinteDeContenus([
    { chemin: 'sheets.js', contenu: 'var X = 1;' },
    { chemin: 'Code.js', contenu: 'function doGet() {}' },
  ]);
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{64}$/);
});

test("l'empreinte change quand un contenu change", () => {
  const avant = empreinteDeContenus([{ chemin: 'Code.js', contenu: 'v1' }]);
  const apres = empreinteDeContenus([{ chemin: 'Code.js', contenu: 'v2' }]);
  assert.notEqual(avant, apres);
});
