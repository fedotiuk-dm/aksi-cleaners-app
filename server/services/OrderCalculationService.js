// services/OrderCalculationService.js

/**
 * Розрахувати вартість товару з урахуванням коефіцієнтів
 * @param {Object} priceListItem - Елемент прайс-листа
 * @param {Number} quantity - Кількість
 * @param {String} color - Колір (для кольорових виробів)
 * @param {Array} appliedCoefficients - Масив застосованих коефіцієнтів {назва, значення}
 * @param {Array} additionalServices - Масив додаткових послуг {назва, вартість}
 * @returns {Object} - Результат розрахунку {базова_вартість, остаточна_вартість, застосовані_коефіцієнти}
 * @throws {Error} - Помилка при некоректних вхідних даних
 * 
 * @example
 * // Розрахувати ціну для чорного виробу
 * const result = calculateItemPrice(priceItem, 2, 'чорний', [{ назва: 'Терміново', значення: 1.5 }]);
 */
function calculateItemPrice(priceListItem, quantity = 1, color = 'чорний', appliedCoefficients = [], additionalServices = []) {
    // Валідація вхідних параметрів
    if (!priceListItem || typeof priceListItem !== 'object') {
        throw new Error('Некоректний елемент прайс-листа');
    }
    
    if (quantity <= 0) {
        throw new Error('Кількість повинна бути більшою за нуль');
    }
    
    if (color !== 'чорний' && color !== 'інший') {
        throw new Error('Недопустимий колір. Допустимі значення: "чорний" або "інший"');
    }
    
    // Визначаємо базову вартість
    let basePrice = 0;
    
    if (priceListItem.вартість_чорний_колір && priceListItem.вартість_інші_кольори) {
        // Якщо це кольоровий виріб
        basePrice = color === 'чорний' 
            ? priceListItem.вартість_чорний_колір 
            : priceListItem.вартість_інші_кольори;
    } else {
        // Звичайний виріб
        basePrice = priceListItem.вартість_замовлення || 0;
    }
    
    if (basePrice < 0) {
        throw new Error('Базова вартість не може бути від\'ємною');
    }
    
    // Застосовуємо коефіцієнти
    let finalPrice = basePrice;
    const appliedCoefficientDetails = [];
    
    appliedCoefficients.forEach(coef => {
        if (typeof coef.значення !== 'number' || coef.значення <= 0) {
            throw new Error(`Некоректний коефіцієнт: ${coef.назва || 'невідомий'}`);
        }
        
        const coefficient = coef.значення;
        finalPrice *= coefficient;
        
        appliedCoefficientDetails.push({
            назва: coef.назва,
            значення: coefficient,
            опис: coef.опис || `Коефіцієнт ${coefficient}`
        });
    });
    
    // Додаємо вартість додаткових послуг
    const additionalServicesDetails = [];
    
    additionalServices.forEach(service => {
        if (typeof service.вартість !== 'number') {
            throw new Error(`Некоректна вартість додаткової послуги: ${service.назва || 'невідома'}`);
        }
        
        finalPrice += service.вартість;
        
        additionalServicesDetails.push({
            назва: service.назва,
            вартість: service.вартість,
            опис: service.опис || service.назва
        });
    });
    
    // Множимо на кількість
    finalPrice *= quantity;
    
    // Округлюємо до 2 знаків після коми
    finalPrice = Math.round(finalPrice * 100) / 100;
    
    return {
        базова_вартість: basePrice,
        остаточна_вартість: finalPrice,
        застосовані_коефіцієнти: appliedCoefficientDetails,
        додаткові_послуги: additionalServicesDetails
    };
}

/**
 * Розрахувати загальну вартість замовлення
 * @param {Array} items - Масив товарів/послуг
 * @param {Number} discount - Загальна знижка (відсоток)
 * @returns {Object} - {загальна_сума, знижка, сума_до_сплати}
 * @throws {Error} - Помилка при некоректних вхідних даних
 * 
 * @example
 * // Розрахувати загальну вартість замовлення зі знижкою 10%
 * const total = calculateOrderTotal(orderItems, 10);
 */
function calculateOrderTotal(items, discount = 0) {
    // Валідація вхідних параметрів
    if (!Array.isArray(items)) {
        throw new Error('Очікується масив товарів');
    }
    
    if (discount < 0 || discount > 100) {
        throw new Error('Знижка повинна бути від 0 до 100 відсотків');
    }
    
    const totalSum = items.reduce((sum, item) => {
        if (!item || typeof item.остаточна_вартість !== 'number') {
            throw new Error('Некоректний товар або відсутня остаточна вартість');
        }
        return sum + item.остаточна_вартість;
    }, 0);
    
    const discountAmount = totalSum * (discount / 100);
    const finalAmount = totalSum - discountAmount;
    
    // Округлюємо до 2 знаків після коми
    return {
        загальна_сума: Math.round(totalSum * 100) / 100,
        знижка: Math.round(discountAmount * 100) / 100,
        сума_до_сплати: Math.round(finalAmount * 100) / 100
    };
}

module.exports = {
    calculateItemPrice,
    calculateOrderTotal
};