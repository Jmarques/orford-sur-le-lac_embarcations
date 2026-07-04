// Logique pure du déploiement backend (décision 0005) — testée sous node.

import { createHash } from 'node:crypto';

export function empreinteDeContenus(fichiers) {
  const hachage = createHash('sha256');
  for (const fichier of [...fichiers].sort((a, b) => a.chemin.localeCompare(b.chemin))) {
    hachage.update(fichier.chemin);
    hachage.update('\0');
    hachage.update(fichier.contenu);
    hachage.update('\0');
  }
  return hachage.digest('hex');
}

// Remplace uniquement la ligne apiUrl de site/config.js — le reste du fichier
// (courrielComite…) est maintenu à la main et ne doit jamais être écrasé.
export function mettreAJourApiUrl(texteConfig, idDeploiement) {
  const motif = /apiUrl: 'https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec'/;
  if (!motif.test(texteConfig)) {
    throw new Error('Ligne "apiUrl: \'https://script.google.com/macros/s/…/exec\'" introuvable dans site/config.js.');
  }
  return texteConfig.replace(
    motif,
    `apiUrl: 'https://script.google.com/macros/s/${idDeploiement}/exec'`,
  );
}
