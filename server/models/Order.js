const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  client: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: String
  },
  items: [{
    description: {
      type: String,
      required: true
    },
    service: {
      type: String,
      required: true,
      enum: ['cleaning', 'washing', 'ironing', 'leather', 'dyeing']
    },
    material: String,
    color: String,
    notes: String,
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  status: {
    type: String,
    required: true,
    enum: ['new', 'processing', 'ready', 'delivered'],
    default: 'new'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  receivedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  promisedDate: {
    type: Date,
    required: true
  },
  completedDate: Date,
  notes: String,
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer'],
    default: 'cash'
  },
  branch: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Автоматичне генерування номеру замовлення
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    // Формат номеру: РРММДД-XXX, де XXX - це порядковий номер за день
    const baseNumber = `${year}${month}${day}`;

    // Знаходимо останнє замовлення за сьогодні
    const lastOrder = await this.constructor.findOne({
      orderNumber: new RegExp(`^${baseNumber}`)
    }).sort({ orderNumber: -1 });

    // Встановлюємо порядковий номер
    let sequence = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const parts = lastOrder.orderNumber.split('-');
      if (parts.length > 1) {
        sequence = parseInt(parts[1], 10) + 1;
      }
    }

    this.orderNumber = `${baseNumber}-${sequence.toString().padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);