# Gabarits de courriel éditables — carte wayfinder

Label: wayfinder:map

## Destination

Un PRD « gabarits de courriel éditables » validé et prêt pour `/to-issues`, les décisions UX verrouillées — notamment le modèle d'édition des variables pour un public aîné.

## Notes

- Public majoritairement aîné : typographie généreuse, cibles larges, langage simple et rassurant (CLAUDE.md). Tout nom d'entité visible vient de CONTEXT.md.
- Décision 0003 : l'app n'envoie JAMAIS de courriel — mailto pré-rempli, relu dans l'aperçu partagé (`site/blocs-fiche.js:226`), envoyé depuis le client mail du membre.
- Décision 0002 : la Sheet reste éditable à la main — toujours relire l'état frais, valider à la lecture, tolérer l'illisible.
- Décision 0008 : mot de passe partagé du comité, envoyé en corps de requête.
- État des lieux : deux courriels préparés existent — relance « emplacement libre » (`site/fiche.js:242`) et relance « hors quota » (`site/fiche-adresse.js:287`). Les deux contiennent des variables inline ET des phrases conditionnelles (date « libre depuis… », règle quota 2 vs exception, pluriels calculés). Les autres `mailto:` du site sont de simples liens de contact sans gabarit.
- Skills à consulter par les sessions : `/grilling`, `/domain-modeling`, `/prototype` (ticket central), webawesome-design (principles.md + composition.md) et `docs/design.md` avant tout markup.

## Decisions so far

- [01 — Périmètre](issues/01-perimetre.md) — gabarits durables des courriels gérés par l'app ; le comité ajuste ton et formulation ; pas de composition libre.
- [02 — Stockage](issues/02-stockage.md) — onglet `Gabarits` dédié (`id`, `sujet`, `corps`) créé par `setup()` ; l'app est la seule surface d'édition, jamais le Sheet.
- [03 — Modèle d'édition des variables](issues/03-modele-edition-variables.md) — piste C : les informations sont des puces insécables dans le texte libre (objet inclus) ; stocké en texte à jetons `{…}` ; conditionnelles = jetons optionnels/calculés ; prototype `site/gabarits-prototype.html`.

## Not yet specified

(rien pour l'instant — le seed des textes actuels a gradué dans [05 — Défauts et réinitialisation](issues/05-defauts-reinitialisation.md) : sa forme, texte à jetons, est fixée par la décision 03.)

## Out of scope

- Composition libre de nouveaux courriels par le comité — puits de complexité (découverte des données disponibles par contexte) ; un cas concret devra le forcer, comme effort séparé.
- Les futurs courriels eux-mêmes (ex. : confirmation d'attribution via une demande) — ils arrivent avec leurs fonctionnalités ; ce map ne livre que le mécanisme et son registre.
- Tout envoi automatique de courriel — interdit par la décision 0003 ; on reste en mailto relu.
