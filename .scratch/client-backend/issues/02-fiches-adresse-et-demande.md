# 02 — Migrer fiche-adresse.js et fiche-demande.js

Status: ready-for-agent

## Parent

`.scratch/client-backend/PRD.md`

## What to build

Propager le client aux deux autres fiches, sur le patron établi en tranche 01. `site/fiche-adresse.js` et `site/fiche-demande.js` portent chacune une copie à l'identique de `envoyerAction`, `reponseAcceptee` et `class ErreurApi` : les remplacer par un client créé avec leurs getters existants.

`fiche-demande.js` fait un POST `deciderDemande` / `majContactDemande` (mot de passe requis) et lit `resultat` en payload — le contrat de sortie ne change pas. La réaction à `accesRefuse` propre à chaque fiche reste en place ; seul le transport passe par le client.

## Acceptance criteria

- [ ] `site/fiche-adresse.js` : plus de `fetch`/`envoyerAction`/`reponseAcceptee`/`ErreurApi` locale — passe par le client.
- [ ] `site/fiche-demande.js` : idem, y compris les gestes `deciderDemande` et `majContactDemande`.
- [ ] Accepter / refuser une demande, mettre à jour le contact, et les gestes de la fiche d'adresse fonctionnent à l'identique ; refus métier (p. ex. quota bloquant) et session expirée se comportent comme avant.
- [ ] Aucune régression visuelle : `npm run verify` passe (delta captures nul).

## Blocked by

- `.scratch/client-backend/issues/01-module-client-et-fiche.md`
