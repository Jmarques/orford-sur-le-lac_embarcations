// Blocs partagés des fiches (décision 0024) : les deux vues détaillées — la
// Fiche d'emplacement (fiche.js, 0018) et la Fiche d'adresse (fiche-adresse.js,
// 0019) — partagent une coquille dont deux blocs se réimplémentaient à
// l'identique. Ce module les réunit, sans build (0004) : classic script chargé
// AVANT fiche.js / fiche-adresse.js, il expose des fabriques de markup et des
// rendus. Aucune donnée n'est posée en HTML — tout ce qui vient de la Sheet
// passe par textContent (anti-XSS), invariant conservé du code d'origine.
//
// Un « préfixe » identifie chaque fiche dans les id (`fiche` pour l'emplacement,
// `fiche-adresse` pour l'adresse) : les deux blocs suivent le même schéma d'id
// (`<prefixe>-membre-nom`, `<prefixe>-journal`…), si bien qu'un seul rendu sert
// les deux. Les rares divergences (adresse + pastille quota côté emplacement ;
// libellé et amorce côté journal) sont paramétrées, jamais dupliquées.
//
// Blocs exposés :
//   Membre  — nom, adresse (option), pastille quota (option), contact
//             téléphone/courriel tappables, mention « aucun membre inscrit ».
//   Journal — liste d'événements datés + formulaire « ajouter une note ».

// Format de date partagé par le journal : identique aux deux fiches d'origine.
var FORMAT_DATE_BLOC = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long' });

// --- Bloc Membre ------------------------------------------------------------

// Markup du bloc Membre. `prefixe` porte le schéma d'id ; les options couvrent
// les seules différences entre les deux fiches :
//   avecAdresse    l'adresse en légende à côté du nom (emplacement seulement).
//   avecQuota      la pastille « Hors quota » (emplacement seulement, 0019).
//   conteneurCache le bloc masqué à l'injection (emplacement : montré quand
//                  attribué ; adresse : toujours visible).
//   nomCache       le nom masqué à l'injection (adresse : révélé au rendu).
function creerBlocMembre(options) {
  var prefixe = options.prefixe;
  var adresse = options.avecAdresse
    ? `\n            <span id="${prefixe}-membre-adresse" class="wa-color-text-quiet"></span>`
    : '';
  var quota = options.avecQuota
    ? `\n            <wa-badge id="${prefixe}-membre-quota" variant="neutral" appearance="filled-outlined" hidden></wa-badge>`
    : '';
  var cacheConteneur = options.conteneurCache ? ' hidden' : '';
  var cacheNom = options.nomCache ? ' hidden' : '';
  return `
        <div id="${prefixe}-membre" class="wa-stack wa-gap-2xs"${cacheConteneur}>
          <!-- Nom (et, côté emplacement, adresse + pastille quota) sur une même
               ligne, repli naturel si étroite : la fiche reste courte sur
               téléphone. La pastille quota (0019) n'apparaît QUE hors quota —
               silence dans les règles (0016). -->
          <p class="wa-cluster wa-gap-xs wa-align-items-baseline">
            <span id="${prefixe}-membre-nom" class="champ-membre-nom"${cacheNom}></span>${adresse}${quota}
          </p>
          <div class="wa-cluster wa-gap-m liens-contact">
            <a id="${prefixe}-telephone" hidden><wa-icon name="phone"></wa-icon> <span id="${prefixe}-telephone-texte"></span></a>
            <a id="${prefixe}-courriel" hidden><wa-icon name="envelope"></wa-icon> <span id="${prefixe}-courriel-texte"></span></a>
          </div>
          <p id="${prefixe}-membre-absent" class="wa-caption-m wa-color-text-quiet" hidden>Aucun membre inscrit
            dans l'onglet Membres pour cette adresse.</p>
        </div>`;
}

