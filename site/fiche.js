// Fiche d'emplacement (décisions 0018, unifiée 0024) : LA vue détaillée d'un
// emplacement — la même quelle que soit la page qui l'ouvre (grille des
// Structures, registre À traiter). Composant partagé sans build (décision
// 0004) : ce script expose creerFicheEmplacement(), qui injecte le markup de la
// fiche et rend `ouvrir(numero)`.
//
// Coquille unifiée à PLAT (0024) : plus d'onglets Observer/Traiter — tout
// défile dans une colonne `[Sujet (statut) · Membre · Corps propre · Journal]`.
//   · Le SUJET porte le statut. Un état à problème (Attribué-libre, ou adresse
//     hors quota) s'affiche en callout QUI PORTE ses remèdes (Relancer, Libérer
//     — gating resserré de gestesEmplacement) ; un état sain s'affiche en ligne
//     calme, sans callout ni geste.
//   · « Sur place » (consigner l'occupation Occupé/Libre) est une ACTION de la
//     barre utilitaire qui révèle un panneau replié — plus une section
//     permanente.
//   · « Relancer le membre » ouvre l'aperçu du courriel pré-rédigé (blocs
//     partagés) : rien n'est envoyé automatiquement (0003).
// Tout geste laisse la fiche ouverte — le feedback est le changement visible
// (statut, journal), pas un message (0016). Dépend de grille.js / presentation.js
// / blocs-fiche.js, chargés avant.
//
// options :
//   ongletParDefaut    accepté pour compatibilité, sans effet (plus d'onglets).
//   donnees()          → { structures, emplacements, membres, journal } courants.
//   motDePasse()       → le mot de passe du comité (session).
//   surDonneesFraiches(inventaire) — la page range l'état frais et re-rend
//                      derrière la fiche (grille recolorée, registre re-trié).
//   surSessionExpiree() — la fiche s'est fermée, la page montre la connexion.
//   surOuvrirAdresse(cle, adresse, numero) — MIROIR de surOuvrirEmplacement de
//                      la fiche d'adresse (0019/0024) : la page ferme cette fiche
//                      et ouvre la fiche d'adresse avec retour vers l'emplacement.
//                      OPTIONNEL — sans lui, le bouton « Fiche d'adresse » de la
//                      barre utilitaire ne paraît pas (la page ne sait pas héberger
//                      la fiche d'adresse). Ne paraît que si l'emplacement est
//                      attribué (le dossier d'adresse n'existe que là).

/* global statutEmplacement, gestesEmplacement, historiqueEmplacement,
   serieLibreObservee, depassementQuota, casAdresse,
   cleAdresse, ETATS_OCCUPATION, apparenceStatut, proseSignal, formatAdresse,
   chercherMembreParCle, positionParNumero, lienMailto,
   creerBlocMembre, rendreBlocMembre, creerBlocJournal, rendreListeJournal,
   calerBlocJournal, ouvrirApercuCourriel */

