# 0018 — Fiche d'emplacement unique : mêmes informations et gestes partout, en drawer

Date: 2026-07-06
Status: Accepted

## Context
Les deux vues détaillées d'un emplacement montraient des contenus disjoints : le panneau de la page Structures portait le statut, la position et l'observation (Occupé/Libre) mais ni le membre, ni le journal, ni les gestes de traitement ; la fiche de la page À traiter portait l'inverse. Résultat : voir « Attribué, libre » dans la grille obligeait à retrouver le numéro dans la page À traiter pour agir — ou même juste pour lire le journal, inaccessible pour tout emplacement hors file (En ordre, Disponible, Non observé). L'API `inventaire` renvoie pourtant les mêmes données aux deux pages : l'asymétrie était une décision d'UI, pas une contrainte. Usage majoritairement mobile : la fiche doit rester condensée, sans défilement vertical.

## Decision
Un emplacement a UNE fiche canonique (composant partagé), identique quelle que soit la page qui l'ouvre : en-tête permanent (statut dérivé coloré, position, membre condensé avec téléphone/courriel tappables), puis deux onglets — **Observer** (dernière observation + Occupé/Libre, « sur place ») et **Traiter** (journal, ajouter une note, écrire au membre, libérer). Les gestes dépendent du statut de l'emplacement (Libérer si attribué, Écrire si courriel connu), jamais de la page ; la page d'origine choisit seulement l'onglet ouvert par défaut (Structures → Observer, À traiter → Traiter). Tout geste laisse la fiche ouverte — y compris la libération : le feedback est le changement visible (statut en en-tête, ligne au journal), pas un message séparé (0016). Contenant : drawer montant du bas sur mobile (le contexte de la grille reste visible), adapté sur grand écran ; seul le journal défile en interne.

## Alternatives rejected
- Lien croisé « Traiter ce cas » du panneau Structures vers a-traiter.html — rechargement de page, perte du contexte de la grille, et aucun accès au journal pour les emplacements hors file.
- Gestes selon la page (observer sur Structures, traiter sur À traiter) — reconduisait l'aller-retour qui motivait la session.
- Trois onglets (Observer / Journal / Gestes) — libellés serrés sur mobile, et le champ « ajouter une note » séparé du journal qu'il alimente.
- Accordéons sans onglets — tout déplier fait réapparaître le défilement ; état moins prévisible que deux onglets fixes.
- Fermer la fiche après un geste (comportement historique des deux pages, chacune à sa façon) — empêche d'enchaîner observer puis noter, et c'était l'inconsistance de départ.
- Restreindre l'observation à la page Structures ou ajouter un garde-fou « êtes-vous sur place ? » — friction payée à chaque usage légitime ; la question « Qu'observez-vous sur place ? » porte la règle, et on fait confiance au comité (même logique que la Sheet éditable, 0002).

## Trade-offs accepted
- L'observation Occupé/Libre devient accessible depuis À traiter, donc loin du terrain : le libellé « sur place » est la seule barrière contre une observation de canapé.
- Sur À traiter, une libération laisse ouverte la fiche d'un dossier qui a déjà quitté le registre derrière ; c'est le statut affiché (Disponible / À identifier) et la ligne « Libération » au journal qui disent que c'est fait.
- Le message de succès de la page À traiter disparaît (redondant avec le feedback dans la fiche) ; la cible de focus après fermeture doit être re-décidée à l'implémentation.
- Deux contenants (drawer mobile, adapté grand écran) à styler et tester au lieu d'un wa-dialog unique.

## Revisit when
- Un nouveau geste apparaît (attribuer depuis la fiche, éditer le membre…) : les deux onglets suffisent-ils encore ?
- Le journal ou les tolérances montrent des observations enregistrées loin du terrain — le garde-fou rejeté redevient une option.
- L'en-tête + onglets déborde d'un écran de téléphone courant malgré la condensation (le « pas de scroll » ne tient plus).
