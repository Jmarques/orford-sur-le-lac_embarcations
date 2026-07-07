# PRD — Couche de présentation/formatage frontend

Status: ready-for-agent

_Candidats 02 et 03 de la revue d'architecture du 2026-07-07 (`.scratch/revue-architecture/`), regroupés : même racine, même seam._

## Problem Statement

`grille.js` dérive le **fait** une seule fois — le statut d'un emplacement, sa position, l'adresse d'une ligne, une date lisible, la série « libre depuis », la fenêtre d'apparition. Mais la **mise en présentation** de ces faits est recopiée à travers les fiches et les pages. Pour un membre du comité, une couleur de statut, une phrase de signal, une adresse ou un lien « écrire au membre » doivent être identiques partout ; pour le développeur, chacun de ces rendus vit aujourd'hui en 3 à 6 exemplaires qui peuvent diverger silencieusement.

Concrètement :
- **Apparence du statut** : `statutEmplacement` renvoie `{code, libelle, probleme, explication}` mais **pas** l'apparence Web Awesome. La table `code → {variante, icone}` est maintenue à la main **4 fois** (fiche.js `APPARENCE_STATUTS`, fiche-adresse.js `VARIANTES_STATUTS`, fiche-demande.js `VARIANTES_STATUTS`, plus `theme.css` `.statut-{code}`). Un 6ᵉ statut = 4 fichiers à toucher.
- **Prose des signaux** : les phrases « Attribué, mais observé libre depuis le… · N observations » et « embarcation apparue entre le… et le… » sont écrites **2 fois** (fiche.js `detailStatut`, a-traiter.html `signalLibre`/`signalAIdentifier`) à partir des mêmes faits (`serieLibreObservee`, `fenetreApparition`).
- **Helpers déjà écrits mais privés** dans grille.js : `dateLisible_` (ré-implémenté **4×** au-dessus du seam), `chercherMembreParCle_` (**3×**).
- **Helpers manquants**, donc recopiés : `formatAdresse` « numeroAdresse rue » (**4×**), `positionParNumero` structure·niveau via `analyserStructures` (**5×**, avec l'invariant « la 1ʳᵉ position gagne pour un numéro en double » re-décidé à chaque copie), `hrefEcrire` mailto sujet+corps+signature+encodage (**3×**, avec l'invariant d'encodage `?`/`&`).

Total : ~19 copies de logique de présentation, sans foyer.

## Solution

Un **module de présentation frontend** — `site/presentation.js` — qui prend les faits de `grille.js` et renvoie du prêt-à-afficher : l'apparence Web Awesome d'un statut, la prose d'un signal, l'adresse formatée, la position d'un numéro, le lien mailto. Les fiches et les pages passent de N tables/fonctions recopiées à un appel.

Rien ne change à l'écran (mêmes couleurs, mêmes phrases, mêmes liens). Le gain est interne : un seul foyer par règle de présentation, testable en node, et un **domaine partagé (`grille.js`) qui reste libre de tout vocabulaire d'UI**. `grille.js` ne fait qu'exposer deux utilitaires pur-domaine déjà présents mais privés.

## User Stories

1. En tant que membre du comité, je veux que la couleur et l'icône d'un statut soient identiques dans la grille, les fiches et la légende, pour lire l'état d'un emplacement sans hésitation.
2. En tant que membre du comité, je veux que la phrase « Attribué, libre depuis le… » soit formulée pareil dans la fiche et dans le registre À traiter, pour ne pas douter qu'il s'agit du même signal.
3. En tant que membre du comité, je veux qu'une adresse s'affiche toujours « 234 Rue du Pré », pour la reconnaître partout.
4. En tant que membre du comité, je veux que la position d'un emplacement (structure · niveau) soit cohérente d'un écran à l'autre, pour m'y retrouver sur le terrain.
5. En tant que membre du comité, je veux qu'un courriel préparé (« écrire au membre ») ait toujours le même sujet, le même corps et la même signature, pour envoyer un message soigné.
6. En tant que développeur, je veux une seule table `code → {variante, icone}`, pour qu'ajouter un statut soit une édition unique.
7. En tant que développeur, je veux une seule fonction qui met un signal en phrase, pour que le fait dérivé et sa formulation ne divergent jamais.
8. En tant que développeur, je veux un seul `formatAdresse`, pour que la forme « numeroAdresse rue » (décision 0012) ne soit pas re-décidée à chaque renderer.
9. En tant que développeur, je veux un seul `positionParNumero`, pour que l'invariant « la première position gagne pour un numéro en double » vive à un seul endroit.
10. En tant que développeur, je veux un seul `hrefEcrire`, pour que l'encodage du mailto (les `?`/`&` d'une cellule Sheet) soit correct partout, une fois.
11. En tant que développeur, je veux exposer `dateLisible` et `chercherMembre` depuis grille.js, pour cesser de ré-écrire la date-ou-repli et la recherche de membre par clé normalisée.
12. En tant que développeur, je veux que la couche présentation vive dans un module frontend séparé, pour que `grille.js` (domaine partagé backend + navigateur) ne soit jamais couplé à Web Awesome.
13. En tant que développeur, je veux tester la présentation en node (sans navigateur), pour couvrir chaque table et chaque phrase.
14. En tant que développeur, je veux que la boucle de captures reste verte (zéro diff visuel), pour prouver que le rendu est inchangé.
15. En tant que développeur, je veux que `theme.css` continue de dériver `.statut-{code}` en CSS, pour ne pas déplacer vers JS ce qui est déjà déclaratif et correct.

