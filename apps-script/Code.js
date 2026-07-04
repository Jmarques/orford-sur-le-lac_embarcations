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
    var demande = parseDemande(JSON.parse(e.postData.contents), lireConfig());
    var id = ajouterDemande(demande);
    return reponseJson_({ ok: true, id: id });
  } catch (err) {
    return reponseJson_({ ok: false, erreur: String((err && err.message) || err) });
  }
}

function reponseJson_(objet) {
  return ContentService.createTextOutput(JSON.stringify(objet)).setMimeType(
    ContentService.MimeType.JSON
  );
}
