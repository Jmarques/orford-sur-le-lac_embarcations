# 0025 — Réponses à une demande depuis les Modèles de courriel

Date: 2026-07-11
Status: Accepted

## Context

La refonte 0024 a fait disparaître le courriel de refus pré-rédigé de l'ancienne
fiche de demande (régression, commit 54b4625) ; le courriel d'acceptation n'a
jamais existé (noté « futur courriel » au PRD gabarits-courriels). Une demande
décidée sort du callout « Demande en cours » dès le rafraîchissement (état
dérivé, 0020) : il n'existe plus de surface où proposer la réponse après le
geste. Décisions prises en grilling avec Jeremy (2026-07-11).

## Decision

Accepter ou refuser une demande ouvre aussitôt l'aperçu « Courriel pré-rédigé »
composé du Modèle de courriel de la réponse (`reponseAcceptation` /
`reponseRefus` — libellés « Réponse — demande acceptée / refusée »), adressé au
courriel figé de la demande ; la rangée « Déjà décidées » d'À traiter porte le
filet durable « Écrire au membre » pour les deux issues.

Détails verrouillés :
- Texte d'origine du refus = l'ancien texte de fiche-demande verbatim
  (`{nom}`, `{type d'embarcation}`, `{adresse}`, `{raison}` — la raison,
  requise, vient du geste ou du Journal ; sa ponctuation finale est calculée
  dans la valeur, jamais dans le modèle).
- Texte d'origine de l'acceptation rédigé au grilling (`{nom}`, `{numéro}`,
  `{adresse}`, `{type d'embarcation}`) — PAS de position : les identifiants de
  structure sont un vocabulaire interne au comité (jamais visibles sur le
  terrain), « niveau » ne parle pas hors de l'app, et les numéros
  d'emplacement sont marqués physiquement sur les structures — le numéro
  suffit au membre.
- Destinataire = le courriel figé de la demande (on répond à qui a écrit),
  pas la ligne Membres. Choix peu engageant : la contrainte PII à venir (voir
  Revisit) retirera les courriels de l'app.

## Alternatives rejected

- Bouton « Écrire au membre » dans la fiche après le geste — exige de retenir
  artificiellement une demande qui n'est plus « en cours » (lutte contre
  l'état dérivé, 0020).
- Jeton `{position}` (structure/niveau) dans l'acceptation — vocabulaire
  interne qui fuirait vers le membre.
- Mini bouton « copier » sur l'objet/le message de l'aperçu — le mailto suffit
  dans ~90 % des cas (Jeremy) ; pas de fonctionnalité pour l'instant.
- Second bouton « modifier le modèle » — le lien discret du pied de l'aperçu
  (ticket 12) couvre déjà le besoin ; pas deux chemins pour le même endroit.

## Trade-offs accepted

- L'aperçu qui s'ouvre seul après le geste est une interruption — assumée :
  c'est le moment exact où le comité veut prévenir le membre, et rien ne part
  jamais tout seul (0003) ; il se referme d'un tap.
- Un membre du comité sans client mail configuré (webmail) n'a pas de chemin
  de repli tant que « copier » est écarté.

## Revisit when

- La contrainte de conformité PII retire les courriels de l'app : le mailto
  perd son destinataire et « copier le message » redevient le chemin
  principal — rouvrir la décision « copier » et le choix du destinataire.
- Le comité cherche la réponse d'une demande décidée ailleurs que dans
  « Déjà décidées » (le filet est au mauvais endroit).
