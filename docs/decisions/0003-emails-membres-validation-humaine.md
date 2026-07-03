# 0003 — Aucun email vers un membre sans validation humaine

Date: 2026-07-03
Status: Accepted

## Context
La communication actuelle est humaine (téléphone/email personnels) et appréciée. Un email automatique erroné (mauvais emplacement, mauvaise adresse) coûterait cher en confiance dans une petite communauté. La notification automatique vers le comité, elle, est interne et sans risque.

## Decision
L'app génère les brouillons d'email aux membres (sujet + corps) mais n'envoie jamais sans la confirmation explicite d'un membre du comité ; seules les notifications internes au comité (nouvelle demande reçue) partent automatiquement.

## Alternatives rejected
- Email automatique à chaque décision — boucle fermée séduisante, mais le demandeur perd le contact humain et une erreur part sans relecture.
- Aucune assistance email (le comité rédige tout) — ne réduit pas la charge de travail, qui est le but du projet.

## Trade-offs accepted
- La boucle de retour vers le membre dépend d'un clic humain : une décision peut rester non communiquée si personne ne valide.
- Un écran/état de plus à gérer (brouillon en attente d'envoi).

## Revisit when
- Le comité demande explicitement l'envoi automatique après une saison d'usage sans incident de brouillon erroné.
