// Grille d'emplacements (décision 0009) : parse, normalisation, validation et
// dérivation du format manuscrit de la colonne `emplacements` de Structures —
// [ [74..81], [82..89] ], `a..b` = plage séquentielle (ascendante ou non).
// Logique pure, partagée entre Apps Script, le navigateur (site/grille.js,
// copie générée) et les tests node.

// Découpe le texte en jetons : crochets, virgules, nombres et plages a..b.
// Tout fragment inattendu est rejeté en nommant ce qui a été lu.
function jetonsDeGrille_(texte) {
  var jetons = [];
  var motif = /\s*(\[|\]|,|(\d+)\s*\.\.\s*(\d+)|\d+)\s*/g;
  var position = 0;
  var resultat;
  while ((resultat = motif.exec(texte)) !== null) {
    if (resultat.index !== position) break;
    position = motif.lastIndex;
    if (resultat[2] !== undefined) {
      jetons.push({ type: 'plage', de: Number(resultat[2]), a: Number(resultat[3]) });
    } else if (/^\d+$/.test(resultat[1])) {
      jetons.push({ type: 'nombre', valeur: Number(resultat[1]) });
    } else {
      jetons.push({ type: resultat[1] });
    }
  }
  if (position !== texte.length) {
    throw new Error('Fragment illisible dans la grille : « ' + texte.slice(position, position + 20).trim() + ' »');
  }
  return jetons;
}

function deplierPlage_(de, a) {
  var pas = de <= a ? 1 : -1;
  var numeros = [];
  for (var n = de; n !== a + pas; n += pas) numeros.push(n);
  return numeros;
}

// Parse la cellule `emplacements` : deux niveaux d'imbrication exactement,
// éléments = entiers ou plages a..b (bornes incluses, sens libre).
function parserGrille(texte) {
  var jetons = jetonsDeGrille_(String(texte === undefined || texte === null ? '' : texte));
  var position = 0;
  function courant() { return jetons[position]; }
  function attendre(type, contexte) {
    var jeton = jetons[position++];
    if (!jeton || jeton.type !== type) {
      throw new Error('Grille malformée : « ' + type + ' » attendu ' + contexte + '.');
    }
    return jeton;
  }

  attendre('[', 'au début de la grille');
  if (courant() && (courant().type === 'nombre' || courant().type === 'plage')) {
    throw new Error('Grille malformée : « [ » attendu — chaque niveau ou colonne est entre crochets, ex. [[1..5], [6..10]].');
  }
  var arrays = [];
  while (courant() && courant().type === '[') {
    position++;
    var numeros = [];
    while (courant() && (courant().type === 'nombre' || courant().type === 'plage')) {
      var element = jetons[position++];
      if (element.type === 'nombre') numeros.push(element.valeur);
      else numeros.push.apply(numeros, deplierPlage_(element.de, element.a));
      if (courant() && courant().type === ',') position++;
    }
    attendre(']', 'à la fin d\'un niveau ou d\'une colonne');
    arrays.push(numeros);
    if (courant() && courant().type === ',') position++;
  }
  attendre(']', 'à la fin de la grille');
  if (position !== jetons.length) {
    throw new Error('Grille malformée : du contenu traîne après le « ] » final.');
  }
  return arrays;
}

// L'inverse du parse : la forme canonique écrite dans la Sheet à la sauvegarde.
// Toute suite consécutive (montante ou descendante) de 3 numéros ou plus
// redevient une plage a..b.
function normaliserGrille(arrays) {
  var textes = arrays.map(function (numeros) {
    return '[' + compacterNumeros_(numeros) + ']';
  });
  return '[' + textes.join(', ') + ']';
}

// « 143, 144, 145, 198 » → « 143..145, 198 » : toute suite consécutive
// (montante ou descendante) de 3 numéros ou plus redevient une plage a..b.
function compacterNumeros_(numeros) {
  var morceaux = [];
  for (var i = 0; i < numeros.length; ) {
    var pas = numeros[i + 1] === numeros[i] + 1 ? 1 : numeros[i + 1] === numeros[i] - 1 ? -1 : 0;
    var fin = i;
    while (pas !== 0 && numeros[fin + 1] === numeros[fin] + pas) fin++;
    if (fin - i >= 2) {
      morceaux.push(numeros[i] + '..' + numeros[fin]);
      i = fin + 1;
    } else {
      morceaux.push(String(numeros[i]));
      i++;
    }
  }
  return morceaux.join(', ');
}

