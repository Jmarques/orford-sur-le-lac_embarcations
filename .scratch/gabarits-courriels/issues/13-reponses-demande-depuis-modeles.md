# 13 — Les réponses à une demande se composent depuis des modèles

**What to build:** les deux courriels de réponse à une [[Demande]] — acceptation et refus — comme [[Modèle de courriel]] configurables, avec leur flot (décision 0025, grilling 2026-07-11). Le refus est une RÉGRESSION à réparer : l'ancienne fiche-demande offrait « Écrire au membre » après un refus (mailto avec la raison), perdu au commit 54b4625 (décision 0024) ; l'acceptation n'a jamais existé (« futur courriel » au PRD).

**Flot (a + c de 0025) :**
- **a)** « Attribuer le n° X et accepter » ou « Refuser la demande » (fiche d'adresse) réussit → l'aperçu « Courriel pré-rédigé » s'ouvre aussitôt par-dessus la fiche, composé du bon modèle. Rien ne part jamais tout seul (0003) ; l'aperçu se referme d'un tap.
- **c)** Filet durable : « Écrire au membre » dans le dépliable d'une demande décidée (« Déjà décidées », page À traiter), pour les DEUX issues — même aperçu, raison relue au Journal, numéro attribué relu à la ligne.

**Modèles (registre serveur + UI, mécanique des tickets 09-12) :**
- `reponseRefus` — libellé « Réponse — demande refusée ». Texte d'origine = l'ancien texte de fiche-demande verbatim (`git show 54b4625~1:site/fiche-demande.js`, `hrefEcrire`) : objet « Votre demande d'emplacement — Orford sur le Lac » ; corps « Bonjour {nom}, / Nous avons bien reçu votre demande d'emplacement pour un(e) {type d'embarcation} à l'adresse {adresse}. / Nous ne pouvons malheureusement pas y donner suite pour l'instant : {raison} / N'hésitez pas à nous écrire si vous avez des questions. / Le comité administratif — Orford sur le Lac ». `{raison}` requise, valeur = la raison saisie au refus (ou relue au Journal pour le filet c) avec ponctuation finale calculée DANS la valeur (point ajouté si absent), jamais une syntaxe dans le modèle.
- `reponseAcceptation` — libellé « Réponse — demande acceptée ». Texte d'origine (rédigé au grilling) : objet « Votre emplacement {numéro} — Orford sur le Lac » ; corps « Bonjour {nom}, / Bonne nouvelle : votre demande d'emplacement est acceptée. L'emplacement {numéro} est attribué à votre adresse ({adresse}) pour votre {type d'embarcation}. / Vous pouvez l'utiliser dès maintenant. Si quelque chose ne convient pas, dites-le-nous. / Merci, / Le comité administratif — Orford sur le Lac ». PAS de position : les ids de structure sont internes au comité, les numéros sont marqués sur le terrain (CONTEXT.md).
- Valeurs figées de la demande (`{nom}`, `{adresse}`, `{type d'embarcation}`) ; destinataire = **courriel figé de la demande** (pas la ligne Membres). `{numéro}` = le numéro attribué (du geste, ou `numeroAttribue` pour le filet).
- Seed `setup()`, repli silencieux ligne/défaut, page « Modèles de courriels » les liste automatiquement, lien « Modifier le modèle de ce courriel » hérité de l'aperçu (ticket 12).

**Hors périmètre (décision 0025)** : bouton « copier » (mailto suffit ~90 % — revisiter à la contrainte PII) ; second bouton « modifier le modèle » ; toute surface dans la fiche d'adresse APRÈS le geste (l'état dérivé 0020 ne retient pas une demande décidée).

Démo : refuser une demande avec une raison → l'aperçu s'ouvre, la raison est dans le corps ; accepter → l'aperçu annonce le numéro ; rouvrir « Déjà décidées » plus tard → « Écrire au membre » recompose le même courriel ; personnaliser les modèles dans la page « Modèles de courriels » → les réponses suivantes changent.

**Blocked by:** None — can start immediately (mécanique 09-12 en place).

**Status:** ready-for-agent

- [ ] `reponseRefus` et `reponseAcceptation` au registre serveur (textes d'origine ci-dessus) + registre UI (libellés, jetons, exemples nommés pour l'aperçu de la page Modèles) ; semés par `setup()`
- [ ] Valeurs pures testées au seam exports : ponctuation de `{raison}` calculée (avec/sans point final), valeurs figées de la demande ; pins du rendu par défaut
- [ ] Fiche d'adresse : accepter/refuser réussi → aperçu ouvert composé du bon modèle, destinataire = courriel de la demande (l'aperçu par-dessus la fiche restée ouverte — 0018)
- [ ] « Déjà décidées » (À traiter) : « Écrire au membre » dans le dépliable, deux issues, raison relue au Journal et numéro à la ligne
- [ ] Scénarios de captures : aperçu post-refus, aperçu post-acceptation, bouton du dépliable (desktop + mobile) ; console propre
- [ ] `npm run verify` passe ; revue subagent du delta faite ; captures committées
