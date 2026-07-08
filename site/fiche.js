// Fiche d'emplacement (décision 0018) : LA vue détaillée d'un emplacement — la
// même quelle que soit la page qui l'ouvre (grille des Structures, registre
// À traiter). Composant partagé sans build (décision 0004) : ce script expose
// creerFicheEmplacement(), qui injecte le markup de la fiche et rend
// `ouvrir(numero)`. Les gestes suivent le STATUT, jamais la page ; tout geste
// laisse la fiche ouverte — le feedback est le changement visible (statut,
// journal), pas un message (0016). Dépend de grille.js, chargé avant.
//
// options :
//   ongletParDefaut    'observer' | 'traiter' — l'onglet montré à l'ouverture.
//   donnees()          → { structures, emplacements, membres, journal } courants.
//   motDePasse()       → le mot de passe du comité (session).
//   surDonneesFraiches(inventaire) — la page range l'état frais et re-rend
//                      derrière la fiche (grille recolorée, registre re-trié).
//   surSessionExpiree() — la fiche s'est fermée, la page montre la connexion.

/* global statutEmplacement, gestesEmplacement, historiqueEmplacement,
   serieLibreObservee, depassementQuota,
   cleAdresse, ETATS_OCCUPATION, apparenceStatut, proseSignal, formatAdresse,
   chercherMembreParCle, positionParNumero, lienMailto */

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
        <wa-callout id="fiche-statut">
          <wa-icon id="fiche-statut-icone" slot="icon" name="circle-info"></wa-icon>
          <div class="wa-stack wa-gap-2xs">
            <strong id="fiche-statut-libelle"></strong>
            <!-- Pas de wa-caption-m ici : sa couleur « quiet » est calibrée
                 pour la surface de page, pas pour le fond coloré du callout —
                 la classe locale ne règle que la taille, la couleur vient du
                 variant du callout. -->
            <span id="fiche-statut-detail" class="detail-statut"></span>
          </div>
        </wa-callout>
        <div id="fiche-membre" class="wa-stack wa-gap-2xs" hidden>
          <!-- Nom et adresse sur la même ligne (repli naturel si étroite) :
               la fiche reste courte sur téléphone. La pastille quota (0019)
               n'apparaît QUE quand l'adresse dépasse son quota — silence
               dans les règles (0016) ; le traitement vit dans À traiter. -->
          <p class="wa-cluster wa-gap-xs wa-align-items-baseline">
            <span id="fiche-membre-nom" class="champ-membre-nom"></span>
            <span id="fiche-membre-adresse" class="wa-color-text-quiet"></span>
            <wa-badge id="fiche-membre-quota" variant="neutral" appearance="filled-outlined" hidden></wa-badge>
          </p>
          <div class="wa-cluster wa-gap-m liens-contact">
            <a id="fiche-telephone" hidden><wa-icon name="phone"></wa-icon> <span id="fiche-telephone-texte"></span></a>
            <a id="fiche-courriel" hidden><wa-icon name="envelope"></wa-icon> <span id="fiche-courriel-texte"></span></a>
          </div>
          <p id="fiche-membre-absent" class="wa-caption-m wa-color-text-quiet" hidden>Aucun membre inscrit
            dans l'onglet Membres pour cette adresse.</p>
        </div>
        <p id="fiche-note-comite" class="note-membre wa-text-pretty" hidden></p>
        <wa-tab-group id="fiche-onglets">
          <wa-tab panel="observer">Observer</wa-tab>
          <wa-tab panel="traiter">Traiter</wa-tab>
          <wa-tab-panel name="observer">
            <div class="wa-stack wa-gap-s">
              <!-- L'état courant (un fait) reste au-dessus des boutons qui le changent. -->
              <p id="fiche-observation-date" class="wa-caption-m wa-color-text-quiet"></p>
              <h3 class="wa-heading-s">Qu'observez-vous sur place ?</h3>
              <!-- Deux réponses seulement : sur place, on voit une embarcation ou pas. -->
              <div class="boutons-occupation">
                <wa-button class="bouton-occupation" data-occupation="occupé" appearance="outlined" size="m">Occupé</wa-button>
                <wa-button class="bouton-occupation" data-occupation="libre" appearance="outlined" size="m">Libre</wa-button>
              </div>
              <wa-callout id="fiche-erreur-observer" variant="danger" role="alert" tabindex="-1" hidden>
                <wa-icon slot="icon" name="circle-exclamation"></wa-icon>
                <span id="fiche-erreur-observer-texte"></span>
              </wa-callout>
            </div>
          </wa-tab-panel>
          <wa-tab-panel name="traiter">
            <div class="wa-stack wa-gap-s">
              <h3 class="wa-heading-s">Journal de l'emplacement</h3>
              <ol id="fiche-journal" class="liste-evenements zone-journal wa-stack wa-gap-s"></ol>
              <p id="fiche-journal-vide" class="wa-caption-m wa-color-text-quiet" hidden>Rien au journal
                pour l'instant.</p>
              <!-- Le champ vit en pied du journal : le geste se lit comme
                   « j'ajoute une ligne à ce journal ». -->
              <form id="fiche-formulaire-note" class="wa-stack wa-gap-s">
                <!-- rows=1 + resize auto : le champ grandit en écrivant ; le
                     placeholder court tient sur une ligne (hauteur mobile). -->
                <wa-textarea id="fiche-champ-note" label="Ajouter une note" rows="1" resize="auto"
                             placeholder="ex. : courriel envoyé — Jeremy"></wa-textarea>
                <!-- L'erreur d'envoi vit à côté des boutons : c'est là que regarde
                     l'utilisateur au moment où elle apparaît. Le texte saisi est conservé. -->
                <wa-callout id="fiche-erreur-traiter" variant="danger" role="alert" tabindex="-1" hidden>
                  <wa-icon slot="icon" name="circle-exclamation"></wa-icon>
                  <span id="fiche-erreur-traiter-texte"></span>
                </wa-callout>
                <div class="wa-cluster wa-gap-s">
                  <wa-button id="fiche-ajouter-note" type="submit" appearance="outlined" variant="brand">
                    <wa-icon slot="start" name="pen"></wa-icon>
                    Ajouter la note
                  </wa-button>
                </div>
              </form>
              <!-- L'aide colle au bouton qu'elle explique (revue UI) : on ne
                   s'attend pas à un brouillon préparé — le dire est du
                   procédural rassurant, pas du bruit (0016/0019). -->
              <div class="wa-stack wa-gap-2xs">
                <div class="wa-cluster wa-gap-s">
                  <wa-button id="fiche-ecrire" appearance="outlined" hidden>
                    <wa-icon slot="start" name="envelope"></wa-icon>
                    Écrire au membre
                  </wa-button>
                </div>
                <p id="fiche-aide-ecrire" class="wa-caption-m wa-color-text-quiet wa-text-pretty" hidden>Un courriel
                  déjà rédigé s'ouvrira dans votre messagerie — relisez-le et ajustez-le
                  avant de l'envoyer.</p>
              </div>
              <div class="wa-cluster wa-gap-s">
                <wa-button id="fiche-liberer" appearance="outlined" hidden>
                  <wa-icon slot="start" name="unlock"></wa-icon>
                  Libérer l'emplacement
                </wa-button>
              </div>
            </div>
          </wa-tab-panel>
        </wa-tab-group>
      </div>
    </wa-drawer>
    <!-- Confirmation avant de libérer : aucun tap accidentel ne retire une adresse. -->
    <wa-dialog id="fiche-dialogue-liberer" label="Libérer l'emplacement ?">
      <p id="fiche-dialogue-liberer-texte" class="wa-text-pretty"></p>
      <wa-button id="fiche-dialogue-liberer-confirmer" slot="footer" variant="danger" data-dialog="close">
        Libérer l'emplacement
      </wa-button>
      <!-- La sortie sûre est un vrai bouton, aussi facile à viser que l'action
           (public aîné) — pas un lien texte. -->
      <wa-button slot="footer" appearance="outlined" data-dialog="close">Annuler</wa-button>
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

  function ligneJournal(evenement) {
    const element = document.createElement('li');
    element.className = 'ligne-journal';
    const type = EVENEMENTS_JOURNAL[evenement.action];
    const icone = document.createElement('wa-icon');
    icone.setAttribute('name', type ? type.icone : 'circle-info');
    icone.setAttribute('label', type ? type.libelle : 'Événement');
    const bloc = document.createElement('span');
    bloc.className = 'texte-journal';
    const quand = document.createElement('span');
    quand.className = 'wa-caption-m wa-color-text-quiet';
    quand.textContent = formatDate.format(evenement.date);
    const quoi = document.createElement('span');
    quoi.className = 'wa-text-pretty';
    quoi.textContent = texteEvenement(evenement);
    bloc.append(quand, quoi);
    element.append(icone, bloc);
    return element;
  }

  // Le courriel pré-rempli n'est JAMAIS envoyé par l'app (0003) : le membre du
  // comité l'ajuste et l'envoie depuis son propre client mail. Le corps ne
  // parle d'emplacement libre que si c'est le fait établi (« Attribué, libre »)
  // — sinon il reste à écrire, seule la signature est posée.
  function hrefEcrire(membre, ligne, statut) {
    const sujet = 'Votre emplacement ' + ligne.numero + ' — Orford sur le Lac';
    const signature = ['Merci,', 'Le comité administratif — Orford sur le Lac'];
    let corps;
    if (statut.code === 'peutEtreALiberer') {
      const serie = serieLibreObservee(ligne, options.donnees().journal);
      corps = [
        'Bonjour ' + membre.nom + ',',
        '',
        'En passant près des structures, le comité a remarqué que l\'emplacement ' + ligne.numero
          + ' (attribué au ' + adresseLisible(ligne) + ') est libre'
          + (serie.debut ? ' depuis le ' + formatDate.format(serie.debut) : '') + '.',
        '',
        'Utilisez-vous encore cet emplacement cette saison ? Si vous n\'en avez plus besoin, '
          + 'dites-le-nous : un autre membre de la communauté pourra en profiter.',
        '',
      ].concat(signature).join('\n');
    } else {
      corps = ['Bonjour ' + membre.nom + ',', '', '', ''].concat(signature).join('\n');
    }
    return lienMailto({ courriel: membre.courriel, sujet, corps });
  }

  // --- Rendu : tout se recalcule depuis donnees(), la fiche se remplit en place ---

  function rendre() {
    const ligne = lignePourNumero(numeroCourant);
    const statut = statutEmplacement(ligne);
    const apparence = apparenceStatut(statut.code);
    const position = positionPourNumero(numeroCourant);

    const libelle = 'Emplacement ' + numeroCourant
      + (position ? ' · Structure ' + position.structure
        + (position.niveau !== '' ? ' · Niveau ' + position.niveau : '') : '');
    if (drawer.getAttribute('label') !== libelle) drawer.setAttribute('label', libelle);

    // N'écrire l'attribut que s'il change : re-poser la même valeur fait
    // re-rendre le shadow DOM du composant, et le contenu slotté disparaît
    // le temps d'une frame (callout écrasé à l'écran pendant un re-rendu
    // après un geste — visible sur API lente, flagrant en capture).
    const poserAttribut = (element, nom, valeur) => {
      if (element.getAttribute(nom) !== valeur) element.setAttribute(nom, valeur);
    };
    poserAttribut(el('fiche-statut'), 'variant', apparence.variante);
    poserAttribut(el('fiche-statut-icone'), 'name', apparence.icone);
    el('fiche-statut-libelle').textContent = statut.libelle;
    el('fiche-statut-detail').textContent = detailStatut(statut, ligne);

    // Le membre (si attribué) — mêmes gestes que la fiche : dérivés du statut.
    // `liberer` équivaut à « attribué » (grille.js) : la variable le nomme.
    const membre = ligne ? chercherMembre(ligne) : undefined;
    const gestes = gestesEmplacement(ligne, membre);
    const attribue = gestes.liberer;
    const blocMembre = el('fiche-membre');
    blocMembre.hidden = !attribue;
    const nom = el('fiche-membre-nom');
    const telephone = el('fiche-telephone');
    const courriel = el('fiche-courriel');
    nom.hidden = telephone.hidden = courriel.hidden = true;
    if (!blocMembre.hidden) {
      el('fiche-membre-adresse').textContent = adresseLisible(ligne);
      el('fiche-membre-absent').hidden = !!membre;
      // Pastille quota (0019) : seulement quand l'adresse dépasse — le membre
      // du comité qui ouvre un emplacement depuis la grille découvre le
      // contexte du dossier ; rien quand l'adresse est dans les règles. Le
      // libellé nomme l'état (« Hors quota », la section qui le traite) —
      // le nombre seul ne dirait pas que c'est un dossier (revue UI).
      const quota = depassementQuota(ligne, options.donnees().emplacements, options.donnees().membres);
      const pastilleQuota = el('fiche-membre-quota');
      pastilleQuota.hidden = !quota;
      if (quota) pastilleQuota.textContent = 'Hors quota — ' + quota.nombre + ' emplacements à cette adresse';
      if (membre) {
        nom.hidden = false;
        nom.textContent = String(membre.nom || '').trim();
        const numeroTelephone = String(membre.telephone || '').trim();
        if (numeroTelephone) {
          telephone.href = 'tel:' + numeroTelephone.replace(/[^+\d]/g, '');
          el('fiche-telephone-texte').textContent = numeroTelephone;
          telephone.hidden = false;
        }
        const adresseCourriel = String(membre.courriel || '').trim();
        if (adresseCourriel) {
          courriel.href = 'mailto:' + adresseCourriel;
          el('fiche-courriel-texte').textContent = adresseCourriel;
          courriel.hidden = false;
        }
      }
    }

    // Note du comité de la ligne d'emplacement (annotation durable, non datée).
    const note = el('fiche-note-comite');
    note.hidden = !(ligne && String(ligne.note || '').trim());
    if (!note.hidden) note.textContent = 'Note du comité : ' + ligne.note;

    // Onglet Observer : l'état courant = seul bouton plein (brand) + coche ;
    // il est aussi dit en toutes lettres au-dessus — la couleur ne porte
    // jamais seule.
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

    // Onglet Traiter : journal complet (défilé au plus récent) + gestes.
    const journal = el('fiche-journal');
    const historique = historiqueEmplacement(options.donnees().journal, numeroCourant);
    journal.replaceChildren(...historique.map(ligneJournal));
    el('fiche-journal-vide').hidden = historique.length > 0;
    calerJournal();

    el('fiche-liberer').hidden = !gestes.liberer;
    const ecrire = el('fiche-ecrire');
    ecrire.hidden = !gestes.ecrire;
    el('fiche-aide-ecrire').hidden = !gestes.ecrire;
    if (gestes.ecrire) ecrire.setAttribute('href', hrefEcrire(membre, ligne, statut));
  }

  // Cale le journal sur l'événement le plus récent. Sans effet tant que le
  // panneau est masqué (scrollHeight nul, drawer fermé ou onglet Observer
  // actif) : rappelé à l'ouverture du drawer et à l'affichage de l'onglet —
  // au frame suivant, une fois le panneau réellement mesurable (wa-tab-show
  // part avant que le contenu soit visible).
  function calerJournal() {
    requestAnimationFrame(() => {
      const journal = el('fiche-journal');
      journal.scrollTop = journal.scrollHeight;
    });
  }
  drawer.addEventListener('wa-after-show', calerJournal);
  el('fiche-onglets').addEventListener('wa-tab-show', calerJournal);

  // --- Erreurs : dans l'onglet du geste qui a échoué, jamais un état à part ---

  function cacherErreurs() {
    el('fiche-erreur-observer').hidden = true;
    el('fiche-erreur-traiter').hidden = true;
  }

  function montrerErreur(onglet, message) {
    const callout = el('fiche-erreur-' + onglet);
    el('fiche-erreur-' + onglet + '-texte').textContent = message;
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
  async function rafraichir(onglet) {
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
      montrerErreur(onglet, 'Le geste est bien enregistré, mais la fiche n\'a pas pu se recharger. '
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

  // Ouvre la fiche d'un numéro sur l'onglet de la page. Attend l'upgrade des
  // composants injectés : poser une propriété (value, loading) sur un élément
  // pas encore upgradé la ferait disparaître à l'upgrade.
  // `retour` (0019, ouverture depuis une fiche d'adresse) : { libelle,
  // surRetour } — affiche « Retour à <libelle> » et rejoue surRetour à la
  // fermeture du drawer.
  async function ouvrir(numero, retour) {
    await Promise.all(['wa-drawer', 'wa-tab-group', 'wa-textarea', 'wa-button', 'wa-callout']
      .map((nom) => customElements.whenDefined(nom)));
    numeroCourant = numero;
    retourCourant = retour || null;
    el('fiche-retour-zone').hidden = !retourCourant;
    if (retourCourant) {
      el('fiche-retour-texte').textContent = 'Retour à ' + retourCourant.libelle;
    }
    // Contenant selon l'écran AU MOMENT de l'ouverture : la fiche monte du bas
    // sur téléphone (la grille reste visible au-dessus), glisse du côté sur
    // grand écran — même contenu (0018). Seuil distinct du 480px de theme.css :
    // ici on choisit le CONTENANT (une tablette étroite préfère le bas), là-bas
    // on condense les espacements des seuls vrais téléphones.
    drawer.setAttribute('placement', matchMedia('(max-width: 640px)').matches ? 'bottom' : 'end');
    el('fiche-champ-note').value = '';
    el('fiche-ajouter-note').loading = false;
    el('fiche-liberer').loading = false;
    cacherErreurs();
    el('fiche-onglets').setAttribute('active', options.ongletParDefaut || 'observer');
    rendre();
    drawer.setAttribute('open', '');
  }

  return { ouvrir, fermer };
}
