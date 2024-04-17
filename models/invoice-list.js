const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Sequence = require('./squence')

const itemSchema = new Schema({
  // Assuming 'items' is an array of objects, you need to define the structure of these objects.
  // This is a placeholder structure. Adjust it according to your actual item structure.
  name: {type: String, required: true},
  description: {type: String, required: true},
  amount: { type: Number, required: true},
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true }
}, { _id: false }); // _id: false if you don't want Mongoose to automatically add an _id to sub-documents

const invoiceSchema = new Schema({
  id: { type: String, required: true }, // Assuming 'id' is a string. Adjust the type if necessary.
  invoiceNumber: { type : Number, required: true },
  currency: { type: String, required: true },
  currentDate: { type: String, default: new Date().toLocaleDateString() },
  PODate: { type: String, default: new Date().toLocaleDateString() },
  PODateFormat: { type : Date},
  PONumber: { type: String },
  companyName: { type: String, required: true },
  companyCity: { type: String },
  companyState: { type: String },
  companyPincode: { type: String },
  companyGSTNumber: { type: String },
  cgstPerc: { type: Number },
  igstPerc: { type: Number },
  sgstPerc: { type: Number },
  cgst: { type: Number },
  sgst: { type: Number },
  igst: { type: Number },
  total: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  hsn: { 
    type: String,
    default: process.env.hsn
   },
  items: [itemSchema] // This embeds the itemSchema defined above within the invoiceSchema
});


const InvoiceModel = mongoose.model('invoice-list', invoiceSchema);

module.exports = InvoiceModel;
