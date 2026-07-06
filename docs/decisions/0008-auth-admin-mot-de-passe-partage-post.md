# 0008 — Auth admin : mot de passe partagé dans Config, transmis en corps POST, vérifié par action

Date: 2026-07-04
Status: Accepted

## Context
Les pages admin (traiter les demandes, inventaire) ne doivent être lisibles que par le comité (~5 bénévoles, public aîné). CONTEXT.md fixe déjà « mot de passe partagé stocké dans la Sheet ». Le frontend est statique sur GitHub Pages (0001) : toute protection réelle doit être côté Apps Script, et les données admin ne doivent pas transiter par des URLs.

## Decision
Un mot de passe partagé unique vit dans l'onglet Config (clé `motDePasseComite`) ; toute action admin — lectures comprises — passe en **POST** avec le mot de passe dans le corps JSON (jamais en paramètre d'URL), vérifié côté Apps Script avant d'agir ; le client le mémorise en `sessionStorage` pour la durée de l'onglet.

## Alternatives rejected
- Mot de passe en query param d'un GET — traînerait dans l'historique navigateur, les logs et les URLs partagées par copier-coller.
- Comptes individuels / OAuth Google — surdimensionné pour ~5 bénévoles ; friction de connexion incompatible avec le public visé.
- Protection purement côté client (page cachée, mot de passe vérifié en JS) — le site est statique et public : les données seraient lisibles par quiconque appelle l'API.

## Trade-offs accepted
- Un secret partagé se partage : aucune traçabilité individuelle (le Journal dira « le comité », pas qui) et révocation = changer le mot de passe pour tout le monde (une cellule dans Config).
- Le mot de passe transite à chaque requête (HTTPS, mais présent dans chaque corps) et dort en clair dans `sessionStorage` et dans la Sheet — acceptable pour des données à faible sensibilité (pas de données de paiement ni de santé).
- Les lectures admin en POST s'écartent de la sémantique REST — prix accepté pour garder le secret hors URL avec le modèle doGet/doPost d'Apps Script.

## Revisit when
- Le comité veut savoir *qui* a fait une action (contestation d'une décision) — passer à un identifiant par membre.
- Le mot de passe fuit ou circule hors comité plus d'une fois — durcir (rotation régulière, voire comptes).
- Des données sensibles entrent dans la Sheet (paiements, infos médicales au-delà du drapeau mobilité réduite).
