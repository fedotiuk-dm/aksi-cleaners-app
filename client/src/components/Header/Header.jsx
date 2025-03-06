import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './Header.css';
// Імпортуємо іконки, якщо встановили пакет lucide-react
import { LogOut } from 'lucide-react';

const Header = () => {
    const { user, logout } = useContext(AuthContext);

    // Отримуємо ініціали користувача
    const getInitials = (name) => {
        if (!name) return 'АК';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <header className="app-header">
            <div className="header-container">
                <h1 className="app-title">AKSI Хімчистка</h1>
                <div className="user-controls">
                    {/* Якщо є іконки */}
                    {LogOut && (
                        <div className="user-profile">
                            <div className="user-avatar">
                                <span>{getInitials(user?.username)}</span>
                            </div>
                            <button onClick={logout} className="logout-button">
                                <LogOut className="icon" />
                                <span className="logout-text">Вихід</span>
                            </button>
                        </div>
                    )}
                    {/* Якщо немає іконок */}
                    {!LogOut && (
                        <div className="user-profile">
                            <div className="user-avatar">
                                <span>{getInitials(user?.username)}</span>
                            </div>
                            <button onClick={logout} className="logout-button">
                                Вихід
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;