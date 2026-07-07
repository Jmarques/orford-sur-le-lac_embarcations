# 02 — Fiche de demande : la décision complète (accepter = attribuer, refuser, contact, quota)

Status: ready-for-agent

## Parent

.scratch/traitement-demandes/PRD.md (décision 0020)

## What to build

Toucher une rangée de la section « Demandes » ouvre la **fiche de demande** (même patron de drawer/fiche que les fiches d'emplacement et d'adresse, décisions 0018/0019 ; la fiche reste ouverte après un geste et se rafraîchit sous les yeux). Elle naît complète — c'est l'écran de décision du comité :

- **Contact** : les coordonnées de la demande face au [[Membre]] courant de l'adresse, différences mises en évidence, geste « mettre à jour le contact » en un clic (action authentifiée, journalisée), indépendant d'accepter/refuser. Adresse absente de Membres : montré comme tel ; la ligne sera créée à l'acceptation.
- **Situation de l'adresse** : emplacements déjà attribués et quota accordé (réutilise les dérivations hors quota, clé d'adresse normalisée) ; signal si une autre demande ouverte existe pour la même adresse ; la note écrite par le membre.
- **Suggestions** : les emplacements au statut « Disponible » seulement, dans les structures dont les embarcations acceptées incluent le type demandé (colonne vide = accepte tout, avec mention), groupés par structure avec numéro et niveau, triés par niveau décroissant — croissant si mobilité réduite, structure verticale comptée au sol. État vide : « aucune place observée libre dans les structures compatibles — faire une tournée ».
- **Accepter = attribuer en un seul geste** : toucher une suggestion → bouton « Attribuer le n°X et accepter » → écrit l'attribution sur la ligne d'Emplacements, `numeroAttribue` + `dateDecision` sur la demande, crée la ligne Membres avec les coordonnées de la demande si absente, et journalise (événement `attribution` avec `demandeId`).
- **Quota bloquant** : attributions ≥ quota accordé → accepter est impossible, expliqué en français simple (« cette adresse a déjà ses 2 emplacements ») avec la porte de sortie : augmenter le quota accordé dans Membres, puis accepter.
- **Refuser** : raison en texte libre obligatoire, journalisée (événement `refus`, la colonne note de la demande reste celle du membre) ; `dateDecision` posée. « Écrire au membre » = mailto pré-rempli avec la ligne d'aide établie (décision 0019), jamais d'envoi automatique (décision 0003).

Côté serveur, la préparation de décision suit le patron des préparations existantes (note, libération) : validations aux frontières — demande existante et encore nouvelle ; pour accepter : emplacement réellement Disponible et compatible, adresse sous son quota accordé ; pour refuser : raison non vide — et retour des écritures préparées, colle Apps Script mince pilotée par les en-têtes.

## Acceptance criteria

- [ ] Dérivations pures testées en node : suggestions (filtre Disponible + compatibilité, embarcations non renseignées = accepte tout, tri normal/PMR, verticales au sol, groupement), diff de contact (identique / différent / Membre absent), autres demandes ouvertes de la même adresse (clé normalisée)
- [ ] Préparation de décision testée en node : accepter une place non disponible ou incompatible → refus ; accepter au quota → refus ; refuser sans raison → refus ; demande déjà décidée → refus ; acceptation → écritures Demandes + Emplacements + Journal (+ Membres si absente)
- [ ] Actions API authentifiées (décision 0008) pour accepter, refuser, mettre à jour le Membre ; chaque geste journalisé avec `demandeId`
- [ ] La fiche montre tout le contrat de données dès cette tranche : contact avec diff et geste de màj, situation de l'adresse (attributions + quota + autre demande ouverte + note du membre), suggestions, gestes accepter/refuser, mailto
- [ ] Le geste laisse la fiche ouverte et l'état se rafraîchit (la demande passe dans les traitées, la rangée disparaît des nouvelles)
- [ ] États couverts en captures mockées : contact identique / différent / absent de Membres, quota sous/au blocage, suggestions pleines (normal et PMR) / vides, suggestion sélectionnée, confirmation d'acceptation, refus, erreur serveur ; console propre
- [ ] Revue ui-critic sur le delta ; typographie généreuse et cibles larges (public aîné) ; cohérence visuelle stricte avec les fiches 0018/0019

## Blocked by

- 01-modele-decision-section-lecture.md
