# 04 — Notification interne au comité à la réception d'une demande

Status: ready-for-agent

## Parent

.scratch/traitement-demandes/PRD.md (décision 0020)

## What to build

À chaque nouvelle demande reçue (soumission du formulaire public), Apps Script envoie un courriel sobre à une adresse comité lue dans l'onglet Config (nouvelle clé). Contenu minimal : l'adresse demandeuse, le type d'embarcation, et un lien vers la page À traiter. Si la clé Config est absente ou vide, aucun envoi n'a lieu et la soumission réussit quand même — la notification ne doit jamais faire échouer une demande. Autorisé par la décision 0003 (les notifications internes au comité sont automatiques ; seuls les courriels vers un membre exigent une validation humaine).

Cette tranche vient en dernier, volontairement : tout le traitement des demandes doit être livré avant.

## Acceptance criteria

- [ ] Nouvelle clé Config pour l'adresse comité ; le setup la garantit sans réordonner (décision 0012)
- [ ] Une demande reçue déclenche un courriel interne sobre (adresse, type, lien vers À traiter)
- [ ] Clé absente ou vide → aucun envoi, la soumission réussit ; l'envoi qui échoue ne casse jamais la création de la demande
- [ ] La préparation du contenu du courriel (sujet/corps depuis une demande) testée en node ; l'envoi lui-même (MailApp) non testé en node, vérifié au déploiement (convention du projet)
- [ ] Aucun courriel vers le membre demandeur (décision 0003)

## Blocked by

- 01-modele-decision-section-lecture.md
- 02-fiche-de-demande-decision-complete.md