// Analyse les lignes de l'onglet Structures : parse chaque grille, l'oriente
// en lignes (ligne 0 = niveau le plus haut), dérive les emplacements et
// collecte les problèmes — sans jamais lancer : les données invalides sont un
// état normal de la Sheet (décisions 0002 et 0009), à signaler, pas à planter.
function analyserStructures(lignesStructures, typesEmbarcations) {
  var structures = lignesStructures.map(function (ligne) {
    return analyserStructure_(ligne, typesEmbarcations || []);
  });

  // Unicité dans toute la communauté (CONTEXT.md) : un numéro vu dans deux
  // structures est marqué en conflit dans chacune — aucune ne « gagne ».
  var structuresParNumero = {};
  structures.forEach(function (analyse) {
    analyse.emplacements.forEach(function (emplacement) {
      var ids = structuresParNumero[emplacement.numero] || (structuresParNumero[emplacement.numero] = []);
      if (ids.indexOf(analyse.id) === -1) ids.push(analyse.id);
    });
  });
  var conflits = [];
  Object.keys(structuresParNumero).forEach(function (numero) {
    if (structuresParNumero[numero].length > 1) {
      conflits.push({ numero: Number(numero), structures: structuresParNumero[numero] });
    }
  });
  // Un seul message par structure adverse, numéros compactés en plages —
  // 14 conflits contigus ne doivent pas devenir 14 messages.
  structures.forEach(function (analyse) {
    var numerosParAdverses = {};
    conflits.forEach(function (conflit) {
      if (conflit.structures.indexOf(analyse.id) === -1) return;
      var autres = conflit.structures
        .filter(function (id) { return id !== analyse.id; })
        .join(', ');
      (numerosParAdverses[autres] = numerosParAdverses[autres] || []).push(conflit.numero);
    });
    Object.keys(numerosParAdverses).forEach(function (autres) {
      var numeros = numerosParAdverses[autres].sort(function (a, b) { return a - b; });
      analyse.problemes.push({
        severite: 'erreur',
        message: (numeros.length === 1
          ? 'Le numéro ' + numeros[0] + ' est aussi dans ' + autres
          : 'Les numéros ' + compacterNumeros_(numeros) + ' sont aussi dans ' + autres)
          + ' — chaque numéro n\'existe qu\'une fois dans toute la communauté.',
      });
    });
  });

  return { structures: structures, conflits: conflits };
}

function transposer_(colonnes) {
  var hauteur = colonnes.reduce(function (max, colonne) {
    return Math.max(max, colonne.length);
  }, 0);
  var lignes = [];
  for (var i = 0; i < hauteur; i++) {
    lignes.push(colonnes.map(function (colonne) { return colonne[i]; })
      .filter(function (numero) { return numero !== undefined; }));
  }
  return lignes;
}

function analyserStructure_(ligne, typesEmbarcations) {
  // Saisie vide : la lecture naturelle du type — par niveaux pour une
  // horizontale, par colonnes pour une verticale (données actuelles intactes).
  var saisie = String(ligne.saisie || '').trim()
    || (ligne.type === 'vertical' ? 'colonnes' : 'niveaux');
  var analyse = {
    id: ligne.id,
    type: ligne.type,
    saisie: saisie,
    lignes: null,
    emplacements: [],
    doublons: [],
    problemes: [],
  };

  if (ligne.type !== 'horizontal' && ligne.type !== 'vertical') {
    analyse.problemes.push({
      severite: 'avertissement',
      message: 'Type inconnu : « ' + ligne.type + ' » (attendu : horizontal ou vertical).',
    });
  }
  if (saisie !== 'niveaux' && saisie !== 'colonnes') {
    analyse.problemes.push({
      severite: 'avertissement',
      message: 'Saisie inconnue : « ' + saisie + ' » (attendu : niveaux ou colonnes) — lue comme « niveaux ».',
    });
    analyse.saisie = saisie = 'niveaux';
  }
  String(ligne.embarcations || '').split(',').forEach(function (embarcation) {
    var nom = embarcation.trim();
    if (nom && typesEmbarcations.indexOf(nom) === -1) {
      analyse.problemes.push({
        severite: 'avertissement',
        message: 'Embarcation inconnue de la Config : « ' + nom + ' ».',
      });
    }
  });

  var arrays;
  try {
    arrays = parserGrille(ligne.emplacements);
  } catch (erreur) {
    analyse.problemes.push({ severite: 'erreur', message: String(erreur.message || erreur) });
    return analyse;
  }

  var longueurs = arrays.map(function (a) { return a.length; });
  var longueursDistinctes = longueurs.filter(function (l, i) { return longueurs.indexOf(l) === i; });
  if (longueursDistinctes.length > 1) {
    var unite = saisie === 'colonnes' ? 'colonne' : 'niveau';
    analyse.problemes.push({
      severite: 'erreur',
      message: 'La grille est irrégulière : chaque ' + unite + ' doit avoir le même nombre d\'emplacements (trouvé : ' + longueurs.join(', ') + ').',
    });
  }

  var vus = {};
  arrays.forEach(function (numeros) {
    numeros.forEach(function (numero) {
      if (vus[numero] && analyse.doublons.indexOf(numero) === -1) analyse.doublons.push(numero);
      vus[numero] = true;
    });
  });
  if (analyse.doublons.length > 0) {
    analyse.problemes.push({
      severite: 'erreur',
      message: 'Numéro' + (analyse.doublons.length > 1 ? 's' : '') + ' en double dans la structure : ' + analyse.doublons.join(', ') + '.',
    });
  }

  analyse.lignes = saisie === 'colonnes' ? transposer_(arrays) : arrays;
  var nombreLignes = analyse.lignes.length;
  analyse.lignes.forEach(function (numeros, indexLigne) {
    numeros.forEach(function (numero, indexColonne) {
      analyse.emplacements.push({
        numero: numero,
        structure: ligne.id,
        // Seules les horizontales ont des niveaux (CONTEXT.md) ; 1 = le plus bas.
        niveau: ligne.type === 'horizontal' ? nombreLignes - indexLigne : '',
        ligne: indexLigne,
        colonne: indexColonne,
      });
    });
  });
  return analyse;
}

