# Decision index

One line per decision: `NNNN — <decision in one sentence> [tags]`. Agents: read this before proposing designs; open the full record before re-deciding anything it covers.

<!-- entries below, newest last -->
0001 — Frontend statique GitHub Pages + Google Apps Script en API + Google Sheet unique source de vérité [architecture]
0002 — La Sheet reste éditable à la main : propriétaire sur la ligne d'emplacement, historique en journal append-only [données, intégrité]
0003 — Aucun email vers un membre sans validation humaine ; seules les notifications internes au comité sont automatiques [emails, confiance]
0004 — Frontend vanilla + Web Awesome (CDN, sans build), variables visuelles en tokens --wa-* dans theme.css ; suggestions côté client [frontend, ui, suggestions]
0005 — Déploiement hybride : frontend via workflow Pages au push, backend via npm run deploy (clasp, ID stable, empreinte dans .deployment.json) [déploiement]
0006 — npm scripts = interface unique du tooling ; boucle visuelle agent par captures mockées multi-états (hook ?etat=, Playwright devDep) [tooling, agents]