// Rendu du bloc Membre : nom + contact tappable, ou mention « aucun membre »
// quand l'adresse n'a pas de ligne Membres. `membre` absent (undefined) = le
// bloc se replie sur la mention et les liens masqués. L'adresse et la pastille
// quota (côté emplacement) restent rendues par la fiche : elles dépendent de
// données qui lui sont propres.
function rendreBlocMembre(prefixe, membre) {
  var el = function (suffixe) { return document.getElementById(prefixe + suffixe); };
  var nom = el('-membre-nom');
  var telephone = el('-telephone');
  var courriel = el('-courriel');
  nom.hidden = telephone.hidden = courriel.hidden = true;
  el('-membre-absent').hidden = !!membre;
  if (!membre) return;
  nom.hidden = false;
  nom.textContent = String(membre.nom || '').trim();
  var numeroTelephone = String(membre.telephone || '').trim();
  if (numeroTelephone) {
    telephone.href = 'tel:' + numeroTelephone.replace(/[^+\d]/g, '');
    el('-telephone-texte').textContent = numeroTelephone;
    telephone.hidden = false;
  }
  var adresseCourriel = String(membre.courriel || '').trim();
  if (adresseCourriel) {
    courriel.href = 'mailto:' + adresseCourriel;
    el('-courriel-texte').textContent = adresseCourriel;
    courriel.hidden = false;
  }
}

// --- Bloc Journal -----------------------------------------------------------

// Markup du bloc Journal : liste d'événements + formulaire d'ajout de note. Les
// options portent les seules divergences entre les deux fiches :
//   sujet       « l'emplacement » / « l'adresse » — complète « Journal de … ».
//   amorce      le placeholder du champ note (exemple propre à chaque fiche).
//   erreurId    l'id du callout d'erreur d'envoi (l'emplacement porte deux
//               zones d'erreur, d'où un id distinct de `<prefixe>-erreur`).
function creerBlocJournal(options) {
  var prefixe = options.prefixe;
  var erreurId = options.erreurId;
  return `
              <h3 class="wa-heading-s">Journal de ${options.sujet}</h3>
              <ol id="${prefixe}-journal" class="liste-evenements zone-journal wa-stack wa-gap-s"></ol>
              <p id="${prefixe}-journal-vide" class="wa-caption-m wa-color-text-quiet" hidden>Rien au journal
                pour l'instant.</p>
              <!-- Le champ vit en pied du journal : le geste se lit comme
                   « j'ajoute une ligne à ce journal ». rows=1 + resize auto : le
                   champ grandit en écrivant, l'amorce courte tient sur une
                   ligne (hauteur mobile). -->
              <form id="${prefixe}-formulaire-note" class="wa-stack wa-gap-s">
                <wa-textarea id="${prefixe}-champ-note" label="Ajouter une note" rows="1" resize="auto"
                             placeholder="${options.amorce}"></wa-textarea>
                <!-- L'erreur d'envoi vit à côté du bouton : c'est là que regarde
                     l'utilisateur au moment où elle apparaît. Le texte saisi
                     est conservé. -->
                <wa-callout id="${erreurId}" variant="danger" role="alert" tabindex="-1" hidden>
                  <wa-icon slot="icon" name="circle-exclamation"></wa-icon>
                  <span id="${erreurId}-texte"></span>
                </wa-callout>
                <div class="wa-cluster wa-gap-s">
                  <wa-button id="${prefixe}-ajouter-note" type="submit" appearance="outlined" variant="brand">
                    <wa-icon slot="start" name="pen"></wa-icon>
                    Ajouter la note
                  </wa-button>
                </div>
              </form>`;
}

// Une ligne du journal : le même échafaudage (icône du type en tête, date en
// légende, texte de l'événement) pour les deux fiches — seuls l'icône, son
// libellé et le texte varient, calculés par chaque fiche selon ses événements.
function construireLigneJournal(descripteur) {
  var element = document.createElement('li');
  element.className = 'ligne-journal';
  var icone = document.createElement('wa-icon');
  icone.setAttribute('name', descripteur.icone);
  icone.setAttribute('label', descripteur.label);
  var bloc = document.createElement('span');
  bloc.className = 'texte-journal';
  var quand = document.createElement('span');
  quand.className = 'wa-caption-m wa-color-text-quiet';
  quand.textContent = FORMAT_DATE_BLOC.format(descripteur.date);
  var quoi = document.createElement('span');
  quoi.className = 'wa-text-pretty';
  quoi.textContent = descripteur.texte;
  bloc.append(quand, quoi);
  element.append(icone, bloc);
  return element;
}

