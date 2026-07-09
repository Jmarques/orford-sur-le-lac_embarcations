// Fiche d'adresse (décisions 0019, généralisée 0024) : LE dossier d'une
// ADRESSE — le sujet est l'adresse, pas un emplacement. Généralisée à
// N'IMPORTE QUELLE adresse (plus seulement les cas « Hors quota ») via
// casAdresse généralisé (04). Coquille unifiée avec la fiche d'emplacement
// (fiche.js, 0024) : `[Sujet? · Membre · Emplacements de l'adresse · Journal]`,
// les blocs Membre et Journal partagés (blocs-fiche.js).
//
//   · Le SUJET n'apparaît QUE pour un problème/exception : callout neutre
//     « Hors quota » qui PORTE son remède (« Demander de libérer une place »,
//     aperçu du courriel — rien n'est envoyé, 0003). AUCUN callout quand
//     l'adresse est « dans le quota » : le calme signale l'absence de problème.
//   · Chaque emplacement ouvre sa fiche d'emplacement (avec retour, 0019) ;
//     la section est masquée quand l'adresse n'a aucun emplacement.
// Composant sans build (0004) : injecte son markup et rend `ouvrir(cle)` ; tout
// vient de donnees(), posé par textContent (anti-XSS) ; un geste laisse la fiche
// ouverte — le feedback est le changement visible (0016). Dépend de grille.js /
// presentation.js / blocs-fiche.js, chargés avant.
//
// Quand l'adresse a une DEMANDE en cours (décision 0024, amende 0020), la fiche
// la traite INLINE : un callout « Demande en cours » porte son remède (attribuer
// une place suggérée avec niveau + confirmation, ou refuser avec une raison),
// le contact de la demande en compact (un seul « Mettre à jour le contact » s'il
// diffère du membre). Le cas demande-seule (adresse sans membre ni emplacement)
// n'a ni bloc Membre, ni liste d'emplacements, ni journal — rien où attacher une
// note tant que l'adresse n'existe pas.
//
// options :
//   donnees()          → { structures, emplacements, membres, journal, demandes } courants.
//   motDePasse()       → le mot de passe du comité (session).
//   surDonneesFraiches(inventaire) — la page range l'état frais et re-rend.
//   surSessionExpiree() — la fiche s'est fermée, la page montre la connexion.
//   surOuvrirEmplacement(numero, cle, adresse) — la page ferme cette fiche et
//                      ouvre la fiche d'emplacement avec retour (0019).

/* global statutEmplacement, casAdresse, journalDeCas, apparenceStatut, cartePositions,
   demandeEnCoursAdresse, diffContact, suggestionsEmplacements, situationAttribution,
   estMobiliteReduite, chercherMembreParCle, formatAdresse,
   creerBlocMembre, rendreBlocMembre, creerBlocJournal, rendreListeJournal, calerBlocJournal,
   ouvrirApercuCourriel */

