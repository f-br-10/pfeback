const mongoose = require('mongoose');

const fournisseurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  adresse: { type: String, required: true },
  telephone: { type: String, required: true },
  email: { type: String, required: true },
  isOvh: { type: Boolean, default: false },  // Ajout du champ isOvh
  ovhApiKey: { type: String },
  ovhSecret: { type: String },
  ovhConsumerKey: { type: String },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  deleted: { type: Boolean, default: false } 

});

const Fournisseur = mongoose.model('Fournisseur', fournisseurSchema);

module.exports = Fournisseur;