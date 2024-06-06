
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  type: { type: String, required: false },
  date_debut: { type: Date, required: true },
  date_fin: { type: Date, required: true },
  statut: { type: String, required: false },
  statique: { type: Boolean, default: true },
  fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
  deleted: { type: Boolean, default: false } // Ajout du champ deleted
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;

