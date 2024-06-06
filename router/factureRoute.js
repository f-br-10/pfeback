const express = require('express');
const facture = express.Router();
const {
  getAllFactures,
  getFactureById,
  getFacturesByFournisseur,
  deleteFacture,
} = require('../controller/factureController');

facture.get('/', getAllFactures);
facture.get('/:id', getFactureById);
facture.get('/:fournisseurId', getFacturesByFournisseur); 
facture.delete('/:id', deleteFacture);

module.exports = facture;
