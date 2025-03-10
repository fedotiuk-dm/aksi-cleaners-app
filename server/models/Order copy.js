// models/Order.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Схема для окремого товару/послуги в замовленні
const OrderItemSchema = new Schema({
  priceListItem: {
    type: Schema.Types.ObjectId,
    ref: 'PriceList',
    required: true,
  },
  найменування_виробу: {
    type: String,
    required: true,
    trim: true,
  },
  категорія: {
    type: String,
    required: true,
    trim: true,
  },
  од_виміру: {
    type: String,
    required: true,
    trim: true,
  },
  кількість: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  колір: {
    type: String,
    enum: ['чорний', 'інший'],
    default: 'чорний',
  },
  базова_вартість: {
    type: Number,
    required: true,
    min: 0,
  },
  застосовані_коефіцієнти: [
    {
      назва: String,
      значення: Number,
      опис: String,
    },
  ],
  додаткові_послуги: [
    {
      назва: String,
      вартість: Number,
      опис: String,
    },
  ],
  остаточна_вартість: {
    type: Number,
    required: true,
    min: 0,
  },
  коментар: String,
});

// Основна схема замовлення
const OrderSchema = new Schema(
  {
    клієнт: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    номер_замовлення: {
      type: String,
      required: true,
      unique: true,
    },
    дата_створення: {
      type: Date,
      default: Date.now,
    },
    дата_виконання: {
      type: Date,
    },
    статус: {
      type: String,
      enum: ['нове', 'в обробці', 'готове', 'видане', 'скасоване'],
      default: 'нове',
    },
    товари: [OrderItemSchema],
    загальна_сума: {
      type: Number,
      required: true,
      min: 0,
    },
    знижка: {
      type: Number,
      default: 0,
      min: 0,
    },
    сума_до_сплати: {
      type: Number,
      required: true,
      min: 0,
    },
    оплачено: {
      type: Number,
      default: 0,
      min: 0,
    },
    терміновість: {
      type: Boolean,
      default: false,
    },
    коментар: String,
    історія_змін: [
      {
        дата: {
          type: Date,
          default: Date.now,
        },
        співробітник: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        дія: String,
        деталі: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Індекси для оптимізації запитів
OrderSchema.index({ клієнт: 1 });
// OrderSchema.index({ номер_замовлення: 1 }, { unique: true });
OrderSchema.index({ дата_створення: -1 });
OrderSchema.index({ статус: 1, дата_створення: -1 });

// Автоматичне генерування номеру замовлення
OrderSchema.pre('save', async function (next) {
  if (!this.номер_замовлення) {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    // Формат номеру: РРММДД-XXX, де XXX - це порядковий номер за день
    const baseNumber = `${year}${month}${day}`;

    // Знаходимо останнє замовлення за сьогодні
    const lastOrder = await this.constructor
      .findOne({
        номер_замовлення: new RegExp(`^${baseNumber}`),
      })
      .sort({ номер_замовлення: -1 });

    // Встановлюємо порядковий номер
    let sequence = 1;
    if (lastOrder && lastOrder.номер_замовлення) {
      const parts = lastOrder.номер_замовлення.split('-');
      if (parts.length > 1) {
        sequence = parseInt(parts[1], 10) + 1;
      }
    }

    this.номер_замовлення = `${baseNumber}-${sequence
      .toString()
      .padStart(3, '0')}`;
  }
  next();
});

// Віртуальне поле для залишку до оплати
OrderSchema.virtual('залишок_до_сплати').get(function () {
  return this.сума_до_сплати - this.оплачено;
});

// Метод для перевірки повної оплати
OrderSchema.methods.повністю_оплачено = function () {
  return this.оплачено >= this.сума_до_сплати;
};

module.exports = mongoose.model('Order', OrderSchema);
