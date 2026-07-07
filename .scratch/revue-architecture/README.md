# Revues d'architecture

Rapports produits par `/improve-codebase-architecture` (skill maison). Chaque revue est une photo à un instant T : elle repère la friction architecturale et propose des *deepenings* (plus de comportement derrière une interface plus petite). Ouvrir le `.html` dans un navigateur.

## Revues

- [`revue-2026-07-07.html`](revue-2026-07-07.html) — première revue complète.

### 2026-07-07 — synthèse

Constat de fond : le codebase est déjà bien architecturé. La dérivation métier est centralisée comme le domaine l'exige (statut, état de demande, hors-quota — dérivés une fois dans `grille.js`, exécutés des deux côtés via la copie), `SpreadsheetApp` est 100 % contenu dans `sheets.js`, split pur/impur net (`preparer*` → application). **La friction est ailleurs : la couche qui met les dérivations en mots, en couleurs et en requêtes réseau n'a pas de foyer** — elle existe en 3 à 6 copies.

Six candidats classés :

1. **Strong — module `client backend`** : `poster(action, corps)`. 11 sites `fetch`, `ErreurApi` déclarée 6×, `envoyerAction` copié 3×, enveloppe `ok/erreur/accesRefuse` ré-écrite 5×. Additif, aucun ADR touché, ouvre le 1er module frontend testable en node. **← par où commencer.**
2. **Strong — finir `statutEmplacement`** : le module dérive `{code,libelle,probleme,explication}` mais pas `variant`/`icon` → 4 tables code→apparence (fiche.js, fiche-adresse.js, fiche-demande.js, structures.html+theme.css) + prose des signaux dupliquée 2×.
3. **Strong — exposer les helpers privés** : `dateLisible_`, `chercherMembreParCle_` déjà écrits mais privés ; ajouter `formatAdresse`, `positionParNumero`, `hrefEcrire`. 19 copies → 5 foyers.
4. **Worth exploring — découper `grille.js`** : 31 exports, 7 concerns soudés seulement par « copier 1 fichier ». **Touche les décisions 0004/0009** (pas de bundler) : ne rouvrir que si la navigabilité pèse assez ; le copieur devient un concat.
5. **Worth exploring — resserrer l'interface de la fiche** : contrat `donnees()` implicite (closure sur l'état de page), id DOM en dur, navigation à 3 drapeaux répartie sur 3 fichiers.
6. **Speculative — backend** : paramétrer le prédicat de correspondance de `majLigneParCle_` (dédup avec `upsertMembre_`) ; retirer le spread `inventaire` de `Code.js:31`.

Étape suivante prévue : sur choix d'un candidat, `/grilling` pour dérouler l'arbre de conception.
