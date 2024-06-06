const express = require('express');
const fournisseur = express.Router();
const {createFournisseur,getFournisseurById, getAllFournisseurs,deleteFournisseur,getServiceByFournisseur,assignServicesToFournisseur,getFournisseursWithServicesCount, updatedFournisseur} = require('../controller/fournisseurController');
const { verifyToken } = require('../verifyToken.js');


fournisseur.post('/create', verifyToken, createFournisseur);

fournisseur.get('/:id', getFournisseurById);

fournisseur.get('/', verifyToken, getAllFournisseurs);

fournisseur.patch('/update/:id', updatedFournisseur);

fournisseur.delete('/:id', verifyToken, deleteFournisseur);

fournisseur.patch('/assignServicesToFournisseur', verifyToken, assignServicesToFournisseur);

fournisseur.get('/service-distribution', getFournisseursWithServicesCount);

fournisseur.get('/:id/services', getServiceByFournisseur);


module.exports = fournisseur;
