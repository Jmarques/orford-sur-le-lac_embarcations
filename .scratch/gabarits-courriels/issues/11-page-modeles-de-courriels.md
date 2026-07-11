# 11 — Page « Modèles de courriels » complète

**What to build:** la page comité « Modèles de courriels » — sans entrée au menu (elle s'atteint par URL directe ; le lien contextuel arrive au ticket 12). Page comité standard : connexion par mot de passe (0008), squelette bande-lac, tous les états dès cette tranche. La liste montre chaque modèle en rangée-bouton pleine largeur (libellé français + début du texte effectif) ; choisir un modèle remplace la liste par l'éditeur en place (bouton retour en tête — remplacé, jamais empilé, 0018), pré-ouvrable par `?modele=<id>`.

L'éditeur absorbe la piste C du prototype (`gabarits-prototype`, référence visuelle) : texte libre avec les informations en puces insécables (objet inclus), palette de boutons d'insertion au curseur, aperçu vivant avec exemple réel nommé et valeurs surlignées, avertissement contre l'éditeur quand une information requise manque (réinsertion par la palette), « Revenir au texte d'origine » qui re-remplit sans écrire, « Enregistrer le modèle » via l'action d'écriture (maj par clé id, création si absente, validation minimale : id connu, textes non vides, taille plafonnée, dernier écrit gagne) puis état frais et confirmation ; une erreur d'écriture conserve le texte saisi. Ordre mobile : édition → aperçu → palette → actions. UX/UI : brief + principles/composition + `docs/design.md`, polish checklist, revue du delta de captures par subagent lecture seule.

Démo : personnaliser un modèle dans l'app → toutes les relances suivantes (fiches des tickets 09/10) utilisent le nouveau texte ; revenir au texte d'origine → le défaut revient.

**Blocked by:** 09 — La relance d'emplacement se compose depuis le modèle. (10 n'est pas bloquant — parallélisable.)

**Status:** ready-for-agent

- [ ] Page protégée (connexion, mdp refusé, chargement, erreur) ; liste des modèles en rangées ; éditeur en place avec retour ; `?modele=` pré-ouvre
- [ ] Éditeur à puces conforme au prototype : insertion au curseur, puces insécables, aperçu vivant, requis manquant → callout contre l'éditeur + réinsertion, optionnel signalé « (si connue) »
- [ ] « Enregistrer le modèle » écrit par l'action dédiée (mot de passe en corps), renvoie l'état frais, confirme ; échec → erreur qui conserve le texte
- [ ] « Revenir au texte d'origine » re-remplit avec le défaut reçu, sans écrire
- [ ] Validation d'écriture testée au seam apps-script (id inconnu, textes vides, plafond)
- [ ] Sérialisation puces → texte à jetons testée au seam du module pur (aller-retour parse/sérialise)
- [ ] Scénarios de captures : tous les états ci-dessus, desktop + mobile (ordre édition → aperçu → palette → actions), console propre
- [ ] `npm run verify` passe ; captures nouvelles committées ; revue subagent du delta faite
