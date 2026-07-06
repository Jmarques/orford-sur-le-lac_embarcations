# 0012 — Couche Sheet pilotée par les en-têtes : les écritures aussi, pas seulement les lectures

Date: 2026-07-05
Status: Accepted (renforce 0002)

## Context
La décision 0002 veut la Sheet éditable à la main par le comité. Les lectures (`objetsDepuisLignes`) mappent déjà chaque cellule par le **nom** de sa colonne (ligne d'en-tête) : réordonner les colonnes est sans risque en lecture. Mais toutes les écritures — `ajouterDemande`, `sauverStructure`, les ajouts au Journal, et `setup()` — supposent que l'ordre **physique** des colonnes est celui de la constante `ENTETES_` correspondante. Réordonner une colonne dans la Sheet corromprait donc la prochaine écriture de l'app (valeurs sous les mauvaises colonnes). Jeremy veut pouvoir réordonner librement les colonnes tant que les en-têtes restent.

## Decision
Les écritures lisent la **ligne d'en-tête réelle** de l'onglet et placent chaque valeur sous sa colonne **par nom**, jamais par position (un petit helper construit la ligne dans l'ordre physique courant à partir d'un objet). `setup()` garantit la présence de chaque en-tête requis en **ajoutant les colonnes manquantes en fin**, sans jamais réordonner ni écraser l'ordre choisi par le comité. Les constantes `ENTETES_` définissent l'**ensemble requis** et l'ordre **par défaut à la création** — pas une contrainte de position permanente. Convention d'affichage liée : une adresse se lit toujours « numeroAdresse rue » (ex. « 234 Rue du Pré »), quel que soit l'ordre des colonnes dans la Sheet.

## Alternatives rejected
- Garder les écritures par position — le plus simple, mais réordonner casse tout ; contraire à l'esprit « éditable à la main » de 0002.
- Interdire le réordonnancement (juste documenté) — fragile ; un membre du comité réordonnera pour sa lisibilité et cassera l'app en silence.
- `setup()` qui réécrit toute la ligne d'en-tête dans l'ordre de la constante — remettrait de force l'ordre par défaut et désalignerait les données déjà en place.

## Trade-offs accepted
- Chaque écriture lit d'abord la ligne d'en-tête de l'onglet (coût négligeable à cette échelle ; les onglets sont déjà relus à chaque action, 0002).
- `setup()` devient « garantir que chaque en-tête existe » plutôt qu'un simple `setValues` — un peu plus de logique, testée.
- Un en-tête renommé à la main (faute de frappe) fait échouer le mappage pour cette colonne — signalé à la lecture, jamais silencieux (0002).

## Revisit when
- Le coût des lectures d'en-tête devient sensible (volume ou latence bien au-delà de l'échelle actuelle).
- On migre hors Google Sheets vers un store où l'ordre des colonnes n'a plus de sens.
