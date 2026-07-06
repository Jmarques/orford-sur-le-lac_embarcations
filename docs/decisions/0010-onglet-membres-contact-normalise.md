# 0010 — Onglet Membres : le contact d'une adresse est normalisé hors d'Emplacements ; schéma d'observation finalisé pour T4/T5

Date: 2026-07-05
Status: Accepted (révise 0007 sur les colonnes d'Emplacements ; précise 0002)

## Context
Depuis 0009, la grille de Structures est la source de vérité de la géographie ; l'onglet Emplacements ne porte plus que l'attribution (numeroAdresse + rue), l'observation, et une colonne `nom`. Deux problèmes en préparant T4 (occupation observée en un clic) et T5 (toucher un emplacement → voir le membre attribué) : (1) le `nom` est recopié sur chaque emplacement d'une même adresse — une adresse peut en avoir 2+ (quota) — donc duppliqué et divergeable ; (2) `numeroInfere` et `sourceObservation` étaient spécifiques au relevé photo abandonné en 0009. Le glossaire distingue déjà l'**adresse** (l'identité, la clé) de la personne.

## Decision
Un nouvel onglet **Membres** détient le contact courant d'une adresse : `numeroAdresse, rue, nom, courriel, telephone`, **une seule ligne par adresse** (clé = numeroAdresse + rue), même si plusieurs personnes du foyer ont demandé. Il est la **source de vérité du contact** ; l'onglet Demandes reste un journal historique (contact figé au moment de la demande) auquel on ne touche pas. La colonne `nom` quitte Emplacements (dérivée de l'adresse via Membres à la lecture). L'observation passe du modèle photo au modèle terrain : `numeroInfere` et `sourceObservation` sont supprimées, `dateObservation` est ajoutée. **Emplacements final : `numero, numeroAdresse, rue, note, occupationObservee, dateObservation`.** T4 n'écrit que dans Emplacements (occupationObservee + dateObservation) ; seul T5 lit Membres. Dans cette manche, Membres est saisi à la main dans la Sheet (comme les attributions, 0002/0007) et T5 est en lecture seule ; l'éditeur de Membres et le flux « mettre à jour le contact depuis une demande acceptée, avec validation du comité » sont une manche séparée avec son propre grill/design.

## Alternatives rejected
- Garder `nom` dénormalisé sur Emplacements — recopié sur chaque emplacement d'une adresse, deux endroits à corriger, divergence garantie à terme.
- Une ligne Membres par personne (plutôt que par adresse) — fidèle au « plusieurs personnes par adresse » du glossaire, mais impose de choisir quel contact afficher pour un emplacement et alourdit la saisie manuelle ; un contact principal par adresse suffit pour joindre quelqu'un.
- Dériver le contact de la demande acceptée la plus récente (pas d'onglet Membres) — un téléphone qui change après coup n'est jamais à jour, et une adresse attribuée sans demande (cas historiques) n'aurait pas de contact.
- Fusionner Demandes et Membres en un onglet — mélange l'historique des demandes et l'état courant du contact, contraire à la séparation demande/attribution du glossaire.
- Garder numeroInfere/sourceObservation — inertes sans relevé photo ; sourceObservation n'a aucun sens avec un clic manuel.
- Construire l'éditeur de Membres et la mise à jour depuis une demande dès maintenant — élargit T5 et mélange lecture et édition ; Jeremy veut concevoir soigneusement l'UX de la mise à jour du contact, qui mérite sa propre manche.

## Trade-offs accepted
- Pour lire un nom en éditant Emplacements à la main, le comité regarde désormais deux onglets — la friction « deux onglets » que 0002 voulait éviter, ici acceptée pour le nom (pas pour l'attribution, qui reste sur la ligne d'emplacement conformément à 0002).
- Toute lecture affichant un nom fait une jointure Emplacements→Membres sur (numeroAdresse + rue) ; une adresse attribuée sans ligne Membres affiche « contact non renseigné » plutôt que de planter (0002).
- `dateObservation` doit être renseignée par l'action T4 sinon l'ancienneté de l'occupation est inconnue.
- Le contact du foyer est réduit à une personne : les co-demandeurs ne vivent que dans le journal Demandes.

## Revisit when
- Le comité a besoin de joindre plusieurs personnes distinctes pour une même adresse assez souvent pour que « un contact par adresse » gêne — passer à une ligne par personne.
- Les incohérences entre l'attribution (Emplacements) et le contact (Membres) surviennent plus d'une fois par saison — envisager de matérialiser la jointure ou de restreindre l'édition manuelle.
- La manche « éditeur de Membres + mise à jour depuis une demande » démarre — rouvrir pour trancher la provenance canonique et la validation.