// Numéros présents dans l'onglet Emplacements mais dans aucune grille : ils ne
// sont jamais supprimés automatiquement (décision 0009), seulement signalés.
function numerosOrphelins(structuresAnalysees, lignesEmplacements) {
  var dansGrilles = {};
  structuresAnalysees.forEach(function (analyse) {
    analyse.emplacements.forEach(function (emplacement) {
      dansGrilles[emplacement.numero] = true;
    });
  });
  return lignesEmplacements
    .map(function (ligne) { return Number(ligne.numero); })
    .filter(function (numero) { return !dansGrilles[numero]; });
}

// Les valeurs OBSERVABLES sur le terrain : on voit une embarcation ou pas.
// Tout le reste (vide, ancien « inconnu », faute de frappe manuelle — 0002)
// est lu comme « pas encore observé » : l'absence d'observation n'est pas
// une observation.
var ETATS_OCCUPATION = ['occupé', 'libre'];

// Le dernier état observé lisible d'un emplacement, ou '' : toute valeur hors
// ensemble (Sheet éditée à la main — 0002) ou ligne absente = pas d'observation.
// C'est aussi le « fantôme » d'une cellule de tournée (décision 0013).
function fantomeOccupation(ligne) {
  return ligne && ETATS_OCCUPATION.indexOf(ligne.occupationObservee) !== -1
    ? ligne.occupationObservee
    : '';
}

// Un emplacement est attribué quand sa ligne porte une adresse complète —
// une cellule à moitié effacée (Sheet éditée à la main, 0002) ne compte pas.
function estAttribue_(ligne) {
  return !!(ligne && String(ligne.numeroAdresse || '').trim() && String(ligne.rue || '').trim());
}

// Le statut métier d'un emplacement, DÉRIVÉ du croisement attribution ×
// occupation observée — jamais stocké (décision 0011). `ligne` = la ligne
// d'Emplacements du numéro, ou undefined si elle n'existe pas encore.
// Cinq cases ; `probleme: true` marque les deux que le comité doit repérer
// d'un coup d'œil. Libellés auto-explicatifs (ils nomment les deux axes).
function statutEmplacement(ligne) {
  var attribue = estAttribue_(ligne);
  var occupation = fantomeOccupation(ligne);

  if (occupation === '') {
    return {
      code: 'pasObserve', libelle: 'Non observé', probleme: false,
      explication: 'Personne n\'a encore noté ce qui se trouve à cet emplacement.',
    };
  }
  if (attribue) {
    if (occupation === 'occupé') {
      return {
        code: 'conforme', libelle: 'En ordre', probleme: false,
        explication: 'L\'emplacement est attribué à une adresse et une embarcation s\'y trouve — tout est en ordre.',
      };
    }
    return {
      code: 'peutEtreALiberer', libelle: 'Attribué, libre', probleme: true,
      explication: 'L\'emplacement est attribué à une adresse, mais il a été observé libre — le membre ne l\'utilise peut-être plus.',
    };
  }
  if (occupation === 'occupé') {
    return {
      code: 'orphelin', libelle: 'À identifier', probleme: true,
      explication: 'Une embarcation s\'y trouve alors que l\'emplacement n\'est attribué à personne — à identifier avant de pouvoir l\'attribuer.',
    };
  }
  return {
    code: 'disponible', libelle: 'Disponible', probleme: false,
    explication: 'L\'emplacement n\'est attribué à personne et a été observé libre — prêt à être attribué.',
  };
}

// Les gestes de traitement structurés offerts par la fiche d'un emplacement
// (décision 0018) : dérivés du statut seul, jamais de la page qui ouvre la
// fiche. Libérer exige une attribution ; écrire au membre exige en plus un
// courriel connu dans l'onglet Membres. `membre` = la ligne Membres de
// l'adresse attribuée, ou undefined.
function gestesEmplacement(ligne, membre) {
  var attribue = estAttribue_(ligne);
  return {
    liberer: attribue,
    ecrire: attribue && !!(membre && String(membre.courriel || '').trim()),
  };
}