function creerFicheAdresse(options) {
  document.body.insertAdjacentHTML('beforeend', `
    <wa-drawer id="fiche-adresse" label="Adresse">
      <div class="corps-fiche-adresse wa-stack wa-gap-l">
        <!-- SUJET — callout SEULEMENT pour un problème/exception (Hors quota) :
             il porte alors son remède, rattaché au problème qu'il résout (0024).
             Neutre : une règle de gestion, pas une urgence de terrain. Rien
             « dans le quota » — le calme signale l'absence de problème. -->
        <wa-callout id="fiche-adresse-statut" variant="neutral" hidden>
          <wa-icon slot="icon" name="circle-info"></wa-icon>
          <div class="wa-stack wa-gap-2xs">
            <strong id="fiche-adresse-statut-libelle"></strong>
            <span id="fiche-adresse-statut-detail" class="detail-statut"></span>
            <!-- Remède DANS le callout, séparé du texte par un filet : ce qu'il
                 résout se lit à côté du problème (0024). L'aperçu du courriel
                 porte la réassurance « rien n'est envoyé » (0003). -->
            <div id="fiche-adresse-remedes" class="remedes" hidden>
              <wa-button id="fiche-adresse-demander" variant="brand" appearance="accent" size="m">
                <wa-icon slot="start" name="envelope"></wa-icon>
                Demander de libérer une place
              </wa-button>
            </div>
          </div>
        </wa-callout>

        <!-- DEMANDE EN COURS (0024, amende 0020) : quand l'adresse a une demande
             NOUVELLE, la fiche la traite ICI. Le callout PORTE son remède —
             attribuer (suggestions + confirmation) ou refuser (raison) — comme
             tout remède rattaché au problème qu'il résout (0024). Masqué quand
             aucune demande n'attend. Contact COMPACT (fini le diff champ par
             champ) : une ligne + un seul « Mettre à jour » si diff. -->
        <wa-callout id="fiche-adresse-demande" variant="brand" hidden>
          <wa-icon slot="icon" name="inbox"></wa-icon>
          <div class="wa-stack wa-gap-m corps-demande-adresse">
            <div class="wa-stack wa-gap-2xs">
              <strong>Demande en cours</strong>
              <span id="fiche-adresse-demande-type" class="detail-statut"></span>
            </div>
            <wa-badge id="fiche-adresse-demande-mobilite" variant="warning" appearance="filled-outlined" pill hidden>
              <wa-icon name="person-cane"></wa-icon> Priorité niveau bas (mobilité réduite)
            </wa-badge>
            <div id="fiche-adresse-demande-note-bloc" class="wa-stack wa-gap-2xs" hidden>
              <span class="wa-caption-m">Note du membre</span>
              <p id="fiche-adresse-demande-note" class="note-membre"></p>
            </div>

            <!-- Contact de la demande, COMPACT : une ligne, + un seul geste. -->
            <div class="wa-stack wa-gap-2xs">
              <span class="wa-caption-m">Contact de la demande</span>
              <p id="fiche-adresse-demande-contact"></p>
              <p id="fiche-adresse-demande-contact-nouveau" class="detail-statut" hidden>Nouveau contact —
                il sera enregistré à l'acceptation de la demande.</p>
              <div id="fiche-adresse-demande-maj-zone" class="wa-cluster wa-gap-s wa-align-items-center" hidden>
                <span class="detail-statut">Diffère du contact enregistré.</span>
                <wa-button id="fiche-adresse-demande-maj" appearance="outlined" variant="brand" size="s">
                  <wa-icon slot="start" name="pen"></wa-icon>
                  Mettre à jour le contact
                </wa-button>
              </div>
              <wa-callout id="fiche-adresse-demande-contact-erreur" variant="danger" role="alert" tabindex="-1" hidden>
                <wa-icon slot="icon" name="circle-exclamation"></wa-icon>
                <span id="fiche-adresse-demande-contact-erreur-texte"></span>
              </wa-callout>
            </div>

            <!-- Attribuer une place : Disponibles compatibles, le NIVEAU montré
                 avec le numéro ; on sélectionne PUIS on confirme (jamais en un
                 tap, 0024) ; le quota reste bloquant (0020). -->
            <div class="wa-stack wa-gap-s">
              <strong id="fiche-adresse-demande-attribuer-titre">Attribuer une place</strong>
              <p id="fiche-adresse-demande-quota-bloque" class="note-membre" hidden></p>
              <div id="fiche-adresse-demande-suggestions" class="wa-stack wa-gap-m"></div>
              <p id="fiche-adresse-demande-suggestions-vide" class="section-vide-neutre" hidden>
                <wa-icon name="binoculars"></wa-icon> Aucune place observée libre dans les structures
                compatibles — faites une tournée pour en trouver.
              </p>
              <p id="fiche-adresse-demande-choisir-invite" class="detail-statut" hidden>Touchez un emplacement
                ci-dessus pour l'attribuer.</p>
              <wa-callout id="fiche-adresse-demande-erreur" variant="danger" role="alert" tabindex="-1" hidden>
                <wa-icon slot="icon" name="circle-exclamation"></wa-icon>
                <span id="fiche-adresse-demande-erreur-texte"></span>
              </wa-callout>
              <div id="fiche-adresse-demande-accepter-zone" class="wa-cluster wa-gap-s" hidden>
                <wa-button id="fiche-adresse-demande-accepter" variant="brand" appearance="accent" size="m">
                  <wa-icon slot="start" name="circle-check"></wa-icon>
                  <span id="fiche-adresse-demande-accepter-texte">Attribuer et accepter</span>
                </wa-button>
              </div>
            </div>

            <!-- Ou refuser : une raison obligatoire, journalisée (0020). -->
            <form id="fiche-adresse-demande-formulaire-refus" class="wa-stack wa-gap-s">
              <wa-textarea id="fiche-adresse-demande-raison" label="Ou refuser la demande" rows="1" resize="auto"
                           placeholder="ex. : aucune place compatible libre cette saison"></wa-textarea>
              <div class="wa-cluster wa-gap-s">
                <wa-button id="fiche-adresse-demande-refuser" type="submit" appearance="outlined">
                  <wa-icon slot="start" name="circle-xmark"></wa-icon>
                  Refuser la demande
                </wa-button>
              </div>
            </form>
          </div>
        </wa-callout>

        <!-- MEMBRE (bloc partagé, 0024) : contact courant de l'adresse. -->
        ${creerBlocMembre({ prefixe: 'fiche-adresse', avecAdresse: false, avecQuota: false, conteneurCache: false, nomCache: true })}

        <!-- CORPS PROPRE — les emplacements de l'adresse, chacun ouvrant sa
             fiche. Section masquée quand l'adresse n'a aucun emplacement (0024). -->
        <div id="fiche-adresse-section-emplacements" class="wa-stack wa-gap-s">
          <h3 class="wa-heading-s">Les emplacements de l'adresse</h3>
          <ul id="fiche-adresse-emplacements" class="liste-emplacements-adresse wa-stack wa-gap-xs"></ul>
        </div>

        <!-- JOURNAL (bloc partagé, 0024) : événements + ajout de note. Masqué
             pour une adresse demande-seule : rien où attacher une note tant que
             l'adresse n'existe pas (0024). -->
        <div id="fiche-adresse-section-journal" class="wa-stack wa-gap-s">
          ${creerBlocJournal({ prefixe: 'fiche-adresse', sujet: 'l\'adresse', amorce: 'ex. : toléré à 3 jusqu\'au printemps — Jeremy', erreurId: 'fiche-adresse-erreur' })}
        </div>
      </div>
    </wa-drawer>
  `);

  const el = (id) => document.getElementById(id);
  const drawer = el('fiche-adresse');
  const formatDate = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long' });

  // ErreurApi (erreur métier montrable) et le transport vers le backend
  // viennent du module client (client.js, chargé avant fiche-adresse.js).

  // La clé normalisée du cas ouvert, et son adresse lisible (le texte de la
  // Sheet — la clé ne s'affiche jamais).
  let cleCourante = '';
  let adresseCourante = '';
  // L'emplacement sélectionné dans les suggestions de la demande, avant
  // confirmation — jamais d'attribution en un tap (0024).
  let numeroChoisi = null;

  function donneesCas() {
    return casAdresse(cleCourante, options.donnees().emplacements, options.donnees().membres);
  }

  // La demande en cours de l'adresse ouverte (0024) : la plus ancienne demande
  // NOUVELLE portant sa clé, ou undefined. Un seul foyer de vérité pour le rendu
  // ET les gestes (accepter/refuser/mettre à jour) — la demande est relue frais
  // au moment du clic, jamais capturée dans une fermeture.
  function demandeCourante() {
    return demandeEnCoursAdresse(cleCourante, options.donnees().demandes);
  }

  function rangeeEmplacement(ligne, positions) {
    const element = document.createElement('li');
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'rangee-emplacement';
    bouton.dataset.numero = String(ligne.numero);
    // Deux lignes courtes dans la largeur d'un drawer : numéro + pastille de
    // statut d'abord, position en légende dessous — jamais de repli en plein
    // milieu d'une mention.
    const texte = document.createElement('span');
    texte.className = 'rangee-emplacement-texte';
    const enTete = document.createElement('span');
    enTete.className = 'rangee-emplacement-en-tete';
    const titre = document.createElement('span');
    titre.className = 'rangee-emplacement-titre';
    titre.textContent = 'Emplacement ' + ligne.numero;
    const statut = statutEmplacement(ligne);
    const pastille = document.createElement('wa-badge');
    // La couleur ne porte jamais seule : le libellé accompagne (décision 0016).
    pastille.setAttribute('variant', apparenceStatut(statut.code).variante);
    pastille.setAttribute('appearance', 'filled-outlined');
    pastille.textContent = statut.libelle;
    enTete.append(titre, pastille);
    texte.appendChild(enTete);
    const position = positions.get(Number(ligne.numero));
    if (position) {
      const sousTitre = document.createElement('span');
      sousTitre.className = 'wa-caption-m wa-color-text-quiet';
      sousTitre.textContent = 'Structure ' + position.structure
        + (position.niveau !== '' ? ' · Niveau ' + position.niveau : '');
      texte.appendChild(sousTitre);
    }
    const chevron = document.createElement('wa-icon');
    chevron.className = 'rangee-chevron';
    chevron.setAttribute('name', 'chevron-right');
    chevron.setAttribute('aria-hidden', 'true');
    bouton.append(texte, chevron);
    bouton.addEventListener('click', () => {
      options.surOuvrirEmplacement(Number(ligne.numero), cleCourante, adresseCourante);
    });
    element.appendChild(bouton);
    return element;
  }

  // Le descripteur d'un événement du journal de l'adresse pour le bloc partagé
  // (blocs-fiche.js) : la libération nomme son emplacement, la note d'adresse
  // parle du dossier entier.
  function decrireEvenement(evenement) {
    const liberation = evenement.action === 'libération';
    return {
      icone: liberation ? 'unlock' : 'pen',
      label: liberation ? 'Libération' : 'Note',
      texte: (liberation && evenement.numero !== null
        ? 'Emplacement ' + evenement.numero + ' — ' : '') + evenement.details,
    };
  }

  // Le fait du dépassement + l'effet du remède, en une phrase — jamais son
  // impératif : « demandez de libérer » vit sur le bouton, pas dans le texte
  // (un seul foyer, 0016 ; et rien à contredire quand aucun membre n'est
  // inscrit). Le dépassement est dit en toutes lettres : le lecteur n'a pas à
  // calculer que 4 > 3 (public aîné). Même tournure que la fiche d'emplacement.
  function detailHorsQuota(cas) {
    const nombres = ['un', 'deux', 'trois', 'quatre'];
    const enPlus = nombres[cas.depassement - 1] || String(cas.depassement);
    const regle = cas.quota === 2 ? 'le quota de 2' : 'l\'exception accordée à ' + cas.quota;
    const pluriel = cas.nombre > 1 ? 's' : '';
    const liberer = cas.depassement > 1 ? 'En libérer ' + enPlus + ' ramènerait' : 'En libérer un ramènerait';
    return cas.nombre + ' emplacement' + pluriel + ' attribué' + pluriel + ', '
      + enPlus + ' de plus que ' + regle + '. ' + liberer + ' l\'adresse dans le quota.';
  }

  // Le courriel pré-rempli n'est JAMAIS envoyé par l'app (0003) : le membre du
  // comité le relit et l'envoie depuis son propre client mail (via l'aperçu
  // partagé, blocs-fiche.js). Ton factuel et rassurant — la fiche parle d'un
  // membre de la communauté, pas d'un fautif. Offert seulement hors quota.
  function courrielRelance(cas) {
    const numeros = cas.emplacements.map((l) => l.numero).join(', ');
    const regle = cas.quota === 2
      ? 'La règle de la communauté est de 2 emplacements par adresse.'
      : 'Votre adresse a une exception accordée à ' + cas.quota + ' emplacements.';
    const corps = [
      'Bonjour ' + String(cas.membre.nom || '').trim() + ',',
      '',
      'Votre adresse (' + cas.adresse + ') a actuellement ' + cas.nombre
        + ' emplacements d\'embarcation : ' + numeros + '. ' + regle,
      '',
      'Utilisez-vous encore chacun d\'eux ? Si vous pouvez en libérer un, '
        + 'dites-le-nous : d\'autres membres de la communauté attendent une place.',
      '',
      'Merci,',
      'Le comité administratif — Orford sur le Lac',
    ].join('\n');
    return {
      courriel: cas.membre.courriel,
      sujet: 'Vos emplacements d\'embarcation — Orford sur le Lac',
      corps,
    };
  }

  // Une suggestion : un bouton-emplacement sélectionnable (numéro + niveau —
  // le niveau montré AVEC le numéro, 0024). Un tap sélectionne ; l'attribution
  // se confirme ensuite (jamais en un tap). Coche franche sur la place choisie :
  // l'état sélectionné ne repose pas sur la seule teinte (public aîné).
  function boutonSuggestion(emplacement) {
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'suggestion-emplacement';
    bouton.dataset.numero = String(emplacement.numero);
    bouton.setAttribute('aria-pressed', String(numeroChoisi === emplacement.numero));
    const titre = document.createElement('span');
    titre.className = 'suggestion-numero';
    titre.textContent = 'n° ' + emplacement.numero;
    const niveau = document.createElement('span');
    niveau.className = 'wa-caption-m wa-color-text-quiet';
    niveau.textContent = emplacement.niveau === '' ? 'au sol' : 'niveau ' + emplacement.niveau;
    bouton.append(titre, niveau);
    if (numeroChoisi === emplacement.numero) {
      const coche = document.createElement('wa-icon');
      coche.setAttribute('name', 'circle-check');
      coche.className = 'suggestion-coche';
      bouton.appendChild(coche);
    }
    bouton.addEventListener('click', () => {
      numeroChoisi = numeroChoisi === emplacement.numero ? null : emplacement.numero;
      rendre();
    });
    return bouton;
  }

  // Un groupe de suggestions : les Disponibles d'une structure compatible.
  function groupeSuggestions(groupe) {
    const bloc = document.createElement('div');
    bloc.className = 'groupe-suggestions wa-stack wa-gap-2xs';
    const titre = document.createElement('h4');
    titre.className = 'wa-heading-s titre-structure-suggestion';
    titre.textContent = 'Structure ' + groupe.structure;
    bloc.appendChild(titre);
    if (groupe.accepteTout) {
      const mention = document.createElement('span');
      mention.className = 'wa-caption-m wa-color-text-quiet';
      mention.textContent = 'accepte toutes les embarcations';
      bloc.appendChild(mention);
    }
    const grille = document.createElement('div');
    grille.className = 'grille-suggestions wa-cluster wa-gap-xs';
    grille.append(...groupe.emplacements.map(boutonSuggestion));
    bloc.appendChild(grille);
    return bloc;
  }

  // Le bloc « Demande en cours » (0024) : type / date / mobilité, contact
  // COMPACT, puis attribuer (suggestions + confirmation) ou refuser. Masqué
  // quand aucune demande n'attend — le calme signale alors l'absence de demande.
  function rendreDemande(demande, donnees) {
    const bloc = el('fiche-adresse-demande');
    bloc.hidden = !demande;
    if (!demande) {
      numeroChoisi = null;
      return;
    }

    // En-tête : type · date de réception, priorité PMR le cas échéant.
    const recue = new Date(demande.date);
    el('fiche-adresse-demande-type').textContent = demande.type + ' · '
      + (Number.isNaN(recue.valueOf()) ? 'reçue à une date inconnue' : 'reçue le ' + formatDate.format(recue));
    el('fiche-adresse-demande-mobilite').hidden = !estMobiliteReduite(demande);
    const note = String(demande.note || '').trim();
    el('fiche-adresse-demande-note-bloc').hidden = !note;
    if (note) el('fiche-adresse-demande-note').textContent = note;

    // Contact COMPACT : une ligne ; « nouveau contact » si aucun membre inscrit,
    // sinon un seul « Mettre à jour le contact » s'il diffère de l'enregistré.
    const membre = chercherMembreParCle(donnees.membres, cleCourante);
    // Espace insécable après le point médian : le « · » reste collé au champ
    // suivant, jamais orphelin en fin de ligne quand le contact se replie
    // (même convention que la rangée du registre).
    el('fiche-adresse-demande-contact').textContent = [demande.nom, demande.courriel, demande.telephone]
      .map((x) => String(x || '').trim()).filter(Boolean).join(' · ');
    const diff = diffContact(demande, membre);
    el('fiche-adresse-demande-contact-nouveau').hidden = !diff.membreAbsent;
    el('fiche-adresse-demande-maj-zone').hidden = !diff.aDifference;

    // Attribuer : suggestions + confirmation ; le quota reste bloquant (0020).
    rendreAttributionDemande(demande, donnees);
  }

  function rendreAttributionDemande(demande, donnees) {
    const situation = situationAttribution(cleCourante, donnees.emplacements, donnees.membres);
    const bloque = situation.bloque;
    // Le titre ne promet pas une action indisponible (revue UI, fiche de demande).
    el('fiche-adresse-demande-attribuer-titre').textContent = bloque
      ? 'Attribution impossible pour l\'instant' : 'Attribuer une place';
    el('fiche-adresse-demande-quota-bloque').hidden = !bloque;
    if (bloque) {
      el('fiche-adresse-demande-quota-bloque').textContent = 'Cette adresse a déjà ' + situation.nombre
        + (situation.nombre > 1 ? ' emplacements' : ' emplacement') + ' pour un quota de ' + situation.quota
        + '. Pour attribuer quand même, augmentez le quota accordé de cette adresse dans l\'onglet Membres, '
        + 'puis rouvrez la fiche.';
    }

    const groupes = bloque ? [] : suggestionsEmplacements(demande, donnees.structures, donnees.emplacements);
    el('fiche-adresse-demande-suggestions').replaceChildren(...groupes.map(groupeSuggestions));
    el('fiche-adresse-demande-suggestions-vide').hidden = bloque || groupes.length > 0;

    // Le numéro choisi peut avoir disparu (rechargement) : on le réinitialise.
    const existeEncore = groupes.some((g) => g.emplacements.some((e) => e.numero === numeroChoisi));
    if (!existeEncore) numeroChoisi = null;
    // Aucun bouton désactivé pâle : une invite tant que rien n'est choisi, puis
    // le bouton plein une fois la place sélectionnée (revue UI, fiche de demande).
    const aSuggestions = !bloque && groupes.length > 0;
    el('fiche-adresse-demande-choisir-invite').hidden = !(aSuggestions && numeroChoisi === null);
    el('fiche-adresse-demande-accepter-zone').hidden = !(aSuggestions && numeroChoisi !== null);
    if (numeroChoisi !== null) {
      el('fiche-adresse-demande-accepter-texte').textContent = 'Attribuer le n° ' + numeroChoisi + ' et accepter';
    }
  }

  // --- Rendu : tout se recalcule depuis donnees(), la fiche se remplit en place ---

  function rendre() {
    const cas = donneesCas();
    const donnees = options.donnees();
    const demande = demandeCourante();
    // L'adresse « existe » dès qu'elle a un membre OU une attribution (casAdresse
    // non-null). Sinon, une demande seule ouvre le dossier : contact via la
    // demande, pas de membre, pas d'emplacements, pas de journal (0024).
    const demandeSeule = !cas && !!demande;

    if (drawer.getAttribute('label') !== adresseCourante) {
      drawer.setAttribute('label', adresseCourante);
    }

    // --- Sujet : callout SEULEMENT hors quota ; rien « dans le quota » (0024) ---
    // Le calme signale lui-même l'absence de problème. Une libération qui
    // referme le cas fait simplement disparaître le callout, fiche ouverte : la
    // liste d'emplacements rétrécit et le journal la raconte — c'est le feedback.
    const membre = cas ? cas.membre : undefined;
    const horsQuota = !!(cas && cas.depassement > 0);
    const callout = el('fiche-adresse-statut');
    const peutDemander = horsQuota && !!(membre && String(membre.courriel || '').trim());
    if (horsQuota) {
      el('fiche-adresse-statut-libelle').textContent = 'Hors quota';
      el('fiche-adresse-statut-detail').textContent = detailHorsQuota(cas);
      el('fiche-adresse-remedes').hidden = !peutDemander;
      callout.hidden = false;
    } else {
      callout.hidden = true;
      el('fiche-adresse-remedes').hidden = true;
    }

    // La demande en cours : traitée inline dans son propre callout (0024).
    // Masquée quand aucune demande n'attend.
    rendreDemande(demande, donnees);

    // Le membre : contact courant de l'adresse (0010), mention calme sinon —
    // bloc partagé (0024). Masqué pour une adresse demande-seule : le contact
    // vient alors de la demande (pas de bloc Membre en double, 0024).
    el('fiche-adresse-membre').hidden = demandeSeule;
    if (!demandeSeule) rendreBlocMembre('fiche-adresse', membre);

    // Les emplacements du dossier : le statut de chacun se lit en toutes lettres,
    // le tap ouvre sa fiche. Section masquée quand l'adresse n'en a aucun (0024).
    const liste = el('fiche-adresse-emplacements');
    const emplacements = cas ? cas.emplacements : [];
    const positions = cartePositions(donnees.structures);
    liste.replaceChildren(...emplacements.map((ligne) => rangeeEmplacement(ligne, positions)));
    el('fiche-adresse-section-emplacements').hidden = emplacements.length === 0;

    // Le journal du dossier : notes d'adresse + libérations des emplacements.
    // Masqué pour une adresse demande-seule : rien où attacher une note tant
    // que l'adresse n'existe pas (0024).
    el('fiche-adresse-section-journal').hidden = demandeSeule;
    const numeros = emplacements.map((l) => Number(l.numero));
    const evenements = journalDeCas(donnees.journal, cleCourante, numeros);
    rendreListeJournal('fiche-adresse', evenements, decrireEvenement);
  }

  // « Demander de libérer une place » : ouvre l'aperçu du courriel pré-rédigé
  // (rien n'est envoyé — 0003). Offert seulement quand l'adresse dépasse et que
  // le membre a un courriel — le rendu masque sinon le remède.
  el('fiche-adresse-demander').addEventListener('click', () => {
    const cas = donneesCas();
    if (cas && cas.depassement > 0 && cas.membre && String(cas.membre.courriel || '').trim()) {
      ouvrirApercuCourriel(courrielRelance(cas));
    }
  });

  // Cale le journal sur l'événement le plus récent (bloc partagé, voir fiche.js).
  function calerJournal() {
    calerBlocJournal('fiche-adresse');
  }
  drawer.addEventListener('wa-after-show', calerJournal);

  function cacherErreur() {
    el('fiche-adresse-erreur').hidden = true;
  }

  function montrerErreur(message) {
    const callout = el('fiche-adresse-erreur');
    el('fiche-adresse-erreur-texte').textContent = message;
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

  // Garde commune des gestes : vrai si la session tient ; une session expirée
  // ferme la fiche et rend la main à la page (faux). Le client a déjà normalisé
  // — un refus métier est remonté en ErreurApi avant d'arriver ici.
  async function sessionEncoreValide(resultat) {
    if (resultat.accesRefuse) {
      await fermer();
      options.surSessionExpiree();
      return false;
    }
    return true;
  }

  async function rafraichir() {
    try {
      const resultat = await client.poster({ action: 'inventaire' });
      if (!(await sessionEncoreValide(resultat))) return;
      options.surDonneesFraiches(resultat);
      rendre();
    } catch (erreurRecharge) {
      console.info('Rechargement après geste impossible :', erreurRecharge.message || erreurRecharge);
      montrerErreur('Le geste est bien enregistré, mais la fiche n\'a pas pu se recharger. '
        + 'Fermez-la puis rouvrez-la pour voir l\'état à jour.');
    }
  }

  async function envoyerNote() {
    const bouton = el('fiche-adresse-ajouter-note');
    if (bouton.loading) return; // pas de double envoi
    cacherErreur();
    const champ = el('fiche-adresse-champ-note');
    const texte = String(champ.value || '').trim();
    if (!texte) {
      montrerErreur('La note est vide — écrivez ce qui a été fait ou convenu, '
        + 'puis ajoutez-la au journal.');
      return;
    }
    bouton.loading = true;
    try {
      // La note vise l'ADRESSE (0019) : le texte lisible de la Sheet, jamais
      // la clé normalisée — le Journal reste lisible par un humain.
      const resultat = await client.poster({ action: 'ajouterNote', adresse: adresseCourante, texte });
      if (!(await sessionEncoreValide(resultat))) return;
      champ.value = ''; // vidé après succès seulement — l'échec le conserve
      await rafraichir();
    } catch (erreurEnvoi) {
      if (erreurEnvoi instanceof ErreurApi) console.info('Note refusée :', erreurEnvoi.message);
      else console.error('Note impossible :', erreurEnvoi);
      montrerErreur('Impossible d\'ajouter la note — votre texte est conservé. '
        + 'Vérifiez votre connexion Internet, puis réessayez.'
        + (erreurEnvoi instanceof ErreurApi ? ' Détail : ' + erreurEnvoi.message : ''));
    } finally {
      bouton.loading = false;
    }
  }

  el('fiche-adresse-formulaire-note').addEventListener('submit', (evenement) => {
    evenement.preventDefault();
    envoyerNote();
  });

  // --- Gestes de la demande (0024) : accepter, refuser, mettre à jour le contact.
  // Ils réutilisent les actions backend de 0020 (deciderDemande, majContactDemande)
  // et laissent la fiche ouverte : la demande décidée quitte l'état « en cours »,
  // le bloc disparaît, l'emplacement attribué apparaît — le feedback est visible.

  function cacherErreursDemande() {
    el('fiche-adresse-demande-erreur').hidden = true;
    el('fiche-adresse-demande-contact-erreur').hidden = true;
  }

  function montrerErreurDemande(id, message) {
    const callout = el(id);
    el(id + '-texte').textContent = message;
    callout.hidden = false;
    callout.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    callout.focus();
  }

  // Un geste de demande : bouton en attente, envoi, rechargement, gestion
  // d'erreur — même patron que la note, mais avec sa propre zone d'erreur.
  async function faireGesteDemande(bouton, corps, idErreur, messageEchec) {
    if (bouton.loading) return;
    cacherErreursDemande();
    bouton.loading = true;
    try {
      const resultat = await client.poster(corps);
      if (!(await sessionEncoreValide(resultat))) return;
      await rafraichir();
    } catch (erreur) {
      if (erreur instanceof ErreurApi) console.info('Geste de demande refusé :', erreur.message);
      else console.error('Geste de demande impossible :', erreur);
      montrerErreurDemande(idErreur, messageEchec
        + (erreur instanceof ErreurApi ? ' Détail : ' + erreur.message : ''));
    } finally {
      bouton.loading = false;
    }
  }

  el('fiche-adresse-demande-accepter').addEventListener('click', () => {
    if (numeroChoisi === null) return;
    const demande = demandeCourante();
    if (!demande) return;
    faireGesteDemande(el('fiche-adresse-demande-accepter'),
      { action: 'deciderDemande', decision: 'accepter', demandeId: demande.id, numero: numeroChoisi },
      'fiche-adresse-demande-erreur',
      'Impossible d\'attribuer cet emplacement. Vérifiez votre connexion Internet, puis réessayez.');
  });

  el('fiche-adresse-demande-formulaire-refus').addEventListener('submit', (evenement) => {
    evenement.preventDefault();
    const demande = demandeCourante();
    if (!demande) return;
    const raison = String(el('fiche-adresse-demande-raison').value || '').trim();
    if (!raison) {
      montrerErreurDemande('fiche-adresse-demande-erreur', 'Donnez une raison au refus — elle est '
        + 'journalisée et explique la décision.');
      return;
    }
    faireGesteDemande(el('fiche-adresse-demande-refuser'),
      { action: 'deciderDemande', decision: 'refuser', demandeId: demande.id, raison },
      'fiche-adresse-demande-erreur',
      'Impossible de refuser la demande. Vérifiez votre connexion Internet, puis réessayez.');
  });

  el('fiche-adresse-demande-maj').addEventListener('click', () => {
    const demande = demandeCourante();
    if (!demande) return;
    faireGesteDemande(el('fiche-adresse-demande-maj'),
      { action: 'majContactDemande', demandeId: demande.id },
      'fiche-adresse-demande-contact-erreur',
      'Impossible de mettre à jour le contact. Vérifiez votre connexion Internet, puis réessayez.');
  });

  // Ouvre la fiche d'un cas par sa clé d'adresse normalisée. La clé peut désigner
  // une adresse SANS attribution ni membre (demande seule) : son libellé vient
  // alors de la demande, casAdresse étant null (0024).
  async function ouvrir(cle) {
    await Promise.all(['wa-drawer', 'wa-dialog', 'wa-textarea', 'wa-button', 'wa-callout', 'wa-badge']
      .map((nom) => customElements.whenDefined(nom)));
    cleCourante = cle;
    numeroChoisi = null;
    const cas = donneesCas();
    const demande = demandeCourante();
    adresseCourante = cas ? cas.adresse
      : (demande ? formatAdresse(demande.numero, demande.rue) : adresseCourante);
    // Même choix de contenant que la fiche d'emplacement (0018).
    drawer.setAttribute('placement', matchMedia('(max-width: 640px)').matches ? 'bottom' : 'end');
    el('fiche-adresse-champ-note').value = '';
    el('fiche-adresse-ajouter-note').loading = false;
    el('fiche-adresse-demande-raison').value = '';
    el('fiche-adresse-demande-accepter').loading = false;
    el('fiche-adresse-demande-refuser').loading = false;
    el('fiche-adresse-demande-maj').loading = false;
    cacherErreur();
    cacherErreursDemande();
    rendre();
    drawer.setAttribute('open', '');
  }

  return { ouvrir, fermer };
}
