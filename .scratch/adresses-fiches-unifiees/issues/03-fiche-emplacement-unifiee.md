# 03 — Fiche d'emplacement unifiée

Status: ready-for-agent

## Parent
`.scratch/adresses-fiches-unifiees/PRD.md`

## What to build
Redessiner la [[Fiche d'emplacement]] en **coquille unifiée à plat** (retrait des onglets Observer/Traiter, amende 0018) : `[Sujet (statut) · Membre · Corps propre · Journal · Actions]`. « Sur place » (consigner l'[[Occupation observée]] Occupé/Libre) devient une **action** qui révèle un panneau replié, plus une section permanente. Les **remèdes** (relancer, libérer) vivent **dans le callout du statut** qu'ils résolvent ; une **barre d'actions utilitaires** séparée porte « Sur place ». Le contexte du **courriel pré-rédigé** s'affiche dans un **aperçu** (objet + corps + « rien n'est envoyé automatiquement », 0003) au lieu d'une légende. Consomme les blocs partagés (01) et le gating (02). Drawer élargi sur desktop, plein écran mobile.

## Acceptance criteria
- [ ] La fiche d'emplacement n'a plus d'onglets : tout défile dans une colonne.
- [ ] « Sur place » est une action qui révèle le relevé Occupé/Libre (replié par défaut).
- [ ] Les remèdes applicables sont rendus dans le callout du problème ; les actions utilitaires dans une barre à part.
- [ ] Cliquer « Relancer le membre » ouvre un aperçu du courriel (objet + corps + réassurance), avec « Ouvrir dans ma messagerie » (mailto, jamais d'envoi automatique).
- [ ] Tout geste laisse la fiche ouverte (0018) ; le statut et le journal changent sous les yeux.
- [ ] Captures des états En ordre, Attribué-libre, Disponible ; delta revu par un subagent lecture seule.
- [ ] Tests de la fiche verts.

## Blocked by
- 01, 02