// Compte les cellules affichées par statut (un numéro présent dans deux
// structures compte deux fois, comme sur la grille) et les numéros marqués en
// conflit inter-structures ou doublon interne — pour la légende.
function compterStatuts(structuresAnalysees, conflits, lignesEmplacements) {
  var parNumero = {};
  lignesEmplacements.forEach(function (l) { parNumero[Number(l.numero)] = l; });
  var parCode = {};
  var marques = {};
  conflits.forEach(function (c) { marques[c.numero] = true; });
  structuresAnalysees.forEach(function (analyse) {
    analyse.doublons.forEach(function (n) { marques[n] = true; });
    analyse.emplacements.forEach(function (e) {
      var code = statutEmplacement(parNumero[Number(e.numero)]).code;
      parCode[code] = (parCode[code] || 0) + 1;
    });
  });
  return { parCode: parCode, enConflit: Object.keys(marques).length };
}

// Cycle de tap d'une cellule de tournée (décision 0013) : un tap confirme ce
// qu'on voit (le fantôme tel quel, ou « occupé » sans fantôme), un second
// bascule occupé ↔ libre, un troisième revient à « non relevé » ('').
function prochainEtatTournee(fantome, etat) {
  var premier = ETATS_OCCUPATION.indexOf(fantome) !== -1 ? fantome : ETATS_OCCUPATION[0];
  if (ETATS_OCCUPATION.indexOf(etat) === -1) return premier;
  if (etat === premier) return premier === 'occupé' ? 'libre' : 'occupé';
  return '';
}

// Le lot à envoyer en fin de tournée : les cellules relevées seulement, en
// ordre de numéro — jamais d'observation par inaction (décision 0013).
// `releves` : numéro → état du cycle de tap ('' = revenu à non relevé).
function lotDeTournee(releves) {
  return Object.keys(releves)
    .filter(function (numero) { return ETATS_OCCUPATION.indexOf(releves[numero]) !== -1; })
    .map(Number)
    .sort(function (a, b) { return a - b; })
    .map(function (numero) { return { numero: numero, occupation: releves[numero] }; });
}

// Une cellule relevée « a changé » quand l'état confirmé diffère d'un fantôme
// lisible — l'information intéressante d'une tournée (décision 0013). Sans
// fantôme (jamais observé, ou valeur illisible — 0002), rien n'a « changé ».
function aChangeTournee(fantome, etat) {
  return ETATS_OCCUPATION.indexOf(fantome) !== -1
    && ETATS_OCCUPATION.indexOf(etat) !== -1
    && etat !== fantome;
}

// Le bilan d'une tournée envoyée : compte de relevés et changements (numéro +
// nouvel état, ordre de numéro). `fantomes` : numéro → fantôme ('' si aucun).
function resumeDeTournee(releves, fantomes) {
  var observations = lotDeTournee(releves);
  return {
    compte: observations.length,
    changements: observations.filter(function (observation) {
      return aChangeTournee(fantomes[observation.numero] || '', observation.occupation);
    }),
  };
}

// --- Page « À traiter » (décision 0014) : files, « libre depuis », historique ---

// Date lisible ou null : une cellule éditée à la main (0002) peut porter
// n'importe quoi — jamais un plantage, jamais un « Invalid Date » affiché.
function dateLisible(valeur) {
  if (valeur === undefined || valeur === null || valeur === '') return null;
  var date = new Date(valeur);
  return isNaN(date.valueOf()) ? null : date;
}

// L'historique d'un emplacement : les événements lisibles du Journal pour ce
// numéro, en ordre chronologique (0011). Un événement d'un autre numéro, sans
// action ou sans date lisible est ignoré (0002) — il ne peut pas être situé
// dans le temps, donc pas raconté.
function historiqueEmplacement(evenements, numero) {
  return (evenements || [])
    .filter(function (e) { return e && Number(e.numero) === Number(numero); })
    .map(function (e) {
      return { date: dateLisible(e.date), action: String(e.action || ''), details: String(e.details || '') };
    })
    .filter(function (e) { return e.date !== null && e.action !== ''; })
    .sort(function (a, b) { return a.date - b.date; });
}

// Les observations lisibles d'un numéro (occupé/libre seulement), chronologiques.
function observationsLisibles_(evenements, numero) {
  return historiqueEmplacement(evenements, numero).filter(function (e) {
    return e.action === 'observation' && ETATS_OCCUPATION.indexOf(e.details) !== -1;
  });
}

// La série ininterrompue de l'état donné qui TERMINE les observations — le
// « depuis quand » des deux files se calcule sur elle.
function serieTerminale_(observations, etat) {
  var serie = [];
  for (var i = observations.length - 1; i >= 0 && observations[i].details === etat; i--) {
    serie.unshift(observations[i]);
  }
  return serie;
}

