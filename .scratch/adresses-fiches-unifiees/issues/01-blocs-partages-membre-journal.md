# 01 — Préfacto : blocs partagés Membre + Journal

Status: ready-for-agent

## Parent
`.scratch/adresses-fiches-unifiees/PRD.md`

## What to build
Extraire en un module partagé les deux blocs de vue aujourd'hui dupliqués entre la [[Fiche d'emplacement]] et la [[Fiche d'adresse]] : **Membre** (nom, adresse, contact téléphone/courriel tappables, mention « aucun membre inscrit ») et **Journal** (liste d'événements datés + formulaire « ajouter une note »). Les deux fiches consomment ce module ; **aucun changement de comportement visible** — c'est un préfacto qui rend les tranches suivantes faciles (« make the change easy, then make the easy change »).

## Acceptance criteria
- [ ] Un module de blocs partagés expose la construction du bloc Membre et du bloc Journal.
- [ ] La fiche d'emplacement et la fiche d'adresse produisent leur bloc Membre et leur bloc Journal via ce module (fin de la duplication).
- [ ] Les captures committées des deux fiches sont **inchangées** (delta pixel nul) — `npm run screenshots` ne signale rien.
- [ ] La suite de tests reste verte (`npm test`).
- [ ] Aucune donnée de la Sheet posée en HTML (textContent, anti-XSS) — invariant conservé.

## Blocked by
None - can start immediately
