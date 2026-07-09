# 07 — Traitement de la demande dans la fiche d'adresse

Status: ready-for-agent

## Parent
`.scratch/adresses-fiches-unifiees/PRD.md`

## What to build
Quand une [[Adresse]] a une **[[Demande]] en cours**, la [[Fiche d'adresse]] affiche un bloc **« Demande en cours »** qui **traite la demande inline** (amende 0020) : type / date / [[Mobilité réduite]] ; le **contact de la demande de façon compacte** avec un seul **« Mettre à jour le contact »** s'il diffère du [[Membre]] enregistré (ou « nouveau contact — enregistré à l'acceptation » si rien n'est inscrit) ; **attribuer une place suggérée** (Disponibles compatibles triés par niveau, la suggestion montrant le **niveau avec le numéro**, puis **confirmation**) ; ou **refuser avec une raison** journalisée. Le cas **demande-seule** est géré : adresse sans membre ni emplacement → contact via la demande, pas de bloc Membre ni de liste d'emplacements, et **pas de journal** tant que l'adresse n'existe pas.

## Acceptance criteria
- [ ] Une adresse avec demande affiche le bloc « Demande en cours » avec attribuer + refuser inline (aucun renvoi vers un écran séparé).
- [ ] Les suggestions sont les Disponibles compatibles, triées par niveau (bas d'abord si mobilité réduite), le **niveau affiché avec le numéro** ; l'attribution demande une **confirmation** avant d'être posée.
- [ ] Le contact est compact ; « Mettre à jour le contact » en un geste si différent ; mention « nouveau contact » si aucun membre enregistré.
- [ ] Refuser exige une raison, journalisée ; le quota reste bloquant à l'attribution (0020).
- [ ] Adresse demande-seule : pas de bloc Membre, pas de liste d'emplacements, pas de champ « ajouter une note ».
- [ ] Tests au seam pour les suggestions (niveau, mobilité) et le contact compact ; captures des états (demande diff-contact, demande seule).

## Blocked by
- 05