// Rend la liste du journal et la mention « rien au journal », puis cale la vue
// sur l'événement le plus récent. `decrire(evenement)` → { icone, label, texte }
// est propre à chaque fiche (l'emplacement journalise aussi les observations ;
// l'adresse préfixe les libérations de leur numéro).
function rendreListeJournal(prefixe, evenements, decrire) {
  var journal = document.getElementById(prefixe + '-journal');
  journal.replaceChildren.apply(journal, evenements.map(function (evenement) {
    var d = decrire(evenement);
    return construireLigneJournal({
      icone: d.icone, label: d.label, date: evenement.date, texte: d.texte,
    });
  }));
  document.getElementById(prefixe + '-journal-vide').hidden = evenements.length > 0;
  calerBlocJournal(prefixe);
}

// Cale le journal sur l'événement le plus récent. Sans effet tant que le
// panneau est masqué (scrollHeight nul, drawer fermé ou onglet caché) : à
// rappeler à l'ouverture du drawer et à l'affichage de l'onglet — au frame
// suivant, une fois le panneau réellement mesurable.
function calerBlocJournal(prefixe) {
  requestAnimationFrame(function () {
    var journal = document.getElementById(prefixe + '-journal');
    journal.scrollTop = journal.scrollHeight;
  });
}

// --- Aperçu du courriel pré-rédigé (décisions 0024, 0003) -------------------

// Un dialogue partagé qui montre l'objet et le corps d'un courriel AVANT
// d'ouvrir la messagerie du membre du comité. Rien n'est jamais envoyé par
// l'app (0003) : « Ouvrir dans ma messagerie » pose un mailto pré-rempli, à
// relire et ajuster. Réutilisé par la fiche d'emplacement (relancer un membre)
// et la fiche d'adresse (demander de libérer une place) — d'où sa place dans
// les blocs partagés. Le dialogue est injecté une seule fois, à la première
// ouverture, puis réutilisé ; l'objet et le corps passent par textContent
// (anti-XSS), le mailto est encodé par lienMailto (presentation.js).
function injecterApercuCourriel_() {
  if (document.getElementById('apercu-courriel')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <wa-dialog id="apercu-courriel" label="Courriel pré-rédigé">
      <div class="wa-stack wa-gap-m">
        <!-- La réassurance d'abord (0003) : elle lève l'inquiétude « est-ce
             que ça part tout seul ? » avant de montrer le brouillon. -->
        <p class="wa-color-text-quiet wa-text-pretty">Rien n'est envoyé automatiquement.
          En ouvrant, ce brouillon apparaîtra dans votre messagerie — relisez-le et
          ajustez-le avant de l'envoyer.</p>
        <div class="wa-stack wa-gap-2xs">
          <span class="wa-caption-m wa-color-text-quiet">Objet</span>
          <strong id="apercu-courriel-objet" class="wa-text-pretty"></strong>
        </div>
        <div class="wa-stack wa-gap-2xs">
          <span class="wa-caption-m wa-color-text-quiet">Message</span>
          <div id="apercu-courriel-corps" class="apercu-corps wa-text-pretty"></div>
        </div>
      </div>
      <wa-button id="apercu-courriel-ouvrir" slot="footer" variant="brand" appearance="accent" size="m">
        <wa-icon slot="start" name="envelope"></wa-icon>
        Ouvrir dans ma messagerie
      </wa-button>
      <!-- La sortie sûre est un vrai bouton, aussi facile à viser que l'action
           (public aîné) — pas un lien texte. -->
      <wa-button slot="footer" appearance="outlined" size="m" data-dialog="close">Fermer</wa-button>
    </wa-dialog>`);
  // Le bouton d'ouverture est un lien mailto : ouvrir la messagerie ne quitte
  // pas la page, on referme le dialogue derrière (le brouillon vit désormais
  // dans le client mail du membre du comité).
  document.getElementById('apercu-courriel-ouvrir')
    .addEventListener('click', function () {
      document.getElementById('apercu-courriel').removeAttribute('open');
    });
}

// Ouvre l'aperçu pour un courriel { courriel, sujet, corps } (mêmes clés que
// lienMailto). L'appelant construit l'objet et le corps ; ici on ne fait que
// montrer et préparer le mailto.
function ouvrirApercuCourriel(courriel) {
  injecterApercuCourriel_();
  document.getElementById('apercu-courriel-objet').textContent = courriel.sujet;
  document.getElementById('apercu-courriel-corps').textContent = courriel.corps;
  document.getElementById('apercu-courriel-ouvrir').setAttribute('href', lienMailto(courriel));
  document.getElementById('apercu-courriel').setAttribute('open', '');
}
