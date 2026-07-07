// Traitement des cas de la page « À traiter » (décisions 0014, 0020) : logique
// pure, partagée entre Apps Script et les tests node, calquée sur observation.js.
// Note au journal, libération, et — depuis 0020 — décision d'une demande
// (accepter = attribuer, refuser) et mise à jour du contact. Aucun état de suivi
// stocké : les files et l'état des demandes restent entièrement dérivés.

/* global etatDemande, suggestionsEmplacements, situationAttribution, cleAdresse */
if (typeof module !== 'undefined') {
  var etatDemande = require('./grille.js').etatDemande;
  var suggestionsEmplacements = require('./grille.js').suggestionsEmplacements;
  var situationAttribution = require('./grille.js').situationAttribution;
  var cleAdresse = require('./grille.js').cleAdresse;
}

function numeroValide_(numero) {
  if (!Number.isInteger(Number(numero)) || Number(numero) <= 0) {
    throw new Error('Numéro d\'emplacement invalide : ' + JSON.stringify(numero) + ' (entier positif attendu).');
  }
  return Number(numero);
}

// Une note n'écrit QUE dans le Journal : le statut reste factuel (0011/0014),
// aucune ligne d'Emplacements n'est touchée. Son sujet est un emplacement
// (numero) OU une adresse (0019, cas hors quota) — exactement l'un des deux.
function preparerNote(corps) {
  var adresse = String(corps.adresse === undefined || corps.adresse === null ? '' : corps.adresse).trim();
  var aNumero = corps.numero !== undefined && corps.numero !== null && String(corps.numero).trim() !== '';
  if (aNumero && adresse !== '') {
    throw new Error('Une note parle d\'un seul sujet : un numéro d\'emplacement ou une adresse, pas les deux.');
  }
  if (!aNumero && adresse === '') {
    throw new Error('Une note doit viser un numéro d\'emplacement ou une adresse.');
  }
  var texte = String(corps.texte === undefined || corps.texte === null ? '' : corps.texte).trim();
  if (texte === '') {
    throw new Error('La note est vide — écrire ce qui a été fait ou convenu avant de l\'ajouter au journal.');
  }
  return {
    evenement: {
      action: 'note',
      numero: aNumero ? numeroValide_(corps.numero) : '',
      adresse: adresse,
      details: texte,
    },
  };
}

// La libération retire l'attribution : seules les deux colonnes d'adresse sont
// réécrites (fusion par en-têtes réels — 0012), et l'événement Journal garde
// la trace de l'adresse retirée (l'historique raconte qui avait la place).
function preparerLiberation(corps, lignesEmplacements) {
  var numero = numeroValide_(corps.numero);
  var ligne = lignesEmplacements.filter(function (l) {
    return l && Number(l.numero) === numero;
  })[0];
  if (!ligne) {
    throw new Error('L\'emplacement ' + numero + ' n\'a pas de ligne dans Emplacements — rien à libérer.');
  }
  var numeroAdresse = String(ligne.numeroAdresse === undefined || ligne.numeroAdresse === null ? '' : ligne.numeroAdresse).trim();
  var rue = String(ligne.rue === undefined || ligne.rue === null ? '' : ligne.rue).trim();
  if (!numeroAdresse || !rue) {
    throw new Error('L\'emplacement ' + numero + ' n\'est attribué à personne — il n\'y a pas d\'adresse à retirer.');
  }
  return {
    miseAJour: { numeroAdresse: '', rue: '' },
    // L'événement porte aussi la clé adresse (0019) : le journal d'un cas hors
    // quota raconte la libération même après que l'emplacement a quitté l'adresse.
    evenement: {
      action: 'libération',
      numero: numero,
      adresse: numeroAdresse + ' ' + rue,
      details: 'Adresse retirée : ' + numeroAdresse + ' ' + rue + '.',
    },
  };
}

// L'adresse civique lisible d'une demande : « numero rue » (0012).
function adresseDemande_(demande) {
  return String(demande.numero).trim() + ' ' + String(demande.rue).trim();
}

// Le payload de contact Membres tiré d'une demande (0010/0020).
function contactDepuisDemande_(demande) {
  return {
    numeroAdresse: demande.numero,
    rue: demande.rue,
    nom: String(demande.nom || '').trim(),
    courriel: String(demande.courriel || '').trim(),
    telephone: String(demande.telephone || '').trim(),
  };
}

