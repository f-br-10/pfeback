const Client = require('../model/ClientModel.js');
const User = require('../model/UserModel.js');
const Service = require('../model/ServiceModel.js');
const mongoose = require("mongoose");

// Créer un nouveau client
async function createClient(req, res) {
  try {
    // Recherche du client existant
    const existingClient = await Client.findOne({ email: req.body.email });
    
    // Vérification si le client existe déjà
    if (existingClient) {
      return res.status(400).json({ message: 'Le client existe déjà' });
    }

    // Création du client s'il n'existe pas encore
    const newClient = await Client.create(req.body);
    return res.status(201).json(newClient);
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    res.status(500).json({ message: 'Erreur lors de la création du client' });
  }
}

// Récupérer un client par son ID
async function getClientById(req, res) {
  try {
    const client = await Client.findById(req.params.id).populate('services');
    if (!client || client.deleted) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    return res.json(client);
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du client' });
  }
}

// Récupérer tous les clients
async function getAllClients(req, res) {
  try {
    const user = req.user;
    const userFinded = await User.findById(user._id);
    if (!userFinded) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    let clients;
    if (userFinded.isAdmin) {
      clients = await Client.find({ deleted: false }).populate('services');
    } else {
      clients = await Client.find({ services: { $in: userFinded.services }, deleted: false }).populate('services');
    }

    // Filtrer les services supprimés pour chaque client
    clients = clients.map(client => {
      client.services = client.services.filter(service => !service.deleted);
      return client;
    });

    return res.json(clients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des clients' });
  }
}

const getClientsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Trouver l'utilisateur par son identifiant
    const user = await User.findById(userId).populate('services');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Récupérer les identifiants des services associés à cet utilisateur
    const serviceIds = user.services.map(service => service._id);

    // Trouver tous les clients ayant ces services dans leur liste de services
    const clients = await Client.find({ services: { $in: serviceIds }, deleted: false }).populate('services');

    res.status(200).json(clients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients par utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// Mettre à jour un client
async function updateClient(req, res) {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClient || updatedClient.deleted) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    return res.json(updatedClient);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du client' });
  }
}

// Supprimer un client (soft delete)
async function deleteClient(req, res) {
  try {
    const client = await Client.findById(req.params.id);
    if (!client || client.deleted) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    client.deleted = true;
    await client.save();
    return res.json({ message: 'Client supprimé avec succès (soft delete)' });
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du client' });
  }
}
// Assigner des services à un client
async function assignServicesToClient(req, res) {
  try {
    const { clientId, serviceIds } = req.body;

    // Vérifier si le client existe
    const client = await Client.findById(clientId);
    if (!client || client.deleted) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    // Vérifier si les services existent
    const services = await Service.find({ _id: { $in: serviceIds } });
    if (!services || services.length !== serviceIds.length) {
      return res.status(404).json({ message: 'Un ou plusieurs services non trouvés' });
    }

    // Filtrer les services déjà assignés à d'autres clients
    const availableServiceIds = [];
    const alreadyAssignedServices = [];
    for (const service of services) {
      const existingClient = await Client.findOne({ services: service._id });
      if (!existingClient || existingClient._id.equals(clientId)) {
        availableServiceIds.push(service._id);
      } else {
        console.log(`Le service ${service._id} est déjà assigné au client ${existingClient._id}`);
        alreadyAssignedServices.push(service._id);
      }
    }

    // Vérifier si aucun service n'est disponible à assigner
    if (availableServiceIds.length === 0) {
      return res.status(400).json({ message: 'Tous les services demandés sont déjà assignés à un autre client.' });
    }

    // Vérifier si le client a déjà certains services attribués
    const existingServices = client.services.map(service => service.toString());
    const newServices = availableServiceIds.filter(serviceId => !existingServices.includes(serviceId.toString()));

    if (newServices.length === 0) {
      return res.status(400).json({ message: 'Le client a déjà tous les services demandés.' });
    }

    // Fusionner les services existants et les nouveaux services disponibles
    const updatedServices = [...new Set([...client.services, ...newServices])];

    // Assigner les services disponibles au client
    client.services = updatedServices;
    await client.save();

    return res.status(200).json({ 
      message: 'Services assignés au client avec succès', 
      services: updatedServices 
    });
  } catch (error) {
    console.error('Erreur lors de l\'assignation des services au client:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}


// Obtenir tous les clients avec leurs services associés
async function getAllClientsWithServices(req, res) {
  try {
    const clients = await Client.find({ deleted: false, services: { $exists: true, $ne: [] } }).populate('services').exec();
    res.status(200).json(clients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients avec leurs services:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

// Supprimer un service d'un client
async function removeServiceFromClient(req, res) {
  try {
    const { clientId, serviceId } = req.body;

    // Vérifier si le client existe
    const client = await Client.findById(clientId);
    if (!client || client.deleted) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    // Vérifier si le service existe et est assigné à ce client
    const serviceIndex = client.services.findIndex(id => id.equals(new mongoose.Types.ObjectId(serviceId)));
    if (serviceIndex === -1) {
      return res.status(404).json({ message: 'Service non trouvé pour ce client' });
    }

    // Supprimer le service de la liste des services du client
    client.services.splice(serviceIndex, 1);
    await client.save();

    return res.status(200).json({ message: 'Service supprimé du client avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du service du client:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}



module.exports = {
  createClient,
  getClientById,
  getAllClients,
  updateClient,
  deleteClient,
  assignServicesToClient,
  getAllClientsWithServices,removeServiceFromClient,
  getClientsByUser

};
