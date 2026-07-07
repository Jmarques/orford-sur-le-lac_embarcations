# 03 — Migrer les pages admin inline (a-traiter.html, structures.html)

Status: done

## Parent

`.scratch/client-backend/PRD.md`

## What to build

Migrer les scripts inline des deux pages admin sur le client. Ces sites portent le chemin `accesRefuse` (session morte → réafficher l'écran de connexion) et le chargement `inventaire`, plus les gestes propres à `structures.html`.

- `a-traiter.html` : `chargerCas` (POST `inventaire`) — remplacer le `fetch` + interprétation d'enveloppe + `class ErreurApi` par `client.poster({action:'inventaire'})`. Sur sentinelle `{accesRefuse:true}` : `sessionStorage.removeItem` + `montrerConnexion(true)`, comme aujourd'hui. Conserver dans la page les diagnostics de mode dégradé (journal/membres/`quotaAccorde` absents → `console.info`) — ce ne sont pas des concerns de transport.
- `structures.html` : les 4 sites `fetch` (inventaire + config au chargement, `sauverStructure`, observer un lot) — router vers `client.poster` / `client.obtenir('config')`, retirer la `class ErreurApi` locale.

La réaction à `accesRefuse` reste propre à chaque page ; le client se contente de normaliser. Aucun changement d'écran.

## Acceptance criteria

- [x] `a-traiter.html` : `chargerCas` passe par `client.poster` ; plus de `fetch`/`ErreurApi` inline ; session expirée réaffiche la connexion à l'identique (helper `sessionExpiree`, partagé avec les 3 `surSessionExpiree` des fiches).
- [x] Les diagnostics console « backend pas redéployé » / « colonne quotaAccorde absente » restent en place dans la page.
- [x] `structures.html` : les 4 sites `fetch` passent par le client (`poster` pour inventaire/sauvegarde/observation, `obtenir` pour config) ; plus d'`ErreurApi` inline.
- [x] Charger la page, sauver une structure, faire une tournée (observer un lot) fonctionnent à l'identique ; refus métier et session expirée se comportent comme avant.
- [x] `npm run verify` passe (delta captures nul).

## Blocked by

- `.scratch/client-backend/issues/01-module-client-et-fiche.md`
