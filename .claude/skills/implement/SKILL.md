---
name: implement
description: "Implement a piece of work based on a PRD or set of issues."
disable-model-invocation: true
---

Implémente le travail décrit par l'utilisateur dans le PRD ou les issues (`.scratch/<feature>/`).

Suis ces étapes dans l'ordre — chacune est obligatoire, aucune ne se déduit des autres :

1. **Lire avant d'écrire.** L'issue en entier (les acceptance criteria sont le contrat) et son PRD parent ; `docs/decisions/INDEX.md` puis les records qui touchent la zone (vérifier leur « Revisit when ») ; `CONTEXT.md` pour le vocabulaire. Issue étalon : `.scratch/hors-quota/issues/02-section-hors-quota-et-fiche-adresse.md` — ce niveau de précision est la norme, pas l'exception.

2. **UI ? Brief d'abord.** Avant tout markup : design brief (audience, ton, hiérarchie, états vide/chargement/erreur/succès), lecture de `principles.md` + `composition.md` du skill webawesome-design, et `docs/design.md` — les patterns décidés de CE site (0015, 0016). Une page « conforme mais générique » est un échec.

3. **/tdd aux seams pré-agréés du PRD.** Dérivations pures et actions serveur d'abord (prior art : `tests/*.test.mjs`) ; la colle DOM/`sheets.js`/`Code.js` reste hors node par convention. Pas de typecheck dans ce repo (vanilla JS sans build) : les tests sont l'unique gate logique — ne saute pas le rouge-vert.

4. **Boucle courte.** Un fichier de test seul : `node --test tests/<x>.test.mjs`. Boucle visuelle sur une page : `npm run screenshots -- --page <page>`. Toujours en commande nue — jamais `&&`, `|` ni redirection (le hook refuse de toute façon).

5. **Gate finale : `npm run verify`** (nu). Console error/warning + pageerror font échouer la boucle de captures : zéro toléré hors `CONSOLE_IGNOREE`.

6. **Revue visuelle du delta** (décision 0017). Lancer `npm run screenshots` AVANT d'invoquer le subagent, puis revue critique par un subagent **lecture seule** (Read/Glob/Grep — pas de shell) sur les artefacts `screenshots/.diff/` listés par le rapport (crops avant/après/différence, tuiles des captures neuves) — jamais les pleines pages. « Aucune différence » = pas de revue visuelle.

7. **Changement visuel intentionnel → committer les PNG avec le code** (la baseline, décision 0017).

8. **`/code-review`** pour clore, puis corriger ce qui en sort.

9. **Commit sur la branche courante.** Cocher les acceptance criteria dans le fichier d'issue et mettre à jour sa ligne `Status:`.
