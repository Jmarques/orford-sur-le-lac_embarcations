# 0001 — GitHub Pages + Apps Script API + Google Sheet comme source de vérité

Date: 2026-07-03
Status: Accepted

## Context
Petit site pour ~180 adresses, géré par un comité bénévole de boomers habitués à Excel. Contraintes posées : déploiement « commit = déploiement », données dans un document type tableur partageable avec autorisations Google, budget zéro, notifications email. Un site purement statique ne peut ni écrire ni envoyer d'emails : il faut un pont.

## Decision
Frontend statique hébergé sur GitHub Pages ; un Google Apps Script attaché à la Google Sheet, déployé en Web App, sert d'API JSON (lectures en GET, écritures en POST `text/plain` pour éviter le preflight CORS) et envoie les emails ; la Sheet est l'unique source de vérité (données + configuration + mot de passe admin).

## Alternatives rejected
- Tout servir depuis Apps Script (HtmlService) — casse « commit GitHub = déploiement » et l'URL script.google.com est repoussante.
- Fonctions serverless (Cloudflare/Vercel) + API Google Sheets — un compte, des clés de service et des pièces en plus à maintenir pour un comité bénévole.
- Vraie base de données — le comité perdrait l'accès direct type Excel, qui est une exigence.

## Trade-offs accepted
- Quotas et latence d'Apps Script (~1–3 s par appel) ; acceptable pour quelques demandes par semaine.
- Le Web App doit être déployé en accès anonyme : toute la sécurité admin est applicative (voir 0003 pour l'auth).
- Pas de transactions : la Sheet peut être modifiée entre lecture et écriture (assumé, voir 0002).

## Revisit when
- Le volume dépasse les quotas Apps Script (erreurs de quota observées) ou la latence devient une plainte récurrente du comité.
- La communauté embauche/obtient un hébergement avec vrai backend.
