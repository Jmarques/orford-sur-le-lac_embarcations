import { test } from 'node:test';
import assert from 'node:assert/strict';

import { urlDeScenario } from '../tools/captures.mjs';

test("l'URL d'un scénario sans état forcé est la page nue", () => {
  assert.equal(
    urlDeScenario('http://localhost:8907', { page: 'index.html' }),
    'http://localhost:8907/index.html',
  );
});

test("l'URL d'un scénario avec état forcé porte le hook ?etat=", () => {
  assert.equal(
    urlDeScenario('http://localhost:8907', { page: 'index.html', etat: 'succes' }),
    'http://localhost:8907/index.html?etat=succes',
  );
});
