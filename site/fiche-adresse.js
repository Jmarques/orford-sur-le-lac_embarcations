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
// options :
//   donnees()          → { structures, emplacements, membres, journal } courants.
//   motDePasse()       → le mot de passe du comité (session).
//   surDonneesFraiches(inventaire) — la page range l'état frais et re-rend.
//   surSessionExpiree() — la fiche s'est fermée, la page montre la connexion.
//   surOuvrirEmplacement(numero, cle, adresse) — la page ferme cette fiche et
//                      ouvre la fiche d'emplacement avec retour (0019).

/* global statutEmplacement, casAdresse, journalDeCas, apparenceStatut, cartePositions,
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

        <!-- MEMBRE (bloc partagé, 0024) : contact courant de l'adresse. -->
        ${creerBlocMembre({ prefixe: 'fiche-adresse', avecAdresse: false, avecQuota: false, conteneurCache: false, nomCache: true })}

        <!-- CORPS PROPRE — les emplacements de l'adresse, chacun ouvrant sa
             fiche. Section masquée quand l'adresse n'a aucun emplacement (0024). -->
        <div id="fiche-adresse-section-emplacements" class="wa-stack wa-gap-s">
          <h3 class="wa-heading-s">Les emplacements de l'adresse</h3>
          <ul id="fiche-adresse-emplacements" class="liste-emplacements-adresse wa-stack wa-gap-xs"></ul>
        </div>

        <!-- JOURNAL (bloc partagé, 0024) : événements + ajout de note. -->
        <div class="wa-stack wa-gap-s">
          ${creerBlocJournal({ prefixe: 'fiche-adresse', sujet: 'l\'adresse', amorce: 'ex. : toléré à 3 jusqu\'au printemps — Jeremy', erreurId: 'fiche-adresse-erreur' })}
        </div>
      </div>
    </wa-drawer>
  `);

  const el = (id) => document.getElementById(id);
  const drawer = el('fiche-adresse');

  // ErreurApi (erreur métier montrable) et le transport vers le backend
  // viennent du module client (client.js, chargé avant fiche-adresse.js).

  // La clé normalisée du cas ouvert, et son adresse lisible (le texte de la
  // Sheet — la clé ne s'affiche jamais).
  let cleCourante = '';
  let adresseCourante = '';

  function donneesCas() {
    return casAdresse(cleCourante, options.donnees().emplacements, options.donnees().membres);
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

  // --- Rendu : tout se recalcule depuis donnees(), la fiche se remplit en place ---

  function rendre() {
    const cas = donneesCas();
    const donnees = options.donnees();

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

    // Le membre : contact courant de l'adresse (0010), mention calme sinon —
    // bloc partagé (0024).
    rendreBlocMembre('fiche-adresse', membre);

    // Les emplacements du dossier : le statut de chacun se lit en toutes lettres,
    // le tap ouvre sa fiche. Section masquée quand l'adresse n'en a aucun (0024).
    const liste = el('fiche-adresse-emplacements');
    const emplacements = cas ? cas.emplacements : [];
    const positions = cartePositions(donnees.structures);
    liste.replaceChildren(...emplacements.map((ligne) => rangeeEmplacement(ligne, positions)));
    el('fiche-adresse-section-emplacements').hidden = emplacements.length === 0;

    // Le journal du dossier : notes d'adresse + libérations des emplacements.
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

  // Ouvre la fiche d'un cas par sa clé d'adresse normalisée (fileHorsQuota).
  async function ouvrir(cle) {
    await Promise.all(['wa-drawer', 'wa-dialog', 'wa-textarea', 'wa-button', 'wa-callout', 'wa-badge']
      .map((nom) => customElements.whenDefined(nom)));
    cleCourante = cle;
    const cas = donneesCas();
    if (cas) adresseCourante = cas.adresse;
    // Même choix de contenant que la fiche d'emplacement (0018).
    drawer.setAttribute('placement', matchMedia('(max-width: 640px)').matches ? 'bottom' : 'end');
    el('fiche-adresse-champ-note').value = '';
    el('fiche-adresse-ajouter-note').loading = false;
    cacherErreur();
    rendre();
    drawer.setAttribute('open', '');
  }

  return { ouvrir, fermer };
}
