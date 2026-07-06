# 0009 — La grille d'emplacements de l'onglet Structures est la source de vérité, saisie à la main ; abandon du seed photo

Date: 2026-07-05
Status: Accepted (révise 0007 : seed photo et colonnes structure/niveau abandonnés)

## Context
Le seed depuis `tmp/structure.json` (workflow LLM sur photos, décision 0007) a produit trop de données erronées pour servir de base. Jeremy a ressaisi l'inventaire à la main dans l'onglet Structures : une colonne `emplacements` par structure, en arrays imbriqués (`[[74..81], [82..89]]`, `a..b` = plage séquentielle). Ces données manuscrites ont coûté cher à produire et deviennent les données initiales. Il faut une page comité pour visualiser ces grilles, corriger les invalides, et plus tard pointer l'occupation observée.

## Decision
La colonne `emplacements` de l'onglet Structures est la **seule** source de vérité pour « quel numéro est dans quelle structure, à quel niveau » : l'onglet Emplacements perd ses colonnes `structure` et `niveau` (dérivées à la lecture) et ne garde que l'attribution (colonnes comité) et l'observation. Le format canonique de la cellule est la syntaxe manuscrite existante, normalisée à la sauvegarde (ranges quand séquentiel) ; deux colonnes distinctes la décrivent : `type` (horizontal/vertical = rangement physique, seuls les horizontaux ont des niveaux) et `saisie` (niveaux/colonnes = sens de lecture des arrays, premier élément toujours côté niveau le plus haut). Le seed photo est supprimé (fichiers, fonction, tests) ; l'occupation observée repart vide. L'éditeur admin sauvegarde **toujours**, même invalide, avec avertissements persistants (parse, doublons inter-structures, grille irrégulière) ; à la sauvegarde l'API crée les lignes Emplacements manquantes et n'en supprime jamais (un numéro retiré devient orphelin signalé).

## Alternatives rejected
- Garder le seed photo ré-exécutable en parallèle — deux sources de vérité pour la géographie, et les données photo sont précisément ce qu'on juge non fiable.
- JSON strict dans la cellule — perd les plages `a..b`, cellules illisibles et pénibles à éditer à la main (0002), migration des données manuscrites pour rien.
- Une ligne de Sheet par niveau/colonne — onglet plus lourd, édition manuelle plus risquée, sans gain pour le parseur.
- Garder `structure`/`niveau` dans Emplacements synchronisés depuis la grille — deux écritures à garder cohérentes pour une info dérivable à la lecture.
- Bloquer la sauvegarde d'une grille invalide — fait perdre le travail en cours (corrections à cheval sur deux structures) et contredit 0002 : la Sheet éditée à la main peut de toute façon être invalide, l'app doit le tolérer à la lecture.
- Éditeur visuel clic-par-clic dès la v1 — beaucoup plus de travail alors que la saisie par plages au texte est justement la plus rapide ; le champ texte + aperçu live couvre saisie normale et rattrapage d'invalide avec une seule mécanique.

## Trade-offs accepted
- Un parseur/sérialiseur maison à maintenir (syntaxe tolérante en entrée, forme normalisée en sortie) au lieu de `JSON.parse`.
- Des données invalides peuvent vivre dans la Sheet entre deux corrections : toute lecture (API, page structures, future attribution) doit les tolérer et les signaler plutôt que planter.
- `niveau` n'existe plus comme colonne : tout consommateur (mobilité réduite, suggestions) doit passer par la dérivation depuis la grille.
- Les lignes Emplacements orphelines s'accumulent tant que personne ne les supprime à la main dans la Sheet.
- L'occupation observée de juin 2026 est perdue — assumé : elle était majoritairement fausse.

## Revisit when
- Le comité demande à déplacer/renuméroter des emplacements plus vite que l'édition texte ne le permet — l'éditeur visuel clic-par-clic redevient candidat.
- Un troisième consommateur de la grille apparaît (au-delà de la page structures et des suggestions d'attribution) — envisager de matérialiser la dérivation côté Sheet.
- Un nouveau relevé photo fiable arrive — le réintroduire comme **observation** (occupationObservee) uniquement, jamais comme géographie.
