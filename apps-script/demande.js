// Logique pure de validation des demandes — partagée entre Apps Script et les tests node.

function champRequis(payload, champ) {
  const valeur = String(payload[champ] || '').trim();
  if (!valeur) {
    throw new Error('Champ "' + champ + '" manquant ou vide.');
  }
  return valeur;
}

function parseDemande(payload, config) {
  if (!config || !Array.isArray(config.rues) || !Array.isArray(config.types)) {
    throw new Error('Configuration invalide : listes "rues" et "types" attendues.');
  }
  const numero = Number(champRequis(payload, 'numero'));
  if (!Number.isInteger(numero) || numero < 1 || numero > 999) {
    throw new Error('Champ "numero" invalide : entier entre 1 et 999 attendu.');
  }
  const rue = champRequis(payload, 'rue');
  if (config.rues.indexOf(rue) === -1) {
    throw new Error('Champ "rue" invalide : doit être une rue de la communauté.');
  }
  const courriel = champRequis(payload, 'courriel');
  if (!/^\S+@\S+\.\S+$/.test(courriel)) {
    throw new Error('Champ "courriel" invalide : adresse de la forme nom@domaine.ca attendue.');
  }
  const type = champRequis(payload, 'type');
  if (config.types.indexOf(type) === -1) {
    throw new Error('Champ "type" invalide : doit être un type d\'embarcation configuré.');
  }
  return {
    rue: rue,
    numero: numero,
    nom: champRequis(payload, 'nom'),
    courriel: courriel,
    telephone: String(payload.telephone || '').trim(),
    type: type,
    mobiliteReduite: payload.mobiliteReduite === true || payload.mobiliteReduite === 'on',
    note: String(payload.note || '').trim(),
  };
}

if (typeof module !== 'undefined') {
  module.exports = { parseDemande };
}
