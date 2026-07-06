# 02 — Progression et changements

Status: ready-for-human — implémenté (commit 1eec8ba), à valider sur le vrai site

## Parent

`.scratch/tournee/PRD.md` — PRD « Tournée : relevé d'occupation en série, structure par structure » (décision 0013).

## What to build

Rendre la tournée lisible pendant et après le relevé. Un compteur « relevés / total » (ex. « 12/16 relevés ») reste visible pendant toute la tournée. Les cellules dont l'état confirmé diffère du fantôme portent un marqueur « a changé » bien visible — le changement est l'information intéressante pour le comité. Si « Terminer la tournée » est touché alors que des cellules restent non relevées, un avertissement l'annonce (« 3 emplacements non relevés — ils garderont leur dernière observation ») et laisse terminer quand même (portée flexible, 0013). Après l'envoi réussi, un écran de résumé présente le bilan : nombre de relevés et liste des changements (« 14 relevés, 2 changements : n° 43 maintenant libre, n° 78 maintenant occupé »). Le compte des relevés, la détection « a changé » et la construction du résumé sont des fonctions pures du module de grille partagé, testées en node.

## Acceptance criteria

- [x] Compteur « relevés / total » visible en permanence (pastille sticky), mis à jour à chaque tap (y compris l'annulation au troisième tap).
- [x] Marqueur « a changé » sur toute cellule confirmée à un état différent de son fantôme ; une cellule sans fantôme confirmée ne porte pas le marqueur à tort — logique couverte en tests node (`aChangeTournee`).
- [x] Avertissement de fin partielle : déclenché seulement s'il reste des cellules non relevées, nombre exact annoncé, permet de terminer ou de continuer le relevé.
- [x] Écran de résumé après envoi : total relevé, liste des changements avec numéro et nouvel état, formulation en français simple ; cas « aucun changement » traité (« 1 emplacement relevé, aucun changement. »).
- [x] Captures mockées : compteur en cours, cellules marquées « a changé » (sur fond rempli ET clair), avertissement partiel, résumé avec et sans changements ; console propre ; `npm run verify` vert.
- [x] Revue UI sur captures fraîches passée — corrections appliquées : bordure et taille de la puce « a changé » (contraste sur cellule claire), hauteur de rangée uniforme.

## Blocked by

- `01-tournee-minimale-bout-en-bout.md` — l'écran, le cycle de tap et l'envoi de lot doivent exister.
