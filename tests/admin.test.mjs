import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { verifierAcces } = require('../apps-script/admin.js');

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
