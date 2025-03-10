import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './CoefficientsSelector.css';

/**
 * Компонент для вибору коефіцієнтів та додаткових послуг
 * 
 * @param {Object} props - Властивості компонента
 * @param {string} props.itemType - Тип виробу ('textile' або 'leather')
 * @param {Function} props.onCoefficientsChange - Callback при зміні вибраних коефіцієнтів
 * @param {Array} [props.initialCoefficients=[]] - Початково вибрані коефіцієнти
 * @param {Array} [props.initialServices=[]] - Початково вибрані послуги
 */
const CoefficientsSelector = ({ 
    itemType, 
    onCoefficientsChange,
    initialCoefficients = [], 
    initialServices = []
}) => {
    const [coefficients, setCoefficients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCoefficients, setSelectedCoefficients] = useState(initialCoefficients);
    const [additionalServices, setAdditionalServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState(initialServices);

    // Отримання коефіцієнтів при завантаженні
    useEffect(() => {
        const fetchCoefficients = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('/api/price-list/special/coefficients');
                const allItems = response.data;

                // Розділити на коефіцієнти та додаткові послуги
                const coeffs = allItems.filter(item => item.категорія === 'коефіцієнти');

                // Додаткові послуги в залежності від типу виробу (текстильні чи шкіряні)
                let services = [];
                if (itemType === 'textile') {
                    services = allItems.filter(item =>
                        item.категорія === 'додатково_для_текстильних_виробів'
                    );
                } else if (itemType === 'leather') {
                    services = allItems.filter(item =>
                        item.категорія === 'додатково_для_шкіряних_виробів'
                    );
                }

                setCoefficients(coeffs);
                setAdditionalServices(services);
            } catch (error) {
                console.error('Помилка отримання коефіцієнтів:', error);
                setError('Не вдалося завантажити коефіцієнти. Спробуйте ще раз.');
            } finally {
                setLoading(false);
            }
        };

        if (itemType) {
            fetchCoefficients();
        }
    }, [itemType]);

    // Відправка змінених даних батьківському компоненту
    const notifyParent = useCallback(() => {
        onCoefficientsChange({
            коефіцієнти: selectedCoefficients,
            додаткові_послуги: selectedServices
        });
    }, [selectedCoefficients, selectedServices, onCoefficientsChange]);

    // Обробка зміни вибраних коефіцієнтів
    const handleCoefficientToggle = useCallback((coefficient) => {
        setSelectedCoefficients(prevSelected => {
            // Перевіряємо, чи коефіцієнт вже вибраний
            const isSelected = prevSelected.some(c => c._id === coefficient._id);

            let newSelected;
            if (isSelected) {
                // Якщо вже вибраний, видаляємо його
                newSelected = prevSelected.filter(c => c._id !== coefficient._id);
            } else {
                // Якщо не вибраний, додаємо його
                newSelected = [...prevSelected, {
                    _id: coefficient._id,
                    назва: coefficient.найменування_виробу,
                    значення: coefficient.коефіцієнт || 1,
                    опис: `Коефіцієнт: ${coefficient.найменування_виробу}`
                }];
            }

            return newSelected;
        });
    }, []);

    // Обробка зміни вибраних додаткових послуг
    const handleServiceToggle = useCallback((service) => {
        setSelectedServices(prevSelected => {
            // Перевіряємо, чи послуга вже вибрана
            const isSelected = prevSelected.some(s => s._id === service._id);

            let newSelected;
            if (isSelected) {
                // Якщо вже вибрана, видаляємо її
                newSelected = prevSelected.filter(s => s._id !== service._id);
            } else {
                // Якщо не вибрана, додаємо її
                newSelected = [...prevSelected, {
                    _id: service._id,
                    назва: service.найменування_виробу,
                    вартість: service.вартість_замовлення || 0,
                    опис: service.найменування_виробу
                }];
            }

            return newSelected;
        });
    }, []);

    // Повідомляємо батьківський компонент про зміни
    useEffect(() => {
        notifyParent();
    }, [selectedCoefficients, selectedServices, notifyParent]);

    if (!itemType) return null;

    if (loading) {
        return <div className="coefficients-selector__loading" aria-live="polite">Завантаження коефіцієнтів...</div>;
    }

    if (error) {
        return <div className="coefficients-selector__error" aria-live="assertive">{error}</div>;
    }

    return (
        <div className="coefficients-selector">
            {/* Коефіцієнти */}
            {coefficients.length > 0 && (
                <fieldset className="coefficients-selector__section">
                    <legend className="coefficients-selector__heading">Коефіцієнти</legend>
                    <div className="coefficients-selector__list">
                        {coefficients.map(coefficient => {
                            const isSelected = selectedCoefficients.some(c => c._id === coefficient._id);
                            return (
                                <button
                                    key={coefficient._id}
                                    type="button"
                                    className={`coefficients-selector__item ${
                                        isSelected ? 'coefficients-selector__item--selected' : ''
                                    }`}
                                    onClick={() => handleCoefficientToggle(coefficient)}
                                    aria-pressed={isSelected}
                                >
                                    <span className="coefficients-selector__name">
                                        {coefficient.найменування_виробу}
                                    </span>
                                    <span className="coefficients-selector__value">
                                        {coefficient.коефіцієнт ? `x${coefficient.коефіцієнт}` : ''}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </fieldset>
            )}

            {/* Додаткові послуги */}
            {additionalServices.length > 0 && (
                <fieldset className="coefficients-selector__section">
                    <legend className="coefficients-selector__heading">Додаткові послуги</legend>
                    <div className="coefficients-selector__list">
                        {additionalServices.map(service => {
                            const isSelected = selectedServices.some(s => s._id === service._id);
                            return (
                                <button
                                    key={service._id}
                                    type="button"
                                    className={`coefficients-selector__item ${
                                        isSelected ? 'coefficients-selector__item--selected' : ''
                                    }`}
                                    onClick={() => handleServiceToggle(service)}
                                    aria-pressed={isSelected}
                                >
                                    <span className="coefficients-selector__name">
                                        {service.найменування_виробу}
                                    </span>
                                    <span className="coefficients-selector__price">
                                        {service.вартість_замовлення ? `${service.вартість_замовлення} грн` : ''}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </fieldset>
            )}
        </div>
    );
};

CoefficientsSelector.propTypes = {
    itemType: PropTypes.oneOf(['textile', 'leather']),
    onCoefficientsChange: PropTypes.func.isRequired,
    initialCoefficients: PropTypes.array,
    initialServices: PropTypes.array
};

export default CoefficientsSelector;