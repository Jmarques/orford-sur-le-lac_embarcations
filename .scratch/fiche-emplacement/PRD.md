# PRD — Fiche d'emplacement unique : mêmes informations et gestes partout

Status: ready-for-agent
Décisions cadres : 0018 (fiche unique — la décision de cette feature), 0016 (interfaces silencieuses), 0014 (page À traiter), 0013 (tournée intouchée), 0011 (statut dérivé, Journal), 0008 (auth POST), 0006 (captures mockées), 0004 (présentation côté client), 0003 (aucun courriel sans validation humaine), 0002 (Sheet éditable, état frais).
Vocabulaire : CONTEXT.md — [[Fiche d'emplacement]] (nouveau terme), [[Statut d'un emplacement]], [[Occupation observée]], [[Note (au journal)]], [[Membre]], [[Tournée]].
Dépendance : aucune côté serveur — les quatre actions API nécessaires (`inventaire`, `observerEmplacement`, `ajouterNote`, `libererEmplacement`) existent et sont déployées.

## Problème

Les deux vues détaillées d'un emplacement sont disjointes : le panneau de la page Structures montre le statut, la position et le geste d'observation, mais ni le membre, ni le journal, ni les gestes de traitement ; la fiche de la page À traiter montre l'inverse. Un membre du comité qui repère « Attribué, libre » dans la grille doit mémoriser le numéro, changer de page et le retrouver dans le registre pour agir — ou même simplement pour lire le journal, inaccessible pour tout emplacement hors file (En ordre, Disponible, Non observé). Les deux popups ferment après chaque geste, empêchant d'enchaîner (observer puis noter). L'API renvoie pourtant les mêmes données aux deux pages : l'asymétrie est une décision d'UI héritée, pas une contrainte. Usage majoritairement mobile : l'information doit rester condensée, sans défilement vertical de la fiche.

## Solution

