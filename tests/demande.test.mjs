import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parseDemande } = require('../apps-script/demande.js');

// Les listes valides viennent de l'onglet Config de la Sheet (décision 0001).
const CONFIG = {
  rues: ['Rue du Pré', 'Rue des Érables'],
  types: ['Kayak', 'Canoë', 'Planche (SUP)'],
};

function payloadValide(surcharges = {}) {
  return {
    rue: 'Rue du Pré',
    numero: '234',
    nom: 'John Tremblay',
    courriel: 'john@example.com',
    type: 'Kayak',
    ...surcharges,
  };
}

test('un nom vide est rejeté en nommant le champ', () => {
  assert.throws(() => parseDemande(payloadValide({ nom: '  ' }), CONFIG), /nom/);
});

test('une rue vide est rejetée en nommant le champ', () => {
  assert.throws(() => parseDemande(payloadValide({ rue: '' }), CONFIG), /rue/);
});

test('un type vide est rejeté en nommant le champ', () => {
  assert.throws(() => parseDemande(payloadValide({ type: '' }), CONFIG), /type/);
});

test('un numéro civique invalide est rejeté en nommant le champ', () => {
  for (const numero of ['', 'abc', '0', '-5', '1000', '12.5']) {
    assert.throws(
      () => parseDemande(payloadValide({ numero }), CONFIG),
      /numero/,
      `numero=${JSON.stringify(numero)} aurait dû être rejeté`,
    );
  }
});

test('une rue hors de la liste de la communauté est rejetée', () => {
  assert.throws(() => parseDemande(payloadValide({ rue: 'Rue Inconnue' }), CONFIG), /rue/);
});

test('un type hors de la liste configurée est rejeté', () => {
  assert.throws(() => parseDemande(payloadValide({ type: 'Pédalo' }), CONFIG), /type/);
});

test('un courriel manquant ou mal formé est rejeté en nommant le champ', () => {
  for (const courriel of ['', '   ', 'pasuncourriel', 'a@b', 'a b@c.com']) {
    assert.throws(
      () => parseDemande(payloadValide({ courriel }), CONFIG),
      /courriel/,
      `courriel=${JSON.stringify(courriel)} aurait dû être rejeté`,
    );
  }
});

test('les champs optionnels absents ont des valeurs par défaut saines', () => {
  const demande = parseDemande(payloadValide(), CONFIG);
  assert.equal(demande.telephone, '');
  assert.equal(demande.note, '');
  assert.equal(demande.mobiliteReduite, false);
});

test('un payload complet retourne une demande normalisée', () => {
  const demande = parseDemande(
    {
      rue: '  Rue du Pré ',
      numero: '234',
      nom: ' John Tremblay ',
      courriel: ' john@example.com ',
      telephone: ' 819 555-1234 ',
      type: 'Kayak',
      mobiliteReduite: 'on',
      note: ' Deux kayaks, merci. ',
    },
    CONFIG,
  );
  assert.deepEqual(demande, {
    rue: 'Rue du Pré',
    numero: 234,
    nom: 'John Tremblay',
    courriel: 'john@example.com',
    telephone: '819 555-1234',
    type: 'Kayak',
    mobiliteReduite: true,
    note: 'Deux kayaks, merci.',
  });
});
