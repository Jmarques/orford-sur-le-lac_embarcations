// Fiche d'adresse (décision 0019) : le dossier d'un cas « Hors quota » — le
// sujet est l'ADRESSE, pas un emplacement. Même patron que la fiche
// d'emplacement (fiche.js, décision 0018) : composant sans build (0004) qui
// injecte son markup et rend `ouvrir(cle)` ; tout vient de donnees(), posé par
// textContent (anti-XSS) ; un geste laisse la fiche ouverte — le feedback est
// le changement visible (0016). Les gestes d'emplacement (observer, libérer)
// restent dans la fiche d'emplacement, ouverte depuis la liste avec retour.
// Dépend de grille.js, chargé avant.
//
// options :
//   donnees()          → { structures, emplacements, membres, journal } courants.
//   motDePasse()       → le mot de passe du comité (session).
//   surDonneesFraiches(inventaire) — la page range l'état frais et re-rend.
//   surSessionExpiree() — la fiche s'est fermée, la page montre la connexion.
//   surOuvrirEmplacement(numero, cle, adresse) — la page ferme cette fiche et
//                      ouvre la fiche d'emplacement avec retour (0019).

/* global statutEmplacement, casAdresse, journalDeCas, apparenceStatut, cartePositions, lienMailto,
   creerBlocMembre, rendreBlocMembre, creerBlocJournal, rendreListeJournal, calerBlocJournal */

