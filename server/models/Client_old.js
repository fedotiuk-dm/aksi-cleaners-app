const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  address: String,
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', ClientSchema);