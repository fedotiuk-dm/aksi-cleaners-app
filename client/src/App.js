import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import InvoicePrint from './components/InvoicePrint/InvoicePrint';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

// Головна сторінка
const Home = () => (
    <div className="welcome-container">
      <h2>Ласкаво просимо до системи управління хімчисткою "AKSI"</h2>
      <p>Виберіть розділ для роботи:</p>
      <div className="menu-links">
        <a href="/orders" className="menu-link">
          Управління замовленнями
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
          <div className="App">
            <header className="App-header">
              <h1>AKSI - Система управління хімчисткою</h1>
            </header>
            <main>
              <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route path="/" element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                } />

                <Route path="/orders" element={
                  <PrivateRoute>
                    <OrdersPage />
                  </PrivateRoute>
                } />

                <Route path="/invoice" element={
                  <PrivateRoute>
                    <InvoicePrint order={sampleOrder} />
                  </PrivateRoute>
                } />

                {/* Якщо маршрут не знайдено, перенаправляємо на головну сторінку */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;