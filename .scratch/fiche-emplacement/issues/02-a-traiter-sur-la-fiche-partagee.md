# 02 — La page À traiter adopte la fiche partagée

Status: done

## Parent

`.scratch/fiche-emplacement/PRD.md` (décision 0018).

## What to build

La page À traiter délègue au composant fiche partagé de l'issue 01 et supprime sa fiche spécifique (`fiche-cas`). Une rangée du registre ouvre la fiche canonique sur l'onglet Traiter ; l'onglet Observer y est pleinement fonctionnel (scénario : vérifier ses cas sur le terrain avec la page À traiter ouverte — l'observation qui referme le cas le fait sortir du registre derrière). Le message de succès de la page disparaît (0016 : le feedback est le changement visible dans la fiche — statut basculé, ligne au journal, champ vidé). Après fermeture d'une fiche dont la rangée a quitté le registre (libération, ou observation qui referme le cas), le focus se pose sur le titre de la section d'origine. Le registre lui-même (rangées, tri, badges, sections) ne change pas.

Processus UX obligatoire (CLAUDE.md) : revue sur le delta de captures fraîches (0017).

## Acceptance criteria

- [ ] Une rangée du registre ouvre la fiche partagée sur l'onglet Traiter, avec le même en-tête et les mêmes onglets que depuis Structures (fiche strictement identique).
- [ ] Note ajoutée : fiche ouverte, journal enrichi, champ vidé, compte de notes de la rangée mis à jour derrière.
- [ ] Libération confirmée : fiche ouverte, statut basculé (Disponible ou À identifier), « Libération » au journal, rangée sortie du registre derrière.
- [ ] Observation depuis l'onglet Observer : si elle referme le cas, la rangée sort du registre derrière pendant que la fiche reste ouverte.
- [ ] Le message de succès (`message-succes`) et la fiche spécifique (`fiche-cas`) sont supprimés ; à la fermeture d'une fiche dont la rangée a disparu, le focus va au titre de la section d'origine.
- [ ] Session expirée pendant un geste : retour à l'écran de connexion avec le message de refus (comportement actuel conservé).
- [ ] Aucune console error/warning ni pageerror ; scénarios de captures d'À traiter mis à jour (fiche par onglet, fiche restée ouverte après note et après libération) ; baselines committées (0017).
- [ ] Flux réel piloté au navigateur : note → journal mis à jour fiche ouverte ; libération → rangée disparue derrière, focus correct après fermeture.

## Blocked by

- `01-fiche-partagee-et-structures.md`

## Comments

- 2026-07-06 (implémentation) : le focus à la fermeture couvre un cas de plus que la lettre du
  critère — TOUT geste re-rend le registre et détruit la rangée déclencheuse (nœud détaché pour le
  restore du drawer), donc à la fermeture le focus est posé explicitement : rangée re-rendue si le
  cas est encore en file, titre de la section d'origine sinon. Garde `event.target` sur
  wa-after-hide (un composant interne à la fiche ne doit pas consommer l'origine).
- 2026-07-06 (revue, assumé) : le critère 3 dit « Disponible ou À identifier » après libération —
  seule la variante Disponible est capturée (la bascule de statut est la dérivation pure de
  grille.js, testée node ; la variante À identifier n'apporterait pas de couverture nouvelle).
