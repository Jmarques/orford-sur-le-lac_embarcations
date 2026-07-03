# 0005 — Code Apps Script versionné dans le repo, déploiement unifié via clasp avec ID de déploiement stable

Date: 2026-07-03
Status: Accepted

## Context
Le système a deux moitiés déployées différemment : le frontend (GitHub Pages, à chaque commit) et l'Apps Script (déploiement Google séparé). Sans discipline, le code GAS édité en ligne dériverait du repo, et le frontend doit connaître l'URL `/exec` du Web App.

## Decision
Le code Apps Script vit dans le repo (`apps-script/`) et un unique script `deploy.sh` fait tout : `clasp push`, redéploiement sur un ID de déploiement stable (`clasp deploy -i`, donc URL `/exec` immuable après création), génération de `site/config.js` avec l'URL de l'API, puis commit/push qui déclenche Pages.

## Alternatives rejected
- Code GAS édité uniquement dans l'éditeur en ligne — pas de versionnement ni de revue ; la copie repo dériverait inévitablement.
- GitHub Action qui pousse vers Apps Script à chaque commit — credentials Google en secrets GitHub et une Action à maintenir, pour un backend qui changera rarement une fois stable.
- Nouveau déploiement à chaque fois (URL changeante) — obligerait à propager l'URL à chaque déploiement au lieu d'une seule fois.

## Trade-offs accepted
- Installation initiale de clasp (login Google, ~10 min) pour quiconque déploie le backend.
- `site/config.js` est un fichier généré commité : une édition manuelle serait écrasée au prochain déploiement.
- Le déploiement backend reste une action locale manuelle (pas de CI) — dépend de la machine d'un mainteneur.

## Revisit when
- Plusieurs mainteneurs déploient le backend et se marchent dessus — passer à l'option GitHub Action.
- clasp est abandonné par Google ou casse (dernier commit > 2 ans, incompatibilité).
