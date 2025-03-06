import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import './NewOrderPage.css';

// Імпортуємо іконки, якщо встановили пакет lucide-react
import { Camera, Search, UserPlus, Plus } from 'lucide-react';

const NewOrderPage = () => {
    const [items, setItems] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [totalAmount, setTotalAmount] = useState("0.00");
    // eslint-disable-next-line no-unused-vars
    const [expectedDate, setExpectedDate] = useState("");
    const navigate = useNavigate();

    const addItem = () => {
        setItems([...items, {
            id: Date.now(),
            type: '',
            fabric: '',
            color: '',
            services: [],
            price: 0
        }]);
    };

    const handleCancel = () => {
        navigate('/orders');
    };

    const handleSave = () => {
        // Логіка збереження замовлення
        navigate('/orders');
    };

    return (
        <div className="new-order-container">
            <h2 className="page-title">Нове замовлення</h2>

            {/* Інформація про клієнта */}
            <div className="client-section">
                <h3 className="section-title">Клієнт</h3>
                <div className="client-search-container">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Пошук клієнта за номером телефону"
                            className="search-input"
                        />
                        <button className="search-button">
                            {Search ? <Search className="icon" /> : "Пошук"}
                        </button>
                    </div>
                    <button className="new-client-button">
                        {UserPlus ? <UserPlus className="icon icon-mr" /> : ""}
                        <span>Новий клієнт</span>
                    </button>
                </div>

                <div className="client-card">
                    <p className="client-name">Іванов Іван</p>
                    <p className="client-phone">+380991234567</p>
                    <div className="client-badges">
                        <span className="discount-badge">Знижка: 10%</span>
                        <span className="bonus-badge">Бонуси: 250</span>
                    </div>
                </div>
            </div>

            {/* Список речей */}
            <div className="items-section">
                <div className="items-header">
                    <h3 className="section-title">Речі</h3>
                    <button
                        className="add-item-button"
                        onClick={addItem}
                    >
                        {Plus ? <Plus className="icon icon-mr" /> : ""}
                        <span>Додати річ</span>
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="empty-items">
                        <p>Додайте речі до замовлення</p>
                    </div>
                ) : (
                    <div className="items-list">
                        {items.map((item) => (
                            <div key={item.id} className="item-card">
                                <div className="item-content">
                                    <div className="item-image-container">
                                        <div className="item-image-placeholder">
                                            {Camera ? <Camera className="placeholder-icon" /> : "Фото"}
                                        </div>
                                        <button className="add-photo-button">
                                            {Camera ? <Camera className="icon icon-mr" /> : ""}
                                            <span>Додати фото</span>
                                        </button>
                                    </div>

                                    <div className="item-details">
                                        <div className="item-form-grid">
                                            <div className="form-group">
                                                <label>Тип речі</label>
                                                <select className="form-select">
                                                    <option value="">Оберіть тип речі</option>
                                                    <option value="jacket">Куртка</option>
                                                    <option value="coat">Пальто</option>
                                                    <option value="suit">Костюм</option>
                                                    <option value="dress">Сукня</option>
                                                    <option value="shirt">Сорочка</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Матеріал</label>
                                                <select className="form-select">
                                                    <option value="">Оберіть матеріал</option>
                                                    <option value="cotton">Бавовна</option>
                                                    <option value="wool">Вовна</option>
                                                    <option value="silk">Шовк</option>
                                                    <option value="synthetic">Синтетика</option>
                                                    <option value="leather">Шкіра</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Колір</label>
                                                <select className="form-select">
                                                    <option value="">Оберіть колір</option>
                                                    <option value="black">Чорний</option>
                                                    <option value="white">Білий</option>
                                                    <option value="blue">Синій</option>
                                                    <option value="red">Червоний</option>
                                                    <option value="other">Інший</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Ціна</label>
                                                <input type="number" className="form-input" placeholder="0.00" />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Послуги</label>
                                            <div className="services-checkboxes">
                                                <label className="service-checkbox">
                                                    <input type="checkbox" />
                                                    <span>Чистка</span>
                                                </label>
                                                <label className="service-checkbox">
                                                    <input type="checkbox" />
                                                    <span>Прасування</span>
                                                </label>
                                                <label className="service-checkbox">
                                                    <input type="checkbox" />
                                                    <span>Ремонт</span>
                                                </label>
                                                <label className="service-checkbox">
                                                    <input type="checkbox" />
                                                    <span>Виведення плям</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Примітки</label>
                                            <textarea className="form-textarea" rows="2" placeholder="Додаткова інформація про річ"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer
                totalAmount={totalAmount}
                expectedDate={expectedDate}
                onCancel={handleCancel}
                onSave={handleSave}
            />
        </div>
    );
};

export default NewOrderPage;