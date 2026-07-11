# 12 — Le lien depuis l'aperçu + absorption finale

**What to build:** dans l'aperçu « Courriel pré-rédigé » (partagé par les deux fiches), un lien discret « Modifier le modèle de ce courriel » mène à la page « Modèles de courriels » pré-ouverte sur le bon modèle (`?modele=<id>`) — c'est le chemin de découverte : on corrige la formulation au moment où on la remarque. L'appelant de l'aperçu fournit l'id du modèle. Le prototype a joué son rôle de référence visuelle : le supprimer (page, scénarios de captures, captures committées).

Démo : fiche d'emplacement → « Écrire au membre » → aperçu → « Modifier le modèle de ce courriel » → éditeur pré-ouvert sur la relance d'emplacement → retour à la liste.

**Blocked by:** 11 — Page « Modèles de courriels » complète.

**Status:** ready-for-agent

- [ ] Le lien apparaît dans l'aperçu des deux fiches et cible le modèle du courriel affiché ; discret (l'action primaire reste « Ouvrir dans ma messagerie »)
- [ ] Le prototype, ses scénarios et ses captures sont supprimés (comme les prototypes de fiches avant lui)
- [ ] Scénario de capture de l'aperçu mis à jour (le lien visible)
- [ ] `npm run verify` passe ; delta de captures revu et committé
