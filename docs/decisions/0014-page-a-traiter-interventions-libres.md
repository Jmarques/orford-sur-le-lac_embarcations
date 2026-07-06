# 0014 — Page « À traiter » : files dérivées du statut, interventions en texte libre, aucun workflow figé

Date: 2026-07-05
Status: Accepted

## Context
Le comité doit gérer les deux statuts problèmes (« Attribué, libre » : place peut-être à libérer ; « À identifier » : embarcation sans attribution) et, plus tard, les adresses hors quota. Jeremy n'est pas au comité : le workflow réel de relance et de résolution est inconnu — l'encoder maintenant serait construire une machine hypothétique. Contraintes en place : aucun courriel à un membre sans validation humaine (0003), mot de passe partagé sans identité individuelle (0008), statut dérivé jamais stocké et Journal append-only par `numero` (0011). Hors saison, les embarcations sont rentrées : un « libre depuis N mois » en calendrier pur produirait des relances absurdes au printemps.

## Decision
Une seule page « bureau » — **« À traiter »** — avec des **sections empilées** (badges de compte) : « Attribué, libre » (tri : libre depuis le plus longtemps d'abord) et « À identifier » en v1, « Quota » nommée-reportée. Toutes les sections partagent la même **carte-cas** : signal temporel, historique du Journal (attributions, observations, interventions), champ « **Ajouter une intervention** » en texte libre journalisé, et l'action propre au cas. Les files sont **entièrement dérivées du statut** : un cas sort tout seul quand une observation le referme (occupé → « Attribué, libre » redevient En ordre ; libre → « À identifier » devient Disponible) — et la page l'explique en une ligne d'aide. Le **statut reste factuel** : excuse ou tolérance vivent dans les interventions, jamais dans le statut. Deux actions structurées seulement : « **Libérer l'emplacement** » (dialogue de confirmation, retrait de l'adresse, événement Journal) et la **relance par `mailto:` pré-rempli** (numéro, libre depuis — le membre du comité édite et envoie depuis son propre client mail, ce qui satisfait 0003 par construction). Le site calcule et affiche le signal « libre depuis » en **saisons observées** (série d'observations « libre » couvrant une saison), jamais en mois calendaires ; la décision de relancer reste humaine.

## Alternatives rejected
- **Machine à états de suivi** (à traiter → relancé → toléré jusqu'à date → à libérer) — workflow jamais observé ; la structure émergera des interventions réelles avant d'être figée.
- **Un statut « toléré/excusé »** qui masquerait « Attribué, libre » — corrompt un fait dérivé (0011) avec un jugement ; la tolérance est une intervention, le statut ne ment pas.
- **Envoi de courriel in-app** (éditeur de modèle, MailApp, trace du texte exact) — coût v1 élevé pour un workflow inconnu.
- **Règle de relance automatique en mois calendaires** — la saisonnalité la rend fausse ; unité = saison observée, déclencheur = humain (cohérent avec 0003 et le quota non bloquant).
- **Tabs ou pages séparées par type de cas** — volumes faibles (unités/dizaines sur ~180 places), les tabs masquent l'ampleur du travail ; sections empilées + badges la montrent d'un regard (public aîné).
- **Traiter le quota dans cette manche** — reporté nommé : même mécanique carte-cas + interventions, mais clé **adresse** (plusieurs emplacements), future section de la même page.

## Trade-offs accepted
- Pas de trace structurée : on ne peut pas filtrer « tous les tolérés » sans lire le texte des interventions — accepté au volume actuel.
- Le Journal est clé par `numero` : une future intervention « quota » devra s'accrocher à un emplacement précis de l'adresse.
- `mailto:` ne journalise pas le texte exactement envoyé — l'intervention saisie à la main en tient lieu.
- L'auteur d'une intervention n'est connu que s'il signe dans le texte (0008, pas de comptes individuels).

## Revisit when
- Les interventions montrent des motifs répétés (tolérances datées, relances types) — structurer : snooze avec échéance, états de suivi, modèle de courriel in-app avec trace exacte.
- Une section dépasse la vingtaine de cas — passer aux tabs ou aux filtres.
- La vue quota se construit — décider où s'accrochent les interventions par adresse.
- Le comité demande « qui a fait quoi » — identité individuelle (rouvre 0008).
