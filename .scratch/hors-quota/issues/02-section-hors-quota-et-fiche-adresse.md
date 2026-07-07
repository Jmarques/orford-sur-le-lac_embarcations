# 02 — Section « Hors quota » en tête d'À traiter + fiche d'adresse + note d'adresse

Status: ready-for-agent

## Parent

`.scratch/hors-quota/PRD.md` — PRD « Section Hors quota : file par adresse, fiche d'adresse, notes d'adresse » (décision 0019).

## What to build

La première tranche visible — contrat de données complet dès cette tranche (écriture de note d'adresse incluse).

**Le registre** : la page À traiter gagne une section « Hors quota » en **première position** (équité envers les membres qui attendent, 0019), avec sa description en français simple (« Des adresses qui ont plus d'emplacements que le quota n'en permet. »), sa pastille de compte **neutre** (règle de gestion, ni urgence ni anomalie), son état vide calme (« Aucune adresse hors quota. ») et ses rangées compactes : adresse en foyer principal, membre en discret, pastille libellée « N emplacements » (jamais de nombre nu, 0016). Tri par dépassement décroissant (dérivation de l'issue 01). La double présence est assumée : un emplacement « Attribué, libre » d'une adresse hors quota reste dans sa section pendant que l'adresse apparaît ici — aucun dédoublonnage.

**La fiche d'adresse** (même patron que la fiche d'emplacement — dialog desktop / drawer bas mobile, 0018) :

- En-tête : adresse, membre avec téléphone et courriel en liens actifs (recherche du membre alignée sur la clé d'adresse normalisée de l'issue 01 — aujourd'hui la casse fait rater un membre), et le fait qui justifie le cas : « 3 emplacements — le quota est de 2 » ou « … — exception accordée à 3 ». Adresse sans ligne Membres : la fiche le dit calmement (patron existant).
- Les emplacements de l'adresse, avec la pastille de statut de chacun — toucher une rangée **remplace le contenu du même drawer** par la fiche d'emplacement, avec bouton retour vers la fiche d'adresse (mise à jour au retour). Jamais deux drawers empilés.
- Le journal du cas (notes d'adresse + libérations des emplacements, chronologique), le champ « Ajouter une note » (texte libre, anti-XSS, signature libre dans le texte), et « Écrire au membre » : `mailto:` pré-rempli listant les numéros attribués à l'adresse et rappelant la règle — ton factuel et rassurant, jamais « fautif » ; le membre du comité édite avant envoi (0003 par construction).
- Pas de geste « Libérer » au niveau adresse — libérer appartient à la fiche d'emplacement (0018).

**Le serveur** : l'action `note` accepte `numero` **ou** `adresse` — exactement l'un des deux, texte requis, validation aux frontières — et appende l'événement au Journal avec la colonne `adresse` (0012). La libération ne change pas.

Processus UX obligatoire (CLAUDE.md) : design brief avant tout markup, principles + composition du skill webawesome-design, polish checklist, revue ui-critic en lecture seule sur les captures fraîches du delta (0017). Redéploiement backend requis pour le vrai site ; la page signale en console un contrat de lecture incomplet (patron existant `journal`/`membres`).

Vocabulaire : CONTEXT.md ([[Hors quota]], [[Fiche d'adresse]], [[Note (au journal)]], [[Membre]]) — jamais « en infraction », « fautif », « dossier » comme terme UI.

## Acceptance criteria

- [ ] Section « Hors quota » en première position : rangées triées, pastille de compte neutre, état vide calme, description en français simple.
- [ ] La fiche d'adresse s'ouvre au tap : en-tête complet (adresse, membre, contact, fait justifiant le cas — quota par défaut et exception accordée), emplacements avec statut, journal du cas, note, `mailto:`.
- [ ] La navigation fiche d'adresse → fiche d'emplacement → retour fonctionne dans le même drawer, fiche d'adresse mise à jour au retour (une libération qui referme le cas fait sortir l'adresse du registre à la fermeture).
- [ ] Ajout de note d'adresse bout en bout : action serveur `note` étendue (adresse acceptée, numéro + adresse à la fois refusé, aucune clé refusée, texte vide refusé, en-têtes réordonnés — prior art `tests/traitement.test.mjs`), événement Journal correct, note visible dans le journal du cas sans fermer la fiche.
- [ ] La recherche du membre (fiches et registre) passe par la clé d'adresse normalisée.
- [ ] Captures mockées multi-états via `?etat=` : section vide, section peuplée (tri visible), fiche d'adresse ouverte, fiche avec exception dépassée, note en erreur ; console error/warning + pageerror font échouer la boucle (0006/0017).
- [ ] Flux complet piloté au navigateur avant livraison ; `npm run verify` vert ; captures du delta revues par un subagent lecture seule, PNG committés avec le code.

## Blocked by

- `.scratch/hors-quota/issues/01-derivations-hors-quota-et-lecture.md`