// « Libre depuis » en faits observés, jamais en mois calendaires (0014) : la
// série ininterrompue d'observations « libre » qui termine l'historique du
// numéro — son début, son nombre et sa dernière date. Sans série lisible au
// Journal (jamais journalisé, dates illisibles, ou ligne contredite par une
// édition manuelle — 0002), la ligne d'Emplacements est le fait de repli :
// une observation, sa date (ou null si elle aussi est illisible).
function serieLibreObservee(ligne, evenements) {
  var serie = serieTerminale_(observationsLisibles_(evenements, ligne.numero), 'libre');
  if (serie.length === 0) {
    var date = dateLisible(ligne.dateObservation);
    return { nombre: 1, debut: date, derniere: date };
  }
  return { nombre: serie.length, debut: serie[0].date, derniere: serie[serie.length - 1].date };
}

// La fenêtre d'apparition d'un « À identifier » (0014) : la série « occupé »
// qui termine les observations du numéro, bornée par la dernière observation
// « libre » qui la précède — « l'embarcation est apparue entre le 3 mai et le
// 12 juin ». null si aucune observation « occupé » lisible : la ligne
// d'Emplacements reste alors le seul fait (0002).
function fenetreApparition(ligne, evenements) {
  var observations = observationsLisibles_(evenements, ligne.numero);
  var serie = serieTerminale_(observations, 'occupé');
  if (serie.length === 0) return null;
  var avant = observations[observations.length - serie.length - 1];
  return {
    nombre: serie.length,
    debut: serie[0].date,
    derniere: serie[serie.length - 1].date,
    libreAvant: avant ? avant.date : null,
  };
}

// Les files de la page « À traiter » (0014), entièrement dérivées du statut —
// rien n'est stocké, un cas sort tout seul quand une observation le referme.
// « Attribué, libre » porte sa série (le tri et le signal temporel en vivent) ;
// tri du plus anciennement libre au plus récent, les débuts inconnus (signal
// le plus faible) en fin de file, numéro croissant à égalité.
function filesATraiter(lignesEmplacements, evenements) {
  var attribueLibre = [];
  var aIdentifier = [];
  (lignesEmplacements || []).forEach(function (ligne) {
    if (!ligne || !Number.isInteger(Number(ligne.numero)) || Number(ligne.numero) <= 0) return;
    var code = statutEmplacement(ligne).code;
    if (code === 'peutEtreALiberer') {
      attribueLibre.push({
        numero: Number(ligne.numero),
        ligne: ligne,
        serie: serieLibreObservee(ligne, evenements),
      });
    } else if (code === 'orphelin') {
      aIdentifier.push({ numero: Number(ligne.numero), ligne: ligne });
    }
  });
  attribueLibre.sort(function (a, b) {
    if (a.serie.debut === null && b.serie.debut === null) return a.numero - b.numero;
    if (a.serie.debut === null) return 1;
    if (b.serie.debut === null) return -1;
    return (a.serie.debut - b.serie.debut) || (a.numero - b.numero);
  });
  aIdentifier.sort(function (a, b) { return a.numero - b.numero; });
  return { attribueLibre: attribueLibre, aIdentifier: aIdentifier };
}

// --- Section « Hors quota » (décision 0019) : file par adresse, jamais stockée ---

var QUOTA_PAR_DEFAUT = 2;

// Normalise un texte d'adresse en clé d'appariement : trim + minuscules +
// espaces réduits. La Sheet est éditée à la main (0002) — « Rue du Lac » et
// « rue du  lac » doivent compter pour la même adresse, sinon un vrai cas
// hors quota devient invisible. Rien de plus flou : fusionner deux adresses
// distinctes serait pire que d'en éclater une.
function cleTexte_(texte) {
  return String(texte === undefined || texte === null ? '' : texte)
    .trim().replace(/\s+/g, ' ').toLowerCase();
}

// La clé d'adresse d'une ligne (Emplacements ou Membres). '' quand l'adresse
// est incomplète — même règle qu'estAttribue_. L'affichage garde toujours le
// texte de la ligne : seule la clé est normalisée.
function cleAdresse(objet) {
  if (!objet || !String(objet.numeroAdresse || '').trim() || !String(objet.rue || '').trim()) return '';
  return cleTexte_(String(objet.numeroAdresse).trim() + ' ' + String(objet.rue).trim());
}

// Le quota d'une adresse : son quota accordé (entier ≥ 1, décision durable du
// comité inscrite dans Membres) ou 2 par défaut. Une valeur illisible (Sheet
// éditée à la main — 0002) retombe au défaut, jamais un plantage.
function quotaLisible_(membre) {
  var brut = membre ? String(membre.quotaAccorde === undefined || membre.quotaAccorde === null ? '' : membre.quotaAccorde).trim() : '';
  if (brut === '') return QUOTA_PAR_DEFAUT;
  var valeur = Number(brut);
  return Number.isInteger(valeur) && valeur >= 1 ? valeur : QUOTA_PAR_DEFAUT;
}

