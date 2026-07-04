# 0005 — Déploiement hybride : frontend en CI (Pages), backend par `npm run deploy` explicite via clasp

Date: 2026-07-03 (raffinée le 2026-07-03 : workflow A issu du grill tooling)
Status: Accepted

## Context
Le système a deux moitiés : le frontend (GitHub Pages) et l'Apps Script (déploiement Google séparé). Sans discipline, le code GAS édité en ligne dériverait du repo. Le frontend doit connaître l'URL `/exec` du Web App — mais comme le déploiement réutilise un ID stable (`clasp deploy -i`), cette URL ne change jamais après la création : il n'y a pas de boucle « déployer → nouvel ID → re-commit ».

## Decision
Le code Apps Script vit dans le repo (`apps-script/`) ; un push sur `main` déploie le frontend (workflow GitHub Pages) ; le backend se déploie par `npm run deploy` (logique dans `tools/deploy.mjs`), qui détecte via une empreinte des sources stockée dans `.deployment.json` (`{id, empreinteSources}`, commité) si un déploiement est nécessaire, fait `clasp push` + redeploy sur l'ID stable, et vérifie que `site/config.js` est cohérent — sans jamais commiter ni pousser lui-même.

## Alternatives rejected
- Code GAS édité uniquement dans l'éditeur en ligne — pas de versionnement ni de revue ; la copie repo dériverait inévitablement.
- Tout en CI (Action GitHub qui déploie aussi le backend) — credentials Google en secrets GitHub et une Action à maintenir ; prématuré pour un mainteneur unique. La logique dans `tools/deploy.mjs` rend cette évolution triviale (l'Action appellerait `npm run deploy`).
- Hook git local pre-push — hooks à installer par machine, déploiements invisibles, risque de déploiement depuis une branche WIP.
- Nouveau déploiement à chaque fois (URL changeante) — obligerait à propager l'URL à chaque déploiement au lieu d'une seule fois.

## Trade-offs accepted
- Installation initiale de clasp + login Google (~10 min) pour quiconque déploie le backend.
- Le déploiement backend reste un geste manuel : oublier `npm run deploy` après un changement d'`apps-script/` laisse la prod en retard (l'empreinte le signale à la prochaine invocation).
- `site/config.js` et `.deployment.json` sont des fichiers gérés par l'outil : une édition manuelle sera écrasée.

## Revisit when
- Plusieurs mainteneurs déploient le backend, ou un backend obsolète cause un incident réel — passer au tout-CI (Action + secrets).
- clasp est abandonné par Google ou casse (dernier commit > 2 ans, incompatibilité).
