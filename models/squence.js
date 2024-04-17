const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
    id: {type : String, required : true},
    seq: { 
        type : Number, 
        default: 0,
        required: true
    }
});

const InvoiceModel = mongoose.model('sequence', invoiceSchema);

module.exports = InvoiceModel;
