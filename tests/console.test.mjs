import { test } from 'node:test';
import assert from 'node:assert/strict';

import { estProblemeConsole } from '../tools/captures.mjs';

test('les erreurs et avertissements console sont des problèmes', () => {
  assert.equal(estProblemeConsole('error', 'TypeError: x is undefined', []), true);
  assert.equal(estProblemeConsole('warning', '[wa-input] size="large" is deprecated.', []), true);
});

test('les messages info/log ne sont pas des problèmes', () => {
  assert.equal(estProblemeConsole('log', 'chargement ok', []), false);
  assert.equal(estProblemeConsole('info', 'détail', []), false);
});

test('un motif ignoré explicitement n\'est pas un problème', () => {
  assert.equal(
    estProblemeConsole('warning', 'bruit connu du CDN', [/bruit connu/]),
    false,
  );
});
