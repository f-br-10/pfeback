
const mongoose = require('mongoose');

const alerteSchema = new mongoose.Schema({
  serviceId: {type: mongoose.Schema.Types.ObjectId,ref: 'Service', required: true  },
  userId: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true},
  fournisseurId: {type: mongoose.Schema.Types.ObjectId,ref: 'Fournisseur',required: true},
  message: {type: String,required: true},
  createdAt: {type: Date,default: Date.now},
  statut: {type: String,enum: ['unread', 'read', 'processed'], default: 'unread'},
  deleted: { type: Boolean, default: false } 

});

const Alerte = mongoose.model('Alerte', alerteSchema);

module.exports = Alerte;

