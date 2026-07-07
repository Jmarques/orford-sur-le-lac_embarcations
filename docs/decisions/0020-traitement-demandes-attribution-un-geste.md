# 0020 — Traitement des demandes : accepter = attribuer en un geste, quota bloquant, état dérivé, section d'À traiter

Date: 2026-07-06
Status: Accepted

## Context
Les demandes étaient une boîte de réception en lecture seule : formulaire public → onglet Demandes → admin.html qui liste, avec une colonne `statut` changée à la main et une attribution saisie à la main dans Emplacements — aucun endpoint de décision, aucun lien avec les Membres, le quota ou les emplacements libres. Le plan cycle-vie nommait « attribution via l'app » et « MAJ contact depuis une demande acceptée » comme travaux futurs ; depuis, les patrons registre + fiche (0014, 0018, 0019), le statut dérivé (0011) et la doctrine « faits bruts sur la ligne, corrigeables à la main » (0002) ont mûri. admin.html, faite avant ces apprentissages (cartes dépliées, lecture seule), pouvait être remise en question entièrement.

## Decision
Le traitement des demandes devient une section « **Demandes** » de la page À traiter (registre en rangées compactes → **fiche de demande** ; les traitées en dessous, une ligne compacte dépliable pour l'historique dérivé du Journal via `demandeId`) ; **admin.html est retirée**. La fiche de demande montre : le contact demandé face au [[Membre]] courant avec **mise à jour en un clic** (la validation comité = ce clic, indépendant de la décision ; adresse absente de Membres → l'acceptation crée la ligne, journalisé) ; les attributions existantes de l'adresse et son quota accordé ; les suggestions = emplacements **« Disponible » seulement** (observés libres, non attribués) des structures dont la colonne `embarcations` contient le type demandé (colonne vide = accepte tout, avec mention), triées par **niveau décroissant** — croissant si mobilité réduite, structure verticale comptée au sol. **Accepter = attribuer en un seul geste** (toucher une suggestion → « Attribuer le n°X et accepter ») : première écriture d'attribution applicative — écrit `numeroAdresse`+`rue` sur la ligne d'Emplacements, `numeroAttribue`+`dateDecision` sur la demande, et un événement Journal. **Le quota bloque l'attribution** : au quota accordé, accepter est impossible dans l'app ; la porte de sortie est d'augmenter `quotaAccorde` dans Membres (le formulaire public, lui, ne bloque jamais la soumission). **Refuser** est la seule autre issue : raison en texte libre journalisée, écriture au membre en `mailto:` pré-rempli (0003). L'état d'une demande est **dérivé, jamais stocké** : la colonne `statut` disparaît au profit de deux faits — `numeroAttribue` rempli → acceptée ; `dateDecision` seule → refusée ; rien → nouvelle ; corriger à la main = vider les cellules. Notification interne au comité à la réception d'une demande (clé Config, silencieuse si absente) : retenue, construite en dernière phase.

## Alternatives rejected
- **Accepter puis attribuer en deux temps** — crée un état intermédiaire « acceptée sans place » à gérer et afficher, alors que le comité décide et assigne d'un coup.
- **L'app ne fait que suggérer, la Sheet reste le geste** — le lien demande→attribution resterait introuvable et le statut manuel.
- **Suggérer aussi les « Non observé »** — le comité ne promet que ce qui est observé libre ; l'état vide renvoie à faire une tournée.
- **Quota signalé mais non bloquant à l'attribution** — le processus choisi est que le dépassement passe par une décision durable (augmenter `quotaAccorde`), pas par un contournement au fil du traitement.
- **Garder la colonne `statut` écrite par l'app** — état dénormalisé qui peut mentir (« acceptée » sans trace de quel emplacement) ; exactement ce que 0011 a éliminé.
- **Tout dériver du Journal sans rien sur la ligne** — statut invisible dans la Sheet et correction manuelle impossible sans écrire une ligne de Journal, en tension avec 0002.
- **Page « Demandes » dédiée refaite** — une page et une navigation de plus pour un travail de bureau qui a déjà son foyer (À traiter, un seul login, patrons 0014/0018/0019).
- **MAJ automatique du contact à l'acceptation** — un conjoint qui fait une demande écraserait silencieusement le contact principal ; la validation humaine reste le clic.
- **Motifs de refus fermés** — la structure émergera de l'usage (0014) ; personne n'a demandé de statistiques.

## Trade-offs accepted
- « Disponibles seulement » peut donner une liste vide sans tournée récente — assumé, l'état vide dit quoi faire.
- Le déblocage du quota se fait dans la Sheet, hors de l'app — friction volontaire, cohérente avec 0019.
- La demande acceptée garde `numeroAttribue` même si l'emplacement est libéré plus tard — c'est un fait historique, pas l'état courant de l'emplacement.
- Migration manuelle : reporter les demandes déjà décidées dans `numeroAttribue`/`dateDecision` et retirer la colonne `statut`.
- Le retrait d'admin.html casse les signets existants du comité.

## Revisit when
- Le comité veut attribuer une place non suggérée (ex. « Non observé » vérifiée de visu) — saisie libre encadrée ou élargissement du pool.
- Les demandes s'accumulent sans place compatible — un vrai état « en attente » ou une liste d'attente ordonnée.
- Le comité veut accorder le quota depuis l'app — geste in-app journalisé sur `quotaAccorde` (déjà nommé en 0019).
- Le comité veut choisir l'emplacement sur la grille des Structures — navigation fiche de demande → grille avec état transporté.
