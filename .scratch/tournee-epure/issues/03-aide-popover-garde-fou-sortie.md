# 03 — Aide (ancre + popover flottant) + garde-fou de sortie

Status: ready-for-agent

## Parent

`.scratch/tournee-epure/PRD.md` — PRD « Tournée en plein écran épuré » (décision 0021, amende 0016).

## What to build

Compléter l'aide et sécuriser la sortie du recouvrement.

**Aide** : l'ancre d'une ligne (posée en 02) porte le rassurant toujours visible (« Touchez ce que vous voyez ; ce que vous ne touchez pas ne change pas »). Un **« … » / `?`** ouvre un **popover flottant** (par-dessus la grille, **sans reflow** — rien ne pousse la grille) portant la **mécanique du cycle de tap** : un tap confirme, un deuxième bascule, un **troisième annule** le relevé. L'icône rotation révèle son indice de la même façon (au tap sur tactile, flottant).

**Garde-fou de sortie** : ✕ / « Retour à la liste » demande confirmation **uniquement s'il reste des relevés non envoyés** (« N relevés non enregistrés. Quitter sans enregistrer ? ») ; à 0 relevé, ferme sans friction. Empêche qu'un effleurement du ✕ détruise une demi-tournée (public aîné, donnée-terrain irremplaçable), sans jamais gêner quand il n'y a rien à perdre.

## Acceptance criteria

- [ ] Ancre d'une ligne toujours visible, **hauteur stable** ; le « … »/`?` ouvre un popover **flottant** — la grille ne bouge pas.
- [ ] Le popover documente le cycle : confirmer → basculer → **3ᵉ tap = annuler**.
- [ ] L'icône rotation révèle son texte au tap (tactile), flottant, sans reflow.
- [ ] ✕ / retour avec **≥ 1 relevé non envoyé** → dialogue de confirmation ; « quitter » abandonne les taps, « rester » les conserve.
- [ ] ✕ / retour avec **0 relevé** → ferme sans prompt.
- [ ] Captures mockées : popover d'aide ouvert, dialogue du garde-fou (desktop + mobile) ; console propre ; `npm run verify` vert ; revue UI sur le delta passée.

## Blocked by

- `02-recouvrement-plein-ecran-cadre.md`
