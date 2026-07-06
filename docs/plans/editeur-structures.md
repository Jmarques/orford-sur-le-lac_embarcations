# Éditeur de structures — design et plan d'implémentation

Statut : T1, T2 et T3 livrées et revues ui-critic (2026-07-05) ; tranches 4–5 = phase 2. Reste côté Jeremy : `npm run deploy` + migration manuelle de la Sheet (voir plus bas).
Décisions cadres : 0009 (grille source de vérité, format, sauvegarde permissive, sync), 0002 (Sheet éditable à la main), 0004 (Web Awesome sans build), 0006 (captures multi-états), 0008 (auth comité).
Vocabulaire : CONTEXT.md (grille d'emplacements, saisie, structure, niveau, occupation observée).

## Pourquoi (pivot)

L'import photo (`tmp/structure.json` → seed) a produit trop de données erronées. Les grilles manuscrites de l'onglet Structures (colonne `emplacements`) deviennent la source de vérité de « quel numéro est dans quelle structure, à quel niveau ». On construit `site/structures.html` (page comité) pour visualiser ces grilles, corriger les invalides, et plus tard pointer l'occupation observée sur le terrain.

## User stories

- **Membre du comité, au bureau** : je vois toutes les structures avec leurs grilles ; les structures invalides sont signalées avec des erreurs en clair ; je corrige le champ `emplacements` avec un aperçu live et je sauvegarde même si tout n'est pas encore réglé.
- **Membre du comité, sur la plage (phase 2)** : téléphone en main devant une structure, je marque en un clic qu'un emplacement est occupé ou libre ; je touche un emplacement pour voir l'adresse attribuée.

## Schéma (source de vérité : la Sheet)

**Structures** — `id, type, embarcations, saisie, emplacements, notes` (l'ordre réel de la Sheet de Jeremy, `saisie` déjà ajoutée à la main en colonne D ; seule `notes` s'ajoute en queue).
- `type` : `horizontal` (embarcations couchées, niveaux) | `vertical` (debout, sans niveaux).
- `saisie` : `niveaux` (chaque array = un niveau, premier = le plus haut) | `colonnes` (chaque array = une colonne, premier élément = côté niveau le plus haut). Vide → `niveaux` si horizontal, `colonnes` si vertical (= zéro migration des données actuelles).
- `embarcations` : liste à virgules, valeurs attendues dans les `type` de Config (inconnue = avertissement).
- `emplacements` : la grille, format ci-dessous.

**Emplacements** — `numero, rue, numeroAdresse, nom, note, occupationObservee, numeroInfere, sourceObservation`. Les colonnes `structure` et `niveau` disparaissent (dérivées de la grille à la lecture).

## Format de la grille (grammaire et normalisation)

- Deux niveaux d'imbrication exactement : `[ [a..b, n, m], [c..d], … ]`.
- Élément : entier positif, ou plage `a..b` bornes incluses, ascendante (`13..27`) ou descendante (`167..160`).
- Parseur tolérant : espaces libres, virgule traînante acceptée. Crochets déséquilibrés, élément non numérique, plage malformée → erreur de parse (message en français nommant le fragment fautif).
- Normalisation (à la sauvegarde) : `[[13..27], [28..42]]` — espaces après virgules, plages pour toute suite consécutive (asc. ou desc.) de 3 numéros ou plus.

## Validations (module unique)

| Règle | Sévérité |
| --- | --- |
| Texte non parsable | erreur (grille non affichable → fallback texte seul) |
| Numéro en double dans la même structure | erreur |
| Numéro présent dans deux structures (le doublon apparaît marqué dans **chaque** grille, aucune ne « gagne ») | erreur |
| Arrays de longueurs différentes (la grille est régulière) | erreur |
| `type` hors {horizontal, vertical}, `saisie` hors {niveaux, colonnes, vide}, embarcation hors Config | avertissement |

Sauvegarde **toujours permise** (0009) : les problèmes restent affichés après coup et la liste badge les structures invalides. Toute lecture (page, API, futurs consommateurs) tolère l'invalide et le signale — jamais de plantage (0002).

## Dérivation (même module)

`deriverEmplacements(structures)` → pour chaque numéro : `{ numero, structure, niveau, ligne, colonne }`. La grille est d'abord orientée en matrice ligne-par-ligne (transposée si `saisie=colonnes`), ligne 0 = niveau le plus haut. `niveau` (1 = le plus bas) n'existe que pour `type=horizontal` ; vide sinon. Les doublons inter-structures sortent dans une liste de conflits, pas en exception.

## Foyer du code : `apps-script/grille.js` + copie `site/grille.js`

Le parseur/validateur/dérivateur est un module pur unique (pattern `admin.js` : `var` + `module.exports`), utilisé par les tests node, par Apps Script (sauvegarde) et par le navigateur (aperçu live). Sans build (0004), le navigateur ne peut pas charger `apps-script/` : un script npm copie le fichier vers `site/grille.js` (en-tête « GÉNÉRÉ — ne pas éditer ») et un test échoue si les deux copies divergent.

## Contrat API (Code.js, auth 0008)

- `inventaire` (existant, inchangé dans l'esprit) : renvoie les lignes brutes fraîches des deux onglets ; le client parse/valide/dérive avec `grille.js` (cohérent 0004 : logique de présentation côté client).
- `sauverStructure` (nouveau, POST + mot de passe) : `{ id, type, saisie, embarcations, emplacements, notes }` → normalise le texte si parsable (sinon l'enregistre tel quel), réécrit la ligne Structures par `id` (id inconnu = erreur ; créer une structure se fait à la main dans la Sheet), **crée** les lignes Emplacements manquantes (colonnes comité vides), n'en **supprime jamais** (numéro orphelin = signalé), consigne une ligne Journal (`action: 'structure'`, détails : id + compte d'emplacements). Renvoie la structure sauvée + ses problèmes résiduels.

## Page `site/structures.html`

Derrière le mot de passe du comité (même mécanique et `sessionStorage` qu'admin.html) ; navigation réciproque Demandes ↔ Structures dans l'en-tête des deux pages. États : connexion, mdp refusé, chargement, erreur, vide, liste. La liste = une carte par structure : id, type, saisie, embarcations, notes, grille rendue (cellules = numéros, niveaux étiquetés pour les horizontales), badges/callouts de problèmes. Édition par structure : champ texte `emplacements` + champs type/saisie/embarcations/notes (contrat de données complet dès la première tranche du formulaire), aperçu live de la grille, erreurs recalculées à la frappe (y compris doublons contre les autres structures), sauvegarde avec états en-cours/succès/échec. Process UX obligatoire (CLAUDE.md) : brief avant markup, checklist composition, captures de tous les états (`?etat=`), revue `ui-critic` sur rendu — la boucle screenshots échoue sur toute erreur/warning console.

## Exigence → tranche

| # | Exigence | Tranche |
| --- | --- | --- |
| 1 | Parse/normalisation/validation/dérivation du format manuscrit (module pur testé) | 1 |
| 2 | Abandon du seed photo (fichiers, fonction, script npm, tests) + nouveau schéma des onglets | 1 |
| 3 | Migration de la Sheet réelle documentée, sans toucher aux grilles manuscrites | 1 |
| 4 | Voir toutes les structures et leurs grilles (niveaux, numéros), auth comité, navigation | 2 |
| 5 | Signalement visible des données invalides (parse, doublons inter-structures, grille irrégulière) | 2 |
| 6 | Éditer `emplacements` (+ type/saisie/embarcations/notes) au texte avec aperçu live | 3 |
| 7 | Sauvegarde toujours permise, normalisation, création des lignes manquantes, Journal | 3 |
| 6b | `embarcations` = cases à cocher des types de Config (valeurs propres pour le futur appariement demande → emplacement), pas de texte libre | 3 |
| 8 | Occupation observée en un clic sur un emplacement (terrain, mobile) | 4 (phase 2) |
| 9 | Toucher un emplacement → adresse attribuée | 5 (phase 2) |

Rien n'est « invisible parce que reporté » : 8 et 9 sont des tranches nommées, pas des promesses.

## Tranches (tracer bullets — mode tracer, TDD /pragmatic:build)

**T1 — Pivot données.** `apps-script/grille.js` en TDD (parse, normalise, valide, dérive — les données réelles de la Sheet servent de fixtures, S02/S06/S08 couvrent les cas invalides et plages descendantes) ; `ENTETES_STRUCTURES`/`ENTETES_EMPLACEMENTS` mis à jour ; suppression de `seed-donnees.js`, `seedInventaire()`, `fusionnerEmplacements`, `tools/inventaire.mjs`, `tools/seed-inventaire.mjs`, `tests/seed.test.mjs`, `tmp/structure.json`, script npm `seed`. Migration manuelle documentée ci-dessous. ✅ `npm test` vert.

**T2 — Lecture bout-en-bout.** `site/structures.html` en lecture : auth, tous les états, cartes-structures avec grilles rendues et problèmes affichés ; copie `site/grille.js` + script npm + test d'identité ; navigation dans admin.html ; mocks `inventaire` (incluant une structure invalide réaliste) et captures desktop+mobile de chaque état. ✅ `npm run verify` vert + revue ui-critic.

**T3 — Édition et sauvegarde.** ✅ Livrée. Formulaire complet par carte (bouton « Modifier », une seule carte éditée à la fois) : `type`/`saisie` (wa-select), `embarcations` (wa-checkbox-group alimenté par les types de Config — valeurs propres pour le futur appariement, une valeur hors Config reste cochée « (inconnue de la Config) »), `emplacements` (wa-textarea, aperçu live avec grille + problèmes recalculés à la frappe, conflits inter-structures compris), `notes`. `apps-script/structures.js` (`preparerSauvegardeStructure`, testé) + action API `sauverStructure` : normalise si parsable, écrit la ligne par id (id inconnu = crash nommé), crée les lignes Emplacements manquantes sans jamais supprimer, journalise. Sauvegarde toujours permise (0009). États : bouton `loading`+`disabled` (pas de double envoi), callout d'erreur près des boutons + `scrollIntoView`, callout succès après rechargement frais, focus rendu à la carte. Garde d'abandon (wa-dialog de confirmation) avant de jeter des modifications non enregistrées. ✅ `npm run verify` (50 tests, 44 captures console propre) + revue ui-critic (verdict initial « à retravailler » → 6 points bloquants/importants corrigés) + flux sauvegarde ET garde d'abandon vérifiés au navigateur piloté (POST correct, dialogue modal confirmé, focus correct). Note : le wa-dialog n'est pas dans les captures automatiques — un `<dialog>` en top layer ne se rend pas fidèlement en capture Playwright ; vérifié en pilotage à la place.

**T4 (phase 2) — Occupation observée en un clic.** Action API dédiée (écrit `occupationObservee` + `sourceObservation`, Journal) ; bascule occupé/libre/inconnu au toucher sur la grille, pensée mobile. ✅ verify + ui-critic.

**T5 (phase 2) — Vers l'adresse attribuée.** La grille marque les emplacements attribués ; toucher un emplacement ouvre ses informations (adresse, nom, note, observation). ✅ verify + ui-critic.

## Migration manuelle de la Sheet (avec T1, faite par Jeremy)

1. **Structures** : ne rien déplacer — `saisie` est déjà en colonne D (fait le 2026-07-05). `setup()` ajoute seulement l'en-tête `notes` en colonne F.
2. **Emplacements** : supprimer **toutes les lignes de données** (seed photo erroné ; les colonnes comité sont encore vides — rien à perdre) puis les colonnes en trop après H. `setup()` réaligne les en-têtes. Les lignes renaîtront aux sauvegardes de l'éditeur.

## Risques assumés

- Parseur maison à maintenir (au lieu de `JSON.parse`) — prix du format lisible/éditable à la main (0009).
- Copie committée `site/grille.js` — dérive possible, contenue par le test d'identité.
- Entre deux corrections, la Sheet peut être invalide ; tout consommateur doit signaler sans planter (0002/0009).
- `niveau` n'est plus une colonne : tout futur consommateur passe par `deriverEmplacements`.