function creerFicheEmplacement(options) {
  // Markup constant (aucune donnée) : tout ce qui vient de la Sheet est posé
  // ensuite par textContent — jamais de HTML (anti-XSS).
  document.body.insertAdjacentHTML('beforeend', `
    <wa-drawer id="fiche-emplacement" label="Emplacement">
      <div class="corps-fiche-emplacement wa-stack wa-gap-l">
        <!-- Retour vers la fiche d'adresse (0019) : présent seulement quand la
             fiche a été ouverte depuis un cas hors quota — jamais deux drawers
             empilés, le retour rouvre la fiche d'adresse après la fermeture. -->
        <div id="fiche-retour-zone" class="wa-cluster" hidden>
          <wa-button id="fiche-retour" appearance="plain">
            <wa-icon slot="start" name="arrow-left"></wa-icon>
            <span id="fiche-retour-texte">Retour</span>
          </wa-button>
        </div>

        <!-- SUJET — le statut. Callout SEULEMENT pour un problème/exception
             (Attribué-libre ; adresse hors quota) : il porte alors ses remèdes,
             rattachés au problème qu'ils résolvent (0024). -->
        <wa-callout id="fiche-statut" hidden>
          <wa-icon id="fiche-statut-icone" slot="icon" name="circle-info"></wa-icon>
          <div class="wa-stack wa-gap-2xs">
            <strong id="fiche-statut-libelle"></strong>
            <!-- Pas de wa-caption-m ici : sa couleur « quiet » est calibrée
                 pour la surface de page, pas pour le fond coloré du callout —
                 la classe locale ne règle que la taille, la couleur vient du
                 variant du callout. -->
            <span id="fiche-statut-detail" class="detail-statut"></span>
            <!-- Remèdes DANS le callout, séparés du texte par un filet : ce que
                 chaque bouton résout se lit à côté du problème (0024). -->
            <div id="fiche-remedes" class="remedes" hidden>
              <wa-button id="fiche-ecrire" variant="brand" appearance="accent" size="m" hidden>
                <wa-icon slot="start" name="envelope"></wa-icon>
                Relancer le membre
              </wa-button>
              <wa-button id="fiche-liberer" appearance="outlined" size="m" hidden>
                <wa-icon slot="start" name="unlock"></wa-icon>
                Libérer l'emplacement
              </wa-button>
            </div>
          </div>
        </wa-callout>
        <!-- Statut d'un état SAIN, ou statut propre de l'emplacement quand le
             callout parle de l'adresse (hors quota) : une ligne calme, teintée
             de la gravité réelle, jamais un gros callout. -->
        <p id="fiche-statut-calme" class="statut-calme" hidden>
          <wa-icon id="fiche-statut-calme-icone" name="circle-info"></wa-icon>
          <span class="statut-calme-texte">
            <strong id="fiche-statut-calme-libelle" class="statut-calme-libelle"></strong>
            <span id="fiche-statut-calme-detail" class="wa-color-text-quiet wa-text-pretty"></span>
          </span>
        </p>

        <!-- MEMBRE (bloc partagé) : nom, adresse, pastille hors quota, contact. -->
        ${creerBlocMembre({ prefixe: 'fiche', avecAdresse: true, avecQuota: true, conteneurCache: true })}
        <p id="fiche-note-comite" class="note-membre wa-text-pretty" hidden></p>

        <!-- BARRE UTILITAIRE : les actions non liées à un problème. « Sur place »
             révèle le relevé replié ; « Fiche d'adresse » (navigation, MIROIR de
             0019) ouvre le dossier de l'adresse attribuée avec retour ici — même
             tokens que « Sur place » (outlined, size m). Masquée si l'emplacement
             n'est pas attribué, ou si la page ne câble pas surOuvrirAdresse. -->
        <div class="barre-utilitaire wa-cluster wa-gap-s">
          <wa-button id="fiche-sur-place" appearance="outlined" size="m"
                     aria-expanded="false" aria-controls="fiche-sur-place-panneau">
            <wa-icon slot="start" name="binoculars"></wa-icon>
            Sur place
          </wa-button>
          <wa-button id="fiche-vers-adresse" appearance="outlined" size="m" hidden>
            <wa-icon slot="start" name="address-card"></wa-icon>
            Fiche d'adresse
          </wa-button>
        </div>
        <!-- Relevé « Sur place » (observation Occupé/Libre) : replié par défaut,
             révélé par l'action. Sur place, on voit une embarcation ou pas. -->
        <div id="fiche-sur-place-panneau" class="panneau-sur-place wa-stack wa-gap-s" hidden>
          <!-- L'état courant (un fait) reste au-dessus des boutons qui le changent. -->
          <p id="fiche-observation-date" class="wa-caption-m wa-color-text-quiet"></p>
          <h3 class="wa-heading-s">Qu'observez-vous sur place ?</h3>
          <div class="boutons-occupation">
            <wa-button class="bouton-occupation" data-occupation="occupé" appearance="outlined" size="m">Occupé</wa-button>
            <wa-button class="bouton-occupation" data-occupation="libre" appearance="outlined" size="m">Libre</wa-button>
          </div>
          <wa-callout id="fiche-erreur-observer" variant="danger" role="alert" tabindex="-1" hidden>
            <wa-icon slot="icon" name="circle-exclamation"></wa-icon>
            <span id="fiche-erreur-observer-texte"></span>
          </wa-callout>
        </div>

        <!-- JOURNAL (bloc partagé) : événements + ajout de note. -->
        <div class="wa-stack wa-gap-s">
          ${creerBlocJournal({ prefixe: 'fiche', sujet: 'l\'emplacement', amorce: 'ex. : courriel envoyé — Jeremy', erreurId: 'fiche-erreur-traiter' })}
        </div>
      </div>
    </wa-drawer>
    <!-- Confirmation avant de libérer : aucun tap accidentel ne retire une adresse. -->
    <wa-dialog id="fiche-dialogue-liberer" label="Libérer l'emplacement ?">
      <p id="fiche-dialogue-liberer-texte" class="wa-text-pretty"></p>
      <wa-button id="fiche-dialogue-liberer-confirmer" slot="footer" variant="danger" size="m" data-dialog="close">
        Libérer l'emplacement
      </wa-button>
      <!-- La sortie sûre est un vrai bouton, aussi facile à viser que l'action
           (public aîné) — pas un lien texte. -->
      <wa-button slot="footer" appearance="outlined" size="m" data-dialog="close">Annuler</wa-button>
    </wa-dialog>
  `);

  const el = (id) => document.getElementById(id);
  const drawer = el('fiche-emplacement');
  const formatDate = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long' });

  // ErreurApi (erreur métier montrable) et le transport vers le backend
  // viennent du module client (client.js, chargé avant fiche.js).

  // Le numéro affiché dans la fiche ouverte.
  let numeroCourant = null;

  // Le retour de navigation (0019) : posé à l'ouverture depuis une fiche
  // d'adresse ({ libelle, surRetour }), consommé à la fermeture du drawer —
  // quelle que soit la façon de fermer (bouton retour, X, échap).
  let retourCourant = null;

  // Adresse toujours affichée « numeroAdresse rue » (décision 0012).
  function adresseLisible(ligne) {
    return formatAdresse(ligne.numeroAdresse, ligne.rue);
  }

  function lignePourNumero(numero) {
    return options.donnees().emplacements.find((l) => Number(l.numero) === Number(numero));
  }

  // Par la clé d'adresse normalisée (0019) : « Rue du Lac » et « rue du lac »
  // (Sheet éditée à la main, 0002) désignent le même membre.
  function chercherMembre(ligne) {
    return chercherMembreParCle(options.donnees().membres, cleAdresse(ligne));
  }

  // La position d'un numéro, dérivée des grilles (0009). Un numéro « en
  // double » (erreur de données) a plusieurs positions : la première est
  // affichée — le marquage de l'erreur appartient aux pages, pas à la fiche.
  function positionPourNumero(numero) {
    return positionParNumero(numero, options.donnees().structures);
  }

  // Le fait décisif du statut, en une ligne sous le libellé. Les deux statuts
  // problèmes portent leur signal temporel (des faits observés, jamais des
  // mois calendaires — 0014) ; les autres gardent l'explication dérivée.
  // L'adresse n'y figure jamais : elle vit dans la ligne membre (0016).
  function detailStatut(statut, ligne) {
    // proseSignal (presentation.js) porte la formulation « fiche » du signal ;
    // les statuts sans dimension temporelle retombent sur l'explication dérivée.
    return proseSignal(ligne, options.donnees().journal, 'fiche') || statut.explication;
  }

  // Le fait du dépassement de quota d'une adresse, en une phrase — le remède
  // « Libérer » qui l'accompagne dit ce qu'il résout.
  function detailHorsQuota(cas) {
    const enTrop = cas.nombre - cas.quota;
    return cas.adresse + ' a ' + cas.nombre + ' emplacements pour un quota de ' + cas.quota
      + '. En libérer ' + (enTrop > 1 ? enTrop + ' ramènerait' : 'un ramènerait')
      + ' l\'adresse dans le quota.';
  }

  // Icône et libellé de chaque type d'événement du journal. L'observation
  // reprend l'icône de la tournée (list-check) : c'est elle qui l'a écrite.
  const EVENEMENTS_JOURNAL = {
    observation: { icone: 'list-check', libelle: 'Observation' },
    note: { icone: 'pen', libelle: 'Note' },
    'libération': { icone: 'unlock', libelle: 'Libération' },
  };

  function texteEvenement(evenement) {
    if (evenement.action === 'observation') {
      return ETATS_OCCUPATION.includes(evenement.details)
        ? 'Observé ' + evenement.details
        : 'Observation — ' + evenement.details;
    }
    if (evenement.action === 'note' || evenement.action === 'libération') return evenement.details;
    return evenement.action + (evenement.details ? ' — ' + evenement.details : '');
  }

  // Le descripteur d'un événement pour le bloc journal partagé (blocs-fiche.js) :
  // icône du type, libellé et texte. Le journal de l'emplacement montre aussi
  // les observations, d'où EVENEMENTS_JOURNAL et son repli 'circle-info'.
  function decrireEvenement(evenement) {
    const type = EVENEMENTS_JOURNAL[evenement.action];
    return {
      icone: type ? type.icone : 'circle-info',
      label: type ? type.libelle : 'Événement',
      texte: texteEvenement(evenement),
    };
  }

  // Le courriel pré-rempli n'est JAMAIS envoyé par l'app (0003) : le membre du
  // comité le relit et l'envoie depuis son propre client mail (via l'aperçu
  // partagé). « Relancer » n'est offert que sur « Attribué, libre » (le seul
  // état où écrire a une raison, 0024) : le corps parle donc toujours d'un
  // emplacement observé libre.
  function courrielRelance(membre, ligne) {
    const serie = serieLibreObservee(ligne, options.donnees().journal);
    const corps = [
      'Bonjour ' + membre.nom + ',',
      '',
      'En passant près des structures, le comité a remarqué que l\'emplacement ' + ligne.numero
        + ' (attribué au ' + adresseLisible(ligne) + ') est libre'
        + (serie.debut ? ' depuis le ' + formatDate.format(serie.debut) : '') + '.',
      '',
      'Utilisez-vous encore cet emplacement cette saison ? Si vous n\'en avez plus besoin, '
        + 'dites-le-nous : un autre membre de la communauté pourra en profiter.',
      '',
      'Merci,',
      'Le comité administratif — Orford sur le Lac',
    ].join('\n');
    return {
      courriel: membre.courriel,
      sujet: 'Votre emplacement ' + ligne.numero + ' — Orford sur le Lac',
      corps,
    };
  }

  // --- Rendu : tout se recalcule depuis donnees(), la fiche se remplit en place ---

  // N'écrire un attribut que s'il change : re-poser la même valeur fait
  // re-rendre le shadow DOM du composant, et le contenu slotté disparaît le
  // temps d'une frame (callout écrasé pendant un re-rendu après un geste —
  // visible sur API lente, flagrant en capture).
  const poserAttribut = (element, nom, valeur) => {
    if (element.getAttribute(nom) !== valeur) element.setAttribute(nom, valeur);
  };

  // La ligne de statut calme : icône teintée de la gravité réelle (data-variant
  // pilote la couleur en CSS), libellé, détail.
  function rendreCalme(apparence, statut, ligne) {
    const calme = el('fiche-statut-calme');
    poserAttribut(calme, 'data-variant', apparence.variante);
    poserAttribut(el('fiche-statut-calme-icone'), 'name', apparence.icone);
    el('fiche-statut-calme-libelle').textContent = statut.libelle;
    el('fiche-statut-calme-detail').textContent = detailStatut(statut, ligne);
    calme.hidden = false;
  }

  function rendre() {
    const ligne = lignePourNumero(numeroCourant);
    const statut = statutEmplacement(ligne);
    const apparence = apparenceStatut(statut.code);
    const position = positionPourNumero(numeroCourant);

    const libelle = 'Emplacement ' + numeroCourant
      + (position ? ' · Structure ' + position.structure
        + (position.niveau !== '' ? ' · Niveau ' + position.niveau : '') : '');
    if (drawer.getAttribute('label') !== libelle) drawer.setAttribute('label', libelle);

    // Le membre (si attribué), les gestes et le contexte quota — dérivés du
    // statut et de l'inventaire complet (0024), comme depassementQuota.
    const membre = ligne ? chercherMembre(ligne) : undefined;
    const gestes = gestesEmplacement(ligne, options.donnees().emplacements, options.donnees().membres);
    const attribue = !!(ligne && cleAdresse(ligne));
    const cas = attribue ? casAdresse(cleAdresse(ligne), options.donnees().emplacements, options.donnees().membres) : null;
    const horsQuota = !!(cas && cas.depassement > 0);

    // --- Sujet : callout pour un PROBLÈME/exception, sinon ligne calme (0024) ---
    // Un état à problème (Attribué-libre, À identifier) s'affiche en callout de
    // sa gravité réelle (warning / danger) — l'anomalie ne doit jamais être
    // moins saillante que le warning (design.md). Le callout porte ses remèdes
    // quand il y en a. Une adresse hors quota est une exception : callout neutre
    // portant « Libérer », le statut propre de l'emplacement (sain) dit calmement
    // dessous. Le callout parle du dépassement SEULEMENT quand le statut n'est
    // pas déjà un problème — sinon le dépassement reste sur la pastille du
    // membre : un seul foyer (0016).
    const calloutQuota = horsQuota && !statut.probleme;
    const callout = el('fiche-statut');
    const calme = el('fiche-statut-calme');
    if (statut.probleme) {
      // Le callout EST le statut (warning ou danger), avec ses remèdes.
      poserAttribut(callout, 'variant', apparence.variante);
      poserAttribut(el('fiche-statut-icone'), 'name', apparence.icone);
      el('fiche-statut-libelle').textContent = statut.libelle;
      el('fiche-statut-detail').textContent = detailStatut(statut, ligne);
      callout.hidden = false;
      calme.hidden = true;
    } else if (horsQuota) {
      // Le callout parle de l'ADRESSE qui dépasse ; le statut propre de
      // l'emplacement (sain) reste dit calmement en dessous.
      poserAttribut(callout, 'variant', 'neutral');
      poserAttribut(el('fiche-statut-icone'), 'name', 'circle-info');
      el('fiche-statut-libelle').textContent = 'Adresse hors quota';
      el('fiche-statut-detail').textContent = detailHorsQuota(cas);
      callout.hidden = false;
      rendreCalme(apparence, statut, ligne);
    } else {
      // État sain : pas de callout, juste la ligne calme.
      callout.hidden = true;
      rendreCalme(apparence, statut, ligne);
    }

    // Remèdes DANS le callout : montrés selon le gating (0024), toujours masqués
    // quand il n'y a pas de callout (état sain → aucun geste).
    const ecrire = el('fiche-ecrire');
    const liberer = el('fiche-liberer');
    ecrire.hidden = callout.hidden || !gestes.ecrire;
    liberer.hidden = callout.hidden || !gestes.liberer;
    el('fiche-remedes').hidden = ecrire.hidden && liberer.hidden;

    // --- Membre (bloc partagé) : nom, adresse, pastille quota, contact ---
    const blocMembre = el('fiche-membre');
    blocMembre.hidden = !attribue;
    if (!blocMembre.hidden) {
      el('fiche-membre-adresse').textContent = adresseLisible(ligne);
      // Pastille quota (0019) : quand l'adresse dépasse ET que le callout ne
      // porte pas déjà le dépassement (cas « Attribué, libre » hors quota) — le
      // dépassement a toujours un seul foyer (0016). Le libellé nomme l'état
      // (« Hors quota »), le nombre seul ne dirait pas que c'est un dossier.
      const pastilleQuota = el('fiche-membre-quota');
      pastilleQuota.hidden = !(horsQuota && !calloutQuota);
      if (!pastilleQuota.hidden) pastilleQuota.textContent = 'Hors quota — ' + cas.nombre + ' emplacements à cette adresse';
    }
    // Nom, contact tappable et mention « aucun membre » : bloc partagé (0024).
    rendreBlocMembre('fiche', membre);

    // « Fiche d'adresse » (navigation, MIROIR de 0019) : ouvre le dossier de
    // l'adresse attribuée. Offerte SEULEMENT si l'emplacement est attribué (le
    // dossier n'existe que là) ET si la page sait héberger la fiche d'adresse
    // (elle câble surOuvrirAdresse) — sinon un bouton mort. Masquée aussi quand
    // on est ARRIVÉ depuis une fiche d'adresse (retourCourant) : le bouton retour
    // ramène déjà à CE dossier (l'adresse de l'emplacement == celle du retour) —
    // pas deux chemins pour le même endroit, ni de va-et-vient sans fin.
    el('fiche-vers-adresse').hidden = !(attribue && options.surOuvrirAdresse) || !!retourCourant;

    // Note du comité de la ligne d'emplacement (annotation durable, non datée).
    const note = el('fiche-note-comite');
    note.hidden = !(ligne && String(ligne.note || '').trim());
    if (!note.hidden) note.textContent = 'Note du comité : ' + ligne.note;

    // --- Sur place : l'état courant au-dessus des boutons qui le changent ---
    const occupation = ligne ? ligne.occupationObservee : '';
    const valeurCourante = ETATS_OCCUPATION.includes(occupation) ? occupation : null;
    for (const bouton of drawer.querySelectorAll('.bouton-occupation')) {
      const actuel = bouton.dataset.occupation === valeurCourante;
      bouton.querySelector('wa-icon')?.remove();
      if (actuel) {
        bouton.setAttribute('variant', 'brand');
        bouton.setAttribute('appearance', 'accent');
        const coche = document.createElement('wa-icon');
        coche.setAttribute('slot', 'start');
        coche.setAttribute('name', 'check');
        bouton.prepend(coche);
      } else {
        bouton.removeAttribute('variant');
        bouton.setAttribute('appearance', 'outlined');
      }
      bouton.setAttribute('aria-pressed', String(actuel));
      bouton.loading = false;
      bouton.disabled = false;
    }
    const date = ligne && ligne.dateObservation ? new Date(ligne.dateObservation) : null;
    const dateValide = date && !Number.isNaN(date.valueOf());
    el('fiche-observation-date').textContent = valeurCourante
      ? 'Dernière observation : ' + valeurCourante
        + (dateValide ? ', le ' + formatDate.format(date) : ' (date inconnue)') + '.'
      : 'Jamais observé pour l\'instant.';

    // --- Journal complet (défilé au plus récent) ---
    const historique = historiqueEmplacement(options.donnees().journal, numeroCourant);
    rendreListeJournal('fiche', historique, decrireEvenement);
  }

  // Cale le journal sur l'événement le plus récent. Sans effet tant que le
  // panneau est masqué (scrollHeight nul, drawer fermé) : rappelé à l'ouverture
  // du drawer — au frame suivant, une fois le panneau réellement mesurable.
  function calerJournal() {
    calerBlocJournal('fiche');
  }
  drawer.addEventListener('wa-after-show', calerJournal);

  // « Sur place » : révèle / replie le relevé d'occupation (panneau replié par
  // défaut). L'état de l'aria le dit aux lecteurs d'écran.
  el('fiche-sur-place').addEventListener('click', () => {
    const panneau = el('fiche-sur-place-panneau');
    const revele = panneau.hasAttribute('hidden');
    panneau.hidden = !revele;
    el('fiche-sur-place').setAttribute('aria-expanded', String(revele));
  });

  // « Fiche d'adresse » : demande à la page d'ouvrir le dossier de l'adresse
  // attribuée, avec retour ici (MIROIR de surOuvrirEmplacement, 0019). La page
  // ferme cette fiche AVANT d'ouvrir la fiche d'adresse — jamais deux drawers.
  el('fiche-vers-adresse').addEventListener('click', () => {
    const ligne = lignePourNumero(numeroCourant);
    if (!ligne || !options.surOuvrirAdresse) return;
    const cle = cleAdresse(ligne);
    if (cle) options.surOuvrirAdresse(cle, adresseLisible(ligne), numeroCourant);
  });

  // « Relancer le membre » : ouvre l'aperçu du courriel (rien n'est envoyé — 0003).
  el('fiche-ecrire').addEventListener('click', () => {
    const ligne = lignePourNumero(numeroCourant);
    const membre = ligne ? chercherMembre(ligne) : undefined;
    if (membre && String(membre.courriel || '').trim()) {
      ouvrirApercuCourriel(courrielRelance(membre, ligne));
    }
  });

  // --- Erreurs : à l'endroit du geste qui a échoué, jamais un état à part ---

  function cacherErreurs() {
    el('fiche-erreur-observer').hidden = true;
    el('fiche-erreur-traiter').hidden = true;
  }

  function montrerErreur(zone, message) {
    const callout = el('fiche-erreur-' + zone);
    el('fiche-erreur-' + zone + '-texte').textContent = message;
    callout.hidden = false;
    callout.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    callout.focus();
  }

  // --- Gestes : POST (mot de passe en corps, 0008), puis état frais (0002) ---

  // Le seul canal vers le backend (client.js) : URL, corps text/plain (0001),
  // mot de passe en corps (0008), enveloppe normalisée. La réaction à une
  // session morte reste ici (sessionEncoreValide) — pas dans le client.
  const client = creerClient({
    fetch: (url, params) => window.fetch(url, params),
    apiUrl: window.OSL_CONFIG.apiUrl,
    motDePasse: options.motDePasse,
  });

  // Ferme la fiche et attend la fin de son animation : wa-drawer restaure le
  // focus à la fermeture — tout re-rendu de la page doit venir APRÈS.
  function fermer() {
    return new Promise((fin) => {
      if (!drawer.hasAttribute('open')) {
        fin();
        return;
      }
      drawer.addEventListener('wa-after-hide', fin, { once: true });
      drawer.removeAttribute('open');
    });
  }

  async function expirerSession() {
    // La session est morte : ne pas rouvrir la fiche d'adresse au passage —
    // la page va montrer l'écran de connexion.
    retourCourant = null;
    await fermer();
    options.surSessionExpiree();
  }

  // Garde commune des gestes : vrai si la session tient ; une session expirée
  // ferme la fiche et rend la main à la page (faux). Le client a déjà normalisé
  // — un refus métier est remonté en ErreurApi avant d'arriver ici.
  async function sessionEncoreValide(resultat) {
    if (resultat.accesRefuse) {
      await expirerSession();
      return false;
    }
    return true;
  }

  // Recharge l'inventaire après un geste réussi : la page range l'état frais
  // et re-rend derrière, la fiche se re-rend en place — et RESTE ouverte
  // (0018). Si le rechargement échoue, le geste est acquis : l'erreur le dit
  // sans accuser le geste.
  async function rafraichir(zone) {
    try {
      const resultat = await client.poster({ action: 'inventaire' });
      if (!(await sessionEncoreValide(resultat))) return;
      options.surDonneesFraiches(resultat);
      rendre();
    } catch (erreurRecharge) {
      // info, pas error, même pour une panne réseau : l'utilisateur est
      // prévenu dans la fiche, et la boucle de captures échoue sur toute
      // console.error.
      console.info('Rechargement après geste impossible :', erreurRecharge.message || erreurRecharge);
      montrerErreur(zone, 'Le geste est bien enregistré, mais la fiche n\'a pas pu se recharger. '
        + 'Fermez-la puis rouvrez-la pour voir l\'état à jour.');
    }
  }

  async function envoyerObservation(occupation) {
    const boutons = [...drawer.querySelectorAll('.bouton-occupation')];
    if (boutons.some((b) => b.loading)) return; // pas de double envoi
    cacherErreurs();
    for (const bouton of boutons) {
      bouton.disabled = true;
      bouton.loading = bouton.dataset.occupation === occupation;
    }
    try {
      const resultat = await client.poster({
        action: 'observerEmplacement', numero: numeroCourant, occupation,
      });
      if (!(await sessionEncoreValide(resultat))) return;
      await rafraichir('observer'); // rendre() rend leurs états aux boutons
    } catch (erreurEnvoi) {
      // Une erreur métier est affichée à l'utilisateur : info en console,
      // pas error (la boucle de captures échoue sur toute console.error).
      if (erreurEnvoi instanceof ErreurApi) console.info('Observation refusée :', erreurEnvoi.message);
      else console.error('Observation impossible :', erreurEnvoi);
      montrerErreur('observer', 'Impossible d\'enregistrer l\'observation. '
        + 'Vérifiez votre connexion Internet, puis réessayez.'
        + (erreurEnvoi instanceof ErreurApi ? ' Détail : ' + erreurEnvoi.message : ''));
      for (const bouton of boutons) {
        bouton.disabled = false;
        bouton.loading = false;
      }
    }
  }

  async function envoyerNote() {
    const bouton = el('fiche-ajouter-note');
    if (bouton.loading) return; // pas de double envoi
    cacherErreurs();
    const champ = el('fiche-champ-note');
    const texte = String(champ.value || '').trim();
    // Même règle que le serveur : le Journal ne reçoit jamais de ligne muette.
    if (!texte) {
      montrerErreur('traiter', 'La note est vide — écrivez ce qui a été fait ou convenu, '
        + 'puis ajoutez-la au journal.');
      return;
    }
    bouton.loading = true;
    try {
      const resultat = await client.poster({ action: 'ajouterNote', numero: numeroCourant, texte });
      if (!(await sessionEncoreValide(resultat))) return;
      champ.value = ''; // vidé après succès seulement — l'échec le conserve
      await rafraichir('traiter'); // la note se relit dans le journal, fiche ouverte
    } catch (erreurEnvoi) {
      if (erreurEnvoi instanceof ErreurApi) console.info('Note refusée :', erreurEnvoi.message);
      else console.error('Note impossible :', erreurEnvoi);
      montrerErreur('traiter', 'Impossible d\'ajouter la note — votre texte est conservé. '
        + 'Vérifiez votre connexion Internet, puis réessayez.'
        + (erreurEnvoi instanceof ErreurApi ? ' Détail : ' + erreurEnvoi.message : ''));
    } finally {
      bouton.loading = false;
    }
  }

  async function envoyerLiberation() {
    const bouton = el('fiche-liberer');
    if (bouton.loading) return; // pas de double envoi
    cacherErreurs();
    bouton.loading = true;
    try {
      const resultat = await client.poster({ action: 'libererEmplacement', numero: numeroCourant });
      if (!(await sessionEncoreValide(resultat))) return;
      // La fiche reste ouverte (0018) : le statut bascule sous les yeux et la
      // libération se lit au journal — c'est le feedback (0016).
      await rafraichir('traiter');
    } catch (erreurEnvoi) {
      if (erreurEnvoi instanceof ErreurApi) console.info('Libération refusée :', erreurEnvoi.message);
      else console.error('Libération impossible :', erreurEnvoi);
      montrerErreur('traiter', 'Impossible de libérer l\'emplacement. '
        + 'Vérifiez votre connexion Internet, puis réessayez.'
        + (erreurEnvoi instanceof ErreurApi ? ' Détail : ' + erreurEnvoi.message : ''));
    } finally {
      bouton.loading = false;
    }
  }

  for (const bouton of drawer.querySelectorAll('.bouton-occupation')) {
    bouton.addEventListener('click', () => envoyerObservation(bouton.dataset.occupation));
  }

  el('fiche-formulaire-note').addEventListener('submit', (evenement) => {
    evenement.preventDefault();
    envoyerNote();
  });

  el('fiche-liberer').addEventListener('click', () => {
    const ligne = lignePourNumero(numeroCourant);
    const dialogue = el('fiche-dialogue-liberer');
    dialogue.setAttribute('label', 'Libérer l\'emplacement ' + numeroCourant + ' ?');
    el('fiche-dialogue-liberer-texte').textContent =
      'L\'adresse ' + adresseLisible(ligne) + ' sera retirée de l\'emplacement '
      + numeroCourant + ' et la libération sera consignée au journal. L\'emplacement '
      + 'redeviendra disponible pour un autre membre de la communauté.';
    dialogue.setAttribute('open', '');
  });

  el('fiche-dialogue-liberer-confirmer').addEventListener('click', () => {
    // La confirmation se referme d'elle-même (data-dialog) ; l'envoi part
    // après sa fermeture, la fiche reste ouverte en dessous.
    el('fiche-dialogue-liberer')
      .addEventListener('wa-after-hide', () => envoyerLiberation(), { once: true });
  });

  // Le bouton retour ne fait que fermer : le retour lui-même est joué à la
  // fermeture du drawer (wa-after-hide), pour que X et échap reviennent aussi
  // à la fiche d'adresse — dans ce contexte, elle EST la page d'origine.
  el('fiche-retour').addEventListener('click', () => drawer.removeAttribute('open'));
  drawer.addEventListener('wa-after-hide', (evenement) => {
    if (evenement.target !== drawer || !retourCourant) return;
    const retour = retourCourant;
    retourCourant = null;
    retour.surRetour();
  });

  // Ouvre la fiche d'un numéro. Attend l'upgrade des composants injectés :
  // poser une propriété (value, loading) sur un élément pas encore upgradé la
  // ferait disparaître à l'upgrade. `retour` (0019, ouverture depuis une fiche
  // d'adresse) : { libelle, surRetour } — affiche « Retour à <libelle> » et
  // rejoue surRetour à la fermeture du drawer.
  async function ouvrir(numero, retour) {
    await Promise.all(['wa-drawer', 'wa-dialog', 'wa-textarea', 'wa-button', 'wa-callout']
      .map((nom) => customElements.whenDefined(nom)));
    numeroCourant = numero;
    retourCourant = retour || null;
    el('fiche-retour-zone').hidden = !retourCourant;
    if (retourCourant) {
      el('fiche-retour-texte').textContent = 'Retour à ' + retourCourant.libelle;
    }
    // Contenant selon l'écran AU MOMENT de l'ouverture : la fiche monte du bas
    // sur téléphone (le contexte reste visible au-dessus), glisse du côté sur
    // grand écran — même contenu (0018). Seuil distinct du 480px de theme.css :
    // ici on choisit le CONTENANT (une tablette étroite préfère le bas), là-bas
    // on condense les espacements des seuls vrais téléphones.
    drawer.setAttribute('placement', matchMedia('(max-width: 640px)').matches ? 'bottom' : 'end');
    // Le relevé « Sur place » repart replié à chaque ouverture : la fiche reste
    // épurée, l'observation est un geste explicite.
    el('fiche-sur-place-panneau').hidden = true;
    el('fiche-sur-place').setAttribute('aria-expanded', 'false');
    el('fiche-champ-note').value = '';
    el('fiche-ajouter-note').loading = false;
    el('fiche-liberer').loading = false;
    cacherErreurs();
    rendre();
    drawer.setAttribute('open', '');
  }

  return { ouvrir, fermer };
}