Une **fiche d'emplacement** canonique (décision 0018), composant partagé ouvert depuis la grille des Structures comme depuis le registre À traiter, présentée en **drawer montant du bas** sur mobile (la grille reste visible au-dessus) et adaptée sur grand écran. En-tête permanent condensé : statut dérivé coloré avec son signal temporel, position dans le titre (« Emplacement 74 · Structure A · Niveau 2 »), membre en une ligne avec téléphone et courriel tappables. Deux onglets : **Observer** (dernière observation + « Qu'observez-vous sur place ? » Occupé/Libre) et **Traiter** (journal de l'emplacement — seul élément qui défile, en interne —, ajouter une note, écrire au membre, libérer). Les gestes dépendent du **statut** (Libérer si attribué, Écrire si courriel connu), jamais de la page ; la page d'origine choisit seulement l'onglet ouvert par défaut (Structures → Observer, À traiter → Traiter). Tout geste laisse la fiche ouverte : le statut en en-tête bascule, la ligne apparaît au journal — c'est le feedback, le message de succès séparé disparaît (0016).

## User stories

1. En tant que membre du comité devant la grille des Structures, je veux ouvrir la fiche d'un emplacement « Attribué, libre » et le traiter sur place (note, courriel, libération), pour ne plus avoir à retrouver son numéro dans la page À traiter.
2. En tant que membre du comité, je veux lire le journal de n'importe quel emplacement depuis la grille — y compris « En ordre », « Disponible » ou « Non observé » —, pour consulter la mémoire du comité sans que l'emplacement soit un cas à traiter.
3. En tant que membre du comité, je veux la même fiche quelle que soit la page d'où je l'ouvre, pour n'apprendre qu'une seule interface.
4. En tant que membre du comité sur mobile, je veux que la fiche monte du bas de l'écran en laissant la grille visible au-dessus, pour ne jamais perdre de vue l'emplacement que j'ai touché.
5. En tant que membre du comité sur mobile, je veux une fiche condensée qui tient à l'écran sans défilement (seul le journal défile, en interne), pour tout voir d'un coup d'œil.
6. En tant que membre du comité, je veux le statut dérivé en tête de fiche, coloré et expliqué avec son signal temporel (« libre depuis le 3 juin · 2 observations »), pour juger la situation avant d'agir.
7. En tant que membre du comité, je veux la position complète (structure, niveau) dans le titre de la fiche, pour savoir où est l'emplacement sans revenir à la grille.
8. En tant que membre du comité, je veux le nom du membre, son adresse, son téléphone et son courriel en liens actifs (`tel:`, `mailto:`) dans l'en-tête quand l'emplacement est attribué, pour le contacter par le canal de mon choix.
9. En tant que membre du comité qui ouvre la fiche depuis Structures, je veux arriver sur l'onglet Observer, pour que le geste probable (je suis devant la structure) soit le premier.
10. En tant que membre du comité qui ouvre la fiche depuis À traiter, je veux arriver sur l'onglet Traiter, pour que le journal et les gestes de traitement soient les premiers.
11. En tant que membre du comité, je veux pouvoir passer librement d'un onglet à l'autre, pour accéder à tout depuis n'importe quelle page.
12. En tant que membre du comité descendu à la plage avec la page À traiter ouverte, je veux enregistrer une observation depuis la fiche d'un cas, pour vérifier mes dossiers sur le terrain sans changer de page — le cas sort de la file tout seul si l'observation le referme.
13. En tant que membre du comité, je veux que l'onglet Observer affiche la dernière observation (état + date) et pose « Qu'observez-vous sur place ? », pour que la règle du constat de terrain soit dite par la question elle-même.
14. En tant que membre du comité, je veux qu'après une observation la fiche reste ouverte et que le statut en en-tête bascule sous mes yeux, pour enchaîner (observer libre puis noter « courriel envoyé ») sans rouvrir.
15. En tant que membre du comité, je veux qu'après l'ajout d'une note la fiche reste ouverte, le journal montre ma note et le champ se vide, pour continuer à travailler le dossier.
16. En tant que membre du comité, je veux « Libérer l'emplacement » derrière une confirmation explicite, et que la fiche reste ouverte après — statut basculé, libération au journal —, pour voir la preuve du geste au lieu d'un message.
17. En tant que membre du comité, je veux que les gestes offerts suivent le statut (Libérer seulement si attribué, Écrire seulement si courriel connu) et jamais la page, pour que la fiche dise toujours la vérité sur ce qui est possible.
18. En tant que membre du comité, je veux le `mailto:` pré-rempli (numéro, libre depuis) accessible depuis l'onglet Traiter partout, pour relancer un membre depuis la grille comme depuis le registre — sans qu'aucun courriel ne parte de l'app (0003).
19. En tant que membre du comité, je veux que la grille (ou le registre) derrière la fiche se rafraîchisse après un geste, pour que la page reflète l'état frais de la Sheet quand je ferme la fiche (0002).
20. En tant que membre du comité, je veux qu'une erreur d'envoi (note, observation, libération) s'affiche dans la fiche sans perdre mon texte, pour réessayer sans tout resaisir.
21. En tant que membre du comité (public aîné), je veux deux onglets larges et clairement libellés, des cibles généreuses et un langage simple, pour utiliser la fiche sans formation.
22. En tant que membre du comité utilisant clavier ou lecteur d'écran, je veux que la fiche gère le focus proprement (à l'ouverture, entre onglets, à la fermeture — y compris quand la rangée d'origine a disparu du registre après une libération), pour naviguer sans piège.
23. En tant que membre du comité, je veux que la tournée reste inchangée (tap = confirmer, jamais de fiche), pour que le relevé en série reste rapide (0013).
24. En tant que membre du comité, je veux que les données illisibles (Sheet éditée à la main) n'empêchent jamais la fiche de s'afficher, pour que la robustesse survive à l'édition manuelle (0002).

## Décisions d'implémentation

- **Un composant partagé** : la fiche vit dans un module client unique (même modèle que la logique de grille partagée) qui injecte son propre markup, remplit tout par `textContent` (anti-XSS) et expose « ouvrir la fiche pour ce numéro, onglet par défaut X, avec ce rappel de rafraîchissement ». Les deux pages suppriment leurs popups spécifiques (`panneau-emplacement`, `fiche-cas`) et délèguent au composant. Zéro duplication de markup entre pages.
- **Contenant** : drawer bas sur mobile, adapté sur grand écran (panneau latéral ou équivalent) — même contenu, contenant choisi par la largeur d'écran à l'ouverture. Composants Web Awesome, variables visuelles dans les tokens du thème (0004).
- **En-tête permanent** : titre = « Emplacement N · Structure S · Niveau L » ; callout de statut (variante/icône par code de statut, comme aujourd'hui) portant le libellé et le signal temporel (« libre depuis » pour Attribué libre, fenêtre d'apparition pour À identifier, dernière observation sinon) ; ligne membre condensée (nom · adresse · tél · courriel) si attribué, mention « Aucun membre inscrit » si l'attribution existe sans ligne Membres.
- **Onglets** : Observer (dernière observation + boutons Occupé/Libre, question « Qu'observez-vous sur place ? ») et Traiter (journal + formulaire de note + gestes Écrire/Libérer). L'onglet Traiter existe pour tous les statuts (journal + note toujours) ; les gestes conditionnés par le statut seul.
- **Fiche toujours ouverte après un geste** (0018) : après succès, re-fetch `inventaire` (état frais, 0002), re-rendu de la fiche en place (statut, signal, journal, boutons d'occupation) ET de la page derrière (grille recolorée / registre re-trié) via le rappel fourni par la page. Le champ de note se vide après succès ; il est conservé après échec.
- **Le message de succès de la page À traiter disparaît** (0016 : le feedback est le changement visible dans la fiche). Après fermeture d'une fiche dont la rangée a quitté le registre (libération), le focus se pose sur le titre de la section d'origine.
- **Aucun changement serveur** : actions existantes `inventaire`, `observerEmplacement`, `ajouterNote`, `libererEmplacement` ; mot de passe en corps POST (0008).
- **Dérivations réutilisées telles quelles** : statut, historique, série « libre depuis », fenêtre d'apparition — fonctions pures partagées existantes ; la fiche ne fait que les mettre en scène. Seule dérivation nouvelle : les gestes offerts par statut (fonction pure : attribué → Libérer ; courriel connu → Écrire), partagée et testée node.
- **Tournée intouchée** (0013) : en mode tournée, les cellules gardent leur cycle de tap ; la fiche ne s'ouvre qu'en mode consultation de la grille.
- **Hook de captures** `?etat=` étendu : la fiche est ouvrable dans les scénarios mockés depuis les deux pages, chaque statut et chaque onglet capturables (0006). Changement visuel intentionnel → nouvelles captures baseline committées avec le code (0017).
- **Copy** : « Fiche d'emplacement », « Observer » / « Traiter », « Qu'observez-vous sur place ? », « Ajouter la note », « Écrire au membre », « Libérer l'emplacement » — tout vient du glossaire ; jamais « panneau », « popup », « intervention ».

## Décisions de test

- **Comportement externe seulement** : la nouvelle dérivation (gestes par statut) = entrée (ligne, membre) → sortie, sans DOM — prior art `tests/grille.test.mjs`, `tests/a-traiter.test.mjs`. Cas : attribué avec/sans membre, membre sans courriel, non attribué, ligne absente.
- **Pages** : captures mockées multi-états via `?etat=` (0006) — fiche par statut (les cinq), chaque onglet, depuis chaque page, erreur d'envoi dans la fiche, confirmation de libération, fiche restée ouverte après note (journal enrichi) et après libération (statut basculé). Console error/warning + pageerror font échouer la boucle — prior art `tests/captures.test.mjs`, `tests/console.test.mjs`.
- **Flux réel piloté au navigateur** avant livraison (note → journal mis à jour fiche ouverte ; libération → statut basculé fiche ouverte ; observation depuis À traiter → cas sorti du registre derrière).
- Pas de nouveaux tests serveur : aucune action nouvelle.

## Exigence → tranche

| # | Exigence | Tranche |
| --- | --- | --- |
| 1 | Dérivation pure « gestes par statut » testée node | T1 |
| 2 | Composant fiche partagé complet (drawer, en-tête, deux onglets, les quatre gestes, fiche ouverte après geste, erreurs) — **contrat de données complet dès cette tranche** | T1 |
| 3 | Intégration Structures : la fiche remplace le panneau, onglet par défaut Observer, grille rafraîchie derrière, tournée intouchée | T1 |
| 4 | Intégration À traiter : la fiche remplace `fiche-cas`, onglet par défaut Traiter, retrait du message de succès, registre rafraîchi, focus après libération | T2 |
| 5 | Captures baseline des deux pages mises à jour (0017) | T1 (structures) et T2 (à traiter) |

Rien d'invisible : les deux tranches sont visibles, la fiche embarque ses quatre gestes dès T1.

## Hors périmètre

- Toute évolution serveur (aucune nécessaire).
- Attribuer ou éditer le membre depuis la fiche (rouvrirait 0018 — « Revisit when »).
- Garde-fou anti « observation de canapé » (rejeté 0018 ; se rouvre si le journal montre des observations loin du terrain).
- La tournée et son écran dédié (0013).
- La page Demandes (admin.html) — elle n'a pas de fiche d'emplacement.

## Notes

- UX/UI : processus obligatoire du CLAUDE.md — design brief avant tout markup (drawer mobile, hiérarchie de l'en-tête, états vide/chargement/erreur/succès de chaque onglet), lecture de principles.md + composition.md (webawesome-design), polish checklist, puis revue ui-critic en lecture seule sur le **delta** de captures fraîches (0017).
- Le « pas de scroll vertical » de la fiche est une contrainte de design, pas un invariant testable au pixel : l'en-tête + onglets + gestes tiennent dans un écran de téléphone courant ; seul le journal défile. Si ça ne tient plus, c'est un « Revisit when » de 0018.
- La fiche s'ouvre pour un numéro « En double » (bordure pointillée) comme pour tout autre : le statut dérivé s'affiche ; la correction de la saisie reste dans l'édition de structure.
