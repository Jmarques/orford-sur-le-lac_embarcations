# 0013 — Tournée : écran dédié par structure, observation explicite (fantôme + un tap), jamais par inaction

Date: 2026-07-05
Status: Accepted

## Context
Les tournées n'existent pas aujourd'hui faute d'outil : relever une structure via le flux unitaire (tap → panneau → envoi → rechargement complet) est inutilisable en série, et un tableur séquentiel ne ressemble pas à ce qu'on a devant les yeux. Trois scénarios réels la justifient : saisie initiale, relevés de début/fin de saison, et confirmation périodique des « Attribué, libre » (une embarcation peut n'être absente que temporairement). Dans ~80 % des cas l'occupation n'a pas changé depuis le dernier relevé — le dernier état observé est donc un contexte précieux pour la vitesse. Le Journal append-only (0002, 0011) alimente « libre depuis » et les futures décisions de réattribution : une fausse observation ici devient une relance injustifiée à un membre plus tard.

## Decision
La tournée est un **écran dédié par structure** : un bouton « Faire la tournée » sur chaque carte de `structures.html` ouvre un écran limité à cette structure — pas de mode qui change le comportement de la grille existante. Chaque cellule montre le numéro et le dernier état observé **en fantôme** ; **un tap confirme ce qu'on voit** (second tap bascule occupé/libre), un marqueur visible signale ce qui a changé, un compteur affiche « relevés / total ». **Aucune observation n'est écrite par inaction** : les cellules non touchées gardent leur ancienne observation et sa date. « Terminer la tournée » envoie le lot de la structure, affiche le résumé des changements, puis propose « Structure suivante → » pour enchaîner.

## Alternatives rejected
- **Diff mode** (terminer = confirmer tout ce qui n'a pas été tapé) — rubber-stamping : l'inaction écrirait des observations datées d'aujourd'hui pour des emplacements que personne n'a regardés, corrompant « libre depuis » ; doublement risqué avec un public aîné.
- **Mode tournée sur `structures.html`** — même écran, deux comportements selon un état invisible (*mode error*) ; T-B avait déjà écarté les modes sur cette grille.
- **Tournée multi-structures d'un coup** — l'unité physique de travail est la structure (on se déplace entre elles) ; l'enchaînement « Structure suivante → » couvre le scénario « toutes les structures » sans imposer une portée à l'avance.
- **Occupation par photo + LLM** — premiers tests de Jeremy : trop d'erreurs et d'incertitude. Piste écartée pour l'instant.
- **Âge de la dernière observation affiché dans chaque cellule** — surcharge l'UI à ~180 emplacements ; l'âge reste visible dans le panneau unitaire.

## Trade-offs accepted
- Un tap par emplacement regardé, même inchangé — le prix de « chaque observation = un geste conscient » ; devant 16 places, moins d'une minute.
- Un écran de plus à construire et à maintenir (il réutilise le rendu de `grille.js`, mais avec son propre encodage visuel : occupé/libre fantôme/confirmé, pas les 5 statuts).
- Envoi par lot en fin de structure : une tournée interrompue avant « Terminer » perd les taps de la structure en cours (lots courts par conception).

## Revisit when
- Les tournées réelles montrent que l'enchaînement structure par structure est trop lent pour la saisie de début/fin de saison.
- Le réseau sur la plage rend l'envoi par lot peu fiable — envisager un envoi progressif ou hors-ligne.
- Les modèles de vision deviennent fiables pour l'occupation — rouvrir la piste photo comme *pré-remplissage du fantôme* (jamais comme observation directe : la règle « geste explicite » tient).
