// /server/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  клієнт: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: false // Тимчасово прибрано обов'язковість для MVP
  },
  номер_замовлення: {
    type: String,
    default: () => `ORD-${Date.now().toString().slice(-6)}`
  },
  дата_створення: {
    type: Date,
    default: Date.now
  },
  дата_виконання: {
    type: Date
  },
  статус: {
    type: String,
    enum: ['нове', 'в обробці', 'готове', 'видане', 'скасоване'],
    default: 'нове'
  },
  товари: [{
    найменування_виробу: {
      type: String,
      required: true
    },
    категорія: String,
    од_виміру: String,
    кількість: {
      type: Number,
      default: 1
    },
    колір: String,
    базова_вартість: Number,
    застосовані_коефіцієнти: Array,
    додаткові_послуги: Array,
    коментар: String,
    остаточна_вартість: {
      type: Number,
      default: 0
    }
  }],
  загальна_сума: {
    type: Number,
    default: 0
  },
  знижка: {
    type: Number,
    default: 0
  },
  сума_до_сплати: {
    type: Number,
    default: 0
  },
  оплачено: {
    type: Number,
    default: 0
  },
  терміновість: {
    type: Boolean,
    default: false
  },
  коментар: String
}, {
  timestamps: true,
  // Дозволяємо додаткові поля для гнучкості
  strict: false
});

module.exports = mongoose.model('Order', orderSchema);