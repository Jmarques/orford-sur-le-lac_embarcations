# PRD — Tournée en plein écran épuré (refonte de présentation)

Status: ready-for-agent
Décisions cadres : **0021** (plein écran épuré, retour liste, cellule « Élévation »), 0013 (tournée — cœur inchangé : observation explicite, fantôme + un tap, jamais par inaction, envoi par lot), 0016 (interfaces silencieuses ; instruction de tournée = ancre + popover), 0015 (esthétique lac, `eau.js`), 0006/0017 (captures mockées multi-états = seam de vérification), 0008 (auth), 0004 (Web Awesome, tokens `--wa-*`).
Vocabulaire : CONTEXT.md — [[Tournée]], [[Occupation observée]], [[Structure]], [[Emplacement]].
Prototype de référence : `tmp/prototype-cellule-tournee.html` (schéma « Élévation » retenu ; jetable, à supprimer à la livraison).

## Problème

L'écran « Faire la tournée » existe et fonctionne (0013), mais sa présentation combat le geste terrain. La tournée est **toujours** au téléphone, à bout de bras, devant une structure : or l'écran hérite du header animé (bande-lac) qui, en paysage (~375 px de haut), ne laisse presque rien à la grille — alors que le paysage est justement ce qui ferait voir le plus de cases sur ces longues bandes horizontales. Trois frictions concrètes :

- **Cases ambiguës** : « libre relevé » (crème) et « non observé » (crème) se distinguent à peine — or la lecture n°1 d'une tournée est « qu'ai-je déjà couvert ? ».
- **La grille saute sous le doigt** : ajouter le ✓ élargit la case, la puce « a changé » ajoute une rangée et fait grandir toute la ligne.
- **Un ordre imposé** : le résumé puis « Structure suivante → » forcent un enchaînement logique, alors que sur le terrain on choisit la prochaine structure *à l'œil*, en se déplaçant vers celle d'à côté.

## Solution

Faire de la tournée un **recouvrement plein écran épuré** dédié au geste terrain. Le header animé disparaît ; il reste une **barre haut fine** (sortie · nom de structure · compteur · aide · rotation) et une **barre bas** avec « Terminer la tournée » à portée de pouce. L'instruction lourde se réduit à une **ancre d'une ligne** dont un « … » ouvre la mécanique en **popover flottant**. Les cases adoptent l'encodage **« Élévation »** à **empreinte fixe** : pas-fait = puits creux pointillé qui recule, fait = carte pleine surélevée (occupé rempli / libre carte claire) — rien ne bouge au tap. « Terminer » envoie le lot et **referme le recouvrement** : retour direct à la liste, qui **défile et se cale sur la carte relevée**, laquelle porte une **confirmation persistante libellée**. Plus de résumé, plus de « Structure suivante ». Le paysage reste un bonus récompensé, jamais forcé.

## User stories

