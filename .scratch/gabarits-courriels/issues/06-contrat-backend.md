# 06 — Contrat backend

Type: grilling
Status: open
Blocked by: 03

## Question

Quelles actions Apps Script, avec quel contrat ?

- Lecture des gabarits : dans quelle action (l'action de chargement existante ? une action dédiée ?).
- Écriture d'un gabarit : mot de passe en corps (0008), enveloppe normalisée (`site/client.js`), maj par clé (`majLigneParCle_`).
- Validation d'un gabarit soumis : placeholders inconnus tolérés ou rejetés ? sujet/corps vides ?
- Concurrence : dernier écrit gagne (simple) — suffisant ?

Dépend du format stocké décidé en [03 — Modèle d'édition des variables](03-modele-edition-variables.md).
