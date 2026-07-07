# 01 — Modèle de décision + section « Demandes » d'À traiter en lecture, admin.html retirée

Status: done

## Parent

.scratch/traitement-demandes/PRD.md (décision 0020)

## What to build

L'état d'une demande devient dérivé, jamais stocké : l'onglet Demandes perd la colonne `statut` de son contrat et gagne `numeroAttribue` et `dateDecision` (garantis par le setup sans réordonner, décision 0012). Dérivation pure dans le module partagé de grille : `numeroAttribue` rempli → acceptée ; `dateDecision` seule → refusée ; rien → nouvelle — tolérante aux données saisies à la main (décision 0002).

La réponse d'inventaire (authentifiée) inclut désormais les demandes, et la page À traiter gagne une section « Demandes » : rangées compactes des demandes nouvelles (plus ancienne d'abord — adresse, type d'embarcation, mobilité réduite, date de réception), pastille libellée de compte sur la section, et en dessous les demandes traitées en lignes compactes dépliables montrant l'issue (emplacement attribué ou refus avec sa raison, dérivés de la ligne et du Journal via `demandeId`). Pas encore de fiche de demande : les rangées ne s'ouvrent pas (issue 02) — la section en lecture fait déjà mieux que l'ancienne page admin.

admin.html est retirée du site (navigation comprise) et l'action serveur `demandes` disparaît avec elle.

Migration manuelle de la Sheet (par Jeremy, avec cette tranche) : reporter les demandes déjà décidées dans `numeroAttribue`/`dateDecision`, retirer la colonne `statut`.

## Acceptance criteria

- [x] Dérivation pure de l'état d'une demande testée en node (trois états + combinaisons manuelles bizarres : `numeroAttribue` sans `dateDecision` → acceptée ; valeurs parasites sans plantage) — `etatDemande` (grille.js), tests/demandes-section.test.mjs
- [x] Le setup garantit `numeroAttribue` et `dateDecision` dans Demandes sans réordonner les colonnes existantes — `ENTETES_DEMANDES` + `entetesGaranties` (0012)
- [x] L'inventaire renvoie les demandes ; l'action `demandes` et admin.html n'existent plus ; aucun lien du site ne pointe vers admin.html
- [x] Section « Demandes » dans À traiter : nouvelles en rangées compactes triées plus ancienne d'abord, pastille libellée (jamais de nombre nu, décision 0016)
- [x] Demandes traitées en dessous, une ligne compacte par demande, dépliable : issue, date de décision, emplacement attribué ou raison du refus (Journal via `journalDemande`)
- [x] États couverts en captures mockées : aucune demande, nouvelles seulement, traitées seulement, mélange, traitée acceptée dépliée, traitée refusée dépliée ; console error/warning et pageerror propres
- [x] Revue ui-critic sur le delta de captures (affordance des rangées, redondance du déplié, libellés des citations corrigés) ; vocabulaire du glossaire partout (« Demande », jamais « requête »)

## Blocked by

None - can start immediately