1. En tant que membre du comité devant une structure (mobile), je veux que la tournée occupe tout l'écran sans le header animé, pour que la grille et mes actions tiennent même en paysage où la hauteur est minuscule.
2. En tant que membre du comité, je veux tourner physiquement mon téléphone en paysage et voir aussitôt plus de cases, pour parcourir une longue structure avec moins de défilement.
3. En tant que membre du comité tenant mon téléphone en portrait, je veux que la tournée reste parfaitement utilisable, pour n'être jamais bloqué si je ne tourne pas l'écran.
4. En tant que membre du comité qui ne pense pas à tourner l'écran, je veux un indice de rotation discret (petit icône, texte au tap), pour découvrir le bonus paysage sans être harcelé.
5. En tant que membre du comité, je veux distinguer d'un coup d'œil les cases déjà relevées des cases à faire, pour savoir « combien me reste-t-il » sans compter.
6. En tant que membre du comité, je veux que « libre relevé » soit nettement différent de « non observé », pour ne pas confondre une place vide confirmée avec une place jamais regardée.
7. En tant que membre du comité, je veux que la case ne change ni de taille ni de position quand je la tape, pour ne pas perdre le fil ni taper à côté sur une grille dense.
8. En tant que membre du comité, je veux voir dans chaque case le dernier état connu en fantôme, pour confirmer d'un tap les ~80 % de cas inchangés.
9. En tant que membre du comité, je veux qu'un premier tap confirme l'état vu, un deuxième le bascule, un troisième l'annule, pour corriger un tap accidentel sans laisser de fausse observation.
10. En tant que membre du comité (public aîné), je veux une instruction courte toujours visible (« touchez ce que vous voyez ; ce que vous ne touchez pas ne change pas »), pour être rassuré sans pavé de texte.
11. En tant que membre du comité qui a oublié la mécanique, je veux ouvrir le détail du geste dans un popover via « … » ou un « ? », pour retrouver le cycle de tap sans qu'il encombre l'écran en permanence.
12. En tant que membre du comité, je veux un compteur « relevés / total » toujours visible en haut, pour suivre ma progression pendant tout le défilement.
13. En tant que membre du comité, je veux que « Terminer la tournée » soit épinglé en bas, pleine largeur, à portée de pouce, pour l'atteindre sans le chercher et sans le toucher par erreur.
14. En tant que membre du comité, je veux que « Terminer » soit inactif tant que je n'ai rien relevé, pour ne pas envoyer un lot vide.
15. En tant que membre du comité, je veux qu'un ✕ de sortie me demande confirmation seulement s'il me reste des relevés non envoyés, pour ne jamais perdre une demi-tournée d'un effleurement — mais sans friction quand il n'y a rien à perdre.
16. En tant que membre du comité, je veux qu'à la fin la tournée se referme et me ramène directement à la liste des structures, pour choisir à l'œil la prochaine structure vers laquelle je me déplace.
17. En tant que membre du comité de retour à la liste, je veux que la page se cale sur la carte que je viens de relever, pour ne pas perdre ma place ni la chercher.
18. En tant que membre du comité, je veux que cette carte porte une confirmation persistante et libellée (« Tournée enregistrée · 16 relevés, 2 changements »), pour repartir avec l'essentiel sans écran de résumé séparé.
19. En tant que membre du comité, je veux que les changements se lisent déjà dans la grille de la carte (couleurs à jour), pour constater l'effet de ma tournée sans liste redondante.
20. En tant que membre du comité, je veux que l'envoi échoué (réseau de plage) me laisse mes taps et me propose de réessayer sans quitter le plein écran, pour ne pas refaire le relevé.
21. En tant que membre du comité, je veux que la tournée exige le mot de passe du comité comme le reste de l'app, pour que personne d'autre n'écrive d'observations.
22. En tant que membre du comité soucieux de ma batterie sur le terrain, je veux que l'animation de l'eau se mette en pause pendant la tournée, pour ne pas gaspiller le téléphone sur une animation que je ne vois pas.

## Décisions d'implémentation

