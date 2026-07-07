# 03 — Pastille quota dans la fiche d'emplacement + copy explicite de « Écrire au membre »

Status: ready-for-agent

## Parent

`.scratch/hors-quota/PRD.md` — PRD « Section Hors quota : file par adresse, fiche d'adresse, notes d'adresse » (décision 0019).

## What to build

Deux retouches de la fiche d'emplacement partagée (0018), visibles partout où elle s'ouvre (grille des Structures, registre À traiter, fiche d'adresse) :

- **Pastille quota** : sur la ligne membre, une pastille libellée « N emplacements à cette adresse », affichée **seulement** quand l'adresse attribuée dépasse son quota (dérivation de l'issue 01 — silence quand l'adresse est dans les règles, 0016). Le membre du comité qui ouvre un emplacement depuis la grille découvre le contexte du dossier ; aucun marquage dans la grille elle-même (mauvaise clé — fait d'adresse ; le pointillé appartient à « En double »), et aucune navigation vers la fiche d'adresse en v1 (reporté nommé, 0019).
- **Copy du bouton « Écrire au membre »** : libellé court inchangé, plus une ligne d'aide calme — « Un courriel déjà rédigé s'ouvrira dans votre messagerie — relisez-le et ajustez-le avant de l'envoyer. » Appliquée aux **deux fiches** (emplacement et adresse) : le public aîné ne s'attend pas à un brouillon préparé (procédural rassurant, pas du bruit — 0016).

## Acceptance criteria

- [ ] La pastille « N emplacements à cette adresse » apparaît dans la fiche d'emplacement quand l'adresse dépasse son quota, et jamais quand elle le respecte (y compris exception accordée respectée).
- [ ] Elle apparaît partout où la fiche s'ouvre — vérifiée au moins depuis la grille des Structures et depuis la fiche d'adresse.
- [ ] La ligne d'aide accompagne « Écrire au membre » sur la fiche d'emplacement et la fiche d'adresse.
- [ ] Captures mockées : fiche d'un emplacement d'une adresse hors quota (pastille visible) et fiche d'un emplacement dans les règles (aucune pastille) ; console propre (0006/0017).
- [ ] `npm run verify` vert ; captures du delta revues par un subagent lecture seule, PNG committés avec le code.

## Blocked by

- `.scratch/hors-quota/issues/01-derivations-hors-quota-et-lecture.md`
- `.scratch/hors-quota/issues/02-section-hors-quota-et-fiche-adresse.md` (la ligne d'aide et la pastille touchent la fiche d'adresse créée en 02)
