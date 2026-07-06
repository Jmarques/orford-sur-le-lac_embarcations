# Design brief — Fiche d'emplacement (décision 0018)

## Audience et ton

Membres du comité, majoritairement aînés, le plus souvent sur téléphone — parfois debout devant la
structure, plein soleil. Ton factuel et rassurant : la fiche parle d'un emplacement et d'un membre de
la communauté, jamais d'un « fautif ». Deux onglets larges, libellés en un mot du glossaire, cibles
généreuses (`size="l"` sur les gestes), aucun jargon.

## Ce que c'est

LA vue détaillée d'un emplacement — la même depuis la grille des Structures et depuis le registre
À traiter. Un drawer qui monte du bas sur téléphone (la grille reste visible au-dessus : on ne perd
pas la cellule qu'on vient de toucher) et qui glisse du côté droit sur grand écran. Contrainte forte :
**tout tient sans défilement de la fiche** sur un téléphone courant — seul le journal défile, en
interne.

## Hiérarchie (de haut en bas)

1. **Titre du drawer** (header wa-drawer) : « Emplacement 74 · Structure S01 · Niveau 2 » — l'identité
   et la position, une seule fois. Bouton fermer natif du drawer.
2. **Statut** : callout coloré (mêmes variantes/icônes que l'ancien panneau), libellé fort
   (« Attribué, libre ») + une ligne de détail qui porte LE fait décisif du statut :
   - Attribué, libre → « Attribué mais observé libre — libre depuis le 3 juin · 2 observations. »
   - À identifier → « Non attribué, mais une embarcation s'y trouve — apparue entre le 3 mai et le 12 juin. »
   - En ordre / Disponible / Non observé → l'explication dérivée existante (grille.js), sans adresse
     (elle vit dans la ligne membre — une info, un foyer, 0016).
3. **Membre** (si attribué) : nom en semi-gras, adresse en quiet, téléphone + courriel en liens
   tappables (`tel:`, `mailto:`) sur une ligne qui se replie. Si attribué sans ligne Membres :
   « Aucun membre inscrit dans l'onglet Membres pour cette adresse. » Non attribué : rien (le statut
   le dit déjà).
4. **Onglets** (wa-tab-group) : **Observer** | **Traiter**. La page d'origine choisit l'onglet actif à
   l'ouverture (Structures → Observer, À traiter → Traiter) ; tout reste accessible.
   - **Observer** : dernière observation en une ligne de caption (« Dernière observation : libre,
     le 20 juin. » / « Jamais observé pour l'instant. »), question « Qu'observez-vous sur place ? »
     (h3 discret), deux gros boutons Occupé / Libre — l'état courant est le seul bouton accent + coche,
     dit aussi en toutes lettres par la ligne de dernière observation (la couleur ne porte jamais seule).
   - **Traiter** : « Journal de l'emplacement » (h3), liste chronologique d'événements (icône par type),
     à défilement interne au-delà de ~4 lignes, défilée au plus récent ; champ « Ajouter une note » +
     bouton ; gestes en cluster : « Écrire au membre » (si courriel connu), « Libérer l'emplacement »
     (si attribué, confirmation obligatoire).
5. **Note du comité** de la ligne d'emplacement (annotation durable) : citation en retrait sous le
   membre, seulement si présente.

## Gestes et cycle de vie

- Les gestes suivent le **statut**, jamais la page. Observer : toujours. Note : toujours. Écrire :
  courriel connu. Libérer : attribué.
- **Tout geste laisse la fiche ouverte** (y compris la libération). Après succès : re-fetch de
  l'inventaire (0002), re-rendu de la fiche en place (statut, signal, journal, boutons, membre) et de
  la page derrière (rappel fourni par la page). Le feedback, c'est le changement visible — aucun
  message de succès (0016).
- Champ de note vidé après succès, conservé après échec.

## États

- **Chargement** (pendant un geste) : `loading` sur le bouton acteur, boutons voisins désactivés.
  Pas de squelette : la fiche s'ouvre toujours sur des données déjà chargées par la page.
- **Vide** : journal sans événement → « Rien au journal pour l'instant. » (caption quiet).
- **Erreur d'envoi** : callout danger DANS l'onglet actif, près du geste qui a échoué ; texte saisi
  conservé ; scrollIntoView + focus. Session expirée → fermeture de la fiche + écran de connexion
  avec message de refus (comportement des pages conservé).
- **Succès** : le changement visible (statut basculé, ligne au journal, boutons re-marqués).

## Composition (Web Awesome)

- `wa-drawer` : `placement="bottom"` si écran étroit (matchMedia à l'ouverture), sinon `end` ;
  `--size` en tokens ; header natif (label = titre) ; footer sans bouton (le X du header suffit sur
  une fiche sans état à valider — moins de meubles, 0016). Focus géré par le drawer.
- `wa-tab-group` / `wa-tab` / `wa-tab-panel` ; `active` posé selon la page.
- Callout de statut : variantes existantes (success/warning/danger/brand/neutral).
- Boutons d'observation : réutilise `.boutons-occupation` / `.bouton-occupation` (theme.css).
- Journal : réutilise `.liste-evenements` / `.ligne-journal` (theme.css) + nouveau conteneur défilable.
- Tokens uniquement ; nouvelles règles dans `site/theme.css` (0004).

## Anti-buts

- Pas de duplication d'information entre en-tête et onglets (0016) : l'adresse vit dans la ligne
  membre, la position dans le titre, le « depuis quand » dans le callout de statut.
- Pas de workflow, pas d'état de traitement : le journal reste la mémoire libre du comité (0014).
- La tournée ne passe JAMAIS par la fiche (0013).
