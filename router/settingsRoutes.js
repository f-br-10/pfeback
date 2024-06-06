// settingsRoutes.js
const express  = require('express');
const { getUserSettings, updateOrCreateUserSettings } = require('../controller/settingsController.js');

const settingsRoutes = express.Router();

// Route pour récupérer les paramètres de notification d'un utilisateur
settingsRoutes.get('/:userId', getUserSettings);


settingsRoutes.put('/:userId', updateOrCreateUserSettings);

module.exports = settingsRoutes;