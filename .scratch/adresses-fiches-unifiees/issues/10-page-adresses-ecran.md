# 10 — Page « Adresses » (écran de recherche)

Status: ready-for-agent

## Parent
`.scratch/adresses-fiches-unifiees/PRD.md`

## What to build
Créer la page **« Adresses »** (décision 0023) : 4ᵉ onglet du comité (lien ajouté à la nav des pages comité), squelette du site (0015), protégée par le mot de passe du comité (0008). Un **champ de recherche** avec **autocomplétion** : chaque suggestion = nom + adresse (+ légende « · Emplacement N » sur un match par numéro), la **première présélectionnée**, **Entrée** ouvre ; choisir une suggestion ouvre la [[Fiche d'adresse]] (05). Recherche **100 % client** sur l'inventaire chargé après le mot de passe. Tous les états pilotables par `?etat=` (0006). Consomme l'index de recherche (09).

## Acceptance criteria
- [ ] 4ᵉ onglet « Adresses » présent dans la nav comité de toutes les pages comité.
- [ ] Recherche tri-clé fonctionnelle (nom / adresse / numéro), suggestions « nom + adresse » (+ légende numéro le cas échéant).
- [ ] Première suggestion présélectionnée ; Entrée l'ouvre ; choisir ouvre la fiche d'adresse.
- [ ] États connexion / chargement / repos (calme) / résultats / aucun-résultat / erreur, tous pilotables par `?etat=` et capturés.
- [ ] Recherche 100 % client sur l'inventaire déjà chargé (aucun appel réseau par frappe).
- [ ] Captures des états ; delta revu par un subagent lecture seule (design brief + polish checklist avant markup, CLAUDE.md).

## Blocked by
- 05, 09
