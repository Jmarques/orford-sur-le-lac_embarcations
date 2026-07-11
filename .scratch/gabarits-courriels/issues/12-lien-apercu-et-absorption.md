# 12 — Le lien depuis l'aperçu + absorption finale

**What to build:** dans l'aperçu « Courriel pré-rédigé » (partagé par les deux fiches), un lien discret « Modifier le modèle de ce courriel » mène à la page « Modèles de courriels » pré-ouverte sur le bon modèle (`?modele=<id>`) — c'est le chemin de découverte : on corrige la formulation au moment où on la remarque. L'appelant de l'aperçu fournit l'id du modèle. Le prototype a joué son rôle de référence visuelle : le supprimer (page, scénarios de captures, captures committées).

Démo : fiche d'emplacement → « Écrire au membre » → aperçu → « Modifier le modèle de ce courriel » → éditeur pré-ouvert sur la relance d'emplacement → retour à la liste.

**Blocked by:** 11 — Page « Modèles de courriels » complète.

**Status:** ready-for-human — implémenté, à valider sur le vrai site (`npm run deploy` pour publier la page et le lien ensemble)

- [x] Le lien apparaît dans l'aperçu des deux fiches et cible le modèle du courriel affiché (`courrielRelance` passe `modele: 'relanceEmplacement'` / `'relanceHorsQuota'` ; masqué si l'appelant ne nomme pas de modèle) ; discret — dans le pied du dialogue, à gauche, l'action primaire reste « Ouvrir dans ma messagerie »
- [x] Le prototype, ses scénarios et ses captures sont supprimés (comme les prototypes de fiches avant lui)
- [x] Scénario de capture de l'aperçu mis à jour (le lien visible) + nouveau scénario `a-traiter-apercu-courriel-adresse` (l'aperçu hors quota depuis la fiche d'adresse, jamais capturé jusqu'ici)
- [x] `npm run verify` passe ; delta de captures revu par subagent et committé

## Comments

- Revue subagent du delta : le lien initialement placé sous le message passait SOUS LE PLI en mobile (le corps du dialogue défile) — corrigé en le slotant dans le pied du dialogue (`slot="footer"`, poussé à gauche des boutons) : toujours visible, hiérarchie intacte. Suggestion non retenue : reformuler en « Modifier le modèle utilisé pour ces courriels » — le libellé « Modifier le modèle de ce courriel » vient du PRD (US 2) ; à soumettre à Jeremy si l'ambiguïté se confirme à l'usage.
