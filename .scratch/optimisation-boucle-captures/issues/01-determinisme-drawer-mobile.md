# 01 — Éliminer les faux positifs du diff visuel (drawer mobile)

Status: ready-for-human

## What to build

Sur un arbre git propre, `npm run screenshots` signale deux captures modifiées alors
qu'aucun code n'a changé : `a-traiter-fiche--mobile` (302 px) et
`a-traiter-fiche-a-identifier--mobile` (3206 px). Le diff montre un décalage
d'antialiasing/rendu du texte sur tout le contenu du drawer mobile — l'état capturé
n'est pas complètement stabilisé malgré `reducedMotion` et l'attente
`document.fonts.ready`.

Diagnostiquer la source du bruit (stabilisation du drawer après ouverture, timing de
rendu des fontes dans le shadow DOM, sous-pixel du positionnement) et durcir la
génération pour que le delta soit zéro quand rien n'a changé. C'est le déclencheur
« Revisit when » de la décision 0017 : durcir le déterminisme d'abord, ne monter le
seuil pixelmatch qu'en dernier recours documenté.

Chaque faux positif coûte une revue visuelle inutile et érode la confiance dans le
delta — le jour où « on sait que ça bruite », plus personne ne regarde le diff.

## Acceptance criteria

- [x] Trois exécutions consécutives de `npm run screenshots` sur un arbre propre affichent « Aucune différence visuelle avec la baseline committée »
- [x] La cause du bruit est identifiée et notée (commentaire dans le code ou amendement de la décision 0017), pas seulement masquée
- [x] Le seuil `PIXELS_TOLERES` reste à 0 (ou toute augmentation est justifiée par écrit dans la décision 0017)
- [x] Si la baseline des deux captures fautives doit être re-committée après correction, les PNG sont dans le même commit

## Blocked by

None - can start immediately

## Comments

Diagnostic (implémentation) — trois causes distinctes de non-déterminisme trouvées,
toutes des races entre l'état final de la page et le moment de la capture :

1. **`:hover` fantôme** : après le clic qui ouvre la fiche, Chromium applique (ou
   non, selon le timing) `:hover` à l'élément apparu sous le curseur — le lien
   courriel basculait entre soulignement pointillé (repos) et plein (survol).
   Correctif : curseur garé en (0,0) avant la capture. (302 px sur
   `a-traiter-fiche--mobile` ; la baseline était l'état « survolé ».)
2. **Gras synthétique** : `document.fonts.ready` peut être déjà résolue quand une
   graisse vue pour la première fois dans le drawer (la 600 du journal) commence
   seulement à charger depuis le CDN — capture en gras synthétique au lieu de la
   vraie face. Correctif : attendre `document.fonts.status === 'loaded'`.
   (137 px sur la date « 5 juin 2026 ».)
3. **Queue de re-rendu** : le callout de statut de la fiche se vide puis se
   re-remplit au rechargement d'inventaire (`reponsesApres`) — la baseline de
   `a-traiter-note-succes--desktop` avait capturé l'état VIDE (callout écrasé).
   Correctif : attendre la fin de toute animation finie ; les attentes ajoutées
   déplacent la capture après le re-rendu. La baseline corrigée (callout plein)
   est committée avec ce changement.

Le flake initial de `a-traiter-fiche-a-identifier--mobile` (3206 px, antialiasing
pleine page) n'a pas pu être reproduit isolément ; piste la plus probable : même
famille que (2)/(3), sous charge. Les 3 runs complets consécutifs à delta zéro
sont le juge de paix.

Diagnostic complété pendant la parallélisation (issue 02), qui a amplifié les
races et révélé le fond du problème :

4. **Latence CDN** : icônes, fontes et webawesome.css viennent du réseau à
   chaque run — sous charge, un SVG d'icône arrivait après la capture (icône
   absente), une graisse après le rendu (gras synthétique), des métriques de
   repli décalaient les retours à la ligne. Correctif : cache disque des
   réponses CDN (`tools/.cache-cdn/`, gitignoré, écriture atomique), rempli au
   premier run, rejoué ensuite — plus aucune dépendance réseau en régime
   permanent. En complément : préchargement de toutes les faces déclarées
   (`document.fonts…load()`) avant les interactions.
5. **Bande WebGL peinte trop tôt** : en `prefers-reduced-motion`, `eau.js`
   peignait UNE frame — parfois avant que la mise en page se stabilise, et le
   canvas restait étiré (c'était aussi un bug réel : rotation d'écran = bande
   déformée). Correctif dans `eau.js` : la frame fixe est repeinte (même
   temps, mêmes pixels) à chaque changement de taille via ResizeObserver.
   Conséquence : 33 captures re-committées — leur baseline contenait la frame
   étirée.
6. **Scroll du drawer** : les captures « après geste » (note ajoutée…)
   montrent le corps du drawer défilé (focus dans le champ) — état légitime et
   désormais déterministe ; la bimodalité historique venait de là, pas d'un
   bug du callout. Au passage, `fiche.js` ne re-pose plus un attribut identique
   (re-rendu shadow inutile et flash visible sur API lente).

Vérifications finales : delta identique (37 captures, mêmes comptes de pixels)
sur 4 runs complets parallèles consécutifs avant commit ; après commit de la
nouvelle baseline, 3 runs consécutifs à delta zéro (voir commit).