function creerFicheAdresse(options) {
  document.body.insertAdjacentHTML('beforeend', `
    <wa-drawer id="fiche-adresse" label="Adresse">
      <div class="corps-fiche-adresse wa-stack wa-gap-l">
        <!-- Le fait qui justifie le cas — l'équivalent du callout de statut de
             la fiche d'emplacement. Neutre : une règle de gestion, pas une
             urgence de terrain (0019). -->
        <wa-callout id="fiche-adresse-fait">
          <wa-icon id="fiche-adresse-fait-icone" slot="icon" name="circle-info"></wa-icon>
          <div class="wa-stack wa-gap-2xs">
            <strong id="fiche-adresse-fait-libelle"></strong>
            <span id="fiche-adresse-fait-detail" class="detail-statut"></span>
          </div>
        </wa-callout>
        ${creerBlocMembre({ prefixe: 'fiche-adresse', avecAdresse: false, avecQuota: false, conteneurCache: false, nomCache: true })}
        <div class="wa-stack wa-gap-s">
          <h3 class="wa-heading-s">Les emplacements de l'adresse</h3>
          <ul id="fiche-adresse-emplacements" class="liste-emplacements-adresse wa-stack wa-gap-xs"></ul>
        </div>
        <div class="wa-stack wa-gap-s">
          ${creerBlocJournal({ prefixe: 'fiche-adresse', sujet: 'l\'adresse', amorce: 'ex. : toléré à 3 jusqu\'au printemps — Jeremy', erreurId: 'fiche-adresse-erreur' })}
          <div class="wa-cluster wa-gap-s">
            <wa-button id="fiche-adresse-ecrire" appearance="outlined" hidden>
              <wa-icon slot="start" name="envelope"></wa-icon>
              Écrire au membre
            </wa-button>
          </div>
          <!-- On ne s'attend pas à un brouillon préparé : le dire est du
               procédural rassurant, pas du bruit (0016/0019). -->
          <p id="fiche-adresse-aide-ecrire" class="wa-caption-m wa-color-text-quiet wa-text-pretty" hidden>Un courriel
            déjà rédigé s'ouvrira dans votre messagerie — relisez-le et ajustez-le
            avant de l'envoyer.</p>
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

  // Le courriel pré-rempli n'est JAMAIS envoyé par l'app (0003) : le membre du
  // comité l'ajuste et l'envoie depuis son propre client mail. Ton factuel et
  // rassurant — la fiche parle d'un membre de la communauté, pas d'un fautif.
  function hrefEcrire(cas) {
    const sujet = 'Vos emplacements d\'embarcation — Orford sur le Lac';
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
    return lienMailto({ courriel: cas.membre.courriel, sujet, corps });
  }

  // --- Rendu : tout se recalcule depuis donnees(), la fiche se remplit en place ---

  function rendre() {
    const cas = donneesCas();
    const donnees = options.donnees();

    if (drawer.getAttribute('label') !== adresseCourante) {
      drawer.setAttribute('label', adresseCourante);
    }

    // Le fait : hors quota (neutre — règle de gestion), ou réglé sous les yeux
    // (brand) quand une libération vient de refermer le cas, fiche ouverte.
    const fait = el('fiche-adresse-fait');
    const icone = el('fiche-adresse-fait-icone');
    const nombre = cas ? cas.nombre : 0;
    const quota = cas ? cas.quota : 2;
    const horsQuota = cas && cas.depassement > 0;
    const variante = horsQuota ? 'neutral' : 'brand';
    if (fait.getAttribute('variant') !== variante) fait.setAttribute('variant', variante);
    const nomIcone = horsQuota ? 'circle-info' : 'circle-check';
    if (icone.getAttribute('name') !== nomIcone) icone.setAttribute('name', nomIcone);
    el('fiche-adresse-fait-libelle').textContent = horsQuota ? 'Hors quota' : 'Dans le quota';
    // Le dépassement est dit en toutes lettres — le lecteur n'a pas à
    // calculer que 4 > 3 (revue UI, public aîné).
    const enLettres = ['un', 'deux', 'trois', 'quatre'][
      (cas ? cas.depassement : 0) - 1] || String(cas ? cas.depassement : 0);
    const regle = quota === 2 ? 'le quota de 2' : 'l\'exception accordée à ' + quota;
    const pluriel = nombre > 1 ? 's' : '';
    el('fiche-adresse-fait-detail').textContent = nombre === 0
      ? 'Plus aucun emplacement attribué à cette adresse.'
      : horsQuota
        ? nombre + ' emplacement' + pluriel + ' attribué' + pluriel + ', '
          + enLettres + ' de plus que ' + regle + '.'
        : nombre + ' emplacement' + pluriel + ' attribué' + pluriel + ' — '
          + (quota === 2 ? 'le quota est de 2' : 'exception accordée à ' + quota) + '.';

    // Le membre : contact courant de l'adresse (0010), mention calme sinon —
    // bloc partagé (0024). `membre` sert aussi au geste « Écrire » plus bas.
    const membre = cas ? cas.membre : undefined;
    rendreBlocMembre('fiche-adresse', membre);

    // Les emplacements du dossier : le choix décisif — lequel libérer ? Le
    // statut de chacun se lit en toutes lettres, le tap ouvre sa fiche.
    const liste = el('fiche-adresse-emplacements');
    const positions = cartePositions(options.donnees().structures);
    liste.replaceChildren(...(cas ? cas.emplacements : [])
      .map((ligne) => rangeeEmplacement(ligne, positions)));

    // Le journal du dossier : notes d'adresse + libérations des emplacements.
    const numeros = (cas ? cas.emplacements : []).map((l) => Number(l.numero));
    const evenements = journalDeCas(donnees.journal, cleCourante, numeros);
    rendreListeJournal('fiche-adresse', evenements, decrireEvenement);

    const ecrire = el('fiche-adresse-ecrire');
    const peutEcrire = !!(cas && membre && String(membre.courriel || '').trim());
    ecrire.hidden = !peutEcrire;
    el('fiche-adresse-aide-ecrire').hidden = !peutEcrire;
    if (peutEcrire) ecrire.setAttribute('href', hrefEcrire(cas));
  }

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
    await Promise.all(['wa-drawer', 'wa-textarea', 'wa-button', 'wa-callout', 'wa-badge']
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
