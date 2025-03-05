import React, { useState, useEffect } from 'react';
import './OrderForm.css';

const OrderForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    client: {
      name: '',
      phone: '',
      email: ''
    },
    items: [
      {
        description: '',
        service: 'cleaning', // За замовчуванням - чистка
        material: '',
        color: '',
        notes: '',
        price: 0
      }
    ],
    status: 'new',
    totalAmount: 0,
    discount: 0,
    receivedDate: new Date().toISOString().split('T')[0],
    promisedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +3 дні за замовчуванням
    notes: '',
    isPaid: false,
    paymentMethod: 'cash',
    branch: 'main'
  });

  // Якщо передано початкові дані, оновлюємо форму
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Оновлення загальної суми при зміні предметів або знижки
  useEffect(() => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + Number(item.price), 0);
    const discountAmount = itemsTotal * (formData.discount / 100);
    setFormData(prev => ({
      ...prev,
      totalAmount: itemsTotal - discountAmount
    }));
  }, [formData.items, formData.discount]);

  // Обробник зміни даних клієнта
  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      client: {
        ...prev.client,
        [name]: value
      }
    }));
  };

  // Обробник зміни предметів замовлення
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [name]: name === 'price' ? Number(value) : value
    };

    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  // Додавання нового предмету
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          service: 'cleaning',
          material: '',
          color: '',
          notes: '',
          price: 0
        }
      ]
    }));
  };

  // Видалення предмету
  const removeItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  // Обробник зміни загальних даних замовлення
  const handleOrderChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : finalValue
    }));
  };

  // Відправка форми
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="order-form-container">
      <h2>Нове замовлення</h2>
      <form onSubmit={handleSubmit}>
        {/* Дані клієнта */}
        <div className="form-section">
          <h3>Інформація про клієнта</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientName">П.І.Б. клієнта*</label>
              <input
                type="text"
                id="clientName"
                name="name"
                value={formData.client.name}
                onChange={handleClientChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="clientPhone">Телефон*</label>
              <input
                type="tel"
                id="clientPhone"
                name="phone"
                value={formData.client.phone}
                onChange={handleClientChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="clientEmail">Email</label>
              <input
                type="email"
                id="clientEmail"
                name="email"
                value={formData.client.email}
                onChange={handleClientChange}
              />
            </div>
          </div>
        </div>

        {/* Предмети замовлення */}
        <div className="form-section">
          <h3>Речі для обробки</h3>
          {formData.items.map((item, index) => (
            <div key={index} className="item-container">
              <div className="form-row">
                <div className="form-group flex-grow">
                  <label htmlFor={`item-description-${index}`}>Опис речі*</label>
                  <input
                    type="text"
                    id={`item-description-${index}`}
                    name="description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`item-service-${index}`}>Послуга*</label>
                  <select
                    id={`item-service-${index}`}
                    name="service"
                    value={item.service}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                  >
                    <option value="cleaning">Чистка</option>
                    <option value="washing">Прання</option>
                    <option value="ironing">Прасування</option>
                    <option value="leather">Обробка шкіри</option>
                    <option value="dyeing">Фарбування</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor={`item-price-${index}`}>Ціна*</label>
                  <input
                    type="number"
                    id={`item-price-${index}`}
                    name="price"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`item-material-${index}`}>Матеріал</label>
                  <input
                    type="text"
                    id={`item-material-${index}`}
                    name="material"
                    value={item.material}
                    onChange={(e) => handleItemChange(index, e)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`item-color-${index}`}>Колір</label>
                  <input
                    type="text"
                    id={`item-color-${index}`}
                    name="color"
                    value={item.color}
                    onChange={(e) => handleItemChange(index, e)}
                  />
                </div>
                <div className="form-group flex-grow">
                  <label htmlFor={`item-notes-${index}`}>Примітки</label>
                  <input
                    type="text"
                    id={`item-notes-${index}`}
                    name="notes"
                    value={item.notes}
                    onChange={(e) => handleItemChange(index, e)}
                  />
                </div>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger remove-item"
                    onClick={() => removeItem(index)}
                  >
                    Видалити
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="buttons-row">
            <button type="button" onClick={addItem} className="btn btn-secondary">
              + Додати ще одну річ
            </button>
          </div>
        </div>

        {/* Деталі замовлення */}
        <div className="form-section">
          <h3>Деталі замовлення</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="receivedDate">Дата прийому*</label>
              <input
                type="date"
                id="receivedDate"
                name="receivedDate"
                value={formData.receivedDate}
                onChange={handleOrderChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="promisedDate">Дата готовності*</label>
              <input
                type="date"
                id="promisedDate"
                name="promisedDate"
                value={formData.promisedDate}
                onChange={handleOrderChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Статус*</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleOrderChange}
                required
              >
                <option value="new">Прийнято</option>
                <option value="processing">В обробці</option>
                <option value="ready">Готово</option>
                <option value="delivered">Видано</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="branch">Філія*</label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleOrderChange}
                required
              >
                <option value="main">Головна хімчистка</option>
                <option value="branch1">Пункт прийому 1</option>
                <option value="branch2">Пункт прийому 2</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="discount">Знижка (%)</label>
              <input
                type="number"
                id="discount"
                name="discount"
                min="0"
                max="100"
                value={formData.discount}
                onChange={handleOrderChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="totalAmount">Загальна сума</label>
              <input
                type="number"
                id="totalAmount"
                name="totalAmount"
                value={formData.totalAmount}
                readOnly
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="isPaid"
                name="isPaid"
                checked={formData.isPaid}
                onChange={handleOrderChange}
              />
              <label htmlFor="isPaid">Оплачено</label>
            </div>

            {formData.isPaid && (
              <div className="form-group">
                <label htmlFor="paymentMethod">Спосіб оплати</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleOrderChange}
                >
                  <option value="cash">Готівка</option>
                  <option value="card">Карта</option>
                  <option value="transfer">Переказ</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Примітки до замовлення</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleOrderChange}
              rows="3"
            ></textarea>
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn btn-primary">Зберегти замовлення</button>
          <button type="button" className="btn btn-secondary">Скасувати</button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;