// serviceroute.js

const express = require('express');
const serviceroute = express.Router();
const serviceController = require('../controller/serviceController');
const { verifyToken } = require('../verifyToken');

serviceroute.post('/create',verifyToken, serviceController.createService);

//import-ovh-services
serviceroute.get('/import-ovh-services', async (req, res) => {
    try {
      await serviceController.fetchAndStoreOvhServices();
      res.status(200).json({ message: 'Services OVH importés avec succès' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Erreur lors de l\'importation des services OVH', error });
    }
  });

serviceroute.get('/getAllServices', serviceController.getAllServices); 

serviceroute.get("/getserviceswithuser", verifyToken, serviceController.getServicesWithUser);

serviceroute.get('/getservice/:id', serviceController.getServiceById);

serviceroute.patch('/updateservice/:id', serviceController.updateService);

serviceroute.patch('/renewService', serviceController.renewService);

serviceroute.delete('/deleteService/:id', serviceController.deleteService);
 
//pour les diagrammes 
serviceroute.get('/Status-Counts', serviceController.getServiceStatusCounts);

//serviceroute.get('/fournisseur-distribution', serviceController.getServiceDistributionByFournisseur);

serviceroute.get('/expiration-dates', serviceController.getServiceExpirationDates);

module.exports = serviceroute;
