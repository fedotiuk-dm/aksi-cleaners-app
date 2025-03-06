import React from 'react';
import { NavLink } from 'react-router-dom';
import './SideMenu.css';
// Імпортуємо іконки, якщо встановили пакет lucide-react
import {
    Plus,
    Search,
    UserPlus,
    BarChart,
    Truck,
    DollarSign,
    Calendar,
    Home
} from 'lucide-react';

const SideMenu = () => {
    // Визначимо іконки, якщо вони доступні
    const icons = {
        home: Home ? <Home className="menu-icon" /> : null,
        newOrder: Plus ? <Plus className="menu-icon" /> : null,
        orders: Search ? <Search className="menu-icon" /> : null,
        clients: UserPlus ? <UserPlus className="menu-icon" /> : null,
        analytics: BarChart ? <BarChart className="menu-icon" /> : null,
        delivery: Truck ? <Truck className="menu-icon" /> : null,
        payments: DollarSign ? <DollarSign className="menu-icon" /> : null,
        schedule: Calendar ? <Calendar className="menu-icon" /> : null
    };

    const menuItems = [
        { id: 'home', path: '/', icon: icons.home, label: 'Головна' },
        { id: 'new-order', path: '/orders/new', icon: icons.newOrder, label: 'Нове замовлення' },
        { id: 'orders', path: '/orders', icon: icons.orders, label: 'Замовлення' },
        { id: 'clients', path: '/clients', icon: icons.clients, label: 'Клієнти' },
        { id: 'analytics', path: '/analytics', icon: icons.analytics, label: 'Аналітика' },
        { id: 'delivery', path: '/delivery', icon: icons.delivery, label: 'Доставка' },
        { id: 'payments', path: '/payments', icon: icons.payments, label: 'Оплати' },
        { id: 'schedule', path: '/schedule', icon: icons.schedule, label: 'Розклад' },
    ];

    return (
        <nav className="side-menu">
            <div className="menu-container">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) =>
                            `menu-item ${isActive ? 'menu-item-active' : ''}`
                        }
                    >
                        {item.icon}
                        <span className="menu-label">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default SideMenu;