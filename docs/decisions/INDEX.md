# Decision index

One line per decision: `NNNN — <decision in one sentence> [tags]`. Agents: read this before proposing designs; open the full record before re-deciding anything it covers.

<!-- entries below, newest last -->
0001 — Frontend statique GitHub Pages + Google Apps Script en API + Google Sheet unique source de vérité [architecture]
0002 — La Sheet reste éditable à la main : propriétaire sur la ligne d'emplacement, historique en journal append-only [données, intégrité]
0003 — Aucun email vers un membre sans validation humaine ; seules les notifications internes au comité sont automatiques [emails, confiance]
0004 — Frontend vanilla + Web Awesome (CDN, sans build), variables visuelles en tokens --wa-* dans theme.css ; suggestions côté client [frontend, ui, suggestions]
0005 — Déploiement hybride : frontend via workflow Pages au push, backend via npm run deploy (clasp, ID stable, empreinte dans .deployment.json) [déploiement]
0006 — npm scripts = interface unique du tooling ; boucle visuelle agent par captures mockées multi-états (hook ?etat=, Playwright devDep) [tooling, agents]
0007 — Inventaire : onglet Structures séparé, occupation observée distincte de l'attribution, seed Apps Script fusionnant par numéro (seed et structure/niveau remplacés par 0009) [données, inventaire]
0008 — Auth admin : mot de passe partagé dans Config, transmis en corps POST (jamais en URL), vérifié par action [auth, sécurité]
0009 — Grille d'emplacements manuscrite dans Structures = source de vérité (format normalisé, type/saisie séparés) ; seed photo abandonné ; Emplacements sans structure/niveau, lignes créées jamais supprimées [données, inventaire, structures]
0010 — Onglet Membres (contact courant, 1 par adresse, source de vérité vs journal Demandes) ; Emplacements sans nom/numeroInfere/sourceObservation, + dateObservation ; T5 lit, éditeur/MAJ-depuis-demande = manche séparée [données, membres, contact]
0011 — Statut d'un emplacement dérivé (attribution × occupation), jamais stocké ; observations et gestes journalisés dans le Journal dès maintenant (historique + « libre depuis » dérivés) [données, statut, journal]
0012 — Couche Sheet pilotée par les en-têtes : écritures et setup par nom de colonne (réordonnancement manuel sûr), pas seulement les lectures ; affichage adresse « numeroAdresse rue » [données, sheet, robustesse]
0013 — Tournée : écran dédié par structure (« Faire la tournée »), fantôme + un tap = confirmer, jamais d'observation par inaction, envoi par lot + « Structure suivante » [ux, tournée, observations]
0014 — Page « À traiter » : sections empilées par type de cas, files dérivées du statut (sortie automatique), interventions texte libre journalisées, libérer avec confirmation, relance humaine par mailto:, quota reporté nommé [ux, traitement, journal]
0015 — Direction esthétique « Le lac au petit matin » : Fraunces/Nunito Sans + wordmark script, verts d'eau/sable en tokens, galets, bande animée sous l'eau (shader WebGL site/eau.js, tokens --osl-eau-*, fallback dégradé, fixe en reduced-motion) [ui, theme, identite]
0016 — Interfaces silencieuses : une info = un seul foyer (pas de texte répétant une représentation, totaux en pastille libellée, titres redondants invisibles, consigne dite une fois) ; le procédural/rassurant n'est pas du bruit [ui, ux, redondance]
0017 — Revue visuelle incrémentale : captures committées = baseline, npm run screenshots ne signale que le delta pixel (artefacts avant/différence dans screenshots/.diff/), revue sur le delta seulement ; port éphémère, --page pour la boucle interne [tooling, agents, ui]
0018 — Fiche d'emplacement unique (composant partagé Structures + À traiter) : en-tête statut/position/membre, onglets Observer/Traiter, gestes selon le statut jamais la page, fiche toujours ouverte après geste, drawer bas sur mobile [ux, fiche, coherence]
0019 — Hors quota : file par adresse en tête d'À traiter (cas = attributions > quotaAccorde de Membres, défaut 2), fiche d'adresse (emplacements + statuts, journal du cas), notes d'adresse dans le Journal (colonne adresse, amende 0014), clé d'adresse normalisée, rien dans la grille (pastille dans la fiche d'emplacement seulement) [ux, quota, journal, donnees]
0020 — Traitement des demandes : section d'À traiter (admin.html retirée), fiche de demande (diff contact MAJ en un clic, suggestions = Disponibles des structures compatibles triées par niveau), accepter = attribuer en un geste, quota bloquant à l'attribution, état de demande dérivé de numeroAttribue + dateDecision (colonne statut retirée), refus = raison journalisée, notification comité en dernière phase [ux, demandes, attribution, donnees]
