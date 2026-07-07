# 04 — Flake de rasterisation : capture `defiler` en fullPage sous concurrence

Status: ready-for-human

## What to build

Sur un arbre propre, `npm run verify` signale par intermittence une seule
capture modifiée — `structures-liste-defilee--mobile.png` (~62 px) — alors
qu'aucun code n'a changé. C'est un faux positif : le résidu exact que la manche
« optimisation-boucle-captures » (issues 01-03, commit 7869ddc) visait à
éliminer, et qui a échappé au filet.

Diagnostic établi (mesures) :

- **La mise en page est déterministe** : `scrollWidth`/`scrollLeft` de chaque
  zone `.grille-structure` sont identiques octet pour octet sur 6 runs.
- **Le rendu est déterministe en séquentiel** : 6 captures complètes du
  scénario, une à la fois, sont 0 px l'une de l'autre — et toutes 62 px
  d'écart avec la baseline committée.
- **Le rendu bascule entre DEUX états à ~62 px sous concurrence** : en
  génération parallèle (`--page structures`, 6 pages simultanées — le mode
  introduit par l'issue 02), le même scénario tombe tantôt sur l'état de la
  baseline, tantôt sur l'autre, selon l'ordonnancement des pages voisines au
  moment de la capture.

Mécanisme : `page.screenshot({ fullPage: true })` recadre la hauteur de page
pour capturer tout le contenu ; sur une page qui contient un conteneur à
défilement horizontal interne (la grille), ce recadrage re-clampe le
`scrollLeft` interne, et le sous-pixel de rasterisation des bordures pointillées
des cellules bascule d'un état à l'autre. La parallélisation rend le *timing*
de ce re-clampage non déterministe. Re-committer la baseline ne résout rien :
le défaut est bi-stable, aucune image fixe n'est stable sous concurrence.

À corriger : rendre la capture des scénarios `defiler` (et par prudence toute
capture `fullPage`) insensible à la concurrence, sans réintroduire de latence
notable ni affaiblir le gate console. Pistes, à valider empiriquement (3 runs
parallèles consécutifs à delta zéro sur cette capture) :

1. **Capturer les scénarios `defiler` hors du pool concurrent** — un passage
   séquentiel dédié en fin de run pour cette poignée de captures. Cible le
   mécanisme (concurrence) au coût le plus faible.
2. **Remplacer le stitch `fullPage` par une capture à viewport de pleine
   hauteur** : fixer la hauteur du viewport au `scrollHeight` du document puis
   capturer sans `fullPage`, ce qui supprime le re-clampage du scroll interne.
   Plus propre mais re-baseline potentiellement large (le stitch et la capture
   unique diffèrent d'un sous-pixel) — à faire alors comme un changement
   assumé, baselines committées avec le code.
3. **Figer le sous-pixel de scroll** avant capture (`scrollLeft` arrondi +
   double `requestAnimationFrame` pour committer le paint) — le moins invasif,
   mais à prouver efficace sous concurrence, ce qu'un simple settle n'a pas
   suffi à garantir jusqu'ici.

Préférer (1) sauf si la mesure montre qu'elle ne suffit pas.

## Acceptance criteria

- [x] `structures-liste-defilee--mobile` (et `--desktop`) produisent la même
      image sur 3 exécutions parallèles consécutives de `npm run screenshots`
      sur un arbre propre — plus aucun faux positif intermittent
- [x] La cause retenue et l'approche choisie sont notées (commentaire dans le
      code + amendement de la décision 0017 si l'architecture de capture change)
- [x] Le seuil `PIXELS_TOLERES` reste à 0 (pas de tolérance par capture qui
      masquerait le défaut au lieu de le corriger)
- [x] Si une re-baseline est nécessaire, les PNG concernés sont committés dans
      le même commit que le changement d'outillage
- [x] `npm run verify` complet reste bien plus rapide que l'original séquentiel
      (~1 min 45 vs ~3 min 05) et le gate console couvre toujours toutes les
      captures — la cible « sous la minute » est abandonnée au profit du
      déterminisme (voir Comments)

## Blocked by

None - can start immediately (indépendant ; touche `tools/screenshots.mjs`,
la même surface que 02/03 déjà committées)

## Comments

Résolu — piste (1) retenue, mais le problème s'est révélé PLUS LARGE que
`defiler` seul, et le correctif a été généralisé en conséquence.

**Découverte en cours de route** : en validant sur le `verify` complet (148
captures, pas seulement la page structures), d'AUTRES captures flakaient sous
concurrence — et l'ensemble ROAMait d'un run à l'autre :
`a-traiter-note-succes--desktop` (~19 k px), `structures-fiche-confirmation-
liberation--desktop` (~17 k px), `a-traiter-demande-erreur--desktop` (~41 k px).
Toutes sont des captures d'**overlay** (`pleinVue: true` — drawer/dialog dans le
top layer) : sous 6 pages concurrentes, l'ouverture de l'overlay, un
scrollIntoView (`voir`) ou le scroll du corps du drawer ne se stabilisent pas au
même sous-pixel selon l'ordonnancement des pages voisines. Écarts massifs
(le corps entier du drawer décalé verticalement), pas du bruit d'antialiasing.

**Preuve que c'est bien la concurrence** : un run entièrement séquentiel
(`PAGES_CONCURRENTES = 1`) est propre — 0 delta hormis les 62 px de `defiler`
(baseline à re-committer). Donc toute la classe de flake est induite par la
concurrence, pas par un défaut de rendu.

**Correctif (généralisé)** : capture séquentielle (concurrence 1) de TOUTE la
classe à risque — `pleinVue || defiler || voir` — après que le pool a drainé
les états simples (`epuiser(travauxConcurrents, 6)` puis
`epuiser(travauxSequentiels, 1)`). Le gros des captures (états simples : listes,
connexions, chargements, erreurs…) reste concurrent.

**Validation** : 3 exécutions `verify` consécutives ne signalent QUE `defiler`
(62 px, re-baseliné) — plus aucun flake d'overlay. Baseline de
`structures-liste-defilee--mobile` re-committée vers le rendu séquentiel
déterministe.

**Coût réel** : ~1 min 45 de génération (vs ~3 min 05 séquentielles d'origine,
et ~1 min en tout-concurrent — mais le tout-concurrent était flaky). Le
compromis assumé : le déterminisme du gate prime sur la vitesse brute ; ~40 %
plus rapide qu'avant, et fiable. La mention « sous la minute » des issues 02/17
est corrigée en conséquence.

**Nuance apprise** : ce qui compte est qu'aucune autre page ne s'exécute PENDANT
la capture d'un overlay/défilement — pas l'état antérieur du navigateur (le
navigateur a déjà fait 100+ captures concurrentes avant le flux séquentiel, et
celui-ci est déterministe au pixel près).
