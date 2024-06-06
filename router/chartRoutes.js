// route/chartRouteRoutes.js
const express = require('express');
const chartRoute = express.Router();
const chartRouteController = require('../controller/chartController');

chartRoute.get('/services-by-fournisseur', chartRouteController.getServicesByFournisseur);
chartRoute.get('/factures-by-fournisseur', chartRouteController.getFacturesByFournisseur);
chartRoute.get('/reclamations-by-category', chartRouteController.getReclamationsByCategory);
chartRoute.get('/clients-with-most-services', chartRouteController.getClientsWithMostServices);

module.exports = chartRoute;
