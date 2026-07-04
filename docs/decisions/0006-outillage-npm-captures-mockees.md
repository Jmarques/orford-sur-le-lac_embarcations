# 0006 — Les npm scripts sont l'interface unique du tooling ; la boucle visuelle des agents passe par des captures mockées multi-états

Date: 2026-07-03
Status: Accepted

## Context
Les agents (et les développeurs) ont besoin d'une boucle de feedback standard : servir le site, le voir, le vérifier — sans dépendances implicites (Playwright emprunté à un projet voisin, python3 supposé présent) et sans prompts de permission à répétition. Par ailleurs, une page servie localement parle à la vraie API : une soumission de test écrirait dans la vraie Sheet.

## Decision
Tout le tooling s'invoque via `npm run …` (dev, test, screenshots, verify, logs, deploy — logique dans `tools/*.mjs`, Playwright et http-server en devDependencies) ; `npm run screenshots` capture chaque état de chaque page (via le hook d'URL `?etat=…`) en desktop 1280 et mobile 390, **API mockée par interception Playwright** — aucune écriture possible vers la vraie Sheet ; les scénarios de capture sont déclaratifs dans `tools/captures.mjs` ; la commande **échoue si la console du navigateur contient une erreur ou un avertissement** (exceptions listées dans `CONSOLE_IGNOREE`) — des captures visuellement correctes peuvent cacher des dépréciations ou des exceptions (leçon des `size="large"` dépréciés, invisibles à l'écran).

## Alternatives rejected
- Scripts shell épars (`serve.sh`…) — non standard, non listables (`npm run` documente), dépendances implicites de la machine.
- Captures sur la vraie API par défaut — non déterministe, exige l'OAuth fait, et risque d'écrire des données de test dans la vraie Sheet.
- Piloter les états par timing/interception fine plutôt que par `?etat=` — fragile ; le hook ajoute ~10 lignes à la page mais rend chaque scénario déclaratif (une URL).

## Trade-offs accepted
- Le hook `?etat=` est du code de test embarqué dans la page publique (inerte pour les membres, mais présent).
- Les fixtures du mock doivent suivre l'évolution du contrat d'API — un module de fixtures à tenir à jour.
- Playwright + chromium ≈ 300 Mo par machine de dev.
- Les commandes sûres (dev/test/screenshots/verify/logs) sont allowlistées pour les agents ; `npm run deploy` reste soumis à confirmation humaine.

## Revisit when
- Les captures mockées divergent de la réalité au point de laisser passer un bug visuel réel — ajouter un mode `--live` systématique en pré-déploiement.
- Un deuxième projet veut réutiliser ce tooling — l'extraire en package ou dans le template.
