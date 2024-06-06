const mongoose = require('mongoose');

// Créez le schéma de réclamation
const reclamationSchema = new mongoose.Schema({
  accountId: { type: String },
  canBeClosed: { type: Boolean },
  category: { type: String, enum: ['assistance', 'billing', 'incident'] },
  creationDate: { type: Date },
  lastMessageFrom: { type: String, enum: ['customer', 'support', 'incident'] },
  product: { type: String, enum: ['adsl', 'cdn', 'dedicated', 'dedicated-billing', 'dedicated-other', 'dedicatedcloud', 'domain', 'exchange', 'fax', 'hosting', 'housing', 'iaas', 'mail', 'network', 'publiccloud', 'sms', 'ssl', 'storage', 'telecom-billing', 'telecom-other', 'vac', 'voip', 'vps', 'web', 'billing', 'web', 'other'] },
  score: { type: String },
  serviceName: { type: String },
  state: { type: String, enum: ['closed', 'open', 'unknown'] },
  subcategory: { type: String, enum: ['alerts' , 'autorenew' , 'bill' , 'down' , 'inProgress' , 'new' , 'other' , 'perfs' , 'start' , 'usage'] },
  subject: { type: String },
  ticketId: { type: Number },
  ticketNumber: { type: Number },
  type: { type: String, enum: ['criticalIntervention', 'genericRequest'] },
  updateDate: { type: Date },
  fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur' }, 
  deleted: { type: Boolean, default: false }, 
  body: { type: String } // Ajouté pour les réclamations non-OVH
});

const Reclamation = mongoose.model('Reclamation', reclamationSchema);
module.exports = Reclamation;
