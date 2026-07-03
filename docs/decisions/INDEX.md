# Decision index

One line per decision: `NNNN — <decision in one sentence> [tags]`. Agents: read this before proposing designs; open the full record before re-deciding anything it covers.

<!-- entries below, newest last -->
0001 — Frontend statique GitHub Pages + Google Apps Script en API + Google Sheet unique source de vérité [architecture]
0002 — La Sheet reste éditable à la main : propriétaire sur la ligne d'emplacement, historique en journal append-only [données, intégrité]
0003 — Aucun email vers un membre sans validation humaine ; seules les notifications internes au comité sont automatiques [emails, confiance]
0004 — Frontend vanilla sans build ; suggestions d'emplacements calculées côté client dans la page admin [frontend, suggestions]
0005 — Code Apps Script dans le repo, déploiement unifié deploy.sh via clasp avec ID stable + génération de site/config.js [déploiement]
