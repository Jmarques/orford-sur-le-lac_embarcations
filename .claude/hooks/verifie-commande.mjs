/*
 * Hook PreToolUse (Bash) — fait respecter mécaniquement deux règles de CLAUDE.md
 * qui n'étaient qu'instructionnelles :
 *   1. Commandes nues, jamais composées : une commande allowlistée (npm run…,
 *      npm test, node --test, node tmp/*, sips, rm -f tmp|screenshots/*)
 *      combinée à &&, |, ;, redirection… ne matche plus l'allowlist et
 *      interromprait Jeremy avec un prompt de permission. On refuse AVANT,
 *      avec la correction à appliquer.
 *   2. Fichiers via Write/Edit uniquement : heredoc et echo/cat/printf
 *      redirigés vers un fichier sont refusés.
 * Sortie : JSON hookSpecificOutput.permissionDecision = "deny" + raison
 * (relue par l'agent, qui se corrige seul). Aucune sortie = flux normal.
 */

const brut = await new Promise((resoudre) => {
  let donnees = '';
  process.stdin.on('data', (morceau) => (donnees += morceau));
  process.stdin.on('end', () => resoudre(donnees));
});

let commande = '';
try {
  commande = JSON.parse(brut)?.tool_input?.command ?? '';
} catch {
  process.exit(0); // entrée illisible : ne jamais bloquer le flux normal
}

function refuser(raison) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: raison,
      },
    }),
  );
  process.exit(0);
}

// Les contenus entre guillemets (messages de commit…) ne comptent ni comme
// opérateur ni comme commande protégée.
const sansGuillemets = commande
  .replace(/'[^']*'/g, "''")
  .replace(/"[^"]*"/g, '""');

// Règle 2 — écriture de fichier par le shell.
if (/<<-?\s*['"]?\w/.test(sansGuillemets)) {
  refuser(
    'Heredoc refusé : les fichiers se créent avec les outils Write/Edit, ' +
      'jamais cat/echo/heredoc (CLAUDE.md).',
  );
}
if (/(^|[\s;&|(])(echo|printf|cat)\b[^|\n]*(?<![0-9&])>/.test(sansGuillemets)) {
  refuser(
    'Redirection de echo/cat/printf vers un fichier refusée : utilise les ' +
      'outils Write/Edit (CLAUDE.md).',
  );
}

// Règle 1 — composition autour d'une commande allowlistée.
const commandeProtegee =
  /(^|[\s;&|(])(npm\s+(run|test)\b|node\s+--test\b|node\s+tmp\/|sips\b|rm\s+-f\s+(tmp|screenshots)\/)/;
const operateurs = /(\|\||&&|;|\||`|\$\(|(?<!\d)[<>]|\n)/;
if (commandeProtegee.test(sansGuillemets) && operateurs.test(sansGuillemets)) {
  refuser(
    'Commande composée refusée : les commandes allowlistées (npm run…, npm test, ' +
      'node tmp/*, sips) se lancent NUES — sans &&, |, ;, redirection ni cd devant ' +
      '(CLAUDE.md). Leur sortie est déjà conçue pour être lue directement. ' +
      'Relance la commande seule ; pour cibler une page : npm run screenshots -- --page <page>.',
  );
}

process.exit(0);
