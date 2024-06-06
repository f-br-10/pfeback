const Fournisseur = require('../model/FournisseurModel.js'); 
const User = require('../model/UserModel.js');
const Service = require('../model/ServiceModel.js');


// Créer un nouveau fournisseur
async function createFournisseur(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const { nom, adresse, telephone, email, isOvh, ovhApiKey, ovhSecret, ovhConsumerKey } = req.body;

    // Vérifier si un fournisseur avec le même nom et la même adresse existe déjà
    const existingFournisseur = await Fournisseur.findOne({ nom, adresse });
    if (existingFournisseur) {
      return res.status(409).json({ message: 'Fournisseur existe déjà' });
    }

    // Créer un objet fournisseur avec les champs de base
    const fournisseurData = {
      nom,
      adresse,
      telephone,
      email,
      isOvh: isOvh || false  // Assigner isOvh à false par défaut si non fourni
    };

    // Ajouter les clés OVH uniquement si le champ isOvh est vrai
    if (isOvh) {
      fournisseurData.ovhApiKey = ovhApiKey;
      fournisseurData.ovhSecret = ovhSecret;
      fournisseurData.ovhConsumerKey = ovhConsumerKey;
    }

    const newFournisseur = new Fournisseur(fournisseurData);
    await newFournisseur.save();
    
    return res.status(201).json(newFournisseur);
  } catch (error) {
    console.error('Erreur lors de la création du fournisseur:', error);
    res.status(500).json({ message: 'Erreur lors de la création du fournisseur' });
  }
}


// Récupérer un fournisseur par son ID
async function getFournisseurById(req, res) {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id).populate('services');
    if (!fournisseur || fournisseur.deleted) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }
    return res.json(fournisseur);
  } catch (error) {
    console.error('Erreur lors de la récupération du fournisseur:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du fournisseur' });
  }
}

// Récupérer tous les fournisseurs
async function getAllFournisseurs(req, res) {
  try {
    const user = req.user;
    const userFinded = await User.findById(user._id);
    if(!userFinded) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    let fournisseurs;
    if(userFinded.isAdmin) {
      fournisseurs = await Fournisseur.find({ deleted: false }).populate("services");
    } else {
      fournisseurs = await Fournisseur.find({ services: { $in: userFinded.services }, deleted: false }).populate("services");
    }
    return res.json(fournisseurs);
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des fournisseurs' });
  }
}
// Mettre à jour un fournisseur
async function updatedFournisseur(req, res) {
  try {
    const updatedFournisseur = await Fournisseur.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFournisseur || updatedFournisseur.deleted) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }
    return res.json(updatedFournisseur);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du fournisseur:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du fournisseur' });
  }
}
 // supprimer un fournisseur 
async function deleteFournisseur(req, res) {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id);
    if (!fournisseur || fournisseur.deleted) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    // Marquer le fournisseur comme supprimé (soft delete)
    fournisseur.deleted = true;
    await fournisseur.save();

    // Mettre à jour tous les services associés pour les marquer comme supprimés
    await Service.updateMany({ fournisseur: fournisseur._id }, { $set: { deleted: true } });

    return res.json({ message: 'Fournisseur supprimé avec succès (soft delete)' });
  } catch (error) {
    console.error('Erreur lors de la suppression du fournisseur:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du fournisseur' });
  }
}

// Assigner des services à un fournisseur
async function assignServicesToFournisseur(req, res) {
  try {
    const { fournisseurId, serviceIds } = req.body;

    // Vérifier si le fournisseur existe
    const fournisseur = await Fournisseur.findById(fournisseurId);
    if (!fournisseur || fournisseur.deleted) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    // Vérifier si les services existent
    const services = await Service.find({ _id: { $in: serviceIds } });
    if (!services || services.length !== serviceIds.length) {
      return res.status(404).json({ message: 'Un ou plusieurs services non trouvés' });
    }

    // Assigner les services au fournisseur
    fournisseur.services = serviceIds;
    await fournisseur.save();

    return res.status(200).json({ message: 'Services assignés au fournisseur avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'assignation des services au fournisseur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

// Récupérer les services d'un fournisseur par l'ID du fournisseur
async function getServiceByFournisseur(req, res) {
  try {
    const fournisseurId = req.params.id;

    // Vérifier si le fournisseur existe et n'est pas supprimé
    const fournisseur = await Fournisseur.findById(fournisseurId).populate('services');
    if (!fournisseur || fournisseur.deleted) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    // Récupérer les services associés à ce fournisseur
    const services = await Service.find({ _id: { $in: fournisseur.services }, deleted: false });
    return res.status(200).json(services);
  } catch (error) {
    console.error('Erreur lors de la récupération des services du fournisseur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

// Récupérer les fournisseurs avec le nombre de services
async function getFournisseursWithServicesCount(req, res) {
  try {
    const fournisseurs = await Fournisseur.aggregate([
      {
        $match: { deleted: false } // Ne prendre en compte que les fournisseurs non supprimés
      },
      {
        $lookup: {
          from: 'services',
          localField: 'services',
          foreignField: '_id',
          as: 'fournisseurServices'
        }
      },
      {
        $project: {
          nom: 1,
          servicesCount: { $size: '$fournisseurServices' }
        }
      }
    ]);
    res.status(200).json(fournisseurs);
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des fournisseurs', error });
  }
}

module.exports = {
  createFournisseur,
  getFournisseurById,
  getAllFournisseurs,
  deleteFournisseur,
  assignServicesToFournisseur,
  getServiceByFournisseur,
  getFournisseursWithServicesCount,
  updatedFournisseur
};