- **Recouvrement CSS, pas d'API Fullscreen** — quand la tournée est active, sa section passe en `position: fixed; inset: 0` et masque le header animé ; la barre du navigateur reste (l'API Fullscreen est indisponible sur iPhone, cf. 0021). Réutilise l'auth et le câblage existants ; « fermer » restaure la liste.
- **Cadre à deux barres fines** — haut : sortie (✕) · nom de structure · pastille compteur (libellée, 0016) · aide (`?`/« … ») · icône rotation discret. Bas, épinglée : « Terminer la tournée » pleine largeur, désactivée à 0 relevé. Grille défilable au milieu.
- **Aide = ancre + popover** (amende 0016) — une ligne toujours visible porte le rassurant (« ce qu'on ne touche pas ne change pas ») ; le « … »/« ? » ouvre un **popover flottant** (par-dessus la grille, sans reflow) portant la mécanique : cycle de tap dont le **3ᵉ tap = annulation** (conservé).
- **Cellule « Élévation », empreinte fixe** — chaque case a une taille constante ; le ✓ occupe un coin réservé même invisible. Pas-fait = fond creux/recessé + bordure pointillée + fantôme estompé (icône faible) ; fait = carte pleine surélevée + ✓ + mot en gras : occupé = remplissage `brand-fill-loud`, libre = carte claire à bordure `brand-border-loud`. Glyphe « libre » = cercle **contour** (place vide), occupé = embarcation. Le mot d'état et l'icône restent toujours présents (couleur jamais seule, 0016).
- **« a changé » sort de la cellule vivante** — plus de puce ajoutée pendant le relevé (source de reflow) ; l'information « changements » vit dans la confirmation de la carte après la tournée. `aChangeTournee` reste utilisé pour le compte de changements de la confirmation.
- **Fin de tournée repensée** — l'écran résumé (`etat-resume`) et l'enchaînement « Structure suivante → » sont **retirés**. « Terminer » envoie le lot, referme le recouvrement, revient à la liste. La fonction pure `structureSuivante` devient morte : **supprimée** (avec son test et son export). `resumeDeTournee` est réutilisée pour produire le bilan (compte relevés + changements) affiché sur la carte.
- **Confirmation dans le contexte de la carte** — au retour, la liste défile + met le focus sur la carte relevée ; cette carte porte un callout succès **persistant et libellé** (« Tournée enregistrée · N relevés, M changements ») jusqu'à la prochaine action. La bannière succès **globale** (`#message-succes`) n'est plus utilisée pour la tournée. Les statuts de la grille de la carte sont recalculés avec les observations fraîches.
- **Garde-fou de sortie** — ✕ / « Retour à la liste » demande confirmation uniquement s'il existe des relevés non envoyés (« N relevés non enregistrés. Quitter sans enregistrer ? ») ; sinon ferme sans friction.
- **Paysage non forcé** — aucune tentative de verrouillage d'orientation (impossible sur iPhone) ; la grille défile horizontalement dans les deux orientations ; l'indice de défilement existant peut porter aussi l'invitation à tourner.
- **Pause de l'eau** — l'animation `eau.js` du header est suspendue tant que le recouvrement est actif, reprise à la fermeture.
- **Boutons en `size="m"` max** — les boutons de la tournée passent de `l` à `m` (préférence durable ; l'appliquer partout dans l'admin est un balayage séparé, hors périmètre).
- **Copy** — « Faire la tournée », « Terminer la tournée », « Tournée enregistrée » (glossaire ; jamais « Inspection », « Relever »…).

## Décisions de test

- **Tester le comportement externe seulement.** La logique pure de tournée (cycle de tap, compte, « a changé », lot) est déjà couverte (prior art `tests/grille.test.mjs`) et **ne change quasiment pas** : seul `structureSuivante` disparaît → retirer sa fonction, son export et ses cas de test ; vérifier que `resumeDeTournee`/`aChangeTournee` restent testés (ils portent désormais le bilan de la carte).
- **Aucun nouveau comportement serveur** — l'action d'envoi par lot est inchangée ; pas de nouveau test backend.
- **L'essentiel de la refonte est visuel → seam de captures mockées** (0006/0017). Ajouter/mettre à jour les scénarios `tools/captures.mjs` pour couvrir les états, desktop **et** mobile : recouvrement vierge (rien relevé, « Terminer » inactif), en cours (mélange pas-fait/relevé occupé/relevé libre au nouvel encodage), popover d'aide ouvert, garde-fou de sortie (dialogue de confirmation), erreur d'envoi + réessai, et **la liste au retour** avec la carte relevée focalisée + sa confirmation persistante. Console error/warning + pageerror font échouer la boucle (convention existante).
- **Vérification finale** : `npm run verify` (copie-grille + tests + captures) ; revue visuelle sur le **delta** vs baseline seulement (0017), par un subagent en lecture seule sur les artefacts `screenshots/.diff/` — jugée « fait/pas-fait lisible d'un coup d'œil, zéro reflow, non-générique ». Flux complet piloté au navigateur (portrait **et** paysage) avant livraison.

## Exigence → tranche

| # | Exigence | Tranche |
| --- | --- | --- |
| 1 | Cellule « Élévation » à empreinte fixe (fait/pas-fait dominant, occupé/libre affirmé, glyphe libre contour) + retrait de la puce « a changé » de la cellule vivante | T1 |
| 2 | Recouvrement plein écran épuré : `fixed inset:0`, header masqué, barre haut (sortie · nom · compteur · aide · rotation), barre bas « Terminer » (inactif à 0 relevé), pause `eau.js`, boutons `m` | T2 |
| 3 | Aide ancre-d'une-ligne + popover flottant (mécanique, 3ᵉ tap) ; garde-fou de sortie conditionnel | T2 |
| 4 | Fin repensée : retrait résumé + « Structure suivante » (+ suppression `structureSuivante`), retour liste, focus + confirmation persistante libellée sur la carte relevée | T3 |

Rien d'invisible : l'écran existe déjà avec son contrat de données complet (le lot). T1 est visible et autonome (encodage de case), T2 la met en plein écran, T3 refond la fin. Chaque tranche est vérifiable seule par captures.

## Hors périmètre

- **Forcer / verrouiller le paysage** — impossible sur le web iPhone (0021) ; on conçoit pour récompenser la rotation, pas l'imposer.
- **Masquer la barre du navigateur / PWA installée** — autre projet (0021, Revisit).
- **Balayage « boutons ≤ `m` » sur tout l'admin** — préférence durable, appliquée ici mais généralisée dans une manche séparée.
- **Pré-remplissage photo + LLM** — écarté (0013).
- **Envoi progressif ou hors-ligne** — Revisit 0013 si le réseau de plage pose problème.
- Toute modification de l'action serveur d'envoi par lot ou du modèle de données.

## Notes

- La tournée reste le **producteur de données** d'« À traiter » : ne pas affaiblir « jamais d'observation par inaction » ni le 3ᵉ tap (annulation) pour gagner des taps — un tap accidentel non annulable devient une fausse observation.
- UX/UI obligatoire (CLAUDE.md) : design brief + `principles.md`/`composition.md` du skill webawesome-design + `docs/design.md` **avant markup** ; polish checklist + revue ui-critic sur captures fraîches **après**. Le schéma « Élévation » est figé par le prototype ; retouche connue : glyphe « libre » en cercle-contour, pas le disque plein.
- Supprimer `tmp/prototype-cellule-tournee.html` et `tmp/shot-prototype.mjs` une fois T1 livrée.
