const express = require('express');
const syncRoute = express.Router();
const { fetchAndStoreOvhServices } = require('../controller/serviceController.js');
const { fetchAndStoreReclamations } = require('../controller/ovhReclamationController.js');
const { updateServiceStatus } = require('../controller/serviceController.js');
const { checkAndCreateAlerts } = require('../controller/alerteController.js');
const { fetchAndStoreOvhBills } = require('../controller/factureController.js');

// Route pour synchroniser les services
syncRoute.get('/sync-services', async (req, res) => {
  try {
    await fetchAndStoreOvhServices();
    res.status(200).send('Services synchronisés');
  } catch (error) {
    res.status(500).send('Erreur lors de la synchronisation des services: ' + error.message);
  }
});

// Route pour synchroniser les réclamations
syncRoute.get('/sync-reclamations', async (req, res) => {
  try {
    await fetchAndStoreReclamations();
    res.status(200).send('Réclamations synchronisées');
  } catch (error) {
    res.status(500).send('Erreur lors de la synchronisation des réclamations: ' + error.message);
  }
});

// Route pour mettre à jour le statut des services
syncRoute.get('/update-service-status', async (req, res) => {
  try {
    await updateServiceStatus();
    res.status(200).send('Statut des services mis à jour');
  } catch (error) {
    res.status(500).send('Erreur lors de la mise à jour du statut des services: ' + error.message);
  }
});

// Route pour vérifier et créer des alertes
syncRoute.get('/check-create-alerts', async (req, res) => {
  try {
    await checkAndCreateAlerts();
    res.status(200).send('Alertes vérifiées et créées');
  } catch (error) {
    res.status(500).send('Erreur lors de la vérification et de la création des alertes: ' + error.message);
  }
});

// Route pour synchroniser les factures
syncRoute.get('/sync-bills', async (req, res) => {
  try {
    await fetchAndStoreOvhBills();
    res.status(200).send('Factures synchronisées');
  } catch (error) {
    res.status(500).send('Erreur lors de la synchronisation des factures: ' + error.message);
  }
});

module.exports = syncRoute;
