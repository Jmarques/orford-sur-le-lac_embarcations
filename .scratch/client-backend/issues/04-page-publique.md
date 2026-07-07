# 04 — Migrer la page publique (index.html)

Status: done

## Parent

`.scratch/client-backend/PRD.md`

## What to build

Migrer le formulaire public sur le client — le chemin **sans mot de passe**, qui valide les deux entrées publiques du module :

- `chargerConfig` : GET `?action=config` → `client.obtenir('config')` (public, aucun mot de passe). Sur refus → `ErreurApi` montrée telle quelle ; sur erreur technique → message réseau rassurant, écran « indisponible ».
- Envoi d'une demande : POST **sans `action` et sans mot de passe** (contrat du formulaire public, décision 0001) → `client.poster(corps)` créé sans getter `motDePasse` (ou le formulaire crée un client public dédié). Le corps ne doit contenir aucun `motDePasse`.

Retirer la `class ErreurApi` inline. La distinction erreur métier / erreur technique (message montré ou générique) est déjà portée par le client (`ErreurApi` vs erreur propagée) — la page choisit son message via `erreur instanceof ErreurApi`.

Attention : `index.html` doit charger `<script src="client.js">`.

## Acceptance criteria

- [x] `index.html` charge `site/client.js`.
- [x] `chargerConfig` passe par `client.obtenir('config')` ; les rues et types se remplissent à l'identique ; l'échec bascule sur l'écran « indisponible ».
- [x] L'envoi d'une demande passe par `client.poster` **sans `motDePasse`** dans le corps ; succès, refus métier (message montré) et erreur réseau (message générique) se comportent comme avant.
- [x] Plus de `fetch` ni `class ErreurApi` inline dans `index.html`.
- [x] Les hooks de captures `?etat=chargement|indisponible|succes|erreur-envoi` fonctionnent toujours ; `npm run verify` passe (delta captures nul).

## Blocked by

- `.scratch/client-backend/issues/01-module-client-et-fiche.md`
