# 04 — Fin de tournée repensée : retour liste + confirmation sur la carte

Status: done — commit 2be7fbd

## Parent

`.scratch/tournee-epure/PRD.md` — PRD « Tournée en plein écran épuré » (décision 0021, amende 0013).

## What to build

Supprimer l'écran résumé et l'enchaînement imposé, et déplacer le bilan dans le contexte de la carte.

- **Retirer l'écran résumé** (`etat-resume`) et l'action **« Structure suivante → »**. La fonction pure `structureSuivante` devient morte : **la supprimer** avec son export et son ou ses cas de test.
- **« Terminer la tournée »** envoie le lot, **referme le recouvrement** et **revient directement à la liste** des structures.
- Au retour, la liste **défile + met le focus** sur la carte de la structure relevée (ne pas perdre sa place).
- Cette carte porte une **confirmation persistante et libellée** (« Tournée enregistrée · N relevés, M changements ») construite avec `resumeDeTournee` (compte relevés + changements) ; elle persiste jusqu'à la prochaine action. La bannière succès **globale** (`#message-succes`) n'est plus utilisée pour la tournée.
- La grille de la carte affiche les **statuts recalculés** avec les observations fraîches (les changements se lisent en couleur — pas de liste redondante, 0016).

## Acceptance criteria

- [ ] Écran résumé et « Structure suivante » **retirés** ; `structureSuivante` (fonction, export, test) **supprimée** ; les tests de logique pure restants passent.
- [ ] « Terminer » → envoi du lot → le recouvrement se referme → retour à la liste.
- [ ] La liste **défile et focalise** la carte de la structure relevée.
- [ ] La carte porte une **confirmation persistante libellée** (N relevés, M changements) via `resumeDeTournee` ; persiste jusqu'à la prochaine action ; bannière globale non utilisée.
- [ ] La grille de la carte montre les statuts recalculés (observations fraîches).
- [ ] L'échec d'envoi reste géré dans le recouvrement, taps conservés (vérif de non-régression).
- [ ] Captures mockées : retour à la liste avec carte focalisée + confirmation (desktop + mobile) ; console propre ; `npm run verify` vert ; revue UI sur le delta passée.
- [ ] Nettoyage : supprimer `tmp/prototype-cellule-tournee.html` et `tmp/shot-prototype.mjs`.

## Blocked by

- `03-aide-popover-garde-fou-sortie.md`
