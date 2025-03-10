// client/src/pages/NewOrderPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer/Footer';
import PriceListSelector from '../components/PriceListSelector/PriceListSelector';
import CoefficientsSelector from '../components/CoefficientsSelector/CoefficientsSelector';
import './NewOrderPage.css';

// Імпортуємо іконки, якщо встановили пакет lucide-react
import { Camera, Search, UserPlus, Plus, Trash2 } from 'lucide-react';

const NewOrderPage = () => {
  const [client, setClient] = useState(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [expectedDate, setExpectedDate] = useState('');
  const [urgency, setUrgency] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Обчислення загальної суми та фінальної суми
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    setTotalAmount(total);

    // Застосовуємо знижку клієнта або загальну знижку
    const clientDiscount = client?.discount || 0;
    setDiscount(clientDiscount);

    // Обчислюємо фінальну суму зі знижкою
    const discountAmount = total * (clientDiscount / 100);
    setFinalAmount(Math.max(0, total - discountAmount));

    // Встановлюємо очікувану дату виконання (за замовчуванням +3 дні, якщо термінове - +1 день)
    const today = new Date();
    const addDays = urgency ? 1 : 3;
    const expectedDateValue = new Date(today);
    expectedDateValue.setDate(today.getDate() + addDays);

    // Форматуємо дату як рядок "ДД-ММ-РРРР"
    const formattedDate = expectedDateValue.toLocaleDateString('uk-UA');
    setExpectedDate(formattedDate);
  }, [items, client, urgency]);

  // Пошук клієнтів при введенні в поле пошуку
  const searchClients = useCallback(async () => {
    if (!clientSearchTerm.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await axios.get(
        `/api/clients/search?term=${encodeURIComponent(clientSearchTerm)}`
      );
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Помилка пошуку клієнтів:', error);
      setError('Не вдалося виконати пошук. Будь ласка, спробуйте ще раз.');
    } finally {
      setIsSearching(false);
    }
  }, [clientSearchTerm]);

  // Обробка вибору клієнта зі списку
  const handleSelectClient = (selectedClient) => {
    setClient(selectedClient);
    setSearchResults([]);
    setClientSearchTerm('');
  };

  // Обробка створення нового клієнта
  const handleNewClient = () => {
    // Відкриття модального вікна створення клієнта або перехід на сторінку створення
    navigate('/clients/new', {
      state: { returnTo: '/orders/new', phone: clientSearchTerm },
    });
  };

  // Додавання нового товару до замовлення
  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        priceListItem: null, // Тут буде зберігатися вибраний елемент з прайс-листа
        itemName: '',
        category: '',
        unit: '',
        color: 'чорний',
        quantity: 1,
        basePrice: 0,
        coefficients: [],
        additionalServices: [],
        price: 0,
        notes: '',
      },
    ]);
  };

  // Видалення товару із замовлення
  const removeItem = (itemId) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  // Оновлення параметрів товару
  const updateItem = (itemId, updates) => {
    setItems(
      items.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  // Обробка вибору товару з PriceListSelector
  const handleItemSelect = (itemIndex, selectedPriceItem) => {
    if (itemIndex < 0 || itemIndex >= items.length) return;

    const updatedItems = [...items];
    const item = updatedItems[itemIndex];

    updatedItems[itemIndex] = {
      ...item,
      priceListItem: selectedPriceItem._id,
      itemName: selectedPriceItem.найменування_виробу,
      category: selectedPriceItem.категорія,
      unit: selectedPriceItem.од_виміру,
      basePrice: selectedPriceItem.вартість_замовлення || 0,
      price: selectedPriceItem.вартість_замовлення || 0,
    };

    setItems(updatedItems);
  };

  // Обробка зміни коефіцієнтів
  const handleCoefficientsChange = (itemIndex, data) => {
    if (itemIndex < 0 || itemIndex >= items.length) return;

    const updatedItems = [...items];
    const item = updatedItems[itemIndex];

    // Оновлюємо коефіцієнти та додаткові послуги
    updatedItems[itemIndex] = {
      ...item,
      coefficients: data.коефіцієнти || [],
      additionalServices: data.додаткові_послуги || [],
    };

    // Обчислюємо нову ціну з урахуванням усіх коефіцієнтів
    let newPrice = item.basePrice * item.quantity;

    // Застосовуємо коефіцієнти
    if (data.коефіцієнти && data.коефіцієнти.length > 0) {
      data.коефіцієнти.forEach((coef) => {
        if (coef.значення) {
          newPrice *= coef.значення;
        }
      });
    }

    // Додаємо вартість додаткових послуг
    if (data.додаткові_послуги && data.додаткові_послуги.length > 0) {
      data.додаткові_послуги.forEach((service) => {
        if (service.вартість) {
          newPrice += service.вартість;
        }
      });
    }

    // Округляємо до 2 знаків після коми
    newPrice = Math.round(newPrice * 100) / 100;
    updatedItems[itemIndex].price = newPrice;

    setItems(updatedItems);
  };

  // Відміна створення замовлення
  const handleCancel = () => {
    if (
      items.length > 0 &&
      !window.confirm(
        'Ви впевнені, що хочете скасувати створення замовлення? Всі введені дані будуть втрачені.'
      )
    ) {
      return;
    }
    navigate('/orders');
  };

  // Збереження замовлення
  const handleSave = async () => {
    // Валідація даних перед відправкою
    if (!client) {
      alert('Будь ласка, виберіть клієнта для оформлення замовлення.');
      return;
    }

    if (items.length === 0) {
      alert('Додайте хоча б один товар до замовлення.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Підготовка даних для відправки
      const orderData = {
        клієнт: client._id,
        товари: items.map((item) => ({
          priceListItem: item.priceListItem,
          найменування_виробу: item.itemName,
          категорія: item.category,
          од_виміру: item.unit,
          кількість: item.quantity,
          колір: item.color,
          базова_вартість: item.basePrice,
          застосовані_коефіцієнти: item.coefficients,
          додаткові_послуги: item.additionalServices,
          остаточна_вартість: item.price,
          коментар: item.notes,
        })),
        загальна_сума: totalAmount,
        знижка: discount,
        сума_до_сплати: finalAmount,
        терміновість: urgency,
        коментар: notes,
        статус: 'нове',
      };

      // Відправка запиту API
      const response = await axios.post('/api/orders', orderData);

      // Перехід до сторінки перегляду створеного замовлення
      navigate(`/orders/${response.data._id}`, {
        state: { message: 'Замовлення успішно створено!' },
      });
    } catch (error) {
      console.error('Помилка збереження замовлення:', error);
      setError(
        'Не вдалося створити замовлення. Будь ласка, перевірте дані та спробуйте ще раз.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new-order-container">
      <h2 className="page-title">Нове замовлення</h2>

      {/* Повідомлення про помилку */}
      {error && (
        <div className="error-message" aria-live="assertive">
          {error}
        </div>
      )}

      {/* Інформація про клієнта */}
      <div className="client-section">
        <h3 className="section-title">Клієнт</h3>
        <div className="client-search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Пошук клієнта за номером телефону"
              className="search-input"
              value={clientSearchTerm}
              onChange={(e) => setClientSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchClients()}
            />
            <button
              className="search-button"
              onClick={searchClients}
              disabled={isSearching || !clientSearchTerm.trim()}
            >
              {isSearching ? (
                'Пошук...'
              ) : Search ? (
                <Search className="icon" />
              ) : (
                'Пошук'
              )}
            </button>
          </div>
          <button className="new-client-button" onClick={handleNewClient}>
            {UserPlus ? <UserPlus className="icon icon-mr" /> : ''}
            <span>Новий клієнт</span>
          </button>
        </div>

        {/* Результати пошуку клієнтів */}
        {searchResults.length > 0 && (
          <div className="search-results-container">
            <h4>Результати пошуку:</h4>
            <ul className="client-search-results">
              {searchResults.map((client) => (
                <li key={client._id}>
                  <button
                    className="client-result-item"
                    onClick={() => handleSelectClient(client)}
                  >
                    <span className="client-name">
                      {client.name} {client.forname}
                    </span>
                    <span className="client-phone">{client.phone}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Картка вибраного клієнта */}
        {client && (
          <div className="client-card">
            <p className="client-name">
              {client.name} {client.forname}
            </p>
            <p className="client-phone">{client.phone}</p>
            <div className="client-badges">
              {client.discount > 0 && (
                <span className="discount-badge">
                  Знижка: {client.discount}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Список речей */}
      <div className="items-section">
        <div className="items-header">
          <h3 className="section-title">Речі</h3>
          <button className="add-item-button" onClick={addItem}>
            {Plus ? <Plus className="icon icon-mr" /> : ''}
            <span>Додати річ</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty-items">
            <p>Додайте речі до замовлення</p>
          </div>
        ) : (
          <div className="items-list">
            {items.map((item, index) => (
              <div key={item.id} className="item-card">
                <div className="item-header">
                  <h4>Річ #{index + 1}</h4>
                  <button
                    className="remove-item-button"
                    onClick={() => removeItem(item.id)}
                    title="Видалити"
                  >
                    {Trash2 ? (
                      <Trash2 className="icon" size={18} />
                    ) : (
                      'Видалити'
                    )}
                  </button>
                </div>

                <div className="item-content">
                  <div className="item-image-container">
                    <div className="item-image-placeholder">
                      {Camera ? (
                        <Camera className="placeholder-icon" />
                      ) : (
                        'Фото'
                      )}
                    </div>
                    <button className="add-photo-button">
                      {Camera ? <Camera className="icon icon-mr" /> : ''}
                      <span>Додати фото</span>
                    </button>
                  </div>

                  <div className="item-details">
                    {/* Вибір з прайс-листа */}
                    <div className="form-group">
                      <label>Вибір з прайс-листа</label>
                      <PriceListSelector
                        onItemSelect={(selectedItem) =>
                          handleItemSelect(index, selectedItem)
                        }
                      />
                    </div>

                    {item.priceListItem && (
                      <>
                        {/* Вибрана інформація про товар */}
                        <div className="item-selected-info">
                          <p>
                            <strong>Найменування:</strong> {item.itemName}
                          </p>
                          <p>
                            <strong>Категорія:</strong> {item.category}
                          </p>
                          <p>
                            <strong>Одиниця виміру:</strong> {item.unit}
                          </p>
                          <p>
                            <strong>Базова вартість:</strong> {item.basePrice}{' '}
                            грн
                          </p>
                        </div>

                        {/* Форма для додаткових параметрів */}
                        <div className="item-form-grid">
                          <div className="form-group">
                            <label>Кількість</label>
                            <input
                              type="number"
                              className="form-input"
                              value={item.quantity}
                              min="1"
                              onChange={(e) =>
                                updateItem(item.id, {
                                  quantity: parseInt(e.target.value) || 1,
                                })
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>Колір</label>
                            <select
                              className="form-select"
                              value={item.color}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  color: e.target.value,
                                })
                              }
                            >
                              <option value="чорний">Чорний</option>
                              <option value="інший">Інший</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Фінальна ціна</label>
                            <input
                              type="number"
                              className="form-input"
                              value={item.price.toFixed(2)}
                              readOnly
                            />
                          </div>
                        </div>

                        {/* Коефіцієнти та додаткові послуги */}
                        <div className="form-group">
                          <label>Коефіцієнти та додаткові послуги</label>
                          <CoefficientsSelector
                            itemType={
                              item.category.includes('шкір')
                                ? 'leather'
                                : 'textile'
                            }
                            onCoefficientsChange={(data) =>
                              handleCoefficientsChange(index, data)
                            }
                            initialCoefficients={item.coefficients}
                            initialServices={item.additionalServices}
                          />
                        </div>
                      </>
                    )}

                    <div className="form-group">
                      <label>Примітки</label>
                      <textarea
                        className="form-textarea"
                        rows="2"
                        placeholder="Додаткова інформація про річ"
                        value={item.notes}
                        onChange={(e) =>
                          updateItem(item.id, {
                            notes: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Додаткові параметри замовлення */}
      <div className="order-options">
        <div className="order-urgency">
          <label className="urgency-checkbox">
            <input
              type="checkbox"
              checked={urgency}
              onChange={(e) => setUrgency(e.target.checked)}
            />
            <span>Терміново (додаткова плата)</span>
          </label>
        </div>

        <div className="order-notes">
          <label>Примітки до замовлення</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Додаткова інформація про замовлення"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
      </div>

      <Footer
        totalAmount={finalAmount.toFixed(2)}
        expectedDate={expectedDate}
        onCancel={handleCancel}
        onSave={handleSave}
        disabled={isSubmitting}
      />
    </div>
  );
};

export default NewOrderPage;
