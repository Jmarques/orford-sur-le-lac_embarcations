# 02 — Paralléliser la génération des captures

Status: done

## What to build

`npm run screenshots` génère les 114 captures séquentiellement en ~3 min 05
(~1,6 s/capture, dont 600 ms d'attente fixe chacune). La croissance est d'environ
+10 à +16 captures par feature : le temps de la boucle `verify` grandit linéairement
avec le site.

Paralléliser la génération : une file de scénarios consommée par plusieurs pages
Playwright concurrentes (~6 workers) sur un seul navigateur et un seul serveur HTTP.
Le reste du pipeline ne change pas :

- l'attribution des problèmes console/pageerror reste par scénario+viewport (elle
  est déjà scoped à la page, la concurrence ne la casse pas) ;
- la comparaison à la baseline et le rapport de delta restent identiques ;
- les modes `--live` et `--page <nom>` continuent de fonctionner ;
- l'échec bruyant si le serveur meurt en cours de run est conservé.

Cible : run complet sous la minute sur la machine de dev actuelle.

## Acceptance criteria

- [ ] `npm run screenshots` complet passe de ~3 min à moins de 1 min
- [ ] Sur un arbre propre, le run parallèle affiche « Aucune différence visuelle avec la baseline committée » (mêmes octets que le run séquentiel)
- [ ] Une erreur console injectée dans un scénario est toujours attribuée au bon scénario et fait échouer le run
- [ ] `npm run screenshots -- --page structures` et `-- --live` fonctionnent comme avant
- [ ] Le nombre de workers est une constante nommée dans le code, pas un nombre magique dispersé

## Blocked by

- 01 (le critère « delta zéro vs baseline » n'est vérifiable que sans les faux positifs connus)
