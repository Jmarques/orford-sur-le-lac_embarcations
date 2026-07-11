# OSL Embarcations

Gestion des emplacements d'embarcation (kayaks, canoës, planches) de la communauté
Orford sur le Lac. Un formulaire public pour les demandes, des pages admin pour le
comité, et une Google Sheet comme unique source de vérité.

- Vocabulaire du domaine : [CONTEXT.md](CONTEXT.md)
- Décisions de design : [docs/decisions/INDEX.md](docs/decisions/INDEX.md)
- Notes d'origine du projet : [NOTE.md](NOTE.md)

## Architecture (résumé)

| Pièce | Où | Déployée comment |
|---|---|---|
| Frontend statique (`site/`) | GitHub Pages | commit → push (workflow Pages, à venir) |
| API (`apps-script/`) | Google Apps Script lié à la Sheet | `clasp push` + `clasp deploy` |
| Données + configuration | [Google Sheet](https://docs.google.com/spreadsheets/d/1M-DyJtBcJEI3AZQ1PUusGUcq0lV0a3vQBgVPPV6XPxY/edit) | éditable à la main par le comité |

## Développement

Prérequis une fois par machine : `npm install` puis `npx playwright install chromium`.

| Commande | Effet |
|---|---|
| `npm run dev` | sert `site/` sur http://localhost:8080 (attention : le formulaire parle à la **vraie** API) |
| `npm test` | suite de tests (logique pure, node:test) |
| `npm run screenshots` | capture **tous les états** de chaque page (API mockée, aucune écriture réelle) × desktop/mobile dans `screenshots/` ; `-- --live` pour la vraie config (lecture seule) |
| `npm run verify` | tests + screenshots — à lancer avant de déclarer un travail terminé |
| `npm run logs` | erreurs du backend Apps Script en direct (`clasp tail-logs`) |
| `npm run deploy` | déploie le **backend** si `apps-script/` a changé (`-- --force` pour outrepasser) |

Le hook d'URL `?etat=chargement|indisponible|succes|erreur-envoi` fige une page dans
un état donné (utilisé par les captures — décision 0006).

## Déploiement (décision 0005)

- **Frontend** : pousser sur `main` = déploiement automatique de `site/` via le
  workflow GitHub Pages (`.github/workflows/pages.yml`).
- **Backend** : `npm run deploy` (prérequis une fois : `npm install -g @google/clasp`
  + `clasp login`). Redéploie sur l'ID stable — l'URL `/exec` ne change jamais, donc
  aucun impact sur le frontend. L'état du dernier déploiement vit dans
  `.deployment.json` (commité).
- `site/config.js` : la ligne `apiUrl` est gérée par `npm run deploy` ; le
  `courrielComite` s'y édite à la main (lien de contact affiché quand le
  formulaire échoue — homonyme mais distinct de la clé de l'onglet Config).
- Notification interne (ticket 04, décision 0003) : à chaque nouvelle demande,
  le backend envoie un courriel au destinataire de la clé `courrielComite` de
  l'onglet Config de la Sheet (vide = aucun envoi) ; la clé `urlSite` fournit
  le lien vers À traiter. Les deux clés sont semées par `setup()` — après le
  déploiement qui les introduit, ré-exécuter `setup()` et ré-autoriser le
  script (nouveau scope d'envoi de courriel).

### Première mise en service (une seule fois)

1. `clasp create-script --parentId <idDeLaSheet> --title "OSL Embarcations" --rootDir apps-script`
2. `clasp push -f` puis `clasp deploy -d "initial"` ; noter l'ID dans `.deployment.json`
   (`{"id": "…", "empreinteSources": null}`) — `npm run deploy` prend le relais ensuite.
3. Ouvrir l'éditeur (`clasp open-script`), exécuter la fonction `setup` et accepter
   l'autorisation OAuth — cela crée aussi les onglets manquants dans la Sheet.
   `setupDonneesDemo` ajoute en plus des demandes fictives `[DÉMO]` pour développer
   les pages admin.

## Conventions

- UI : composants [Web Awesome](https://webawesome.com) ; toutes les variables
  visuelles vivent dans `site/theme.css` (tokens `--wa-*`) — jamais de valeur en dur.
- `apps-script/sheets.js` est le seul module qui connaît le schéma des onglets.
- Workflow : `/pragmatic:grill` → `/pragmatic:design` → `/pragmatic:build` → `/pragmatic:etc-review`.
