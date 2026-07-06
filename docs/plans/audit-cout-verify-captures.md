# Audit — coût en temps et en tokens de `npm run verify` (captures)

Date : 2026-07-06. Question : la génération + l'analyse des captures ralentit-elle
réellement le développement, et où part le coût ?

## Méthodologie et réserves

- Mesures prises dans un conteneur cloud (session Claude Code distante), pas sur
  la machine de Jeremy : CPU différent, et surtout **Web Awesome servi depuis
  `node_modules` par interception** (le CDN `ka-f.webawesome.com` est bloqué par
  la politique réseau du conteneur). Les temps réseau sont donc des
  **bornes basses** — en conditions réelles chaque capture re-télécharge le CDN.
- Runner instrumenté : copie jetable de `tools/screenshots.mjs` chronométrant
  chaque phase de chaque capture. 86/100 captures mesurées ; 14 scénarios
  interactifs ont échoué à cause du contournement CDN (artefact du conteneur,
  exclus des statistiques, extrapolés au prorata).
- Tokens vision : règle Claude — image réduite pour tenir dans 1568 px de côté
  long et ~1,15 Mpx, puis ~1 token / 750 px². Dimensions lues sur la baseline
  committée (100 PNG, 23 Mo, 122,7 Mpx bruts).

## Constat 1 — le temps : ~3 à 5 minutes par `verify`, dont 95 %+ pour les captures

`copie-grille` (0,2 s) et les tests (0,7 s) sont négligeables. Le run de
captures mesuré : **~1,4 s par capture, séquentiel**, soit pour 100 captures :

| Poste | Par capture | Par run (100) | Part |
|---|---|---|---|
| `waitForTimeout(600)` fixe | 601 ms | **60 s** | 44 % |
| Attentes (sélecteurs, `:defined`, fonts, icônes) | 342 ms | 34 s | 25 % |
| `goto` (chargement page) | 208 ms | 21 s | 15 % |
| Écriture PNG (`screenshot`) | 143 ms | 14 s | 10 % |
| Ouverture/fermeture de page | 79 ms | 8 s | 6 % |
| **Sous-total captures** | **1,37 s** | **~137 s** | |
| Diff vs baseline (pire cas : octets ≠) | 193 ms | ~19 s | |
| Démarrage serveur + navigateur | | ~1 s | |
| **Total mesuré (borne basse)** | | **~2 min 40 s** | |

Deux amplificateurs en conditions réelles :

1. **Zéro cache entre captures.** `navigateur.newPage()` crée un contexte neuf
   à chaque capture : `webawesome.css`, le loader, ses chunks, les icônes et
   Google Fonts sont re-téléchargés **100 fois par run**. Sur un réseau réel
   cela ajoute facilement 0,5 à 2 s par capture → **3 à 5 min par `verify`**.
2. Un scénario qui échoue brûle son timeout complet (15–30 s) avant de tomber.

## Constat 2 — les tokens : le delta-only (décision 0017) est le bon levier, déjà en place

| Scénario de revue | Coût vision estimé |
|---|---|
| Baseline complète (100 captures) | **~98 500 tokens** (desktop moy. 1 478, mobile moy. 491) |
| 1 capture desktop modifiée (après + avant + différence) | ~4 400 tokens |
| 1 capture mobile modifiée (idem) | ~1 500 tokens |
| Revue delta typique (5 captures + prompt/raisonnement subagent) | ~25–35 k tokens |

La décision 0017 évite donc une facture ~10× plus élevée à chaque revue — elle
tient. Le vrai problème token n'est pas la quantité mais la **qualité** :

- **62 captures sur 100 dépassent 1568 px** et sont réduites avant d'atteindre
  le modèle ; 14 tombent sous 50 % d'échelle. Les pages mobiles très hautes
  (`structures-edition--mobile` : 390×6178) arrivent à **25 % de leur taille** —
  le texte est illisible. On paie ~200–1500 tokens pour une image dont le
  reviewer ne peut pas juger la typographie ni les détails : la revue de ces
  captures-là est en partie du théâtre, sauf zoom `sips` manuel.
- La sortie texte du runner (~100 lignes ✓ + synthèse) coûte ~1 k tokens par
  run — négligeable.

## Constat 3 — fragilités qui coûtent du temps d'agent

- **Tolérance zéro pixel** (`PIXELS_TOLERES = 0`) : le moindre bruit
  d'antialiasing marque une capture « modifiée » → revue + re-commit de PNG.
  La baseline est de fait liée à une machine de rendu précise.
- **Dépendance CDN dans le runner** : le run de captures n'est pas hermétique.
  Preuve par l'absurde : il est impossible à exécuter tel quel dans un
  conteneur dont la politique réseau bloque `ka-f.webawesome.com`, alors que
  `@awesome.me/webawesome` est déjà dans `package.json` (avec un dossier
  `dist-cdn/` prévu exactement pour ça).

## Recommandations, par gain décroissant

1. **Paralléliser les captures** (4–6 pages concurrentes sur le même
   navigateur). Les scénarios sont déclaratifs et indépendants ; seul l'ordre
   d'écriture des PNG importe. Gain : wall time ÷ 4–5.
2. **Réduire ou supprimer le `waitForTimeout(600)`**. Le runner attend déjà le
   sélecteur d'état, `:defined`, `document.fonts.ready` et le SVG de chaque
   icône visible — la pause fixe est une ceinture-bretelles qui coûte 60 s de
   sommeil par run. À 150 ms : −45 s. À valider en surveillant le retour du
   flakiness (c'est probablement pour ça qu'elle existe).
3. **Servir Web Awesome et les fonts localement pendant les runs** (interception
   Playwright → `node_modules/@awesome.me/webawesome/dist-cdn/`, fonts en
   `data:` ou fichiers committés). Élimine 100 re-téléchargements CDN par run,
   rend le run hermétique et déterministe (moins de deltas parasites), et
   permet de l'exécuter dans n'importe quel environnement. Alternative
   minimale : réutiliser un seul `BrowserContext` pour partager le cache HTTP.
4. **Rendre lisible ce qu'on fait relire** : pour les captures réduites sous
   ~60 % (les fullPage hautes), fournir au subagent des tuiles/crops à
   l'échelle 1:1 en plus (ou à la place) du fullPage réduit. Même ordre de
   coût token, mais la revue redevient réelle.
5. **Statuer sur la tolérance pixel** si les deltas parasites se multiplient
   (quelques pixels d'antialiasing) : un seuil de quelques dizaines de pixels
   réellement différents éviterait des cycles revue + commit inutiles.

Impact combiné estimé de 1+2+3 : **`npm run verify` complet en ~30–45 s** au
lieu de 3–5 min, sans toucher au contrat (baseline git, delta-only, console
propre).

## Ce qui va déjà bien (à ne pas casser)

- `verify` = grille + tests + captures en une commande allowlistée : bon gate.
- `--page` pour la boucle interne : 2–14 captures au lieu de 100.
- Delta-only (0017) : économie ~10× sur chaque revue visuelle.
- Ramener les octets à la baseline quand le diff est nul : git reste propre.
