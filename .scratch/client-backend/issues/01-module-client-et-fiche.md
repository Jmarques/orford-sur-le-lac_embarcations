# 01 — Le module client + tests + fiche.js migrée

Status: done

## Parent

`.scratch/client-backend/PRD.md`

## What to build

La tranche traceuse : créer le module client frontend, le couvrir de tests node, et migrer un premier vrai appelant (la fiche d'emplacement) dessus — de bout en bout, vérifiable seul.

Le module `site/client.js` expose (seam de test = `fetch` injecté, confirmé) :

```js
class ErreurApi extends Error {}                 // erreur métier montrable telle quelle

function interpreterReponse(resultat) { … }      // PUR — normalise l'enveloppe :
//  ok          → renvoie le payload tel quel
//  accesRefuse → renvoie { accesRefuse: true }
//  autre refus → lève ErreurApi(resultat.erreur)  (repli si message absent)

function creerClient({ fetch, apiUrl, motDePasse }) {
  async function poster(corps)   { … }           // POST text/plain (pas de preflight),
                                                 // motDePasse() fusionné au corps SI getter fourni (0008)
  async function obtenir(action) { … }           // GET ?action=…, sans mot de passe
  return { poster, obtenir };
}
// + guard dual-export node (précédent grille.js) pour require() en test
```

Erreur technique (réseau, `.json()` qui échoue) : l'erreur d'origine se propage, ce n'est pas une `ErreurApi`.

Puis migrer `site/fiche.js` : remplacer son `envoyerAction`, son `reponseAcceptee` et sa `class ErreurApi` locale par un client créé avec les getters existants (`options.motDePasse()`, `window.OSL_CONFIG.apiUrl`, `window.fetch`). La réaction à `accesRefuse` (fermer le drawer via `surSessionExpiree`) reste dans la fiche : elle teste la sentinelle `{accesRefuse:true}`.

Le module est chargé en `<script src="client.js">` sur les pages qui hébergent la fiche (`structures.html`, `a-traiter.html`), avant `fiche.js`.

## Acceptance criteria

- [x] `site/client.js` créé : `creerClient`, `interpreterReponse`, `ErreurApi`, guard dual-export node.
- [x] `tests/client.test.mjs` couvre `interpreterReponse` (ok → payload ; accesRefuse → sentinelle ; refus métier → `ErreurApi` au bon message ; réponse vide/malformée → `ErreurApi` de repli).
- [x] `tests/client.test.mjs` couvre `poster`/`obtenir` avec un faux `fetch` : URL et méthode correctes, corps JSON contenant `action` + champs + `motDePasse` du getter ; corps public sans getter → pas de `motDePasse` ; `obtenir('config')` → GET `apiUrl?action=config` sans mot de passe.
- [x] `site/fiche.js` n'a plus de `fetch`, ni `envoyerAction`, ni `class ErreurApi` locale — elle passe par le client. (`reponseAcceptee` renommée `sessionEncoreValide` : ne teste plus l'enveloppe, seulement la sentinelle — l'interprétation vit dans le client.)
- [x] Les gestes de la fiche (libérer, observer, note, décision) fonctionnent à l'identique ; refus métier et session expirée se comportent comme avant.
- [x] `tools/screenshots.mjs` sert le nouveau `site/client.js` (dossier `site/` servi statiquement) ; la route mock Playwright et les captures restent inchangées (même URL tapée).
- [x] `npm run verify` passe (copie-grille + tests + captures : delta nul).

## Blocked by

None - can start immediately