// Trouve la demande par id dans l'inventaire, ou lance en nommant l'id manquant.
function demandeParId_(inventaire, demandeId) {
  var id = String(demandeId === undefined || demandeId === null ? '' : demandeId).trim();
  var demande = (inventaire.demandes || []).filter(function (d) {
    return d && String(d.id || '').trim() === id;
  })[0];
  if (!demande) {
    throw new Error('Demande introuvable : « ' + id +' ».');
  }
  return demande;
}

// Décision d'une demande (0020) : accepter = attribuer un emplacement en un
// seul geste, ou refuser avec une raison. Valide aux frontières — demande
// encore nouvelle ; pour accepter : emplacement réellement Disponible et
// compatible (recalculé, jamais cru sur parole), adresse sous son quota ; pour
// refuser : raison non vide — et retourne les écritures préparées (ligne
// Demandes, attribution sur Emplacements, ligne Membres à créer si absente,
// événement Journal). La colle sheets.js ne fait que les appliquer.
// `maintenant` = date serveur de la décision.
function preparerDecision(corps, inventaire, maintenant) {
  var demande = demandeParId_(inventaire, corps.demandeId);
  if (etatDemande(demande).code !== 'nouvelle') {
    throw new Error('Cette demande est déjà décidée — il n\'y a rien à traiter.');
  }
  var adresse = adresseDemande_(demande);
  var cle = cleAdresse({ numeroAdresse: demande.numero, rue: demande.rue });

  if (corps.decision === 'accepter') {
    var numero = Number(corps.numero);
    var estSuggere = suggestionsEmplacements(demande, inventaire.structures, inventaire.emplacements)
      .some(function (groupe) {
        return groupe.emplacements.some(function (e) { return e.numero === numero; });
      });
    if (!estSuggere) {
      throw new Error('L\'emplacement ' + corps.numero + ' n\'est plus disponible ou n\'est pas '
        + 'compatible avec le type demandé — rechargez la fiche pour voir les places à jour.');
    }
    var situation = situationAttribution(cle, inventaire.emplacements, inventaire.membres);
    if (situation.bloque) {
      throw new Error('Cette adresse a déjà ' + situation.nombre + ' emplacement(s) pour un quota de '
        + situation.quota + ' — augmentez le quota accordé dans l\'onglet Membres avant d\'attribuer.');
    }
    var membreExiste = (inventaire.membres || []).some(function (m) {
      return cleAdresse(m) === cle;
    });
    return {
      demandeId: demande.id,
      demande: { numeroAttribue: numero, dateDecision: maintenant },
      attribution: { numero: numero, numeroAdresse: demande.numero, rue: demande.rue },
      // Une attribution sans contact ne sert à rien : l'adresse inconnue de
      // Membres reçoit sa ligne, jamais un contact déjà présent n'est écrasé
      // (la mise à jour du contact est un geste distinct et validé — 0020).
      membre: membreExiste ? null : contactDepuisDemande_(demande),
      evenement: {
        action: 'attribution', numero: numero, adresse: adresse, demandeId: demande.id,
        details: 'Emplacement ' + numero + ' attribué à ' + adresse + '.',
      },
    };
  }

  if (corps.decision === 'refuser') {
    var raison = String(corps.raison === undefined || corps.raison === null ? '' : corps.raison).trim();
    if (raison === '') {
      throw new Error('Le refus doit porter une raison — elle est journalisée et sert à écrire au membre.');
    }
    return {
      demandeId: demande.id,
      demande: { dateDecision: maintenant },
      attribution: null,
      membre: null,
      evenement: { action: 'refus', adresse: adresse, demandeId: demande.id, details: raison },
    };
  }

  throw new Error('Décision inconnue : « ' + corps.decision + ' » (attendu : accepter ou refuser).');
}

// Mise à jour du contact d'une adresse depuis une demande (0020), geste
// INDÉPENDANT de la décision : la validation humaine du comité, c'est ce geste.
// Prépare l'écriture Membres (création ou remplacement des champs de contact,
// par clé d'adresse) et l'événement Journal.
function preparerMajContact(corps, inventaire) {
  var demande = demandeParId_(inventaire, corps.demandeId);
  return {
    cle: cleAdresse({ numeroAdresse: demande.numero, rue: demande.rue }),
    membre: contactDepuisDemande_(demande),
    evenement: {
      action: 'contact', adresse: adresseDemande_(demande), demandeId: demande.id,
      details: 'Contact mis à jour depuis la demande de ' + String(demande.nom || '').trim() + '.',
    },
  };
}

if (typeof module !== 'undefined') {
  module.exports = { preparerNote, preparerLiberation, preparerDecision, preparerMajContact };
}
