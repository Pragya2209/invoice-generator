const mongoose = require('mongoose');

const gstRateSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    unique: true
  },
  CGST: {
    type: Number,
    required: true,
    default: 0
  },
  SGST: {
    type: Number,
    required: true,
    default: 0
  },
  IGST: {
    type: Number,
    required: true,
    default: 0
  }
});

const GSTRate = mongoose.model('GSTRate', gstRateSchema);

module.exports = GSTRate;
