# 03 — Revue visuelle sur crops bbox, plus jamais sur pleines pages illisibles

Status: ready-for-agent

## What to build

La revue visuelle du delta lit aujourd'hui des captures pleine page : jusqu'à
390×5213 px en mobile. L'API vision réduit toute image à ~1568 px de grand côté —
une telle capture arrive au modèle en ~117×1568, le texte est physiquement
illisible. Le subagent de revue (Read/Glob/Grep, sans shell) ne peut pas zoomer :
une partie des tokens de revue achète une silhouette de page, pas une revue
critique. Coût actuel estimé : ~1,5–4,5k tokens par capture modifiée (3 images
pleine page), 50–150k tokens pour un delta de feature typique (16–77 PNG).

Changer le format des artefacts de revue dans `screenshots/.diff/` :

- **Capture modifiée** : calculer le rectangle englobant des pixels différents (le
  masque pixelmatch existe déjà), l'élargir d'environ 100 px de contexte, et écrire
  des **crops** avant/après/différence au lieu des pleines pages. Plusieurs zones
  disjointes et éloignées peuvent produire plusieurs crops. Une bbox couvrant
  presque toute la page (refonte globale) retombe sur la pleine page — pas de crop
  dégénéré.
- **Capture nouvelle** (sans baseline) : écrire dans `.diff/` des tuiles d'au plus
  ~1500 px de haut pour que chaque tuile reste lisible après downscale.
- Le rapport en fin de run liste les artefacts produits par capture, pour que le
  prompt du subagent de revue pointe directement dessus.
- Les captures pleine page de `screenshots/` restent la baseline committée — seuls
  les artefacts de revue changent.

Gain attendu : ~10–20× moins de tokens par capture modifiée, et une revue qui voit
enfin le texte qu'elle est censée critiquer.

## Acceptance criteria

- [ ] Une capture modifiée produit des crops avant/après/différence centrés sur la zone changée, avec ~100 px de contexte, jamais plus grands que la page
- [ ] Une capture nouvelle produit des tuiles d'au plus ~1500 px de haut dans `.diff/`
- [ ] Le rapport console liste les artefacts par capture (chemins lisibles par un subagent sans shell)
- [ ] Le texte d'un crop mobile est lisible une fois l'image réduite à 1568 px de grand côté (vérifier sur un cas réel, ex. le diff du drawer de l'issue 01)
- [ ] La baseline committée `screenshots/*.png` reste en pleine page, inchangée par cette issue

## Blocked by

None - can start immediately (friction de merge mineure avec 02 sur les mêmes fichiers d'outillage — se coordonner sur l'ordre si les deux partent en parallèle)
