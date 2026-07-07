# PRD — Module client backend (frontend)

Status: ready-for-agent

_Candidat 01 de la revue d'architecture du 2026-07-07 (`.scratch/revue-architecture/`)._

## Problem Statement

Pour un membre du comité, l'app doit répondre à chaque geste (libérer, observer, accepter une demande, se connecter…) en parlant au backend Apps Script. « Comment parler à ce backend et interpréter un refus » est un invariant du système — mais aujourd'hui cet invariant est recopié dans chaque page et chaque fiche. Quand le protocole doit changer (un nouveau code de refus, une correction d'enveloppe, une URL), il faut éditer 6 à 11 endroits, et rien ne garantit qu'ils restent d'accord. Aucun de ces endroits n'est testé : toute la couche fetch/enveloppe du frontend a zéro couverture unitaire, parce qu'elle est enchevêtrée avec `window.fetch` et le DOM.

Concrètement, la connaissance dupliquée est :
- 11 sites `fetch(window.OSL_CONFIG.apiUrl, …)` (fiches + `structures.html` ×4 + `a-traiter.html` + `index.html` ×2).
- `class ErreurApi extends Error {}` déclarée **6×** (une par fiche et par page).
- `envoyerAction` (POST + mot de passe en corps + `.json()`) copié **3×** à l'identique (fiche.js, fiche-adresse.js, fiche-demande.js).
- `reponseAcceptee` — l'interprétation de l'enveloppe `{ok, erreur, code:'accesRefuse'}` — ré-écrite **5×** (3 fiches + inline dans `structures.html` et `a-traiter.html`).

## Solution

Un **module client** frontend qui porte, en un seul foyer, tout ce qu'un appelant doit savoir pour parler au backend : l'URL, l'astuce text/plain (pas de preflight CORS — décision 0001), le mot de passe dans le corps POST (jamais en URL — décision 0008), et l'interprétation de l'enveloppe de réponse. Les pages et les fiches passent d'un `fetch` brut + gestion d'enveloppe maison à un appel : `client.poster(corps)` ou `client.obtenir(action)`.

Du point de vue de l'utilisateur, rien ne change à l'écran : mêmes gestes, mêmes messages d'erreur métier montrés tels quels, même réaffichage de l'écran de connexion quand la session meurt. Le gain est interne : une seule interface, un seul foyer à corriger, et — pour la première fois côté frontend — un module testable en node sans navigateur.

## User Stories

1. En tant que membre du comité, je veux que libérer un emplacement continue de fonctionner à l'identique, pour ne rien avoir à réapprendre.
2. En tant que membre du comité, je veux qu'un refus métier (« hors quota », « déjà attribué ») s'affiche tel quel, pour comprendre pourquoi mon geste a échoué.
3. En tant que membre du comité, je veux qu'une session expirée me ramène à l'écran de connexion (ou referme la fiche, selon la page), pour me reconnecter sans confusion.
4. En tant que membre du comité, je veux qu'un problème réseau affiche un message rassurant distinct d'un refus métier, pour savoir s'il faut réessayer ou corriger.
5. En tant que membre du public, je veux que l'envoi d'une demande depuis le formulaire continue de marcher (POST sans mot de passe), pour réserver un emplacement.
6. En tant que membre du public, je veux que la page d'accueil charge la liste des rues et des types (GET `config`), pour remplir le formulaire.
7. En tant que développeur, je veux un seul endroit qui connaît l'URL de l'API, pour qu'un changement de déploiement ne se propage pas à la main.
8. En tant que développeur, je veux un seul endroit qui construit le corps POST (mot de passe inclus), pour que la règle « mot de passe en corps, jamais en URL » (0008) ne puisse pas diverger.
9. En tant que développeur, je veux un seul endroit qui interprète l'enveloppe `{ok, erreur, code}`, pour qu'un nouveau code de refus soit une édition unique.
10. En tant que développeur, je veux une seule définition d'`ErreurApi`, pour distinguer partout de la même façon erreur métier et erreur technique.
11. En tant que développeur, je veux pouvoir tester l'interprétation de l'enveloppe en node sans navigateur, pour couvrir les cas ok / accesRefuse / refus métier / réponse invalide.
12. En tant que développeur, je veux pouvoir tester le poster/obtenir avec un faux `fetch` injecté, pour vérifier que le corps, l'URL et le mot de passe sont bien formés sans réseau réel.
13. En tant que développeur, je veux que le module vive sans build (script global + dual-export node), pour rester cohérent avec la décision 0004.
14. En tant que membre du comité, je veux que la boucle de captures (`?etat=`, API mockée par Playwright) continue de passer, pour que la revue visuelle reste fiable.
15. En tant que développeur, je veux que la réaction à une session expirée reste propre à chaque page (fermer le drawer vs. réafficher la connexion), pour que le module client ignore les concerns de page.
16. En tant que développeur, je veux que le mode dégradé « backend pas encore redéployé » (journal/membres absents, `quotaAccorde` absent) reste signalé en console par la page, pour ne pas noyer ce diagnostic dans le client.

## Implementation Decisions

**Nouveau module `site/client.js`.** Frontend-only (pas de contrepartie apps-script, donc pas concerné par `copie-grille`). Chargé en `<script>` global sur les pages qui en ont besoin, comme `grille.js`. Porte le guard dual-export `if (typeof module !== 'undefined') { module.exports = … }` (même précédent que `grille.js`) pour être `require()`-able par les tests node. C'est le **premier module frontend testé en node**.

**Interface — factory + fonction pure (confirmé avec le développeur).** Le seam de test est le `fetch` injecté ; aucun autre.

```js
// Erreur métier renvoyée par l'API (message français montrable tel quel),
// par opposition aux erreurs techniques (réseau, json) qu'on ne montre jamais.
class ErreurApi extends Error {}

// PURE — testable sans fetch. Normalise l'enveloppe du backend :
//  ok            → renvoie le résultat (payload) tel quel
//  accesRefuse   → renvoie la sentinelle { accesRefuse: true }
//  autre refus   → lève ErreurApi(resultat.erreur)
function interpreterReponse(resultat) { … }

// FACTORY — capture les dépendances une fois.
//  fetch      : window.fetch en prod, faux en test
//  apiUrl     : window.OSL_CONFIG.apiUrl
//  motDePasse : getter () => sessionStorage… (lu frais à chaque appel ;
//               absent/inutile pour le formulaire public)
function creerClient({ fetch, apiUrl, motDePasse }) {
  // POST text/plain (pas de preflight), mot de passe fusionné dans le corps (0008)
  async function poster(corps) { … return interpreterReponse(await r.json()); }
  // GET ?action=… , sans mot de passe
  async function obtenir(action) { … return interpreterReponse(await r.json()); }
  return { poster, obtenir };
}
```

**Contrat de sortie (le contrat de données complet dès cette tranche).**
- **Succès** : `poster`/`obtenir` résolvent le payload de l'API (`{ok:true, …}` tel quel — les appelants continuent de lire `resultat.structures`, `resultat.config`, `resultat.id`, etc.).
- **Session expirée** : résolvent la sentinelle `{ accesRefuse: true }`. Le module ne déclenche **aucun** effet de bord de page ; chaque appelant garde sa réaction (fiche : fermer le drawer via `surSessionExpiree` ; `a-traiter`/`structures` : `removeItem` + réafficher la connexion).
- **Refus métier** : lève `ErreurApi(message)` — montré tel quel à l'utilisateur.
- **Erreur technique** (réseau, `.json()` qui échoue) : l'erreur d'origine se propage (pas une `ErreurApi`) — les appelants distinguent déjà `erreur instanceof ErreurApi` pour choisir le message.

**Mot de passe optionnel.** `poster` ne fusionne le mot de passe que si un getter `motDePasse` est fourni et renvoie une valeur — le POST public du formulaire de demande (index.html) crée un client sans getter, ou passe un corps sans action. `obtenir` n'envoie jamais de mot de passe (GET public `config`).

**Migration des sites d'appel.** Remplacer les 11 `fetch`, les 6 `ErreurApi`, les 3 `envoyerAction` et les 5 `reponseAcceptee` par des appels au client. Les getters existants (`options.motDePasse()`, `sessionStorage.getItem(CLE_SESSION)`) alimentent la factory. `ErreurApi` est désormais importée/exposée par le module unique (les pages y accèdent via le global du script).

**Décisions respectées, aucune rouverte.** 0001 (text/plain, pas de preflight), 0008 (mot de passe en corps POST), 0004 (sans build, script global). Aucun ADR n'est contredit — le module est purement additif puis substitutif.

**Hors du module (reste dans la page).** La réaction à `accesRefuse`, le stockage de session (`sessionStorage`), et les diagnostics de mode dégradé (journal/membres/`quotaAccorde` absents → `console.info`) restent côté page : ce sont des concerns de page, pas de transport.

## Testing Decisions

**Ce qu'est un bon test ici :** vérifier le comportement externe du module — la forme de la requête sortante et la normalisation de l'enveloppe entrante — jamais les détails internes. Deux surfaces :

1. **`interpreterReponse` (pur).** Cas : `{ok:true, …}` → renvoie le payload ; `{ok:false, code:'accesRefuse'}` → `{accesRefuse:true}` ; `{ok:false, erreur:'hors quota'}` → lève `ErreurApi` dont le message est `'hors quota'` ; réponse vide/malformée → lève `ErreurApi` avec un message de repli. Aucun `fetch`, aucun DOM.
2. **`poster` / `obtenir` (fetch injecté).** Avec un faux `fetch` qui capture ses arguments : `poster({action:'liberer', numero:12})` appelle l'URL fournie, en `POST`, avec un corps JSON contenant `action`, `numero` **et** `motDePasse` issu du getter ; `poster` d'un corps public (sans getter) n'ajoute pas de `motDePasse` ; `obtenir('config')` fait un GET sur `apiUrl + '?action=config'`, sans mot de passe. Vérifier aussi qu'une réponse `accesRefuse` remonte la sentinelle et qu'un refus métier lève `ErreurApi`.

**Module testé :** `site/client.js`, via `tests/client.test.mjs` (`node --test`).

**Prior art :**
- Dual-export + `require` depuis node : `grille.js` et ses tests (`grille.test.mjs`, `fiche.test.mjs`).
- Injection d'une dépendance impure et assertion sur l'objet produit : le split pur/impur backend, où les `preparer*` reçoivent lignes + `new Date()` et où les tests assertent `miseAJour`/`evenement` (`traitement.test.mjs`, `observation.test.mjs`).
- Test d'un helper de `tools/` requiert directement le fichier source (`captures.test.mjs`, `deploiement.test.mjs`) — précédent pour `require('../site/client.js')`.

**Non testé (comme aujourd'hui) :** le câblage DOM des pages et la réaction concrète à `accesRefuse` restent couverts par la boucle de captures (`npm run screenshots`, API mockée par Playwright via `?etat=`), pas par `node --test`.

## Out of Scope

- Les candidats 02 à 06 de la revue (view-model de statut, helpers partagés, découpe de `grille.js`, interface de la fiche, prédicat de `majLigneParCle_`) — PRD séparés.
- Toute évolution du protocole backend lui-même (`Code.js`, enveloppe de réponse) : le client reflète le contrat existant, il ne le change pas.
- Introduire un bundler ou un système de modules ES (contredirait 0004) — le module reste un script global.
- Changer la réaction d'une page à une session expirée, ou unifier les écrans de connexion.
- Retirer le mode dégradé « backend pas redéployé » ou ses messages console.

## Further Notes

- Le module ouvre la voie (sans l'imposer) à tester d'autres logiques frontend en node ; il fixe le précédent « module frontend impur = factory à dépendances injectées ».
- Séquence de migration sûre : (1) créer `site/client.js` + tests ; (2) migrer un site d'appel (p. ex. `fiche.js`) et vérifier `npm run verify` ; (3) propager aux autres fiches puis aux pages inline ; (4) supprimer les `ErreurApi`/`envoyerAction`/`reponseAcceptee` devenus morts. Chaque étape garde l'app fonctionnelle.
- Point d'attention captures : les pages chargent un nouveau `<script src="client.js">` — vérifier que `tools/screenshots.mjs` sert bien ce fichier local et que la route mock Playwright reste inchangée (le client tape toujours la même URL).
