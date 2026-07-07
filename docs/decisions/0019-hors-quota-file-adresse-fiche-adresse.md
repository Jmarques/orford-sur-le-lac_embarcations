# 0019 — Hors quota : file par adresse en tête d'À traiter, fiche d'adresse, quota accordé, notes d'adresse

Date: 2026-07-06
Status: Accepted

## Context
La décision 0014 avait reporté nommé le traitement du quota (« 2 emplacements par adresse », non bloquant) comme future section de la page À traiter, clé adresse — avec un trade-off assumé : le Journal étant keyé par `numero`, une note de quota devrait s'accrocher à un emplacement précis. En construisant la vue, ce trade-off ne tient plus : une note comme « toléré à 3 tant que la liste d'attente est vide » ne parle d'aucun emplacement. S'y ajoutent les exceptions historiques (adresses à 3–4 emplacements acceptées de longue date) : avec une règle nue « > 2 », elles seraient des résidentes permanentes de la file — un badge qui ne peut jamais tomber à zéro est un badge qu'on apprend à ignorer. Enfin la dérivation repose sur l'égalité de texte des adresses dans une Sheet éditée à la main (0002) : une différence de casse éclaterait une adresse en deux groupes et masquerait un vrai cas.

## Decision
La page À traiter gagne une section « **Hors quota** » — en **première position** (question d'équité envers les membres qui attendent une place, pas seulement de rangement) — dont les cas sont des **adresses**, dérivées et jamais stockées : cas hors quota = attributions de l'adresse > **quota accordé** (`quotaAccorde`, colonne optionnelle de l'onglet Membres, éditée à la main en v1 ; défaut 2). La file se vide par libération, et une adresse re-rentre si elle dépasse son exception. Rangée du registre : adresse + membre + pastille libellée « N emplacements », pastille de section **neutre** (le quota est une règle de gestion, ni urgence ni anomalie de terrain), tri par dépassement décroissant. Toucher un cas ouvre une **fiche d'adresse** (même patron que la fiche d'emplacement 0018) : en-tête adresse + membre + contact + fait justifiant le cas, liste des emplacements de l'adresse **avec leur statut** (toucher l'un ouvre sa fiche d'emplacement dans le même drawer, retour vers la fiche d'adresse), journal du cas (notes d'adresse + libérations de ses emplacements), ajout de note, `mailto:` pré-rempli. Les **notes d'adresse** vivent dans le même Journal via une colonne optionnelle `adresse` (« numeroAdresse rue », 0012) — l'action `note` accepte `numero` ou `adresse`, exactement l'un des deux ; ceci **amende le trade-off de 0014**. L'appariement des adresses (regroupement quota et `chercherMembre`) passe par une clé normalisée partagée (trim + minuscules + espaces réduits) ; l'affichage garde le texte de la ligne. La **grille des Structures ne marque pas** le hors quota (fait d'adresse, pas de terrain ; le pointillé appartient à « En double ») ; la **fiche d'emplacement** montre une pastille « N emplacements à cette adresse » seulement quand l'adresse dépasse son quota. Le bouton « Écrire au membre » des deux fiches devient explicite : ligne d'aide « un courriel déjà rédigé s'ouvrira dans votre messagerie — relisez-le et ajustez-le avant de l'envoyer ».

## Alternatives rejected
- **Laisser les exceptions historiques dans la file** avec une note explicative — bruit permanent, badge jamais vide, section morte par accoutumance.
- **Un état structuré « exception » masquant le cas sans donnée** — le quota accordé n'est pas un état de workflow (rejetés par 0014) mais une décision durable du comité, du même ordre qu'une attribution ; il vit donc comme un fait éditable dans la Sheet.
- **Rangée dépliable listant les emplacements** au lieu d'une fiche d'adresse — dossier éclaté, et le registre doit rester des rangées compactes (jamais N cartes dépliées).
- **Accrocher la note de quota à un emplacement de l'adresse** (trade-off initial de 0014) — arbitraire, et la note devient orpheline si c'est justement cet emplacement qu'on libère.
- **Dupliquer la note sur chaque emplacement** — bruit ×3, incohérent après libération.
- **Rapprochement flou des adresses** (fautes de frappe, abréviations) — pourrait fusionner deux adresses distinctes, pire que l'éclatement ; la normalisation reste prudente (casse et espaces).
- **Marquer le hors quota dans la grille des Structures** (pointillé ou autre) — mauvaise clé (fait d'adresse aspergé sur 3 cellules, 0016), et le pointillé signifie déjà « En double ».
- **Dédoublonner entre sections** (un emplacement « Attribué, libre » d'une adresse hors quota apparaît deux fois : lui dans sa file, son adresse dans Hors quota) — chaque file dit la vérité de sa clé ; masquer l'une ferait mentir l'autre.

## Trade-offs accepted
- Le quota accordé se gère à la main dans la Sheet (aucun geste in-app) — cohérent avec l'attribution, mais invisible dans le journal du cas.
- La navigation fiche d'adresse ↔ fiche d'emplacement remplace le contenu du même drawer (bouton retour) — pas d'empilement, au prix d'un aller-retour.
- Depuis la grille des Structures, la pastille quota de la fiche d'emplacement n'offre aucune navigation vers la fiche d'adresse en v1.
- La double présence entre sections peut surprendre au premier regard — la fiche d'adresse fait le lien en montrant le statut de chaque emplacement.

## Revisit when
- Le comité veut éditer le texte des courriels — modèles (sujet/corps) dans l'onglet Config, le `mailto:` reste (reporté nommé, distinct de l'envoi in-app rejeté par 0014).
- Le comité veut accorder ou retirer une exception depuis l'app — geste in-app journalisé sur `quotaAccorde`.
- L'usage réclame d'ouvrir le dossier d'adresse depuis la grille des Structures — navigation fiche d'emplacement → fiche d'adresse.
- Les adresses réelles divergent au-delà de la casse et des espaces (abréviations de rues) — liste fermée des rues appliquée aussi côté données.
