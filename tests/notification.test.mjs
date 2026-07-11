import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { composerNotificationDemande } = require('../apps-script/notification.js');

// Une demande telle que normalisée par parseDemande (demande.js).
function demande(surcharges = {}) {
  return {
    rue: 'Rue du Pré',
    numero: 234,
    nom: 'John Tremblay',
    courriel: 'john@example.com',
    telephone: '819 555-1234',
    type: 'Kayak',
    mobiliteReduite: false,
    note: '',
    ...surcharges,
  };
}

test('le sujet nomme le type et l\'adresse demandeuse', () => {
  const { sujet } = composerNotificationDemande(demande(), 'https://exemple.ca/');
  assert.match(sujet, /Kayak/);
  assert.match(sujet, /234 Rue du Pré/);
});

test('le corps donne le nom, l\'adresse, le type et le lien vers À traiter', () => {
  const { corps } = composerNotificationDemande(demande(), 'https://exemple.ca/');
  assert.match(corps, /John Tremblay/);
  assert.match(corps, /234 Rue du Pré/);
  assert.match(corps, /Kayak/);
  assert.match(corps, /https:\/\/exemple\.ca\/a-traiter\.html/);
});

test('le lien se compose proprement avec ou sans barre oblique finale', () => {
  const avec = composerNotificationDemande(demande(), 'https://exemple.ca/').corps;
  const sans = composerNotificationDemande(demande(), 'https://exemple.ca').corps;
  for (const corps of [avec, sans]) {
    assert.match(corps, /https:\/\/exemple\.ca\/a-traiter\.html/);
    assert.doesNotMatch(corps, /exemple\.ca\/\/a-traiter/);
  }
});

test('sans urlSite, le courriel part sans ligne de lien', () => {
  for (const urlSite of ['', '   ', undefined, null]) {
    const { corps } = composerNotificationDemande(demande(), urlSite);
    assert.doesNotMatch(corps, /a-traiter\.html/);
    assert.doesNotMatch(corps, /\n\n\n/, 'la ligne du lien disparaît sans laisser de trou');
    assert.match(corps, /234 Rue du Pré/);
  }
});

test('la mobilité réduite est signalée quand elle est demandée, muette sinon', () => {
  const avec = composerNotificationDemande(demande({ mobiliteReduite: true }), '').corps;
  assert.match(avec, /[Mm]obilité réduite/);
  const sans = composerNotificationDemande(demande(), '').corps;
  assert.doesNotMatch(sans, /[Mm]obilité réduite/);
});
