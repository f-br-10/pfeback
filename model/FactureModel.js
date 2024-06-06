const mongoose = require ("mongoose");

//Create table for factureSchema
const factureSchema = new mongoose.Schema({
    billId: { type: String },
    date: { type: Date},
    orderId: { type: Number },
    password: { type: String },
    pdfUrl: { type: String },
    priceWithoutTax: { type: Number },
    priceWithTax: { type: Number },
    fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
    deleted: { type: Boolean, default: false } 

});


const Facture = mongoose.model('Facture', factureSchema);

module.exports = Facture;
/*{
  "billId": "string",
  "category": "autorenew",
  "date": "2024-05-22T14:01:49.327Z",
  "orderId": 0,
  "password": "string",
  "pdfUrl": "string",
  "priceWithTax": {
    "currencyCode": "AUD",
    "priceInUcents": 0,
    "text": "string",
    "value": 0
  },
  "priceWithoutTax": {
    "currencyCode": "AUD",
    "priceInUcents": 0,
    "text": "string",
    "value": 0
  },
  "tax": {
    "currencyCode": "AUD",
    "priceInUcents": 0,
    "text": "string",
    "value": 0
  },
  "url": "string"
}*/
