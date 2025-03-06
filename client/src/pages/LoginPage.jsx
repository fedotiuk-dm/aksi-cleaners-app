import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [formError, setFormError] = useState('');

    const { login, error, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const { username, password } = formData;

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!username || !password) {
            setFormError('Будь ласка, заповніть всі поля');
            return;
        }

        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            console.error('Помилка входу:', err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-container">
                <h2>Вхід у систему AKSI</h2>
                <p>Введіть свої дані для авторизації в системі</p>

                {formError && <div className="error-message">{formError}</div>}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Ім'я користувача</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={handleChange}
                            placeholder="Введіть ім'я користувача"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                            placeholder="Введіть пароль"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Перевірка...' : 'Увійти'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;