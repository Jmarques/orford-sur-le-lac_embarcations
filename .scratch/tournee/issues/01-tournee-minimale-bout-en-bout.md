# 01 — Tournée minimale de bout en bout

Status: ready-for-agent

## Parent

`.scratch/tournee/PRD.md` — PRD « Tournée : relevé d'occupation en série, structure par structure » (décision 0013).

## What to build

Le chemin complet du relevé en série, aussi mince que possible mais traversant toutes les couches. Un bouton « Faire la tournée » sur chaque carte de structure ouvre un écran dédié limité à cette structure. Chaque cellule montre le numéro et le dernier état observé en fantôme (estompé) ; une cellule jamais observée n'a pas de fantôme. Le cycle de tap est complet : un tap confirme ce qu'on voit (reprend le fantôme ; sans fantôme, premier tap = occupé), un second bascule occupé ↔ libre, un troisième revient à « non relevé ». « Terminer la tournée » envoie le lot des cellules touchées — et seulement elles : aucune observation par inaction (0013). Côté serveur, l'action de lot valide chaque valeur contre l'ensemble partagé, écrit cellule + `dateObservation` (timestamp serveur) par en-têtes réels (0012), crée la ligne si absente (0009) et appende un événement Journal par observation (0011) ; un lot contenant une valeur invalide est refusé en entier avec un message clair. En cas d'échec d'envoi, les taps sont conservés et un réessai est proposé. Après succès, retour à la liste des structures avec les statuts recalculés. Auth comité en corps POST (0008).

La logique d'état de la tournée (cycle de tap, contenu du lot) vit en fonctions pures dans le module de grille partagé, sans DOM ni API. L'écran suit le processus UX obligatoire (brief, Web Awesome, tokens theme.css, public aîné : cibles larges, pas d'appui long) et n'affiche pas les 5 statuts — seulement fantôme/confirmé.

## Acceptance criteria

- [ ] Un bouton « Faire la tournée » (copy exacte) sur chaque carte de structure ouvre l'écran de tournée de cette structure seule.
- [ ] Cellule avec fantôme : tap 1 = confirmé identique, tap 2 = basculé, tap 3 = non relevé ; cellule sans fantôme : tap 1 = occupé, tap 2 = libre, tap 3 = non relevé — couvert par des tests node sur les fonctions pures (prior art `tests/grille.test.mjs`).
- [ ] « Terminer la tournée » n'envoie que les cellules touchées ; les autres gardent leur ancienne observation et sa date (vérifiable en données mockées).
- [ ] L'action serveur de lot écrit cellules + Journal (un événement par observation, date serveur), refuse un lot entièrement si une valeur est invalide, crée les lignes absentes — tests node (prior art `tests/observation.test.mjs`), lot vide et lot mixte créations/mises à jour couverts.
- [ ] Échec d'envoi : message d'erreur clair, taps conservés, bouton réessayer fonctionnel.
- [ ] Après envoi réussi, la liste des structures montre les statuts recalculés avec les observations fraîches.
- [ ] Captures mockées via `?etat=` : écran vierge, cellules mixtes (fantômes/confirmées/sans fantôme), erreur d'envoi ; console error/warning + pageerror font échouer la boucle ; `npm run verify` vert.
- [ ] Revue UI sur captures fraîches (processus CLAUDE.md) passée.

## Blocked by

None - can start immediately.
