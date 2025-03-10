const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Підключення до бази даних
mongoose
  .connect(
    process.env.MONGODB_URI ||
      'mongodb+srv://aksi-admin:1911@aksi-cleaners.svdwy.mongodb.net/aksi-cleaners-app'
  )
  .then(() => console.log('MongoDB підключено для імпорту'))
  .catch((err) => {
    console.error('Помилка підключення до MongoDB:', err);
    process.exit(1);
  });

// Модель прайс-листа
const PriceList = mongoose.model(
  'PriceList',
  require('../models/PriceList').schema
);

// Читання файлу
const filePath = '/home/iddqd/IdeaProjects/aksi-cleaners-app/price_list.json';
const fileContent = fs.readFileSync(filePath, 'utf8');

// Розбиваємо файл на рядки
const lines = fileContent.split('\n').filter((line) => line.trim());

// Перетворення кожного рядка в об'єкт і збереження в базу даних
async function importData() {
  try {
    // Очищаємо колекцію перед імпортом
    await PriceList.deleteMany({});

    // Імпортуємо рядок за рядком
    for (const line of lines) {
      try {
        // Видаляємо коментарі та зайві пробіли
        const cleanLine = line.trim().replace(/^\s*\/\/.*/, '');
        if (!cleanLine) continue;

        const item = JSON.parse(cleanLine);

        // Перетворюємо числові поля
        if (item.вартість_замовлення)
          item.вартість_замовлення = Number(item.вартість_замовлення);
        if (item.вартість_з_деталями)
          item.вартість_з_деталями = Number(item.вартість_з_деталями);
        if (item.вартість_максимальна)
          item.вартість_максимальна = Number(item.вартість_максимальна);
        if (item.вартість_чорний_колір)
          item.вартість_чорний_колір = Number(item.вартість_чорний_колір);
        if (item.вартість_інші_кольори)
          item.вартість_інші_кольори = Number(item.вартість_інші_кольори);
        if (item.коефіцієнт) item.коефіцієнт = Number(item.коефіцієнт);
        if (item.коефіцієнт_мін)
          item.коефіцієнт_мін = Number(item.коефіцієнт_мін);
        if (item.коефіцієнт_макс)
          item.коефіцієнт_макс = Number(item.коефіцієнт_макс);

        await new PriceList(item).save();
        console.log(`Імпортовано: ${item.найменування_виробу}`);
      } catch (error) {
        console.error('Помилка в рядку:', line);
        console.error('Деталі помилки:', error);
      }
    }

    console.log('Імпорт завершено!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Помилка імпорту:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

importData();