function chercherMembreParCle(membres, cle) {
  var trouve;
  (membres || []).forEach(function (membre) {
    if (!trouve && cle !== '' && cleAdresse(membre) === cle) trouve = membre;
  });
  return trouve;
}

// Les attributions regroupées par clé d'adresse, dans l'ordre de première
// rencontre. L'affichage de chaque groupe garde le texte de sa première ligne.
function groupesParAdresse_(lignesEmplacements) {
  var parCle = {};
  var ordre = [];
  (lignesEmplacements || []).forEach(function (ligne) {
    if (!ligne || !Number.isInteger(Number(ligne.numero)) || Number(ligne.numero) <= 0) return;
    var cle = cleAdresse(ligne);
    if (cle === '') return;
    if (!parCle[cle]) {
      parCle[cle] = {
        cle: cle,
        adresse: String(ligne.numeroAdresse).trim() + ' ' + String(ligne.rue).trim(),
        emplacements: [],
      };
      ordre.push(cle);
    }
    parCle[cle].emplacements.push(ligne);
  });
  return ordre.map(function (cle) {
    parCle[cle].emplacements.sort(function (a, b) { return Number(a.numero) - Number(b.numero); });
    return parCle[cle];
  });
}

// Le dossier construit d'un groupe d'attributions : la forme commune de
// casAdresse et fileHorsQuota.
function construireCas_(groupe, membres) {
  var membre = chercherMembreParCle(membres, groupe.cle);
  var quota = quotaLisible_(membre);
  return {
    cle: groupe.cle,
    adresse: groupe.adresse,
    membre: membre,
    quota: quota,
    nombre: groupe.emplacements.length,
    depassement: Math.max(0, groupe.emplacements.length - quota),
    emplacements: groupe.emplacements,
  };
}

// Le dossier d'une adresse (0019), hors quota OU dans les règles — la fiche
// d'adresse reste racontable après une libération qui referme le cas. null si
// l'adresse n'a aucune attribution lisible.
function casAdresse(cle, lignesEmplacements, membres) {
  var groupe = null;
  groupesParAdresse_(lignesEmplacements).forEach(function (g) {
    if (!groupe && g.cle === cle) groupe = g;
  });
  return groupe ? construireCas_(groupe, membres) : null;
}

// La file « Hors quota » (0019) : les attributions regroupées par clé
// d'adresse ; cas = attributions > quota accordé. Le compte porte sur les
// attributions, jamais sur l'occupation observée — rien n'est stocké, un cas
// sort par libération et re-rentre s'il dépasse son exception. Tri : pire
// dépassement d'abord, puis nombre d'emplacements, puis adresse (stable).
function fileHorsQuota(lignesEmplacements, membres) {
  var cas = groupesParAdresse_(lignesEmplacements)
    .map(function (groupe) { return construireCas_(groupe, membres); })
    .filter(function (c) { return c.depassement > 0; });

  cas.sort(function (a, b) {
    if (b.depassement !== a.depassement) return b.depassement - a.depassement;
    if (b.nombre !== a.nombre) return b.nombre - a.nombre;
    return a.adresse < b.adresse ? -1 : a.adresse > b.adresse ? 1 : 0;
  });
  return cas;
}

// Le journal d'un cas hors quota (0019) : les événements portés par l'adresse
// (colonne `adresse` du Journal — les notes d'adresse) + les libérations des
// emplacements du cas, chronologique. Une libération d'avant la colonne
// `adresse` reste racontée par son numéro tant que l'emplacement est au cas.
// Un événement illisible est ignoré (0002).
function journalDeCas(evenements, cle, numeros) {
  var nums = (numeros || []).map(Number);
  return (evenements || [])
    .map(function (e) {
      if (!e) return null;
      var surAdresse = cle !== '' && cleTexte_(e.adresse) === cle;
      var surNumero = String(e.action || '') === 'libération' && nums.indexOf(Number(e.numero)) !== -1;
      if (!surAdresse && !surNumero) return null;
      var numero = Number(e.numero);
      return {
        date: dateLisible(e.date),
        action: String(e.action || ''),
        details: String(e.details || ''),
        numero: Number.isInteger(numero) && numero > 0 ? numero : null,
      };
    })
    .filter(function (e) { return e !== null && e.date !== null && e.action !== ''; })
    .sort(function (a, b) { return a.date - b.date; });
}

// La pastille quota de la fiche d'emplacement (0019) : le nombre
// d'emplacements de l'adresse attribuée et son quota, SEULEMENT quand
// l'adresse dépasse — silence quand elle est dans les règles (0016).
function depassementQuota(ligne, lignesEmplacements, membres) {
  var cas = casAdresse(cleAdresse(ligne), lignesEmplacements, membres);
  return cas && cas.depassement > 0 ? { nombre: cas.nombre, quota: cas.quota } : null;
}

// --- Section « Demandes » (décision 0020) : état dérivé, jamais stocké ---

