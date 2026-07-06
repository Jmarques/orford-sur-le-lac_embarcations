import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// site/grille.js est la copie navigateur du module apps-script/grille.js
// (pas de build — décision 0004 ; un seul foyer de code — décision 0009).
// `npm run copie-grille` la régénère ; ce test échoue si elles divergent.
test('site/grille.js est la copie exacte de apps-script/grille.js (npm run copie-grille)', async () => {
  const source = await readFile(new URL('../apps-script/grille.js', import.meta.url), 'utf8');
  const copie = await readFile(new URL('../site/grille.js', import.meta.url), 'utf8');
  assert.equal(copie, source, 'Copie désynchronisée — exécuter `npm run copie-grille`.');
});
