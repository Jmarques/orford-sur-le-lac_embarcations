# 06 — Contrat backend

Type: grilling
Status: resolved
Blocked by: 03

## Question

Quelles actions Apps Script, avec quel contrat ?

- Lecture des gabarits : dans quelle action (l'action de chargement existante ? une action dédiée ?).
- Écriture d'un gabarit : mot de passe en corps (0008), enveloppe normalisée (`site/client.js`), maj par clé (`majLigneParCle_`).
- Validation d'un gabarit soumis : placeholders inconnus tolérés ou rejetés ? sujet/corps vides ?
- Concurrence : dernier écrit gagne (simple) — suffisant ?

Dépend du format stocké décidé en [03 — Modèle d'édition des variables](03-modele-edition-variables.md).

## Answer

1. **Lecture : pas de nouvelle action** — les gabarits voyagent dans la réponse d'`inventaire` (déjà chargée par toutes les pages comité). Nécessaire de toute façon : les fiches composeront leurs courriels depuis le modèle (plus de texte en dur dans `fiche.js`/`fiche-adresse.js`). La page « Modèles de courriels » se sert du même chargement.
2. **Écriture : action `majGabarit`** `{ action, motDePasse, id, sujet, corps }` — maj par clé `id` via `majLigneParCle_` (création si absente), renvoi de l'état frais (0002).
3. **Validation minimale** : `id` connu du registre, `sujet`/`corps` non vides, taille plafonnée. Pas de validation des jetons côté serveur — l'éditeur à puces n'en produit pas d'inconnus, la Sheet reste éditable à la main, la lecture tolérante + repli ([05](05-defauts-reinitialisation.md)) protège le rendu.
4. **Concurrence : dernier écrit gagne.**
