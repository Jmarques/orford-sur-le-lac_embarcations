# 02 — Recouvrement plein écran épuré + cadre

Status: done — commit 2be7fbd

## Parent

`.scratch/tournee-epure/PRD.md` — PRD « Tournée en plein écran épuré » (décision 0021).

## What to build

Faire de la section tournée un **recouvrement plein écran** : quand elle est active, elle passe en `position: fixed; inset: 0` et **masque le header animé** (bande-lac) par CSS — pas d'API Fullscreen (indisponible sur iPhone, 0021). La barre du navigateur reste. L'auth et le câblage existants sont réutilisés.

Cadre frugal en hauteur (paysage ~375 px) :
- **Barre haut fine** : ✕ (sortie) · nom de la structure · pastille compteur **libellée** (0016) · emplacement d'aide (`?`) · **icône rotation discret**.
- **Grille** défilable au milieu (défile horizontalement en portrait **comme** en paysage — le paysage est un bonus récompensé, jamais forcé ; l'indice de défilement peut porter l'invitation à tourner).
- **Barre bas épinglée** : « Terminer la tournée » pleine largeur, **désactivée tant que 0 relevé**.
- L'erreur d'envoi + « Réessayer » vivent **dans** le recouvrement ; les taps sont conservés.

L'instruction lourde est réduite à une **ancre d'une ligne** statique (le « … »/popover et le garde-fou de sortie arrivent en 03). L'animation `eau.js` est **suspendue** tant que le recouvrement est actif, reprise à la fermeture. Tous les boutons de la tournée passent à **`size="m"`** max. La sortie (✕ / « Retour à la liste ») garde pour l'instant la **sémantique actuelle** (les taps de la structure en cours sont perdus, comme aujourd'hui — 0013) ; le garde-fou conditionnel est ajouté en 03 (aucune régression vs l'existant).

## Acceptance criteria

- [ ] Tournée active = recouvrement plein cadre (`fixed inset:0`) ; le header animé n'est **plus visible**.
- [ ] Barre haut : ✕, nom de structure, pastille compteur libellée, emplacement d'aide, icône rotation discret.
- [ ] Barre bas épinglée : « Terminer la tournée » (`size m`), **inactif à 0 relevé**, actif dès 1 relevé.
- [ ] Instruction réduite à une **ancre d'une ligne** (mécanique complète repoussée à 03).
- [ ] Erreur d'envoi + réessai s'affichent dans le recouvrement, taps conservés.
- [ ] `eau.js` en pause pendant le recouvrement, reprise à la fermeture (aucune erreur console ; vérifiable).
- [ ] Tous les boutons de la tournée ≤ `size m`.
- [ ] Grille utilisable et défilable en **portrait et en paysage** (piloter les deux viewports).
- [ ] Captures mockées des états du recouvrement (desktop + mobile) ; console propre ; `npm run verify` vert ; revue UI sur le delta passée.

## Blocked by

- `01-cellule-elevation.md` (même surface `structures.html`/`theme.css` ; empiler l'encodage d'abord évite une double baseline de captures).
