const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { isValidObjectId } = require('mongoose');

// Отримати всі замовлення з пагінацією та фільтрацією
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Підготовка фільтрів
    const filter = {};
    
    // Фільтр за статусом
    if (req.query.статус && ['нове', 'в обробці', 'готове', 'видане', 'скасоване'].includes(req.query.статус)) {
      filter.статус = req.query.статус;
    }
    
    // Фільтр за клієнтом
    if (req.query.клієнт && isValidObjectId(req.query.клієнт)) {
      filter.клієнт = req.query.клієнт;
    }
    
    // Фільтр за датою
    if (req.query.дата_від || req.query.дата_до) {
      filter.дата_створення = {};
      if (req.query.дата_від) filter.дата_створення.$gte = new Date(req.query.дата_від);
      if (req.query.дата_до) filter.дата_створення.$lte = new Date(req.query.дата_до);
    }
    
    // Виконання запиту з пагінацією
    const orders = await Order.find(filter)
      .sort({ дата_створення: -1 })
      .skip(skip)
      .limit(limit)
      .select('номер_замовлення клієнт дата_створення статус загальна_сума сума_до_сплати оплачено')
      .populate('клієнт', 'name forname phone');
    
    // Отримання загальної кількості записів для пагінації
    const total = await Order.countDocuments(filter);
    
    res.json({
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Помилка отримання замовлень:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Отримати одне замовлення за ID
router.get('/:id', async (req, res) => {
  try {
    // Перевірка валідності ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }
    
    const order = await Order.findById(req.params.id)
      .populate('клієнт', 'name forname phone email address')
      .populate('товари.priceListItem');
      
    if (!order) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Помилка отримання замовлення:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Створити нове замовлення
router.post('/', async (req, res) => {
  try {
    // Валідація основних полів
    if (!req.body.клієнт || !isValidObjectId(req.body.клієнт)) {
      return res.status(400).json({ message: 'Потрібно вказати валідний ID клієнта' });
    }
    
    if (!Array.isArray(req.body.товари) || req.body.товари.length === 0) {
      return res.status(400).json({ message: 'Замовлення повинно містити хоча б один товар' });
    }
    
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Помилка при створенні замовлення:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Оновити замовлення
router.put('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }
    
    // Додамо запис в історію змін
    if (!req.body.історія_змін) {
      req.body.історія_змін = [];
    }
    
    req.body.історія_змін.push({
      дата: new Date(),
      співробітник: req.body.співробітник || null,
      дія: 'оновлення_замовлення',
      деталі: 'Оновлено інформацію про замовлення'
    });
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error('Помилка оновлення замовлення:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Змінити статус замовлення
router.patch('/:id/status', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }
    
    const { статус } = req.body;
    if (!статус || !['нове', 'в обробці', 'готове', 'видане', 'скасоване'].includes(статус)) {
      return res.status(400).json({ message: 'Невірний статус замовлення' });
    }

    // Підготовка оновлення з записом в історію
    const updateData = { 
      статус,
      $push: {
        історія_змін: {
          дата: new Date(),
          співробітник: req.body.співробітник || null,
          дія: 'зміна_статусу',
          деталі: `Статус змінено на: ${статус}`
        }
      }
    };
    
    // Якщо статус "видане", встановлюємо дату виконання
    if (статус === 'видане') {
      updateData.дата_виконання = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error('Помилка зміни статусу замовлення:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Додати оплату
router.patch('/:id/payment', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }
    
    const { сума } = req.body;
    if (!сума || typeof сума !== 'number' || сума <= 0) {
      return res.status(400).json({ message: 'Потрібно вказати коректну суму оплати' });
    }

    // Знаходимо замовлення
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }
    
    // Перевіряємо чи не перевищує сума оплати суму до сплати
    const newPaidAmount = order.оплачено + сума;
    if (newPaidAmount > order.сума_до_сплати) {
      return res.status(400).json({ 
        message: 'Сума оплати перевищує суму до сплати',
        currentlyPaid: order.оплачено,
        totalToPay: order.сума_до_сплати
      });
    }
    
    // Оновлюємо дані про оплату
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        оплачено: newPaidAmount,
        $push: {
          історія_змін: {
            дата: new Date(),
            співробітник: req.body.співробітник || null,
            дія: 'оплата',
            деталі: `Додано оплату: ${сума} грн`
          }
        }
      },
      { new: true }
    );

    res.json(updatedOrder);
  } catch (err) {
    console.error('Помилка додавання оплати:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

router.get('/', async (req, res) => {
  console.log('GET /api/orders - отримання замовлень');
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('клієнт');
    
    console.log(`Знайдено ${orders.length} замовлень`);
    // Виводимо перше замовлення для діагностики
    if (orders.length > 0) {
      console.log('Приклад першого замовлення:', JSON.stringify(orders[0], null, 2));
    }
    
    res.json(orders);
  } catch (err) {
    console.error('Помилка отримання замовлень:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// /server/routes/orders.js
router.post('/', async (req, res) => {
  console.log('POST /api/orders - створення замовлення');
  console.log('Отримані дані замовлення:', JSON.stringify(req.body, null, 2));
  
  try {
    // Базова перевірка
    if (!req.body.клієнт) {
      return res.status(400).json({ 
        error: 'Відсутні обов\'язкові поля',
        details: 'Необхідно вказати клієнта' 
      });
    }
    
    // Конвертація типів для чисел
    const orderData = {
      ...req.body,
      загальна_сума: Number(req.body.загальна_сума) || 0,
      знижка: Number(req.body.знижка) || 0,
      сума_до_сплати: Number(req.body.сума_до_сплати) || 0,
      оплачено: Number(req.body.оплачено) || 0,
      дата_створення: req.body.дата_створення || new Date(),
      
      // Забезпечуємо правильні типи для полів з товарами
      товари: Array.isArray(req.body.товари) ? req.body.товари.map(item => ({
        ...item,
        кількість: Number(item.кількість) || 1,
        базова_вартість: Number(item.базова_вартість) || 0,
        остаточна_вартість: Number(item.остаточна_вартість) || 0
      })) : []
    };
    
    // Створюємо замовлення
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    console.log('Замовлення успішно збережено, ID:', savedOrder._id);
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Помилка створення замовлення:', error);
    res.status(400).json({ 
      error: 'Не вдалося створити замовлення',
      details: error.message 
    });
  }
});

module.exports = router;