// serviceroutes.js

const express = require('express');
const clientroute = express.Router();
const clientController = require('../controller/clientController');
const { verifyToken } = require('../verifyToken');

clientroute.post('/create',verifyToken, clientController.createClient);

clientroute.get('/getallclient',verifyToken, clientController.getAllClients); 

clientroute.get('/getclient/:id', clientController.getClientById);


clientroute.get('/:userId', clientController.getClientsByUser);


clientroute.get('/getallwithservice', clientController.getAllClientsWithServices);

clientroute.post('/remove-service-from-client', clientController.removeServiceFromClient);

clientroute.patch('/updateclient/:id', clientController.updateClient);

clientroute.delete('/deleteclient/:id', clientController.deleteClient);

clientroute.patch('/assignServicesToClient', clientController.assignServicesToClient);

module.exports = clientroute;
