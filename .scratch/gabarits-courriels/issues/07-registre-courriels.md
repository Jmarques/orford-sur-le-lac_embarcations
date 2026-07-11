# 07 — Registre des courriels

Type: grilling
Status: resolved

## Question

Comment un futur courriel s'enregistre-t-il, pour que chaque nouvelle fonctionnalité en ajoute un à coût faible ?

- Un registre côté code : `id`, libellé français (glossaire CONTEXT.md), variables disponibles avec leurs libellés, texte par défaut.
- Le contrat développeur : qu'est-ce qu'ajouter un courriel exige (une entrée au registre + une ligne seed ?), et qu'est-ce que l'UI d'édition en dérive automatiquement (palette de variables, aperçu) ?
- Vocabulaire à fixer via `/domain-modeling` : « gabarit » ? « modèle de courriel » ? — terme visible par le comité, donc glossaire.

## Answer

**Une seule vérité par chose — le registre est coupé en deux :**

1. **La vérité des textes vit au serveur** (`apps-script`) : chaque gabarit déclare `id` + sujet/corps par défaut. `inventaire` renvoie par gabarit le texte **effectif** (ligne Sheet, ou défaut en repli) *et* le défaut — « Revenir au texte d'origine » utilise le défaut reçu ; le client ne connaît jamais les textes.
2. **La vérité de l'UI vit au client** (`site/`) : un registre déclare par courriel le libellé français (« Relance — emplacement libre »), les jetons (clé → libellé de puce, requis/optionnel), et au point d'usage la fonction qui fournit les valeurs réelles (rôle actuel de `courrielRelance(...)`). Page « Modèles de courriels », palette et éditeur en dérivent tout.
3. **Contrat développeur** pour un futur courriel : une entrée serveur (id + textes par défaut), une entrée client (libellé + jetons + fonction de valeurs), brancher le bouton d'aperçu. Pas de nouvel écran, pas de nouvelle action.
4. **Vocabulaire acté au glossaire** (CONTEXT.md) : « **Modèle de courriel** » (choisi par Jeremy — le mot de Gmail/Outlook) ; « **information** » est le mot utilisateur pour un jeton ; « gabarit » reste un terme technique interne (onglet `Gabarits`), jamais montré à l'UI.
