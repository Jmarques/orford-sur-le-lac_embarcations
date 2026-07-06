# 01 — Fiche d'emplacement partagée, intégrée à la page Structures

Status: done

## Parent

`.scratch/fiche-emplacement/PRD.md` (décision 0018).

## What to build

La fiche d'emplacement canonique (composant client partagé, markup injecté, `textContent` partout) et son intégration complète à la page Structures, où elle remplace le panneau d'emplacement actuel. Tranche complète de bout en bout : dérivation pure des gestes par statut (testée node), composant avec en-tête permanent (titre « Emplacement N · Structure S · Niveau L », callout de statut avec signal temporel, ligne membre condensée avec tél/courriel tappables) et deux onglets — Observer (dernière observation + « Qu'observez-vous sur place ? » Occupé/Libre) et Traiter (journal à défilement interne, ajouter une note, Écrire au membre, Libérer avec confirmation) —, en drawer montant du bas sur mobile et adapté sur grand écran. Les gestes suivent le statut, jamais la page ; depuis Structures la fiche s'ouvre sur Observer, pour toute cellule de la grille en mode consultation (tournée intouchée, 0013). Tout geste laisse la fiche ouverte : re-fetch de l'inventaire, re-rendu de la fiche en place et de la grille derrière. Aucun changement serveur.

Processus UX obligatoire (CLAUDE.md) : design brief avant tout markup, principles.md + composition.md, polish checklist, revue ui-critic sur le delta de captures fraîches (0017).

## Acceptance criteria

- [ ] Dérivation pure « gestes par statut » (attribué → Libérer ; courriel connu → Écrire) partagée et testée node — attribué avec/sans membre, membre sans courriel, non attribué, ligne absente.
- [ ] La fiche s'ouvre depuis toute cellule de la grille (les cinq statuts + « En double »), en drawer bas sur mobile avec la grille visible au-dessus, contenant adapté sur grand écran.
- [ ] En-tête permanent : position dans le titre, statut coloré + signal temporel (« libre depuis » / fenêtre d'apparition / dernière observation), membre en une ligne (`tel:`, `mailto:`), « Aucun membre inscrit » si attribué sans ligne Membres.
- [ ] Onglet Observer : dernière observation (état + date), boutons Occupé/Libre, état courant marqué ; onglet Traiter : journal complet (seul élément défilant), formulaire de note, Écrire au membre (`mailto:` pré-rempli), Libérer derrière confirmation — gestes visibles selon le statut seul.
- [ ] Après chaque geste réussi la fiche reste ouverte : statut/signal/journal/boutons re-rendus depuis l'état frais de la Sheet, champ de note vidé, grille recolorée derrière. Après échec : erreur dans la fiche, texte conservé.
- [ ] La fiche ne dépasse pas un écran de téléphone courant (hors défilement interne du journal) ; deux onglets larges, libellés du glossaire.
- [ ] En mode tournée, un tap sur une cellule garde son cycle de confirmation — jamais de fiche (0013).
- [ ] L'ancien panneau d'emplacement est supprimé de la page Structures ; aucune console error/warning ni pageerror dans la boucle de captures.
- [ ] Scénarios de captures mis à jour (fiche par statut, chaque onglet, erreur d'envoi, confirmation de libération, fiche restée ouverte après geste) ; nouvelles baselines committées avec le code (0017).
- [ ] Flux réel piloté au navigateur : observer puis noter sans rouvrir ; libérer → statut basculé fiche ouverte.

## Blocked by

None - can start immediately.

## Comments

- 2026-07-06 (implémentation, entériné) : le critère « signal temporel … dernière observation sinon »
  dans l'en-tête est restreint aux deux statuts problèmes (« libre depuis » / fenêtre d'apparition).
  Pour En ordre / Disponible / Non observé, la date de dernière observation vit UNIQUEMENT dans
  l'onglet Observer — la porter aussi dans le callout aurait créé deux foyers pour le même fait
  (décision 0016, qui prime sur la lettre de ce critère).
- 2026-07-06 : ajouts défensifs hors lettre de l'issue — mode dégradé signalé en console quand le
  backend ne renvoie ni journal ni membres (parité avec a-traiter.html), et cibles de contact
  élargies dans `.liens-contact` (profite aussi à la fiche actuelle d'À traiter). Le mailto de
  relance reprend la copy existante d'a-traiter.html (0003 : jamais envoyé par l'app).
- 2026-07-06 (revue ui-critic, corrigé) : journal calé sur l'événement le plus récent au frame
  suivant wa-after-show/wa-tab-show (le calage au rendu était un no-op drawer fermé) ; onglet
  Traiter condensé pour tenir sur un téléphone (journal 120px + placeholder une ligne + rythme s) ;
  coussin safe-area sous les gestes.
