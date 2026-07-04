# osl_embarcations

## UX/UI (obligatoire pour toute page ou section)
1. **Avant tout markup** : écrire un design brief (audience, ton, hiérarchie, états vide/chargement/erreur/succès) et lire `principles.md` + `composition.md` du skill webawesome-design.
2. Web Awesome partout ; variables visuelles uniquement dans `site/theme.css` (tokens `--wa-*`) — décision 0004.
3. **Après** : passer la polish checklist de composition.md, puis revue par le subagent `ui-critic` sur un rendu (`npm run screenshots` produit tous les états dans `screenshots/`), pas seulement sur le code. Une page « conforme mais générique » est un échec.
4. Public : majoritairement aîné — typographie généreuse, cibles larges, langage simple et rassurant.
5. **Textes visibles par l'utilisateur** : tout nom d'entité (comité, structures, rôles…) vient de CONTEXT.md. Terme absent du glossaire → demander à Jeremy ou passer par /pragmatic:grill ; ne jamais inventer un nom d'organisation ou de concept dans l'UI.

## Couverture des exigences
- Chaque plan /pragmatic:design inclut une table exigence → tranche (rien ne doit être « invisible parce que reporté »).
- Un écran visible par l'utilisateur embarque le contrat de données complet de son formulaire dès sa première tranche.

## Pragmatic conventions
- Design decisions: docs/decisions/ — read INDEX.md before proposing designs; check a record's "Revisit when" before re-deciding anything it covers.
- Canonical vocabulary: CONTEXT.md (if present) — use its terms; when terms conflict or are fuzzy, suggest /pragmatic:grill.
- Code marked PROTOTYPE is throwaway: never extend or promote it without tests.
- Workflows: /pragmatic:grill (fuzzy intent) → /pragmatic:design (plan) → /pragmatic:build (TDD loop) → /pragmatic:etc-review (gate); /pragmatic:decide (record a decision).
