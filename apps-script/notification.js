// Notification interne au comité à la réception d'une demande (ticket 04).
// Autorisée par la décision 0003 : les notifications internes partent
// automatiquement — seul un courriel vers un membre exige une validation.
// La composition (sujet/corps) est de la logique pure testée en node ;
// l'envoi lui-même (MailApp) se vérifie au déploiement.

var PAGE_A_TRAITER = 'a-traiter.html';

// { sujet, corps } du courriel interne « nouvelle demande » — sobre : qui
// demande, où, quoi, et le lien vers À traiter. urlSite vide (clé Config non
// renseignée) → la ligne du lien disparaît, le courriel part quand même.
function composerNotificationDemande(demande, urlSite) {
  var adresse = demande.numero + ' ' + demande.rue;
  var base = String(urlSite || '').trim().replace(/\/+$/, '');
  var paragraphes = [
    demande.nom + ' demande un emplacement pour un(e) ' + demande.type
      + ' au ' + adresse + '.'
      + (demande.mobiliteReduite ? ' Mobilité réduite : privilégier un niveau bas.' : ''),
    base ? 'Traiter la demande : ' + base + '/' + PAGE_A_TRAITER : '',
    '(Répondre à ce courriel écrit directement au demandeur.)',
  ];
  return {
    sujet: 'Nouvelle demande — ' + demande.type + ' au ' + adresse,
    corps: paragraphes.filter(function (p) { return p !== ''; }).join('\n\n'),
  };
}

// Envoie la notification si la clé Config `courrielComite` est renseignée.
// JAMAIS bloquant (ticket 04) : la demande est déjà créée — clé absente,
// quota MailApp atteint ou envoi refusé se journalisent (npm run logs) sans
// faire échouer la soumission. `replyTo` = le demandeur : « Répondre » sur la
// notification écrit directement au membre (geste humain, conforme 0003).
function notifierComiteDemande(demande) {
  try {
    var destinataire = lireValeurConfig(CLE_COURRIEL_COMITE);
    if (!destinataire) return;
    var courriel = composerNotificationDemande(demande, lireValeurConfig(CLE_URL_SITE));
    MailApp.sendEmail({
      to: destinataire,
      subject: courriel.sujet,
      body: courriel.corps,
      name: 'Orford sur le Lac',
      replyTo: demande.courriel,
    });
  } catch (err) {
    console.error('Notification comité non envoyée : ' + String((err && err.message) || err));
  }
}

if (typeof module !== 'undefined') {
  module.exports = { composerNotificationDemande: composerNotificationDemande };
}
