# 08 — Rédiger le PRD

Type: task
Status: resolved
Blocked by: 03, 04, 05, 06, 07

## Question

Rédiger le PRD « gabarits de courriel éditables » via `/to-prd` : user stories, table exigence → tranche (contrat de données complet dès la première tranche visible), en s'appuyant sur toutes les décisions de la carte. Validé par Jeremy = destination atteinte.

## Answer

Rédigé via `/to-spec` (successeur de `/to-prd`) : [PRD.md](../PRD.md), status `ready-for-agent`. 23 user stories, décisions des tickets 01-07 synthétisées, table exigence → tranche (T1 domaine pur · T2 backend · T3 fiches depuis le modèle · T4 page + lien contextuel), coutures de test validées par Jeremy (module pur `site/gabarits.js`, seam apps-script existant, boucle de captures) — avec la consigne « code facilement remplaçable » (modules profonds). Découpage en tickets d'implémentation : `/to-tickets` à la suite.
