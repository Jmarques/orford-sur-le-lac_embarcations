# 0023 — Page « Adresses » : consultation par recherche menant à la fiche d'adresse

Date: 2026-07-08
Status: Accepted

## Context
Comparée à un tableur, l'app n'offrait aucune consultation par identité : pour retrouver un emplacement, un membre ou une adresse, il fallait connaître le numéro ou balayer la grille des Structures à l'œil. Les trois pages du comité (Demandes, Structures, À traiter) sont toutes organisées par tâche ou par carte physique, jamais par « qui / où ». Or l'objectif est que le site devienne le point de contact principal et la Sheet le dernier recours : tant que « retrouver quelqu'un » n'existe que dans la Sheet, le comité rouvrira la Sheet. Quatre directions ont été prototypées et rendues ; la direction « autocomplétion » l'a emporté.

## Decision
Un 4ᵉ onglet du comité, « Adresses », offre une **recherche seule** (pas de tableau triable au départ) : un champ dont chaque suggestion porte le nom du [[Membre]], l'[[Adresse]], et une **pastille de santé du dossier** dérivée (En ordre / Attribué-libre / Hors quota / Non observé), la première présélectionnée, Entrée ouvre. La recherche est **tri-clé** — nom de membre · adresse · numéro d'[[Emplacement]] (légende « · Emplacement N » quand le match vient d'un numéro) — et son unité de résultat est l'**[[Adresse]]**. L'index est l'**union Emplacements ∪ Membres** (`toutesLesAdresses_`) pour que les adresses connues seulement via l'onglet Membres (zéro emplacement) soient trouvables ; `casAdresse` est complété pour fabriquer un dossier à partir de la seule ligne Membres. Une suggestion mène à la [[Fiche d'adresse]] généralisée (0024).

## Alternatives rejected
- Tableau triable/filtrable façon tableur — double le survol par statut déjà offert par Structures et À traiter ; le geste réel est « atteindre un dossier connu », pas « parcourir ».
- Annuaire maître-détail (les ~180 adresses toujours affichées) — contredit « recherche seule », amende le pattern des fiches, plus coûteux ; gardé en réserve si un besoin de parcours émerge.
- Rangées de résultat nues (nom + adresse sans pastille) — plus calme mais on ouvre pour rien ; la pastille de santé oriente sans coûter un clic.
- Loupe universelle dans l'en-tête plutôt qu'un onglet — optimisation power-user, moins découvrable pour un public aîné.

## Trade-offs accepted
- Pas de vue d'ensemble : devant un champ vide, on ne peut ni parcourir ni lister « toutes les adresses d'une rue » — la revue de portefeuille reste À traiter.
- Recherche 100 % client : tout l'inventaire est chargé après le mot de passe (négligeable à ~180 adresses / ~360 emplacements).
- Ambiguïté numérique (un « 234 » civique et un « 234 » d'emplacement) : on montre les deux, chaque rangée dit pourquoi elle correspond.
- L'appariement nom↔adresse hérite de la fragilité de la clé normalisée (0019) : une rue mal orthographiée scinde une adresse en deux entrées.

## Revisit when
- Le comité réclame de parcourir/exporter la liste complète — sortir l'annuaire maître-détail gardé en réserve.
- Le volume explose (communauté ouverte) — recherche côté serveur / pagination.
- La pastille de santé fait ouvrir trop de dossiers pour rien, ou en cache trop — reconsidérer le signal porté par la rangée.