// Une cellule lue comme texte épuré, tolérante à l'édition manuelle (0002) :
// undefined/null → '', jamais un plantage.
function texteBrut_(valeur) {
  return String(valeur === undefined || valeur === null ? '' : valeur).trim();
}

// L'état d'une demande, DÉRIVÉ de deux faits portés par sa ligne (décision
// 0020) — jamais stocké, même doctrine que le statut d'un emplacement (0011).
// Un emplacement attribué (numeroAttribue entier > 0) → acceptée ; une date de
// décision lisible seule → refusée ; ni l'un ni l'autre → nouvelle. Tolérant à
// l'édition manuelle (0002) : un numeroAttribue parasite ne vaut pas une
// attribution ; l'attribution prime sur une date de décision illisible.
function etatDemande(demande) {
  var brutNumero = demande ? texteBrut_(demande.numeroAttribue) : '';
  var numero = Number(brutNumero);
  var date = dateLisible(demande && demande.dateDecision);
  if (brutNumero !== '' && Number.isInteger(numero) && numero > 0) {
    return { code: 'acceptee', libelle: 'Acceptée', numero: numero, date: date };
  }
  if (date !== null) {
    return { code: 'refusee', libelle: 'Refusée', date: date };
  }
  return { code: 'nouvelle', libelle: 'Nouvelle' };
}

// Le temps d'une date lisible (ou 0 si absente/illisible — 0002) : sert de clé
// de tri sans jamais planter.
function tempsLisible_(valeur) {
  var date = dateLisible(valeur);
  return date === null ? 0 : date.getTime();
}

// La section « Demandes » de la page À traiter (décision 0020), dérivée de
// l'état de chaque demande — rien n'est stocké. Les nouvelles d'abord, la plus
// ancienne en tête (premier arrivé, premier servi) ; les traitées ensuite, la
// décision la plus récente en tête. Chaque entrée porte sa demande et son état
// dérivé. Une date illisible (Sheet éditée à la main — 0002) est traitée comme
// la plus ancienne, jamais un plantage. Une ligne absente est ignorée.
function sectionDemandes(demandes) {
  var nouvelles = [];
  var traitees = [];
  (demandes || []).forEach(function (demande) {
    if (!demande) return;
    var etat = etatDemande(demande);
    (etat.code === 'nouvelle' ? nouvelles : traitees).push({ demande: demande, etat: etat });
  });
  nouvelles.sort(function (a, b) {
    return tempsLisible_(a.demande.date) - tempsLisible_(b.demande.date);
  });
  traitees.sort(function (a, b) {
    return tempsLisible_(b.etat.date) - tempsLisible_(a.etat.date);
  });
  return { nouvelles: nouvelles, traitees: traitees };
}

// L'historique d'une demande (décision 0020) : les événements lisibles du
// Journal portant son demandeId, en ordre chronologique — la décision
// (attribution, refus) et la raison d'un refus s'y lisent. Même tolérance
// qu'historiqueEmplacement : un événement sans date lisible ou sans action est
// ignoré, un demandeId vide ne rapatrie rien (0002).
function journalDemande(evenements, demandeId) {
  var id = texteBrut_(demandeId);
  if (id === '') return [];
  return (evenements || [])
    .filter(function (e) { return e && String(e.demandeId || '').trim() === id; })
    .map(function (e) {
      return { date: dateLisible(e.date), action: String(e.action || ''), details: String(e.details || '') };
    })
    .filter(function (e) { return e.date !== null && e.action !== ''; })
    .sort(function (a, b) { return a.date - b.date; });
}

// --- Traitement d'une demande (décision 0020) : suggestions, contact, quota ---

// La clé d'adresse normalisée d'une DEMANDE : son adresse civique est
// (numero, rue) — même normalisation que cleAdresse d'un emplacement/membre.
function cleAdresseDemande_(demande) {
  return demande ? cleAdresse({ numeroAdresse: demande.numero, rue: demande.rue }) : '';
}

// Le rang de niveau pour le tri des suggestions : une structure verticale
// (niveau '') est comptée au sol (0), le rang le plus bas.
function rangNiveau_(niveau) {
  return niveau === '' || niveau === undefined || niveau === null ? 0 : Number(niveau);
}

// Une demande est-elle « mobilité réduite » ? Tolérant aux formes qu'une case
// cochée peut prendre dans la Sheet (booléen, 'on', 'oui', 'true', 'vrai' —
// 0002) : un seul endroit de vérité, partagé par le tri des suggestions, la
// pastille de la fiche et la rangée du registre.
function estMobiliteReduite(demande) {
  if (demande && demande.mobiliteReduite === true) return true;
  var brut = texteBrut_(demande && demande.mobiliteReduite).toLowerCase();
  return brut === 'true' || brut === 'on' || brut === 'oui' || brut === 'vrai';
}

