# 03 — Bords, vérification & nettoyage

Status: done — commit en cours (T03)

## Parent

`.scratch/refonte-structures/PRD.md` (décision 0022).

## What to build

Boucler le redesign sur les cas de bord et la vérification finale, pour garantir qu'**aucune feature n'a été perdue** et que la baseline visuelle est propre.

- **Structures verticales (debout)** : rangée unique, sans étiquette de niveau, cellule et rail cohérents avec le reste ; le compte porte « debout ».
- **Grille non parsable** (cellule éditée à la main — 0002) : afficher le **texte brut** de la cellule plutôt que de casser ; « Faire la tournée » masqué (rien à relever), le callout d'erreur de données dit quoi faire.
- **États re-cadrés** : connexion, chargement (squelette de la tranche 02), erreur, vide — fond inchangé, capés à 65ch comme les pages sœurs (`.contenu-structures > :not(#etat-liste)`), cohérents avec la nouvelle liste.
- **Vérification & revue** : `npm run verify` complet au vert et **console propre** ; revue **ui-critic** par un sous-agent en lecture seule sur le **delta** de captures (0017) — donner les artefacts de `screenshots/.diff/` listés par le rapport, jamais les pleines pages ; corriger ce que la revue lève.
- **Baseline** : committer les PNG de captures modifiées/nouvelles avec le code (changement intentionnel).
- **Nettoyage** : supprimer les prototypes `tmp/proto-structures*.html` et `tmp/proto-shot.mjs` (règle du jetable — l'answer vit dans 0022 + `design.md`).

## Acceptance criteria

- [ ] Une structure verticale (debout) s'affiche correctement (rangée unique, sans niveaux) dans la nouvelle carte.
- [ ] Une grille non parsable montre son texte brut, sans exception console, « Faire la tournée » masqué.
- [ ] Les états connexion / chargement / erreur / vide sont cohérents avec la nouvelle liste, capés 65ch, fond inchangé.
- [ ] Aucune régression : fiche (0018), observation, libération, note, tournée (0021), édition — vérifiées via les scénarios de captures existants.
- [ ] `npm run verify` au vert, console propre ; revue ui-critic sur le delta passée et ses retours traités.
- [ ] Les captures modifiées/nouvelles sont committées comme nouvelle baseline.
- [ ] Les fichiers `tmp/proto-structures*` et `tmp/proto-shot.mjs` sont supprimés.

## Blocked by

- `.scratch/refonte-structures/issues/02-carte-rail-volet-grille-messages-responsive.md`
