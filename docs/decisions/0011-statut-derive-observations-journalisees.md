# 0011 — Statut d'un emplacement dérivé (attribution × occupation) ; observations journalisées dans le Journal

Date: 2026-07-05
Status: Accepted (déclenche et remplace le « Revisit when » observation de 0007)

## Context
En préparant T4 (occupation en un clic) et T5 (infos du membre), Jeremy a explicité que « statut » recouvre 4 à 6 états métier qui croisent deux axes déjà modélisés : l'**attribution** (l'emplacement a une adresse, ou non) et l'**occupation observée** (occupé/libre/inconnu). Deux cases sont des problèmes que le comité doit repérer d'un coup d'œil : `attribué + libre` (le membre n'utilise plus la place — candidate à réattribution après un délai) et `non attribué + occupé` (embarcation orpheline à identifier, qui bloque l'attribution). Il veut aussi savoir « depuis combien de temps c'est libre » et disposer d'un historique par emplacement (attributions, observations inattendues, rappels envoyés) pour éviter les conflits avec les membres.

## Decision
Le statut n'est **jamais stocké** : une fonction pure `statutEmplacement(attributionPrésente, occupationObservee)` le dérive à la lecture. Chaque geste de l'app (observation, attribution/libération, rappel, note) est **appendé à l'onglet Journal existant** (décision 0002, colonnes `date, action, numero, demandeId, details`) ; l'historique d'un emplacement est ce Journal filtré par `numero`, et « libre depuis » = le début de la série ininterrompue d'observations « libre ». La ligne d'Emplacements garde l'**état courant** (`occupationObservee` + `dateObservation`) pour l'affichage rapide et l'édition manuelle (0002). **La journalisation démarre dès la première manche** (T4), même si la frise d'historique et « libre depuis » ne s'affichent que dans une manche ultérieure — sans quoi l'historique serait irrécupérable.

## Alternatives rejected
- Colonne `statut` stockée sur Emplacements — duplique une information dérivable de deux colonnes déjà présentes, à re-synchroniser à chaque changement d'attribution ou d'occupation.
- Occupation seulement en cellule, sans journal — « libre depuis » et l'historique deviennent impossibles à calculer rétroactivement.
- Nouvel onglet d'observations dédié — le Journal append-only de 0002 fait déjà exactement ce travail ; un onglet de plus fragmenterait l'historique.
- Différer la journalisation jusqu'à la manche d'affichage de l'historique — on perdrait tout l'historique accumulé entre-temps.

## Trade-offs accepted
- Le Journal grossit d'une ligne par observation ; à ~180 places et quelques relevés par saison, négligeable.
- « Libre depuis » et l'historique exigent de scanner les lignes Journal du numéro concerné.
- L'état courant sur la ligne d'Emplacements est une petite redondance avec le dernier événement d'observation du Journal — assumée, exactement comme 0002 accepte état-courant-sur-la-ligne + Journal.
- Les libellés des six statuts sont un jeu de travail, à affiner à l'UI (revue ui-critic).

## Revisit when
- Le Journal devient trop volumineux pour un scan par `numero` à cette échelle (bien au-delà de ~180 places et quelques relevés/saison) — indexer ou matérialiser « libre depuis ».
- Le comité veut un statut figé, éditable à la main, plutôt que dérivé.
- La règle de réattribution (ex. « libre depuis 1 été ») doit être appliquée automatiquement — elle deviendra une lecture dérivée de plus sur le Journal.
