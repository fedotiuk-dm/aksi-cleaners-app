// client/src/components/PriceListSelector/PriceListSelector.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './PriceListSelector.css';

/**
 * Компонент для вибору послуги з прайс-листа
 * @param {Object} props
 * @param {Function} props.onItemSelect - Функція, що викликається при виборі товару
 */
const PriceListSelector = ({ onItemSelect }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    
    const searchTimeout = useRef(null);
    const searchInputRef = useRef(null);

    // Отримання категорій при завантаженні компонента
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await axios.get('/api/price-list/categories');
                // Фільтруємо категорії, що не є коефіцієнтами або додатковими послугами
                const serviceCategories = response.data.filter(cat =>
                    !['коефіцієнти', 'додатково_для_текстильних_виробів',
                        'додатково_для_шкіряних_виробів', 'кольорові_вироби'].includes(cat)
                );
                setCategories(serviceCategories);
            } catch (error) {
                console.error('Помилка отримання категорій:', error);
                setError('Не вдалося завантажити категорії. Спробуйте ще раз.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Отримання товарів за категорією з пагінацією
    const fetchItemsByCategory = useCallback(async (categoryName, pageNum = 1) => {
        if (!categoryName) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(
                `/api/price-list/category/${categoryName}?page=${pageNum}&limit=20`
            );
            
            if (pageNum === 1) {
                setItems(response.data.items || []);
            } else {
                setItems(prev => [...prev, ...(response.data.items || [])]);
            }
            
            // Перевіряємо наявність додаткових сторінок
            const pagination = response.data.pagination || {};
            setHasMore(pagination.page < pagination.pages);
            setPage(pagination.page || 1);
        } catch (error) {
            console.error('Помилка отримання товарів:', error);
            setError('Не вдалося завантажити товари. Спробуйте ще раз.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Завантаження наступної сторінки
    const loadMoreItems = useCallback(() => {
        if (selectedCategory && hasMore && !isLoading) {
            fetchItemsByCategory(selectedCategory, page + 1);
        }
    }, [selectedCategory, hasMore, isLoading, page, fetchItemsByCategory]);

    // Обробка вибору категорії
    const handleCategorySelect = useCallback((categoryName) => {
        setSelectedCategory(categoryName);
        setSearchTerm('');
        setSearchResults([]);
        setPage(1);
    }, []);

    // Ефект для завантаження товарів при зміні категорії
    useEffect(() => {
        if (selectedCategory) {
            fetchItemsByCategory(selectedCategory, 1);
        }
    }, [selectedCategory, fetchItemsByCategory]);

    // Пошук товарів з дебаунсингом
    const handleSearchTermChange = useCallback((e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Очищаємо попередній таймаут
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        
        // Встановлюємо новий таймаут для дебаунсингу
        if (value.trim().length >= 2) {
            searchTimeout.current = setTimeout(() => {
                handleSearch(value);
            }, 300); // Дебаунс 300мс
        } else {
            setSearchResults([]);
        }
    }, []);

    // Пошук товарів
    const handleSearch = async (term) => {
        if (term.trim().length < 2) return;

        setIsLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(`/api/price-list/search?term=${encodeURIComponent(term)}`);
            setSearchResults(response.data.items || []);
            setSelectedCategory(''); // Скидаємо вибрану категорію при пошуку
        } catch (error) {
            console.error('Помилка пошуку:', error);
            setError('Не вдалося виконати пошук. Спробуйте ще раз.');
        } finally {
            setIsLoading(false);
        }
    };

    // Очищення пошуку
    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setSearchResults([]);
        
        // Встановлюємо фокус на поле пошуку
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    // Форматування назви категорії
    const formatCategoryName = useCallback((category) => {
        return category.replace(/_/g, ' ');
    }, []);

    // Відображення ціни товару
    const renderItemPrice = useCallback((item) => {
        if (item.вартість_замовлення) {
            return `${item.вартість_замовлення} грн`;
        } else if (item.вартість_чорний_колір && item.вартість_інші_кольори) {
            return `Чорний: ${item.вартість_чорний_колір} грн / Інші: ${item.вартість_інші_кольори} грн`;
        } else {
            return 'Ціна залежить від коефіцієнтів';
        }
    }, []);

    // Обробка вибору товару
    const handleItemSelect = useCallback((item) => {
        if (onItemSelect) {
            onItemSelect(item);
        }
    }, [onItemSelect]);

    // Повертаємо інформацію про помилку, якщо вона є
    if (error && !isLoading && categories.length === 0) {
        return (
            <section className="price-list-selector price-list-selector--error" aria-live="polite">
                <h3>Вибір послуги з прайс-листа</h3>
                <div className="price-list-selector__error-message">
                    <p>{error}</p>
                    <button 
                        className="price-list-selector__retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Спробувати ще раз
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="price-list-selector" aria-labelledby="price-list-title">
            <h3 id="price-list-title">Вибір послуги з прайс-листа</h3>

            {/* Пошук */}
            <div className="price-list-selector__search-section">
                <div className="price-list-selector__search-input-group">
                    <label htmlFor="search-input" className="visually-hidden">Пошук за назвою</label>
                    <input
                        id="search-input"
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                        placeholder="Пошук за назвою..."
                        className="price-list-selector__search-input"
                        aria-describedby="search-hint"
                    />
                    <button
                        onClick={() => handleSearch(searchTerm)}
                        className="price-list-selector__search-button"
                        disabled={isLoading || searchTerm.trim().length < 2}
                        aria-label="Пошук"
                    >
                        {isLoading ? 'Шукаємо...' : 'Пошук'}
                    </button>
                    {searchResults.length > 0 && (
                        <button 
                            onClick={clearSearch} 
                            className="price-list-selector__clear-button"
                            aria-label="Очистити результати пошуку"
                        >
                            Очистити
                        </button>
                    )}
                </div>
                <small id="search-hint" className="price-list-selector__search-hint">
                    Введіть мінімум 2 символи для пошуку
                </small>

                {/* Повідомлення про помилку при пошуку */}
                {error && searchTerm && (
                    <div className="price-list-selector__error-message" aria-live="polite">
                        {error}
                    </div>
                )}

                {/* Результати пошуку */}
                {searchResults.length > 0 && (
                    <div className="price-list-selector__search-results" aria-live="polite">
                        <h4>Результати пошуку</h4>
                        <ul className="price-list-selector__results-list">
                            {searchResults.map(item => (
                                <li key={item._id}>
                                    <button
                                        className="price-list-selector__result-item"
                                        onClick={() => handleItemSelect(item)}
                                    >
                                        <span className="price-list-selector__item-name">{item.найменування_виробу}</span>
                                        <span className="price-list-selector__item-category">{formatCategoryName(item.категорія)}</span>
                                        <span className="price-list-selector__item-price">
                                            {renderItemPrice(item)}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Вибір за категоріями */}
            <div className="price-list-selector__category-section">
                <h4>Категорії послуг</h4>
                <div 
                    className="price-list-selector__category-list"
                    role="tablist"
                    aria-label="Категорії послуг"
                >
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`price-list-selector__category-button ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => handleCategorySelect(category)}
                            role="tab"
                            aria-selected={selectedCategory === category}
                            aria-controls={`panel-${category}`}
                        >
                            {formatCategoryName(category)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Список товарів вибраної категорії */}
            {selectedCategory && (
                <div 
                    className="price-list-selector__items-section"
                    id={`panel-${selectedCategory}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${selectedCategory}`}
                >
                    <h4>{formatCategoryName(selectedCategory)}</h4>
                    {isLoading && items.length === 0 ? (
                        <p className="price-list-selector__loading" aria-live="polite">Завантаження...</p>
                    ) : (
                        <>
                            {error ? (
                                <div className="price-list-selector__error-message" aria-live="polite">
                                    {error}
                                </div>
                            ) : (
                                <>
                                    <ul className="price-list-selector__items-list">
                                        {items.map(item => (
                                            <li key={item._id}>
                                                <button
                                                    className="price-list-selector__item-card"
                                                    onClick={() => handleItemSelect(item)}
                                                >
                                                    <strong className="price-list-selector__item-name">{item.найменування_виробу}</strong>
                                                    <span className="price-list-selector__item-unit">Одиниця виміру: {item.од_виміру}</span>
                                                    <span className="price-list-selector__item-price">
                                                        {renderItemPrice(item)}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    
                                    {hasMore && (
                                        <div className="price-list-selector__load-more">
                                            <button 
                                                className="price-list-selector__load-more-button"
                                                onClick={loadMoreItems}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Завантаження...' : 'Завантажити ще'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </section>
    );
};

PriceListSelector.propTypes = {
    onItemSelect: PropTypes.func.isRequired
};

export default PriceListSelector;