import React from 'react';
import './Footer.css';

const Footer = ({ totalAmount, expectedDate, onCancel, onSave }) => {
    return (
        <div className="order-footer">
            <div className="order-summary">
                <p className="total-amount">
                    Загальна сума: <span className="amount-value">{totalAmount || '0.00'} грн</span>
                </p>
                <p className="expected-date">
                    Очікувана дата готовності: {expectedDate || 'Не встановлено'}
                </p>
            </div>

            <div className="action-buttons">
                <button
                    className="cancel-button"
                    onClick={onCancel}
                >
                    Скасувати
                </button>
                <button
                    className="save-button"
                    onClick={onSave}
                >
                    Зберегти замовлення
                </button>
            </div>
        </div>
    );
};

export default Footer;