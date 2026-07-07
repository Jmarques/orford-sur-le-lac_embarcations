# 01 — Dérivations « Hors quota » et lecture (`quotaAccorde`, notes d'adresse)

Status: ready-for-human — implémenté (tranche T1), à valider sur le vrai site après `npm run deploy`

## Parent

`.scratch/hors-quota/PRD.md` — PRD « Section Hors quota : file par adresse, fiche d'adresse, notes d'adresse » (décision 0019).

## What to build

La fondation dérivée de la section « Hors quota », entièrement côté client (0004) et sans aucun écran : des fonctions pures partagées qui, à partir de l'inventaire, de l'onglet Membres et du Journal, produisent tout ce que la section et les fiches afficheront — plus le contrat de lecture et le setup d'en-têtes qui font voyager les nouvelles colonnes.

Les dérivations (aucun état stocké — 0019) :

- **Clé d'adresse normalisée** : trim + minuscules + espaces multiples réduits — la fonction partagée qui apparie les lignes d'Emplacements entre elles et avec Membres. L'affichage garde toujours le texte de la ligne ; pas de rapprochement plus flou (une fusion à tort serait pire qu'un éclatement).
- **File « Hors quota »** : regroupement des attributions par adresse ; cas = attributions > `quotaAccorde` (défaut 2 si absent ou illisible — 0002). Compte sur les attributions, jamais sur l'occupation observée. Chaque cas porte : adresse lisible, membre (si trouvé), quota applicable, dépassement, emplacements de l'adresse. Tri par dépassement décroissant, puis nombre d'emplacements, puis adresse — stable.
- **Journal du cas** : notes d'adresse (événements du Journal portant la colonne `adresse`) + libérations des emplacements de l'adresse, en ordre chronologique. Le journal d'un emplacement ne change pas.
- **Quota d'une adresse attribuée** (pour la future pastille de la fiche d'emplacement) : nombre d'emplacements de l'adresse et indicateur de dépassement — rien n'est signalé quand l'adresse respecte son quota (0016).

Côté lecture : l'onglet Membres voyage déjà avec l'inventaire — il transporte en plus `quotaAccorde` ; le setup des en-têtes (0012) ajoute `quotaAccorde` à Membres et `adresse` au Journal. Les données mockées `?etat=` s'enrichissent (adresses hors quota, exception respectée, exception dépassée, notes d'adresse) pour que la tranche suivante ait de quoi s'afficher.

Vocabulaire : CONTEXT.md ([[Quota]], [[Hors quota]], [[Note (au journal)]], [[Adresse]]) — jamais « en infraction », « fautif », « dépassement » comme nom d'état.

## Acceptance criteria

- [x] Dérivations pures testées en node (prior art `tests/grille.test.mjs`, `tests/a-traiter.test.mjs`) : entrée (emplacements + membres + journal) → sortie, sans DOM ni API.
- [x] Cas couverts : adresse à 3 attributions sans quota accordé ; exception à 3 respectée (hors file) puis dépassée (en file) ; `quotaAccorde` illisible → défaut 2 ; adresse éclatée par la casse ou les espaces → regroupée ; adresse sans ligne Membres ; Journal vide ; événements illisibles tolérés (0002) ; tri par dépassement stable.
- [x] Le journal du cas fusionne notes d'adresse et libérations des emplacements de l'adresse en ordre chronologique.
- [x] Le quota d'une adresse pour la pastille ne signale rien quand l'adresse respecte son quota.
- [x] Le contrat de lecture transporte `quotaAccorde` ; le setup des en-têtes crée `quotaAccorde` (Membres) et `adresse` (Journal) ; les données mockées en profitent.
- [x] `npm run verify` vert ; aucune capture existante ne change (aucun écran dans cette tranche).

## Blocked by

None - can start immediately.
