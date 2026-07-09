# 0024 — Fiches unifiées (emplacement + adresse) : coquille partagée, actions rattachées au problème

Date: 2026-07-08
Status: Accepted

## Context
La [[Fiche d'emplacement]] (0018) et la [[Fiche d'adresse]] (0019) ont dérivé vers des structures proches mais dupliquées : toutes deux montrent un [[Membre]] (contact), un journal (événements + note) et des actions, mais chacune les réimplémente. Deux irrégularités concrètes en découlent : « Écrire au membre » s'affiche sur un emplacement En ordre (le geste `ecrire` de `gestesEmplacement` teste « attribué », pas « y a-t-il un problème »), et la fiche d'adresse n'existe que pour les cas [[Hors quota]] alors que la page Adresses (0023) doit ouvrir n'importe quelle [[Adresse]]. La 0018 anticipait ce moment (« un nouveau geste apparaît… les deux onglets suffisent-ils ? ») et la 0019 aussi (« ouvrir le dossier d'adresse depuis un emplacement »). Prototypé et itéré avec le comité.

## Decision
Emplacement et adresse partagent une **coquille unique** — `[Sujet] · [Membre] · [Corps propre] · [Journal] · [Actions]` — dont les blocs **Membre** (contact) et **Journal** (événements + ajout de note) sont des composants **partagés**, consommés par les deux fiches. Le **corps propre** est la seule différence (emplacement : le relevé « Sur place » ; adresse : ses emplacements). Règles :

- **Actions rattachées au problème** : un **remède** vit DANS le callout du statut/problème qu'il résout ; les actions **utilitaires** (« Sur place », « Fiche d'adresse ») vivent dans une barre séparée. « Sur place » (consigner l'[[Occupation observée]]) devient une **action** (panneau replié), plus une section permanente.
- **Gating resserré** (amende `gestesEmplacement`) : « Écrire au membre » / « Relancer » n'apparaît que face à une raison — emplacement **Attribué, libre**, ou adresse **Hors quota** — jamais sur un état sain. « Libérer » est offert quand Attribué-libre OU adresse hors quota.
- **[[Fiche d'adresse]] généralisée** à toute adresse (amende 0019) : un callout n'apparaît que pour un problème/exception (rien « dans le quota »). Navigation emplacement → fiche d'adresse (Revisit de 0019).
- **[[Demande]] traitée dans la [[Fiche d'adresse]]** (amende 0020), inline : attribuer une place suggérée (Disponibles compatibles — la suggestion montre le **niveau** avec le numéro, puis **confirmation**) ou refuser avec une raison. Le contact de la demande est montré de façon **compacte** (fini le diff champ-par-champ) : une ligne + un seul « Mettre à jour le contact » s'il diffère du [[Membre]] enregistré ; « nouveau contact — enregistré à l'acceptation » quand rien n'est encore inscrit. L'adresse **sans emplacement ni membre** (demande seule) est gérée : contact via la demande, pas de bloc Membre ni de liste d'emplacements, et **pas de journal tant que l'adresse n'existe pas**.
- Le contexte du **courriel pré-rédigé** est montré dans un **aperçu** (objet + corps + « rien n'est envoyé automatiquement », 0003) plutôt qu'en légendes. Drawer élargi sur desktop ; mobile plein écran. Le terme « Fiche » est conservé (glossaire).

## Alternatives rejected
- Garder deux fiches distinctes et corriger seulement le gating de `ecrire` — laisse la duplication Membre/Journal et l'asymétrie qui l'a créée.
- Onglets Observer/Traiter conservés (0018) — n'unifie pas avec la fiche d'adresse (sans onglets) ; le tout-à-plat lit mieux et « Sur place » devient une action.
- Actions groupées en pied de fiche — flottent, déconnectées du problème ; rattacher le remède au callout dit ce qu'il résout.
- Diff de contact champ-par-champ avec « Adopter » par champ — trop granulaire ; un seul « Mettre à jour le contact » suffit.
- Renvoyer « Traiter la demande » vers une fiche de demande séparée — le traitement (attribuer/refuser) vit là où on lit le dossier, sans saut de contexte.

## Trade-offs accepted
- Amende trois décisions (0018/0019/0020) : leurs libellés et le code des fiches doivent suivre ; risque transitoire d'incohérence pendant l'implémentation.
- « Sur place » replié demande un geste de plus pour observer depuis la fiche (le relevé principal reste l'écran de [[Tournée]] plein écran, 0021).
- Un module de blocs partagés de plus à maintenir — mais il retire la duplication existante.
- La fiche d'adresse devient un point d'entrée du traitement de demande : sa complexité croît (état de la demande + contact + suggestions) là où elle était en lecture/notes.

## Revisit when
- Un geste d'attribution non suggérée, ou un vrai état « en attente » de demande, apparaît (Revisit de 0020) — la barre d'actions et le bloc demande suffisent-ils encore ?
- Le comité veut éditer les modèles de courriels (Revisit de 0019) — l'aperçu devient éditable / modèles en Config.
- L'implémentation révèle des edge cases de la demande (niveau/confirmation, adresse inexistante) qui débordent la coquille — réajuster le corps propre.
- La coquille + le bloc demande débordent l'écran d'un téléphone courant (le « pas de scroll » de 0018 ne tient plus).
