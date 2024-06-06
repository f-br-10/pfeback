const Facture = require('../model/FactureModel');
const Fournisseur = require('../model/FournisseurModel');
const { createOvhInstance } = require('../ovhinit');

async function fetchAndStoreOvhBills() {
  try {
    const fournisseursOvh = await Fournisseur.find({ isOvh: true });

    for (const fournisseur of fournisseursOvh) {
      const ovhInstance = createOvhInstance(
        fournisseur.ovhApiKey,
        fournisseur.ovhSecret,
        fournisseur.ovhConsumerKey
      );

      // Récupérer la liste des factures OVH pour ce fournisseur
      const billsList = await ovhInstance.requestPromised('GET', '/me/bill');
      if(!billsList) continue;


      // Traiter la réponse de l'API OVH
      for (const billId of billsList) {
        try {
          // Récupérer les détails de chaque facture
          const billDetails = await ovhInstance.requestPromised('GET', `/me/bill/${billId}`);

          // Vérifier si la facture existe déjà dans la base de données
          const existingBill = await Facture.findOne({ billId: billDetails.billId, fournisseur: fournisseur._id });

          const billData = {
            billId: billDetails.billId,
            orderId: billDetails.orderId,
            date: new Date(billDetails.date),
            password: billDetails.password,
            pdfUrl: billDetails.pdfUrl,
            priceWithoutTax: billDetails.priceWithoutTax.value,
            priceWithTax: billDetails.priceWithTax.value,
            fournisseur: fournisseur._id,
          };

          if (existingBill) {
            // Mettre à jour les détails de la facture existante
            existingBill.orderId = billData.orderId;
            existingBill.date = billData.date;
            existingBill.password = billData.password;
            existingBill.pdfUrl = billData.pdfUrl;
            existingBill.priceWithoutTax = billData.priceWithoutTax;
            existingBill.priceWithTax = billData.priceWithTax;
            await existingBill.save();
          } else {
            // Créer une nouvelle facture
            const newBill = new Facture(billData);
            await newBill.save();
          }
        } catch (error) {
          console.error('Erreur lors de la récupération et du stockage des détails de la facture OVH:', error);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des factures OVH:', error);
  }
}


// Obtenir toutes les factures
async function getAllFactures(req, res) {
  try {
    const factures = await Facture.find({ deleted: false });
    res.status(200).json(factures);
  } catch (error) {
    res.status(500).send('Erreur lors de la récupération des factures: ' + error.message);
  }
}


// Obtenir une facture par ID
async function getFactureById(req, res) {
  try {
    const { id } = req.params;
    const facture = await Facture.findById(id);
    if (!facture || facture.deleted) {
      return res.status(404).send('Facture non trouvée');
    }
    res.status(200).json(facture);
  } catch (error) {
    res.status(500).send('Erreur lors de la récupération de la facture: ' + error.message);
  }
}
// Obtenir les factures par fournisseur
async function getFacturesByFournisseur(req, res) {
  try {
    const { fournisseurId } = req.params;
    const factures = await Facture.find({ fournisseur: fournisseurId, deleted: false });
    if (!factures.length) {
      return res.status(404).send('Aucune facture trouvée pour ce fournisseur');
    }
    res.status(200).json(factures);
  } catch (error) {
    res.status(500).send('Erreur lors de la récupération des factures: ' + error.message);
  }
}


// Supprimer une facture (soft delete)
async function deleteFacture(req, res) {
  try {
    const { id } = req.params;
    const updatedFacture = await Facture.findByIdAndUpdate(id, { deleted: true }, { new: true });
    if (!updatedFacture) {
      return res.status(404).send('Facture non trouvée');
    }
    res.status(200).json(updatedFacture);
  } catch (error) {
    res.status(500).send('Erreur lors de la suppression de la facture: ' + error.message);
  }
}


module.exports = { fetchAndStoreOvhBills, getAllFactures , getFactureById , getFacturesByFournisseur , deleteFacture};
