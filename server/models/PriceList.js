const mongoose = require('mongoose');

const PriceListSchema = new mongoose.Schema({
    категорія: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    '№': {
        type: Number,
        required: false
    },
    найменування_виробу: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    од_виміру: {
        type: String,
        required: false,
        trim: true
    },
    вартість_замовлення: {
        type: Number,
        default: 0,
        min: 0
    },
    вартість_з_деталями: {
        type: Number,
        min: 0
    },
    вартість_максимальна: {
        type: Number,
        min: 0
    },
    вартість_чорний_колір: {
        type: Number,
        min: 0
    },
    вартість_інші_кольори: {
        type: Number,
        min: 0
    },
    коефіцієнт: {
        type: Number,
        min: 0
    },
    коефіцієнт_мін: {
        type: Number,
        min: 0
    },
    коефіцієнт_макс: {
        type: Number,
        min: 0
    }
}, {
    timestamps: true,
    collection: 'price_list'
});

// Додаємо віртуальне поле для сумісності
PriceListSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

// Забезпечуємо, щоб віртуальні поля включалися в JSON
PriceListSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('PriceList', PriceListSchema);
