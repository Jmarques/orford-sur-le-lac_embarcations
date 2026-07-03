# 0002 — Sheet éditable à la main, propriétaire sur la ligne d'emplacement, historique en journal append-only

Date: 2026-07-03
Status: Accepted

## Context
Le comité gère aujourd'hui tout dans un fichier Excel et doit pouvoir continuer à corriger directement les données ; une app en panne ne doit jamais bloquer le travail. En même temps, NOTE.md exige de garder la trace des demandes et décisions et de pouvoir annuler une décision facilement.

## Decision
La Sheet reste éditable à la main : l'état courant d'un emplacement (propriétaire inclus) vit sur sa ligne dans l'onglet Emplacements (format familier Excel), et l'historique vit dans un onglet Journal append-only alimenté par l'app ; l'API relit toujours l'état frais et valide à la lecture, sans jamais supposer qu'elle est seule à écrire.

## Alternatives rejected
- Écritures via l'app uniquement (Sheet « privée ») — si l'app ne couvre pas un cas, le comité est coincé ; inacceptable au démarrage.
- Onglet Attributions séparé (Emplacements = pur inventaire) — plus propre relationnellement, mais l'édition manuelle demanderait de jongler entre deux onglets ; contraire à l'habitude Excel du comité.

## Trade-offs accepted
- Les éditions manuelles ne passent pas par le Journal : l'historique est complet seulement pour les actions faites via l'app.
- Aucun verrou : une édition manuelle simultanée à une action de l'app peut se marcher dessus (risque jugé négligeable à cette échelle).
- L'API doit tolérer des données sales (cellules vides, fautes de frappe) et les signaler plutôt que planter.

## Revisit when
- Des incohérences dues aux éditions manuelles surviennent plus d'une fois par saison (perte de données, doublons de numéros).
- Le comité n'édite plus jamais la Sheet à la main pendant une saison complète — l'app peut alors devenir le seul point d'écriture.
