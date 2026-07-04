// Données de démo (décision 0006) — à exécuter depuis l'éditeur Apps Script,
// comme setup(). Ajoute des demandes fictives (préfixées [DÉMO]) pour développer
// les pages admin sans toucher aux vraies données. N'efface jamais rien.
function setupDonneesDemo() {
  setup();
  var config = lireConfig();
  var rue = function (i) { return config.rues[i % config.rues.length]; };
  var type = function (i) { return config.types[i % config.types.length]; };
  var demos = [
    { numero: 234, nom: '[DÉMO] Jean Tremblay', courriel: 'jean@exemple.ca', telephone: '819 555-0101', mobiliteReduite: false, note: '' },
    { numero: 12, nom: '[DÉMO] Marie Gagnon', courriel: 'marie@exemple.ca', telephone: '', mobiliteReduite: true, note: 'Épaule fragile, niveau bas svp.' },
    { numero: 234, nom: '[DÉMO] John Tremblay', courriel: 'john@exemple.ca', telephone: '819 555-0102', mobiliteReduite: false, note: 'Deuxième kayak pour la même adresse.' },
    { numero: 87, nom: '[DÉMO] Louise Bélanger', courriel: 'louise@exemple.ca', telephone: '', mobiliteReduite: false, note: '' },
    { numero: 501, nom: '[DÉMO] Robert Roy', courriel: 'robert@exemple.ca', telephone: '819 555-0103', mobiliteReduite: true, note: '' },
  ];
  demos.forEach(function (demo, i) {
    ajouterDemande({
      rue: rue(i),
      numero: demo.numero,
      nom: demo.nom,
      courriel: demo.courriel,
      telephone: demo.telephone,
      type: type(i),
      mobiliteReduite: demo.mobiliteReduite,
      note: demo.note,
    });
  });
}
