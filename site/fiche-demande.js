// Fiche de demande (décision 0020) : l'écran de décision d'une demande à
// traiter. Même patron que la fiche d'emplacement (fiche.js, 0018) et la fiche
// d'adresse (fiche-adresse.js, 0019) : composant sans build (0004) qui injecte
// son markup et rend `ouvrir(demandeId)` ; tout vient de donnees(), posé par
// textContent (anti-XSS) ; un geste laisse la fiche ouverte — le feedback est
// le changement visible (0016). Dépend de grille.js, chargé avant.
//
// options :
//   donnees()          → { structures, emplacements, membres, journal, demandes } courants.
//   motDePasse()       → le mot de passe du comité (session).
//   surDonneesFraiches(inventaire) — la page range l'état frais et re-rend le registre.
//   surSessionExpiree() — la fiche s'est fermée, la page montre la connexion.

/* global etatDemande, diffContact, suggestionsEmplacements, situationAttribution,
   autresDemandesOuvertes, casAdresse, cleAdresse,
   statutEmplacement, estMobiliteReduite, apparenceStatut, formatAdresse,
   chercherMembreParCle, lienMailto */

function creerFicheDemande(options) {
  document.body.insertAdjacentHTML('beforeend', `
    <wa-drawer id="fiche-demande" label="Demande">
      <div class="corps-fiche-demande wa-stack wa-gap-l">
        <!-- L'objet de la demande : type d'embarcation, date de réception, et
             la priorité PMR le cas échéant. -->
        <wa-callout id="fiche-demande-entete" variant="brand">
          <wa-icon slot="icon" name="sailboat"></wa-icon>
          <div class="wa-stack wa-gap-2xs">
            <strong id="fiche-demande-type"></strong>
            <span id="fiche-demande-recue" class="detail-statut"></span>
          </div>
        </wa-callout>
        <wa-badge id="fiche-demande-mobilite" variant="warning" appearance="filled-outlined" pill hidden>
          <wa-icon name="person-cane"></wa-icon> Priorité niveau bas (mobilité réduite)
        </wa-badge>
        <div id="fiche-demande-note-bloc" class="wa-stack wa-gap-2xs" hidden>
          <span class="wa-caption-m wa-color-text-quiet">Note du membre</span>
          <p id="fiche-demande-note" class="note-membre"></p>
        </div>

        <!-- Résultat d'une décision : la fiche reste ouverte, le geste se lit ici. -->
        <wa-callout id="fiche-demande-resultat" role="status" hidden>
          <wa-icon id="fiche-demande-resultat-icone" slot="icon" name="circle-check"></wa-icon>
          <span id="fiche-demande-resultat-texte"></span>
        </wa-callout>

        <!-- Contact : celui de la demande face au membre courant de l'adresse. -->
        <div class="wa-stack wa-gap-s">
          <h3 class="wa-heading-s">Contact</h3>
          <ul id="fiche-demande-contact" class="liste-contact-demande wa-stack wa-gap-2xs"></ul>
          <p id="fiche-demande-contact-absent" class="wa-caption-m wa-color-text-quiet" hidden>Cette adresse n'a
            pas encore de contact dans l'onglet Membres — l'acceptation le créera, ou enregistrez-le maintenant.</p>
          <wa-callout id="fiche-demande-contact-erreur" variant="danger" role="alert" tabindex="-1" hidden>
            <wa-icon slot="icon" name="circle-exclamation"></wa-icon>
            <span id="fiche-demande-contact-erreur-texte"></span>
          </wa-callout>
          <div id="fiche-demande-maj-zone" class="wa-cluster wa-gap-s" hidden>
            <wa-button id="fiche-demande-maj-contact" appearance="outlined" variant="brand">
              <wa-icon slot="start" name="pen"></wa-icon>
              <span id="fiche-demande-maj-contact-texte">Mettre à jour le contact</span>
            </wa-button>
          </div>
        </div>

        <!-- La situation de l'adresse : ses attributions, son quota, une autre
             demande ouverte du même foyer le cas échéant. -->
        <div class="wa-stack wa-gap-s">
          <h3 class="wa-heading-s">Cette adresse</h3>
          <p id="fiche-demande-situation" class="wa-text-pretty"></p>
          <ul id="fiche-demande-attributions" class="liste-emplacements-adresse wa-stack wa-gap-xs"></ul>
          <p id="fiche-demande-autres" class="rappel-doux" hidden>
            <wa-icon name="circle-info"></wa-icon> <span id="fiche-demande-autres-texte"></span>
          </p>
        </div>

        <!-- Attribuer : les emplacements Disponibles compatibles, ou le blocage
             quota, ou l'invitation à faire une tournée. -->
        <div id="fiche-demande-attribuer" class="wa-stack wa-gap-s">
          <h3 id="fiche-demande-attribuer-titre" class="wa-heading-s">Attribuer un emplacement</h3>
          <p id="fiche-demande-quota-bloque" class="note-membre" hidden></p>
          <div id="fiche-demande-suggestions" class="wa-stack wa-gap-m"></div>
          <p id="fiche-demande-suggestions-vide" class="section-vide-neutre" hidden>
            <wa-icon name="binoculars"></wa-icon> Aucune place observée libre dans les structures
            compatibles — faites une tournée pour en trouver.
          </p>
          <!-- Invite tant qu'aucune place n'est choisie : pas de bouton
               désactivé pâle, une consigne claire à la place (revue UI). -->
          <p id="fiche-demande-choisir-invite" class="wa-color-text-quiet" hidden>
            Touchez un emplacement ci-dessus pour l'attribuer.</p>
          <wa-callout id="fiche-demande-erreur" variant="danger" role="alert" tabindex="-1" hidden>
            <wa-icon slot="icon" name="circle-exclamation"></wa-icon>
            <span id="fiche-demande-erreur-texte"></span>
          </wa-callout>
          <!-- Le bouton d'acceptation n'apparaît qu'une fois une place choisie :
               toujours plein, toujours cliquable — jamais un désactivé pâle. -->
          <div id="fiche-demande-accepter-zone" class="wa-cluster wa-gap-s" hidden>
            <wa-button id="fiche-demande-accepter" variant="brand" size="l">
              <wa-icon slot="start" name="circle-check"></wa-icon>
              <span id="fiche-demande-accepter-texte">Attribuer et accepter</span>
            </wa-button>
          </div>
        </div>

        <!-- Refuser : une raison obligatoire, journalisée ; écrire au membre en
             mailto pré-rempli (jamais d'envoi automatique — 0003). -->
        <div id="fiche-demande-refuser-zone" class="wa-stack wa-gap-s">
          <h3 class="wa-heading-s">Ou refuser la demande</h3>
          <form id="fiche-demande-formulaire-refus" class="wa-stack wa-gap-s">
            <wa-textarea id="fiche-demande-raison" label="Raison du refus" rows="1" resize="auto"
                         placeholder="ex. : aucune place compatible libre cette saison"></wa-textarea>
            <div class="wa-cluster wa-gap-s">
              <wa-button id="fiche-demande-refuser" type="submit" appearance="outlined">
                <wa-icon slot="start" name="circle-xmark"></wa-icon>
                Refuser la demande
              </wa-button>
            </div>
          </form>
        </div>

        <!-- Écrire au membre : présent après un refus (mailto pré-rempli). -->
        <div id="fiche-demande-ecrire-zone" class="wa-stack wa-gap-s" hidden>
          <div class="wa-cluster wa-gap-s">
            <wa-button id="fiche-demande-ecrire" appearance="outlined">
              <wa-icon slot="start" name="envelope"></wa-icon>
              Écrire au membre
            </wa-button>
          </div>
          <p class="wa-caption-m wa-color-text-quiet wa-text-pretty">Un courriel déjà rédigé s'ouvrira dans
            votre messagerie — relisez-le et ajustez-le avant de l'envoyer.</p>
        </div>
      </div>
    </wa-drawer>
  `);

  const el = (id) => document.getElementById(id);
  const drawer = el('fiche-demande');
  const formatDate = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long' });

  // ErreurApi (erreur métier montrable) et le transport vers le backend
  // viennent du module client (client.js, chargé avant fiche-demande.js).

  let demandeId = '';
  let numeroChoisi = null; // l'emplacement sélectionné avant confirmation

  function demandeCourante() {
    return (options.donnees().demandes || []).find(
      (d) => d && String(d.id || '').trim() === demandeId);
  }

  // Toujours « numeroAdresse rue » (décision 0012), comme le Journal et les
  // autres fiches — jamais une virgule qui ferait diverger l'affichage.
  function adresseDemande(demande) {
    return formatAdresse(demande.numero, demande.rue);
  }
  function cleDe(demande) {
    return cleAdresse({ numeroAdresse: demande.numero, rue: demande.rue });
  }
  function membreDe(demande) {
    return chercherMembreParCle(options.donnees().membres, cleDe(demande));
  }

  // Une ligne de contact : le champ, la valeur de la demande, et — s'il diffère
  // du membre courant — l'ancienne valeur en légende (les deux voix distinctes).
  function ligneContact(libelle, champ) {
    const li = document.createElement('li');
    li.className = 'ligne-contact-demande';
    const tete = document.createElement('span');
    const etiquette = document.createElement('span');
    etiquette.className = 'wa-caption-m wa-color-text-quiet';
    etiquette.textContent = libelle + ' : ';
    const valeur = document.createElement('span');
    valeur.textContent = champ.demande || '—';
    if (champ.differe) valeur.classList.add('valeur-changee');
    tete.append(etiquette, valeur);
    li.appendChild(tete);
    if (champ.differe) {
      const ancienne = document.createElement('span');
      ancienne.className = 'wa-caption-m wa-color-text-quiet valeur-ancienne';
      ancienne.textContent = champ.membre ? 'actuel : ' + champ.membre : 'actuel : (vide)';
      li.appendChild(ancienne);
    }
    return li;
  }

  // Une suggestion : un bouton-emplacement sélectionnable (numéro + niveau).
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
    // Coche franche sur la place choisie : l'état sélectionné ne repose pas sur
    // la seule teinte (revue UI, public aîné).
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

  // Le courriel de refus pré-rempli (jamais envoyé par l'app — 0003).
  function hrefEcrire(demande, raison) {
    const sujet = 'Votre demande d\'emplacement — Orford sur le Lac';
    const corps = [
      'Bonjour ' + String(demande.nom || '').trim() + ',',
      '',
      'Nous avons bien reçu votre demande d\'emplacement pour un(e) ' + demande.type
        + ' à l\'adresse ' + adresseDemande(demande) + '.',
      '',
      'Nous ne pouvons malheureusement pas y donner suite pour l\'instant'
        + (raison ? ' : ' + raison + (/[.!?]$/.test(raison) ? '' : '.') : '.'),
      '',
      'N\'hésitez pas à nous écrire si vous avez des questions.',
      '',
      'Le comité administratif — Orford sur le Lac',
    ].join('\n');
    return lienMailto({ courriel: demande.courriel, sujet, corps });
  }

  // --- Rendu : tout se recalcule depuis donnees(), la fiche se remplit en place ---

  function rendre() {
    const demande = demandeCourante();
    if (!demande) return;
    const donnees = options.donnees();
    const etat = etatDemande(demande);
    const nouvelle = etat.code === 'nouvelle';
    const membre = membreDe(demande);

    if (drawer.getAttribute('label') !== adresseDemande(demande)) {
      drawer.setAttribute('label', adresseDemande(demande));
    }

    // En-tête : le type demandé, la date de réception, la priorité PMR.
    el('fiche-demande-type').textContent = demande.type;
    const recue = new Date(demande.date);
    el('fiche-demande-recue').textContent = Number.isNaN(recue.valueOf())
      ? 'Reçue à une date inconnue'
      : 'Reçue le ' + formatDate.format(recue);
    el('fiche-demande-mobilite').hidden = !estMobiliteReduite(demande);
    const note = String(demande.note || '').trim();
    el('fiche-demande-note-bloc').hidden = !note;
    if (note) el('fiche-demande-note').textContent = note;

    // Résultat d'une décision : la fiche reste ouverte, le geste se lit ici.
    const resultat = el('fiche-demande-resultat');
    resultat.hidden = nouvelle;
    if (!nouvelle) {
      const accepte = etat.code === 'acceptee';
      resultat.setAttribute('variant', accepte ? 'success' : 'neutral');
      el('fiche-demande-resultat-icone').setAttribute('name', accepte ? 'circle-check' : 'circle-xmark');
      el('fiche-demande-resultat-texte').textContent = accepte
        ? 'Demande acceptée — emplacement ' + etat.numero + ' attribué à ' + adresseDemande(demande) + '.'
        : 'Demande refusée.';
    }

    // Contact : chaque champ, la valeur changée mise en avant.
    const diff = diffContact(demande, membre);
    const liste = el('fiche-demande-contact');
    liste.replaceChildren(
      ligneContact('Nom', diff.champs.nom),
      ligneContact('Courriel', diff.champs.courriel),
      ligneContact('Téléphone', diff.champs.telephone),
    );
    el('fiche-demande-contact-absent').hidden = !diff.membreAbsent;
    // La mise à jour n'a de sens que sur une demande encore ouverte et quand il
    // y a quelque chose à réconcilier (différence, ou adresse absente).
    const peutMaj = nouvelle && (diff.aDifference || diff.membreAbsent);
    el('fiche-demande-maj-zone').hidden = !peutMaj;
    el('fiche-demande-maj-contact-texte').textContent = diff.membreAbsent
      ? 'Enregistrer ce contact' : 'Mettre à jour le contact';

    // La situation de l'adresse : attributions actuelles + quota.
    const cle = cleDe(demande);
    const cas = casAdresse(cle, donnees.emplacements, donnees.membres);
    const situation = situationAttribution(cle, donnees.emplacements, donnees.membres);
    const nombre = cas ? cas.nombre : 0;
    const regle = situation.quota === 2 ? 'le quota est de 2' : 'exception accordée à ' + situation.quota;
    el('fiche-demande-situation').textContent = nombre === 0
      ? 'Aucun emplacement attribué à cette adresse pour l\'instant — ' + regle + '.'
      : nombre + (nombre > 1 ? ' emplacements attribués' : ' emplacement attribué') + ' — ' + regle + '.';
    const attributions = el('fiche-demande-attributions');
    attributions.replaceChildren(...(cas ? cas.emplacements : []).map((ligne) => {
      const li = document.createElement('li');
      li.className = 'rangee-emplacement-statique';
      const titre = document.createElement('span');
      titre.className = 'rangee-emplacement-titre';
      titre.textContent = 'Emplacement ' + ligne.numero;
      const statut = statutEmplacement(ligne);
      const pastille = document.createElement('wa-badge');
      // La couleur ne porte jamais seule : le libellé accompagne (décision 0016).
      pastille.setAttribute('variant', apparenceStatut(statut.code).variante);
      pastille.setAttribute('appearance', 'filled-outlined');
      pastille.textContent = statut.libelle;
      li.append(titre, pastille);
      return li;
    }));

    // Autre demande ouverte du même foyer : un signal, pas un blocage.
    const autres = autresDemandesOuvertes(demande, donnees.demandes);
    el('fiche-demande-autres').hidden = autres.length === 0;
    if (autres.length > 0) {
      el('fiche-demande-autres-texte').textContent = autres.length === 1
        ? 'Une autre demande de cette adresse attend aussi une décision.'
        : autres.length + ' autres demandes de cette adresse attendent aussi une décision.';
    }

    // Attribuer : suggestions + bouton d'acceptation, sauf demande déjà décidée.
    el('fiche-demande-attribuer').hidden = !nouvelle;
    el('fiche-demande-refuser-zone').hidden = !nouvelle;
    if (nouvelle) rendreAttribution(demande, donnees, situation);

    // Écrire au membre : après un refus seulement (mailto pré-rempli).
    const refusee = etat.code === 'refusee';
    el('fiche-demande-ecrire-zone').hidden = !(refusee && String(demande.courriel || '').trim());
    if (refusee) {
      const raison = journalRaison(donnees.journal, demande.id);
      el('fiche-demande-ecrire').setAttribute('href', hrefEcrire(demande, raison));
    }
  }

  // La raison d'un refus, lue au Journal (0020) — sert le mailto pré-rempli.
  function journalRaison(journal, id) {
    const refus = (journal || []).filter(
      (e) => e && e.action === 'refus' && String(e.demandeId || '').trim() === String(id).trim());
    return refus.length ? String(refus[refus.length - 1].details || '').trim() : '';
  }

  function rendreAttribution(demande, donnees, situation) {
    const bloque = situation.bloque;
    // Le titre de section ne promet pas une action indisponible (revue UI).
    el('fiche-demande-attribuer-titre').textContent = bloque
      ? 'Attribution impossible pour l\'instant' : 'Attribuer un emplacement';
    el('fiche-demande-quota-bloque').hidden = !bloque;
    if (bloque) {
      el('fiche-demande-quota-bloque').textContent = 'Cette adresse a déjà ' + situation.nombre
        + (situation.nombre > 1 ? ' emplacements' : ' emplacement') + ' pour un quota de ' + situation.quota
        + '. Pour attribuer quand même, augmentez le quota accordé de cette adresse dans l\'onglet Membres, '
        + 'puis rouvrez la demande.';
    }

    const groupes = bloque ? [] : suggestionsEmplacements(demande, donnees.structures, donnees.emplacements);
    const conteneur = el('fiche-demande-suggestions');
    conteneur.replaceChildren(...groupes.map((groupe) => {
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
    }));
    el('fiche-demande-suggestions-vide').hidden = bloque || groupes.length > 0;

    // Le numéro choisi peut avoir disparu (rechargement) : on le réinitialise.
    const existeEncore = groupes.some((g) => g.emplacements.some((e) => e.numero === numeroChoisi));
    if (!existeEncore) numeroChoisi = null;
    // Aucun bouton désactivé pâle : une invite tant que rien n'est choisi, puis
    // le bouton plein et cliquable une fois la place sélectionnée (revue UI).
    const aSuggestions = !bloque && groupes.length > 0;
    el('fiche-demande-choisir-invite').hidden = !(aSuggestions && numeroChoisi === null);
    el('fiche-demande-accepter-zone').hidden = !(aSuggestions && numeroChoisi !== null);
    if (numeroChoisi !== null) {
      el('fiche-demande-accepter-texte').textContent = 'Attribuer le n° ' + numeroChoisi + ' et accepter';
    }
  }

  function cacherErreurs() {
    el('fiche-demande-erreur').hidden = true;
    el('fiche-demande-contact-erreur').hidden = true;
  }

  function montrerErreur(id, message) {
    const callout = el(id);
    el(id + '-texte').textContent = message;
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
      if (!drawer.hasAttribute('open')) { fin(); return; }
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
    const resultat = await client.poster({ action: 'inventaire' });
    if (!(await sessionEncoreValide(resultat))) return false;
    options.surDonneesFraiches(resultat);
    rendre();
    return true;
  }

  // Un geste générique : bouton en attente, envoi, rechargement, gestion d'erreur.
  async function faireGeste(bouton, corps, idErreur, messageEchec) {
    if (bouton.loading) return;
    cacherErreurs();
    bouton.loading = true;
    try {
      const resultat = await client.poster(corps);
      if (!(await sessionEncoreValide(resultat))) return;
      await rafraichir();
    } catch (erreur) {
      if (erreur instanceof ErreurApi) console.info('Geste refusé :', erreur.message);
      else console.error('Geste impossible :', erreur);
      montrerErreur(idErreur, messageEchec
        + (erreur instanceof ErreurApi ? ' Détail : ' + erreur.message : ''));
    } finally {
      bouton.loading = false;
    }
  }

  el('fiche-demande-accepter').addEventListener('click', () => {
    if (numeroChoisi === null) return;
    faireGeste(el('fiche-demande-accepter'),
      { action: 'deciderDemande', decision: 'accepter', demandeId, numero: numeroChoisi },
      'fiche-demande-erreur',
      'Impossible d\'attribuer cet emplacement. Vérifiez votre connexion Internet, puis réessayez.');
  });

  el('fiche-demande-formulaire-refus').addEventListener('submit', (evenement) => {
    evenement.preventDefault();
    const champ = el('fiche-demande-raison');
    const raison = String(champ.value || '').trim();
    if (!raison) {
      montrerErreur('fiche-demande-erreur', 'Donnez une raison au refus — elle est '
        + 'journalisée et sert à écrire au membre.');
      return;
    }
    faireGeste(el('fiche-demande-refuser'),
      { action: 'deciderDemande', decision: 'refuser', demandeId, raison },
      'fiche-demande-erreur',
      'Impossible de refuser la demande. Vérifiez votre connexion Internet, puis réessayez.');
  });

  el('fiche-demande-maj-contact').addEventListener('click', () => {
    faireGeste(el('fiche-demande-maj-contact'),
      { action: 'majContactDemande', demandeId },
      'fiche-demande-contact-erreur',
      'Impossible de mettre à jour le contact. Vérifiez votre connexion Internet, puis réessayez.');
  });

  async function ouvrir(id) {
    await Promise.all(['wa-drawer', 'wa-textarea', 'wa-button', 'wa-callout', 'wa-badge']
      .map((nom) => customElements.whenDefined(nom)));
    demandeId = String(id).trim();
    numeroChoisi = null;
    drawer.setAttribute('placement', matchMedia('(max-width: 640px)').matches ? 'bottom' : 'end');
    el('fiche-demande-raison').value = '';
    el('fiche-demande-accepter').loading = false;
    el('fiche-demande-refuser').loading = false;
    el('fiche-demande-maj-contact').loading = false;
    cacherErreurs();
    rendre();
    drawer.setAttribute('open', '');
  }

  return { ouvrir, fermer };
}
