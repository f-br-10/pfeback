const mongoose = require('mongoose');
const Reclamation = require('../model/ReclamationModel');
const Service = require('../model/ServiceModel');
const Fournisseur = require('../model/FournisseurModel');
const { createOvhInstance } = require('../ovhinit.js');
// Fonction pour récupérer et stocker les réclamations depuis OVH pour chaque fournisseur
async function fetchAndStoreReclamations() {
  try {
    const fournisseurs = await Fournisseur.find({ isOvh: true });

    for (const fournisseur of fournisseurs) {

      if (fournisseur.ovhApiKey && fournisseur.ovhSecret && fournisseur.ovhConsumerKey) {
        const ovhInstance = createOvhInstance(
          fournisseur.ovhApiKey,
          fournisseur.ovhSecret,
          fournisseur.ovhConsumerKey
        );

        try {
          // Récupérer la liste des réclamations OVH pour ce fournisseur
          const reclamationsList = await ovhInstance.requestPromised('GET', '/support/tickets');
          if(!reclamationsList) continue;


          for (const ticket of reclamationsList) {
            try {
              // Récupérer les détails de chaque réclamation
              const reclamationDetails = await ovhInstance.requestPromised('GET', `/support/tickets/${ticket.id}`);
              console.log('Détails de la réclamation', ticket.id, ':', reclamationDetails);

              // Vérifier si la réclamation existe déjà dans la base de données
              const existingReclamation = await Reclamation.findOne({ ticketId: reclamationDetails.ticketId });

              const reclamationData = {
                accountId: reclamationDetails.accountId,
                canBeClosed: reclamationDetails.canBeClosed,
                category: reclamationDetails.category,
                creationDate: new Date(reclamationDetails.creationDate),
                lastMessageFrom: reclamationDetails.lastMessageFrom,
                product: reclamationDetails.product,
                score: reclamationDetails.score,
                serviceName: reclamationDetails.serviceName,
                state: reclamationDetails.state,
                subject: reclamationDetails.subject,
                ticketNumber: reclamationDetails.ticketNumber,
                type: reclamationDetails.type,
                updateDate: new Date(reclamationDetails.updateDate),
                fournisseur: fournisseur._id // Associer à l'identifiant du fournisseur
              };

              if (existingReclamation) {
                // Mettre à jour les détails de la réclamation existante
                await Reclamation.updateOne({ _id: existingReclamation._id }, reclamationData);
              } else {
                // Créer une nouvelle réclamation
                const newReclamation = new Reclamation({
                  ...reclamationData,
                  ticketId: reclamationDetails.ticketId,
                });
                await newReclamation.save();
              }
            } catch (error) {
              console.error('Erreur lors de la récupération et du stockage des détails de la réclamation OVH:', error);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des réclamations OVH:', error);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
  }
}
// Créer une réclamation
async function createReclamation(req, res) {
  try {
    const { 
      fournisseurId,
      body,
      category,
      impact,
      product,
      serviceName,
      subcategory,
      subject,
      type,
      urgency
    } = req.body;

    const fournisseur = await Fournisseur.findById(fournisseurId);
    
    if (!fournisseur) {
      return res.status(404).send('Fournisseur non trouvé');
    }

    if (fournisseur.isOvh) {
      // Création d'une réclamation OVH
      const ovh = createOvhInstance(fournisseur.ovhApiKey, fournisseur.ovhSecret, fournisseur.ovhConsumerKey);

      const response = await ovh.requestPromised('POST', '/support/tickets/create', {
        body,
        category,
        impact,
        product,
        serviceName,
        subcategory,
        subject,
        type,
        urgency,
        watchers: []
      });

      const newReclamation = new Reclamation({
        accountId: response.accountId,
        canBeClosed: response.canBeClosed,
        category: response.category,
        creationDate: new Date(response.creationDate),
        lastMessageFrom: response.lastMessageFrom,
        product: response.product,
        score: response.score,
        serviceName: response.serviceName,
        state: response.state,
        subject: response.subject,
        ticketId: response.ticketId,
        ticketNumber: response.ticketNumber,
        type: response.type,
        updateDate: new Date(response.updateDate),
        fournisseur: fournisseur._id
      });

      await newReclamation.save();
      res.status(201).json(newReclamation);
    } else {
      // Création d'une réclamation pour un fournisseur non-OVH
      const newReclamation = new Reclamation({
        accountId: null,
        canBeClosed: false,
        category,
        creationDate: new Date(),
        lastMessageFrom: 'customer',
        product,
        score: null,
        serviceName,
        state: 'open',
        subject,
        ticketId: null,
        ticketNumber: null,
        type,
        updateDate: new Date(),
        fournisseur: fournisseur._id,
        body
      });

      await newReclamation.save();
      res.status(201).json(newReclamation);
    }
  } catch (error) {
    res.status(500).send('Erreur lors de la création de la réclamation: ' + error.message);
  }
}

// Supprimer une réclamation (soft delete)
async function deleteReclamation(req, res) {
  try {
    const { id } = req.params;
    const updatedReclamation = await Reclamation.findByIdAndUpdate(id, { deleted: true }, { new: true });
    if (!updatedReclamation) {
      return res.status(404).send('Réclamation non trouvée');
    }
    res.status(200).json(updatedReclamation);
  } catch (error) {
    res.status (500).send('Erreur lors de la suppression de la réclamation: ' + error.message);
  }
}
// Mettre à jour une réclamation OVH
async function updateOvhReclamation(req, res) {
  try {
    const { ticketId } = req.params;
    const { body } = req.body;

    const reclamation = await Reclamation.findOne({ ticketId });
    if (!reclamation) {
      return res.status(404).send('Réclamation non trouvée');
    }

    const fournisseur = await Fournisseur.findById(reclamation.fournisseur);
    if (!fournisseur || !fournisseur.isOvh || !fournisseur.ovhApiKey || !fournisseur.ovhSecret || !fournisseur.ovhConsumerKey) {
      return res.status(400).send('Fournisseur OVH non configuré');
    }

    const ovhInstance = createOvhInstance(fournisseur.ovhApiKey, fournisseur.ovhSecret, fournisseur.ovhConsumerKey);
    const updatedReclamation = await ovhInstance.requestPromised('POST', `/support/tickets/${ticketId}/reply`, { body });

    await Reclamation.findOneAndUpdate(
      { ticketId }, 
      { $set: { lastMessageFrom: 'customer', updateDate: new Date() } }, 
      { new: true }
    );
    res.status(200).json(updatedReclamation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réclamation OVH:', error);
    res.status(500).send('Erreur lors de la mise à jour de la réclamation OVH: ' + error.message);
  }
}
// Fermer une réclamation OVH
async function closeOvhReclamation(req, res) {
  try {
    const { ticketId } = req.params;

    const reclamation = await Reclamation.findOne({ ticketId });
    if (!reclamation) {
      return res.status(404).send('Réclamation non trouvée');
    }

    const fournisseur = await Fournisseur.findById(reclamation.fournisseur);
    if (!fournisseur || !fournisseur.isOvh || !fournisseur.ovhApiKey || !fournisseur.ovhSecret || !fournisseur.ovhConsumerKey) {
      return res.status(400).send('Fournisseur OVH non configuré');
    }

    const ovhInstance = createOvhInstance(fournisseur.ovhApiKey, fournisseur.ovhSecret, fournisseur.ovhConsumerKey);
    const closedReclamation = await ovhInstance.requestPromised('POST', `/support/tickets/${ticketId}/close`);

    await Reclamation.findOneAndUpdate(
      { ticketId }, 
      { $set: { state: 'closed', updateDate: new Date() } }, 
      { new: true }
    );
    res.status(200).json(closedReclamation);
  } catch (error) {
    console.error('Erreur lors de la fermeture de la réclamation OVH:', error);
    res.status(500).send('Erreur lors de la fermeture de la réclamation OVH: ' + error.message);
  }
}
// Obtenir toutes les réclamations
async function getAllReclamations(req, res) {
  try {
    const reclamations = await Reclamation.find({ deleted: false });
    res.status(200).json(reclamations);
  } catch (error) {
    res.status(500).send('Erreur lors de la récupération des réclamations: ' + error.message);
  }
}

// Obtenir une réclamation par ID
async function getReclamationById(req, res) {
  try {
    const { id } = req.params;
    const reclamation = await Reclamation.findById(id);
    if (!reclamation || reclamation.deleted) {
      return res.status(404).send('Réclamation non trouvée');
    }
    res.status(200).json(reclamation);
  } catch (error) {
    res.status(500).send('Erreur lors de la récupération de la réclamation: ' + error.message);
  }
}

// Obtenir le nombre de réclamations par catégorie
async function getReclamationCountsByCategory(req, res) {
  try {
    const categoryCounts = await Reclamation.aggregate([
      { $match: { deleted: false } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);
    res.status(200).json(categoryCounts);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des réclamations par catégorie', error });
  }
}

module.exports = {
  fetchAndStoreReclamations,
  createReclamation,
  updateOvhReclamation,
  closeOvhReclamation,
  getAllReclamations,
  getReclamationById,
  deleteReclamation,
  getReclamationCountsByCategory
};
