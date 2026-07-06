// Recopie apps-script/grille.js vers site/grille.js : le module est unique
// (décision 0009), le navigateur en reçoit une copie exacte faute de build
// (décision 0004). tests/copie-grille.test.mjs échoue si elles divergent.
import { copyFile } from 'node:fs/promises';

const source = new URL('../apps-script/grille.js', import.meta.url);
const destination = new URL('../site/grille.js', import.meta.url);
await copyFile(source, destination);
console.log('site/grille.js régénéré depuis apps-script/grille.js.');