## Implementation Decisions

**Seam confirmé avec le développeur : split par couplage, pas par candidat.**

**1. `grille.js` (domaine partagé) — exposer deux utilitaires déjà présents, aucun ajout de surface UI :**
- `dateLisible(valeur) → Date | null` (aujourd'hui `dateLisible_`, privé).
- `chercherMembre(membres, ligne) → membre | undefined` : apparie par clé d'adresse normalisée (aujourd'hui `chercherMembreParCle_(membres, cle)`, privé ; la version publique calcule `cleAdresse(ligne)` pour coller aux 3 sites d'appel).
- Ces deux fonctions sont pur-domaine (pas de vocabulaire UI), déjà utilisées côté backend/interne — les exposer ne couple rien. `copie-grille` régénère `site/grille.js` ; leur ajout aux `module.exports` est couvert par `copie-grille.test.mjs`.

**2. Nouveau module `site/presentation.js` (frontend-only) — tout le prêt-à-afficher :**
- Classic script + guard dual-export node (précédent `grille.js`/`client.js`), `require()`-able par les tests. Frontend-only : pas de contrepartie apps-script, pas concerné par `copie-grille`.
- Dépend des faits de grille.js (chargé avant) : `statutEmplacement`, `analyserStructures`, `cleAdresse`, `serieLibreObservee`, `fenetreApparition`, `dateLisible`.
- Interface (contrat complet dès la première tranche qui la touche) :

```js
// L'apparence Web Awesome d'un statut, par code (le SEUL foyer variante/icone).
apparenceStatut(code) → { variante, icone }
//   conforme→success/circle-check · peutEtreALiberer→warning/triangle-exclamation
//   orphelin→danger/triangle-exclamation · disponible→brand/circle-check
//   pasObserve→neutral/circle-question ; code inconnu → neutral (repli sûr)

// La phrase d'un signal, dérivée des faits grille (serie/fenetre) → string | null.
proseSignal(ligne, evenements) → string | null

// L'adresse d'une ligne, toujours « numeroAdresse rue » (décision 0012).
formatAdresse(ligne) → string

// La position d'un numéro (structure · niveau), 1ʳᵉ position gagnante pour un
// numéro en double (l'erreur de données se marque ailleurs) → { structure, niveau } | null.
positionParNumero(numero, structures) → { structure, niveau } | null

// Le mailto préparé : sujet + corps + signature du comité, tout encodé.
hrefEcrire({ courriel, sujet, corps }) → string
```

**3. `theme.css` inchangé.** Le mapping `code → classe CSS` reste `'statut-' + code` (interpolation de chaîne, le CSS ne peut pas appeler du JS) ; seuls `variante`/`icone` (attributs posés en JS) passent par `apparenceStatut`.

**4. Migration des sites d'appel.** Remplacer les 4 tables d'apparence, les 2 blocs de prose, les 4 `formatAdresse` inline, les 5 `positionParNumero`, les 3 `hrefEcrire` et les ré-implémentations de date/membre par des appels au module. `presentation.js` est chargé après `grille.js` et avant les fiches, sur `structures.html` et `a-traiter.html` (les pages qui rendent statut/fiches). `index.html` (formulaire public) n'en a pas besoin.

**5. Décisions respectées, aucune rouverte.** 0004 (sans build, script global), 0009 (grille.js copié, source unique), 0012 (« numeroAdresse rue »), 0016 (la couleur ne porte jamais seule — le libellé reste). Aucun ADR contredit ; le candidat 04 (découper grille.js) est *aidé* — la présentation n'y entre pas.

**Hors du module (reste dans la page/la fiche).** Le choix de QUEL volet afficher, l'ouverture des drawers, l'assemblage DOM : `presentation.js` renvoie des valeurs, il ne touche pas au DOM.

## Testing Decisions

**Bon test ici** : vérifier le comportement externe — la valeur prête-à-afficher renvoyée pour une entrée donnée — jamais le DOM ni l'ordre d'appel. Deux surfaces :

1. **`site/presentation.js`** via `tests/presentation.test.mjs` (`node --test`, dual-export) :
   - `apparenceStatut` : les 5 codes → la bonne `{variante, icone}` ; code inconnu → `neutral` (repli).
   - `proseSignal` : à partir de faits fabriqués (série « libre » ininterrompue → « libre depuis le… · N observations » ; fenêtre d'apparition → « apparue entre… et… ») ; cas sans signal → `null`.
   - `formatAdresse` : « 234 » + « Rue du Pré » → « 234 Rue du Pré » ; espaces/casse tolérés.
   - `positionParNumero` : numéro dans une grille → bonne structure/niveau ; numéro en double → **première** position ; numéro absent → `null`.
   - `hrefEcrire` : encodage des `?`/`&`/accents dans sujet/corps ; la signature du comité présente.
2. **`grille.js`** exports ajoutés (dans `grille.test.mjs` ou un fichier dédié) : `dateLisible` (valide/invalide/vide → Date|null) ; `chercherMembre` (appariement par clé insensible à la casse ; absent → undefined).

**Prior art :**
- Module frontend dual-export testé en node : `site/client.js` + `tests/client.test.mjs`.
- Dérivations pures de grille.js testées par faits fabriqués : `grille.test.mjs`, `fiche.test.mjs`, `a-traiter.test.mjs`.
- Non testé (comme aujourd'hui) : le rendu DOM des pages reste couvert par la boucle de captures (`npm run screenshots`, delta nul attendu).

## Traçabilité exigence → tranche

Tranches anticipées (finalisées en `/to-issues`) — rien n'est reporté « invisiblement » :

| Exigence (stories) | Tranche anticipée |
|---|---|
| 11 — exposer `dateLisible`, `chercherMembre` (grille.js) | T1 (prefactor, débloque le reste) |
| 1, 6 — `apparenceStatut` + migrer les 4 tables d'apparence (+ légende) | T2 |
| 2, 7 — `proseSignal` + migrer les 2 blocs de prose | T3 |
| 3, 4, 8, 9 — `formatAdresse`, `positionParNumero`, usage `chercherMembre` + migrer | T4 |
| 5, 10 — `hrefEcrire` + migrer les 3 mailto | T5 |
| 12–15 (seam, tests, captures, CSS) | transverses à chaque tranche |

## Out of Scope

- Candidat 04 (découper `grille.js`), 05 (interface de la fiche), 06 (backend) — PRD séparés.
- Déplacer `.statut-{code}` de `theme.css` vers JS (le CSS déclaratif reste).
- Toute évolution des faits eux-mêmes (`statutEmplacement`, `serieLibreObservee`, `fenetreApparition`) : la présentation les consomme, ne les change pas.
- Introduire un bundler / des modules ES (contredirait 0004).
- Changer une couleur, une icône, une phrase ou un mailto existant — la sortie doit être identique au pixel et au caractère.

## Further Notes

- Le module fixe le précédent « présentation frontend = module séparé lisant les faits du domaine », complément de « transport = client.js ».
- Séquence de migration sûre (une tranche = un `npm run verify` vert) : T1 expose les utils ; T2–T5 introduisent chaque fonction de présentation **puis** migrent ses sites d'appel, en supprimant les copies mortes au fur et à mesure. Chaque tranche garde l'app fonctionnelle et la baseline visuelle intacte.
- Point d'attention captures : `structures.html`/`a-traiter.html` chargent un nouveau `<script src="presentation.js">` — vérifier l'ordre (après `grille.js`, avant les fiches) ; la même URL est tapée, la route mock Playwright ne bouge pas.
