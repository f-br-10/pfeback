// controllers/chartController.js
const Service = require('../model/ServiceModel');
const Facture = require('../model/FactureModel');
const Reclamation = require('../model/ReclamationModel');
const User = require('../model/UserModel');
const Client = require('../model/ClientModel');

exports.getServicesByFournisseur = async (req, res) => {
  try {
    const services = await Service.aggregate([
      { $match: { deleted: false } },
      {
        $group: {
          _id: '$fournisseur',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'fournisseurs', // Le nom de la collection des fournisseurs dans votre base de données
          localField: '_id',
          foreignField: '_id',
          as: 'fournisseurInfo'
        }
      },
      { $unwind: '$fournisseurInfo' }, // Déplier le tableau résultant
      { $project: { _id: 1, count: 1, nom: '$fournisseurInfo.nom' } } // Sélectionner uniquement les champs nécessaires
    ]);
    res.status(200).json(services);
  } catch (error) {
    console.error('Erreur lors de la récupération des services par fournisseur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};
exports.getFacturesByFournisseur = async (req, res) => {
  try {
    const factures = await Facture.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: '$fournisseur', count: { $sum: 1 } } }
    ]);
    res.status(200).json(factures);
  } catch (error) {
    console.error('Erreur lors de la récupération des factures par fournisseur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

exports.getReclamationsByCategory = async (req, res) => {
  try {
    const reclamations = await Reclamation.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.status(200).json(reclamations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réclamations par catégorie:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

exports.getUsersWithMostServices = async (req, res) => {
  try {
    const users = await User.aggregate([
      { $match: { deleted: false } },
      { $project: { nom: 1, prenom: 1, serviceCount: { $size: '$services' } } },
      { $sort: { serviceCount: -1 } },
      { $limit: 10 }
    ]);
    res.status(200).json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs avec le plus de services:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

exports.getClientsWithMostServices = async (req, res) => {
  try {
    const clients = await Client.aggregate([
      { $match: { deleted: false } },
      {
        $lookup: {
          from: 'services',
          localField: 'services',
          foreignField: '_id',
          as: 'services'
        }
      },
      {
        $unwind: {
          path: '$services',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          'services.deleted': false
        }
      },
      {
        $group: {
          _id: '$_id',
          nom: { $first: '$nom' },
          serviceCount: { $sum: 1 }
        }
      },
      {
        $sort: { serviceCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 1,
          nom: 1,
          serviceCount: 1
        }
      }
    ]);
    res.status(200).json(clients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients avec le plus de services:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

