import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import OrdersPage from './pages/OrdersPage';

// Тимчасовий компонент для головної сторінки
const Home = () => (
  <div className="welcome-container">
    <h2>Ласкаво просимо до системи управління хімчисткою "AKSI"</h2>
    <p>Виберіть розділ для роботи:</p>
    <div className="menu-links">
      <a href="/orders" className="menu-link">Управління замовленнями</a>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>AKSI - Система управління хімчисткою</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;