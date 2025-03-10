// /server/models/Client.js
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  імя: {
    type: String,
    required: true,
    trim: true
  },
  прізвище: {
    type: String,
    required: true,
    trim: true
  },
  телефон: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  адреса: {
    type: String,
    trim: true
  },
  примітка: {
    type: String,
    trim: true
  },
  знижка: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Віртуальне поле для повного імені
clientSchema.virtual('повне_імя').get(function() {
  return `${this.прізвище} ${this.імя}`;
});

// Забезпечуємо, щоб віртуальні поля включалися в JSON
clientSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Client', clientSchema);