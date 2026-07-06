# 01 — Dérivations « À traiter » et Journal dans la lecture

Status: ready-for-human — implémenté (commit b956dfa), à valider sur le vrai site

## Parent

`.scratch/a-traiter/PRD.md` — PRD « Page À traiter : files de cas problèmes, interventions et libération » (décision 0014).

## What to build

La fondation dérivée de la page « À traiter », entièrement côté client (0004) et sans aucun écran : des fonctions pures partagées qui, à partir de l'inventaire des emplacements et des événements du Journal, produisent tout ce que la page affichera — plus le contrat de lecture qui fait voyager le Journal avec l'inventaire.

Les dérivations (aucun état stocké, files entièrement dérivées — 0014) :

- **File « Attribué, libre »** : attribution présente + observé libre, triée du plus anciennement libre au plus récent (tri stable).
- **File « À identifier »** : attribution absente + observé occupé.
- **« Libre depuis » en faits observés, jamais en mois calendaires** (0014, saisonnalité) : début de la série ininterrompue d'observations « libre », nombre d'observations dans la série, date de la dernière. Une observation « occupé » casse la série et le compteur repart.
- **Historique complet d'un emplacement** par `numero` : attributions, observations, interventions, libérations, en ordre chronologique — assez riche pour raconter « l'embarcation est apparue entre le 3 mai et le 12 juin » sur un « À identifier ».
- **Tolérance aux données illisibles** (0002) : un événement Journal ou une ligne d'inventaire illisible est ignoré sans jamais empêcher la dérivation de rendre un résultat.

Côté lecture, l'inventaire renvoie en plus les événements du Journal (volume négligeable à ~180 places, 0011) ; les données mockées `?etat=` existantes s'enrichissent du Journal pour que la tranche suivante ait de quoi s'afficher.

Vocabulaire : CONTEXT.md ([[Intervention]], [[Statut d'un emplacement]], [[Occupation observée]]) — jamais « rappel », « suivi » (objet), « conflit ».

## Acceptance criteria

- [x] Dérivations pures testées en node (prior art `tests/grille.test.mjs`) : entrée (emplacements + journal) → sortie, sans DOM ni API.
- [x] Cas couverts : aucune observation, série « libre » ininterrompue, série cassée par un « occupé » (le compteur repart), emplacement jamais attribué, Journal vide, événements illisibles (tolérance sans plantage), tri stable.
- [x] La file « Attribué, libre » sort triée du plus anciennement libre au plus récent ; la file « À identifier » ne contient que les emplacements sans attribution observés occupés.
- [x] L'historique par `numero` fusionne tous les types d'événements en ordre chronologique.
- [x] Le contrat de lecture de l'inventaire inclut les événements du Journal ; les données mockées en profitent.
- [x] `npm run verify` vert ; aucune capture existante ne change (aucun écran dans cette tranche).

## Blocked by

None - can start immediately.
