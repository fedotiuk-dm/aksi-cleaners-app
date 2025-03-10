import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import OrdersPage from './pages/OrdersPage';
import NewOrderPage from './pages/NewOrderPage';
import LoginPage from './pages/LoginPage';
import InvoicePrint from './components/InvoicePrint/InvoicePrint';
import Header from './components/Header/Header';
import SideMenu from './components/SideMenu/SideMenu';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import PrintOrderPage from './pages/PrintOrderPage';
import InvoicePage from './pages/InvoicePage';

// Імпорт компонентів клієнтів
import ClientsPage from './pages/ClientsPage';
import NewClientPage from './pages/NewClientPage';
import ClientDetailsPage from './pages/ClientDetailsPage';

// Головна сторінка
const Home = () => (
    <div className="welcome-container">
      <h2>Ласкаво просимо до системи управління хімчисткою "AKSI"</h2>
      <p>Виберіть розділ для роботи:</p>
      <div className="menu-links">
        <a href="/orders/new" className="menu-link">
          Нове замовлення
        </a>
        <a href="/orders" className="menu-link">
          Управління замовленнями
        </a>
        <a href="/clients" className="menu-link">
          Клієнти
        </a>
        <a href="/invoice" className="menu-link">
          Інвойси
        </a>
      </div>
    </div>
);

// Приклад замовлення для тестування
const sampleOrder = {
  orderNumber: '250305-001',
  receivedDate: '2025-03-05T00:00:00.000Z',
  promisedDate: '2025-03-08T00:00:00.000Z',
  client: {
    name: 'Тестовий Клієнт',
    phone: '+380501234567',
  },
  items: [
    {
      description: 'Пальто',
      service: 'cleaning',
      material: 'Вовна',
      color: 'Чорний',
      price: 300,
    },
  ],
  discount: 10,
  totalAmount: 270,
};

function App() {
  return (
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              {/* Додаємо маршрути для сторінок друку, які мають бути без хедера і меню */}
              <Route path="/print/:id" element={<PrintOrderPage />} />
              <Route path="/invoice/:id" element={<InvoicePage />} />

              <Route path="*" element={
                <PrivateRoute>
                  <div className="app-layout">
                    <Header />
                    <div className="content-container">
                      <SideMenu />
                      <main className="main-content">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/orders" element={<OrdersPage />} />
                          <Route path="/orders/new" element={<NewOrderPage />} />
                          <Route path="/invoice" element={<InvoicePrint order={sampleOrder} />} />

                          {/* Маршрути для клієнтів (замінюємо заглушку) */}
                          <Route path="/clients" element={<ClientsPage />} />
                          <Route path="/clients/new" element={<NewClientPage />} />
                          <Route path="/clients/:clientId" element={<ClientDetailsPage />} />

                          {/* Заглушки для інших розділів */}
                          <Route path="/analytics" element={<div className="placeholder-page"><h2>Аналітика</h2><p>Цей розділ ще у розробці</p></div>} />
                          <Route path="/delivery" element={<div className="placeholder-page"><h2>Доставка</h2><p>Цей розділ ще у розробці</p></div>} />
                          <Route path="/payments" element={<div className="placeholder-page"><h2>Оплати</h2><p>Цей розділ ще у розробці</p></div>} />
                          <Route path="/schedule" element={<div className="placeholder-page"><h2>Розклад</h2><p>Цей розділ ще у розробці</p></div>} />

                          {/* Якщо маршрут не знайдено, перенаправляємо на головну сторінку */}
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;