// Les emplacements à proposer pour une demande (décision 0020) : les
// « Disponible » seulement (observés libres, non attribués — jamais un « Non
// observé » ni un « À identifier »), dans les structures dont la colonne
// `embarcations` accepte le type demandé (vide = accepte tout, signalé par
// `accepteTout`). Groupés par structure (ordre de la liste), triés DANS chaque
// groupe par niveau : décroissant par défaut (garder les bas pour les personnes
// à mobilité réduite), croissant si la demande est PMR ; une verticale compte
// au sol. Numéro croissant à égalité de niveau.
function suggestionsEmplacements(demande, structures, emplacements) {
  var type = texteBrut_(demande && demande.type);
  var pmr = estMobiliteReduite(demande);

  var lignesParNumero = {};
  (emplacements || []).forEach(function (ligne) {
    if (ligne) lignesParNumero[Number(ligne.numero)] = ligne;
  });
  var embarcationsParId = {};
  (structures || []).forEach(function (structure) {
    if (structure) embarcationsParId[structure.id] = structure.embarcations;
  });

  return analyserStructures(structures || [], []).structures
    .map(function (structure) {
      var listeEmb = String(embarcationsParId[structure.id] || '').split(',')
        .map(function (t) { return t.trim(); })
        .filter(function (t) { return t !== ''; });
      var accepteTout = listeEmb.length === 0;
      if (!accepteTout && listeEmb.indexOf(type) === -1) return null;

      var dispos = structure.emplacements
        .filter(function (e) {
          return statutEmplacement(lignesParNumero[Number(e.numero)]).code === 'disponible';
        })
        .map(function (e) { return { numero: Number(e.numero), niveau: e.niveau }; });
      if (dispos.length === 0) return null;

      dispos.sort(function (a, b) {
        var ra = rangNiveau_(a.niveau), rb = rangNiveau_(b.niveau);
        if (ra !== rb) return pmr ? ra - rb : rb - ra;
        return a.numero - b.numero;
      });
      return { structure: structure.id, accepteTout: accepteTout, emplacements: dispos };
    })
    .filter(function (groupe) { return groupe !== null; });
}

// Les différences entre le contact d'une demande et le [[Membre]] courant de
// l'adresse (décision 0020) : chaque champ garde ses deux valeurs et dit s'il
// diffère. `membreAbsent` = l'adresse n'a pas encore de ligne Membres (elle
// sera créée à l'acceptation) ; il n'y a alors rien à réconcilier.
function diffContact(demande, membre) {
  var champs = {};
  ['nom', 'courriel', 'telephone'].forEach(function (cle) {
    var d = texteBrut_(demande && demande[cle]);
    var m = texteBrut_(membre && membre[cle]);
    champs[cle] = { demande: d, membre: m, differe: !!membre && d !== m };
  });
  var membreAbsent = !membre;
  var aDifference = !membreAbsent && ['nom', 'courriel', 'telephone'].some(function (cle) {
    return champs[cle].differe;
  });
  return { membreAbsent: membreAbsent, aDifference: aDifference, champs: champs };
}

// Les autres demandes NOUVELLES de la même adresse (décision 0020) : le signal
// « un autre membre du foyer attend aussi » — la demande courante et les
// demandes déjà décidées sont exclues.
function autresDemandesOuvertes(demande, demandes) {
  var cle = cleAdresseDemande_(demande);
  if (cle === '') return [];
  var id = texteBrut_(demande.id);
  return (demandes || []).filter(function (d) {
    return d && texteBrut_(d.id) !== id
      && cleAdresseDemande_(d) === cle
      && etatDemande(d).code === 'nouvelle';
  });
}

// La situation quota d'une adresse pour décider d'une attribution (0020) : le
// nombre d'attributions actuelles et le quota applicable. Attribuer une place
// de plus est bloqué quand nombre >= quota (l'attribution ferait dépasser).
// Partagé client (le signal de la fiche) / serveur (le garde-fou de la
// décision). `cle` = clé d'adresse normalisée.
function situationAttribution(cle, lignesEmplacements, membres) {
  var cas = casAdresse(cle, lignesEmplacements, membres);
  var quota = quotaLisible_(chercherMembreParCle(membres, cle));
  var nombre = cas ? cas.nombre : 0;
  return { nombre: nombre, quota: quota, bloque: nombre >= quota };
}

if (typeof module !== 'undefined') {
  module.exports = { parserGrille, normaliserGrille, analyserStructures, numerosOrphelins, statutEmplacement, gestesEmplacement, compterStatuts, fantomeOccupation, prochainEtatTournee, lotDeTournee, aChangeTournee, resumeDeTournee, filesATraiter, serieLibreObservee, fenetreApparition, dateLisible, historiqueEmplacement, cleAdresse, chercherMembreParCle, casAdresse, fileHorsQuota, journalDeCas, depassementQuota, etatDemande, sectionDemandes, journalDemande, suggestionsEmplacements, diffContact, autresDemandesOuvertes, situationAttribution, estMobiliteReduite, ETATS_OCCUPATION };
}
