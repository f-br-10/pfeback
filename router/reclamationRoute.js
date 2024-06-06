const express = require('express');
const { verifyToken , verifyTokenAndAdmin} = require('../verifyToken.js');

const reclamation = express.Router();

const {
  createReclamation,
  updateOvhReclamation,
  closeOvhReclamation, 
  getAllReclamations,
  deleteReclamation,
  getReclamationCountsByCategory
} = require('../controller/ovhReclamationController');


// Route pour créer une nouvelle réclamation OVH
reclamation.post('/create', createReclamation);

// Route pour supprimer une réclamation 
reclamation.delete("/:id", deleteReclamation);

// Route pour mettre à jour une réclamation OVH
reclamation.patch('/update/:ticketId', updateOvhReclamation);

// Route pour fermer une réclamation OVH
reclamation.post('/:ticketId/close', closeOvhReclamation);

// Route pour obtenir toutes les réclamations BD
reclamation.get('/getall', getAllReclamations);

//pour les diagrammes 
reclamation.get('/category-counts', getReclamationCountsByCategory);

module.exports = reclamation;
