# PRD — Tournée : relevé d'occupation en série, structure par structure

Status: ready-for-agent
Décisions cadres : 0013 (tournée), 0011 (statut dérivé, observations journalisées), 0009 (create-if-missing), 0012 (en-têtes), 0008 (auth), 0006 (captures mockées), 0004 (Web Awesome, présentation côté client), 0003 (n/a ici — aucun courriel).
Vocabulaire : CONTEXT.md — [[Tournée]], [[Occupation observée]], [[Statut d'un emplacement]], [[Structure]], [[Emplacement]].

## Problème

Les tournées n'existent pas aujourd'hui faute d'outil. Pour relever l'occupation d'une structure entière, un membre du comité devrait répéter le flux unitaire — toucher un numéro, attendre le panneau, choisir l'état, attendre l'envoi, attendre le rechargement complet de la grille — pour chaque emplacement : inutilisable en série. Et un tableur de numéros séquentiels ne ressemble pas à ce qu'on a devant les yeux sur la plage. Résultat : pas de saisie initiale réaliste, pas de relevés de début/fin de saison, et aucun moyen de confirmer périodiquement qu'un emplacement « Attribué, libre » l'est toujours — ce qui bloque toute politique de réattribution (voir PRD « À traiter »).

## Solution

Un bouton « **Faire la tournée** » sur chaque carte de structure ouvre un écran dédié, limité à cette structure. Chaque cellule montre le numéro et le dernier état observé **en fantôme** (estompé). **Un tap = je confirme ce que je vois** ; un second tap bascule occupé ↔ libre ; ce qui diffère du fantôme porte un marqueur « a changé » bien visible. Un compteur suit la progression (« 12/16 relevés »). « **Terminer la tournée** » envoie le lot, affiche le résumé des changements, puis propose « Structure suivante → ». Aucune observation n'est écrite par inaction : les cellules non touchées gardent leur ancienne observation et sa date.

## User stories

1. En tant que membre du comité devant une structure (mobile), je veux ouvrir la tournée de *cette* structure en un geste depuis la liste des structures, pour relever ce que j'ai sous les yeux sans navigation superflue.
2. En tant que membre du comité, je veux voir dans chaque cellule le numéro et le dernier état observé en fantôme, pour comparer la réalité à ce qui est connu au lieu de me le remémorer.
3. En tant que membre du comité, je veux confirmer d'un seul tap un emplacement inchangé, pour couvrir les ~80 % de cas identiques à la vitesse d'un regard.
4. En tant que membre du comité, je veux basculer l'état d'un second tap quand la réalité diffère du fantôme, pour corriger sans quitter la grille.
5. En tant que membre du comité, je veux qu'un troisième tap revienne à « non relevé », pour annuler un tap accidentel sans conséquence.
6. En tant que membre du comité, je veux un marqueur visible sur les cellules dont l'état a changé par rapport au fantôme, pour repérer les changements — l'information intéressante — pendant et après le relevé.
7. En tant que membre du comité, je veux un compteur « relevés / total » toujours visible, pour savoir où j'en suis sans compter les cellules.
8. En tant que membre du comité, je veux relever un emplacement jamais observé (pas de fantôme) par le même geste, pour que la saisie initiale ne soit pas un cas à part.
9. En tant que membre du comité, je veux terminer une tournée partielle (cellules non touchées) après un avertissement clair, pour rester libre de la portée de ma passe — les non-touchées ne perdent rien.
10. En tant que membre du comité, je veux qu'aucune observation ne soit écrite pour un emplacement que je n'ai pas touché, pour que le Journal ne contienne que ce que quelqu'un a réellement regardé.
11. En tant que membre du comité, je veux voir en fin de tournée le résumé des changements (« 14 relevés, 2 changements : n° 43 maintenant libre, n° 78 maintenant occupé »), pour repartir avec l'essentiel en tête.
12. En tant que membre du comité, je veux enchaîner sur « Structure suivante → » depuis l'écran de fin, pour faire toutes les structures d'une visite sans repasser par la liste.
13. En tant que membre du comité, je veux fermer la tournée d'une seule structure sans enchaîner, pour le scénario « je confirme juste les Attribué, libre de la structure 3 ».
14. En tant que membre du comité, je veux que l'envoi échoué (réseau de plage) me laisse mes taps et me propose de réessayer, pour ne pas refaire le relevé.
15. En tant que membre du comité (public aîné), je veux des cellules-cibles larges, des états contrastés et aucun appui long ni geste caché, pour relever sans erreur ni apprentissage.
16. En tant que membre du comité, je veux que la tournée exige le mot de passe du comité comme le reste de l'app, pour que personne d'autre n'écrive d'observations.
17. En tant que membre du comité de retour sur la grille des structures, je veux voir les statuts recalculés avec mes observations fraîches, pour constater l'effet de ma tournée (« Attribué, libre » apparus/disparus).
18. En tant que membre du comité, je veux que chaque observation du lot soit journalisée individuellement avec la date du serveur, pour que « libre depuis » et l'historique par emplacement (PRD « À traiter ») restent exacts.

## Décisions d'implémentation

- **Écran dédié par structure** — pas de mode sur la grille existante (rejeté : *mode error*, décision 0013). Entrée : bouton « Faire la tournée » sur chaque carte de structure ; l'écran réutilise le rendu de grille mais avec son **propre encodage visuel** : occupé/libre en fantôme ou confirmé + marqueur « a changé » — **pas** les 5 statuts, hors sujet pendant un relevé.
- **Cycle d'une cellule** : non relevé (fantôme ou vide) → tap → confirmé à l'état vu (fantôme repris tel quel) → tap → basculé (marqueur « a changé ») → tap → retour à non relevé. Pour une cellule sans fantôme (jamais observée), le premier tap = occupé, le second = libre, le troisième = non relevé.
- **Aucune observation par inaction** (0013) : « Terminer » n'envoie que les cellules touchées ; avertissement listant le nombre de non-relevées, qui gardent leur ancienne observation et sa date.
- **Pas d'âge dans les cellules** (rejeté 0013 : surcharge) — l'âge de la dernière observation reste dans le panneau unitaire de la grille des structures.
- **État de tournée = logique pure partagée** : représentation des cellules, transitions de tap, compteur, détection « a changé », construction du lot — fonctions pures dans le module de grille partagé (copié client par l'outillage existant), sans DOM ni API.
- **Envoi par lot en fin de structure** : une nouvelle capacité du module serveur d'observation — valide chaque valeur contre l'ensemble partagé, écrit cellule + `dateObservation` (timestamp serveur) par en-têtes réels (0012), crée la ligne si absente (0009), appende **un événement Journal par observation** (0011). Échec = état local conservé + réessai proposé.
- **« Structure suivante »** : l'ordre est celui de la liste des structures ; la dernière structure n'offre que la fermeture.
- **Auth** : mot de passe partagé transmis en corps POST (0008), même session que la grille.
- **Copy** : « Faire la tournée » (jamais « Tourner », « Relever », « Inspection » — glossaire).

## Décisions de test

- **Tester le comportement externe seulement** : transitions de tap et contenu du lot (entrée → sortie des fonctions pures), jamais la structure interne de l'état ; réponse de l'action serveur et lignes/Journal produits, jamais les détails de la colle Apps Script (convention : `sheets.js`/`Code.js` non testés en node).
- **Fonctions pures de tournée** : tests node — prior art `tests/grille.test.mjs` (statuts, comptes). Cas à couvrir : cellule avec/sans fantôme, cycle complet des taps, détection « a changé », lot vide, lot partiel, tolérance aux données manuelles illisibles (0002).
- **Action serveur de lot** : tests node — prior art `tests/observation.test.mjs` (validation aux frontières, create-if-missing, événement Journal). Cas : lot mixte créations/mises à jour, valeur invalide dans le lot (tout ou rien ? → refuser le lot entier avec message clair), lot vide.
- **Écran** : captures mockées multi-états via le hook `?etat=` (0006) — vierge (rien relevé), en cours (mélange fantômes/confirmés/changés + compteur), avertissement de fin partielle, résumé des changements, erreur d'envoi, enchaînement. Console error/warning + pageerror font échouer la boucle (convention existante). Flux complet piloté au navigateur avant livraison.

## Exigence → tranche

| # | Exigence | Tranche |
| --- | --- | --- |
| 1 | Logique pure de tournée (cycle de tap, « a changé », compteur, lot) | T1 |
| 2 | Action serveur : lot d'observations journalisées (en-têtes, create-if-missing, date serveur) | T1 |
| 3 | Écran tournée complet : entrée par structure, fantômes, taps, marqueurs, compteur, terminer + avertissement partiel + résumé + suivante, erreurs réseau avec réessai — **contrat de données complet dès cette tranche** (le lot entier) | T2 |
| 4 | Bouton « Faire la tournée » sur les cartes de structures + statuts frais au retour | T2 |

Rien d'invisible : T1 n'a pas d'écran, T2 est la première tranche visible et embarque tout le contrat.

## Hors périmètre

- Pré-remplissage par photo + LLM (écarté 0013 — trop d'erreurs ; si rouvert un jour : seulement comme fantôme, jamais comme observation).
- Envoi progressif ou hors-ligne (Revisit 0013 si le réseau de plage pose problème).
- Tournée multi-structures sur un seul écran (l'enchaînement couvre le besoin).
- La page « À traiter » et tout le traitement des cas problèmes (PRD séparé).
- Attribution via l'app.

## Notes

- La tournée est le **producteur de données** du PRD « À traiter » : la fiabilité de « libre depuis » dépend du principe « jamais d'observation par inaction » — ne pas l'affaiblir pour gagner des taps.
- L'interaction fantôme + tap est la plus nouvelle du lot : un passage par `/prototype` avant T2 est raisonnable si le geste doit être senti avant d'être construit.
- UX/UI : suivre le processus obligatoire du CLAUDE.md (brief, principles/composition, polish checklist, revue sur captures fraîches).
