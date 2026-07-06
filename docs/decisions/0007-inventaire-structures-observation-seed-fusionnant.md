# 0007 — Inventaire : onglet Structures séparé, occupation observée distincte de l'attribution, seed Apps Script fusionnant par numéro

Date: 2026-07-04
Status: Partiellement remplacée par 0009 (seed photo + colonnes structure/niveau abandonnés) puis par 0010 (colonnes nom/numeroInfere/sourceObservation abandonnées, dateObservation ajoutée, contact normalisé dans l'onglet Membres). Restent valides : les onglets séparés et la distinction occupation observée / attribution.

## Context
L'inventaire des ~180 emplacements part de `tmp/structure.json`, produit par un workflow LLM sur photos : fiable en gros mais pas partout (numéros inférés, statuts inconnus, structures S04/S07/S09/S10 à rephotographier). Les attributions (emplacement → adresse) démarrent vides — le comité les saisira lui-même, dans la Sheet ou via le site (voie non tranchée). Un re-seed après de nouvelles photos est quasi certain et ne doit pas écraser le travail du comité.

## Decision
L'inventaire vit dans deux onglets : **Structures** (~10 lignes : id, type horizontale/verticale, notes) et **Emplacements** (une ligne par numéro, propriétaire sur la ligne conformément à 0002, plus des colonnes d'**occupation observée** — occupationObservee, numeroInfere, sourceObservation — distinctes des colonnes d'attribution) ; le seed est une fonction Apps Script `seedInventaire()` (données embarquées dans un fichier généré par script npm depuis `tmp/structure.json`), **fusionnante par numéro** : ré-exécutable, elle ne met à jour que la géographie et l'observation, jamais les colonnes du comité (rue, numeroAdresse, nom, note).

## Alternatives rejected
- Colonnes structure dénormalisées sur chaque ligne d'Emplacements — dupliquerait le type et les notes de structure sur ~180 lignes ; l'édition quotidienne du comité reste sur Emplacements, donc l'onglet séparé ne crée pas la friction « deux onglets » qui avait fait rejeter un onglet Attributions (0002).
- Seed one-shot (exécuté une fois puis jeté) — le re-seed après nouvelles photos est quasi certain ; il forcerait des corrections manuelles sur des dizaines de lignes.
- Collage manuel d'un TSV généré — sans protection des colonnes du comité au re-seed, et source d'erreurs de manipulation.
- Fusionner observation et attribution en une seule colonne « statut » — l'audit photo futur exige de comparer les deux ; une embarcation peut occuper un emplacement sans attribution connue (et inversement).

## Trade-offs accepted
- L'occupation observée vieillit : elle date des photos (juin 2026) et ne se met à jour qu'au prochain seed — elle est un indice, pas un état courant.
- Le fichier seed généré embarque ~180 entrées dans le code Apps Script poussé par clasp — du lest dans le déploiement, inerte hors exécution manuelle.
- La fusion par numéro suppose le numéro immuable : renuméroter une plaque sur le terrain demande une correction manuelle coordonnée (Sheet + prochain seed).
- Deux onglets à garder cohérents (un emplacement référence un id de structure) ; l'API valide à la lecture et signale plutôt que planter (0002).

## Revisit when
- Le comité renumérote des plaques ou déplace des emplacements entre structures plus d'une fois par saison — la clé de fusion « numéro » ne suffit plus.
- L'audit photo devient récurrent (plusieurs relevés par saison) — l'observation mérite alors son propre journal daté plutôt que des colonnes écrasées à chaque seed.
