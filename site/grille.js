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

// Le statut métier d'un emplacement, DÉRIVÉ du croisement attribution ×
// occupation observée — jamais stocké (décision 0011). `ligne` = la ligne
// d'Emplacements du numéro, ou undefined si elle n'existe pas encore.
// Cinq cases ; `probleme: true` marque les deux que le comité doit repérer
// d'un coup d'œil. Libellés auto-explicatifs (ils nomment les deux axes).
function statutEmplacement(ligne) {
  var attribue = !!(ligne && String(ligne.numeroAdresse || '').trim() && String(ligne.rue || '').trim());
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

if (typeof module !== 'undefined') {
  module.exports = { parserGrille, normaliserGrille, analyserStructures, numerosOrphelins, statutEmplacement, compterStatuts, fantomeOccupation, prochainEtatTournee, lotDeTournee, ETATS_OCCUPATION };
}
