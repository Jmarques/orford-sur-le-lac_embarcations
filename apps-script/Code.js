// Point d'entrée du Web App. Lectures en GET, écritures en POST text/plain
// (JSON dans le corps) pour éviter le preflight CORS que Apps Script ne gère
// pas (voir docs/decisions/0001).

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || '';
    if (action === 'config') {
      return reponseJson_({ ok: true, config: lireConfig() });
    }
    throw new Error('Action GET inconnue : "' + action + '".');
  } catch (err) {
    return reponseJson_({ ok: false, erreur: String((err && err.message) || err) });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Corps de requête manquant.');
    }
    var corps = JSON.parse(e.postData.contents);
    // Sans champ `action` : création de demande (contrat du formulaire public).
    // Avec `action` : actions admin, mot de passe dans le corps (décision 0008).
    if (!corps.action) {
      var demande = parseDemande(corps, lireConfig());
      return reponseJson_({ ok: true, id: ajouterDemande(demande) });
    }
    verifierAcces(corps, lireMotDePasseComite());
    if (corps.action === 'demandes') {
      return reponseJson_({ ok: true, demandes: trierDemandes(lireDemandes()) });
    }
    if (corps.action === 'inventaire') {
      var inventaire = lireInventaire();
      return reponseJson_({ ok: true, structures: inventaire.structures, emplacements: inventaire.emplacements });
    }
    if (corps.action === 'sauverStructure') {
      return reponseJson_({ ok: true, structure: sauverStructure(corps) });
    }
    if (corps.action === 'observerEmplacement') {
      return reponseJson_({ ok: true, observation: observerEmplacement(corps) });
    }
    throw new Error('Action inconnue : "' + corps.action + '".');
  } catch (err) {
    var reponse = { ok: false, erreur: String((err && err.message) || err) };
    // Le client ré-affiche l'écran de connexion sur ce code (voir admin.js).
    if (err && err.name === 'ErreurAcces') reponse.code = 'accesRefuse';
    return reponseJson_(reponse);
  }
}

function reponseJson_(objet) {
  return ContentService.createTextOutput(JSON.stringify(objet)).setMimeType(
    ContentService.MimeType.JSON
  );
}
