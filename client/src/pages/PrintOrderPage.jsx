import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import OrderQRCode from '../components/QRCode/QRCode';
import './PrintOrderPage.css';
import '../styles/PrintStyles.css'; // Імпорт глобальних стилів для друку

const PrintOrderPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const printContentRef = useRef(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`/api/orders/${id}`);
                setOrder(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching order:', error);
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const handlePrint = () => {
        const printContent = printContentRef.current;
        if (!printContent) return;

        // Відкриваємо нове вікно для друку
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Будь ласка, дозвольте спливаючі вікна для цього сайту');
            return;
        }

        // Додаємо HTML та стилі
        printWindow.document.write(`
            <html>
            <head>
                <title>Друк замовлення #${order?.orderNumber || 'N/A'}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .print-qr-section {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 20px;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    .items-table th, .items-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    .items-table th {
                        background-color: #f2f2f2;
                    }
                    .print-totals {
                        text-align: right;
                        margin-top: 20px;
                        font-size: 16px;
                    }
                    .print-footer {
                        text-align: center;
                        margin-top: 30px;
                        font-size: 14px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        window.setTimeout(function() {
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
    };

    if (loading) {
        return <div>Завантаження...</div>;
    }

    if (!order) {
        return <div>Замовлення не знайдено</div>;
    }

    return (
        <div>
            <button
                onClick={handlePrint}
                className="print-button"
                style={{
                    display: 'block',
                    margin: '10px auto',
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                Друкувати замовлення
            </button>

            <div ref={printContentRef} className="print-page">
                <div className="print-header">
                    <h1>АКСІ - Хімчистка</h1>
                    <h2>Замовлення #{order.orderNumber}</h2>
                </div>

                <div className="print-qr-section">
                    <OrderQRCode orderNumber={order.orderNumber} size={200} />
                </div>

                <div className="print-info">
                    <div className="print-section">
                        <h3>Дані клієнта</h3>
                        <p><strong>Ім'я:</strong> {order.client.name}</p>
                        <p><strong>Телефон:</strong> {order.client.phone}</p>
                        {order.client.email && <p><strong>Email:</strong> {order.client.email}</p>}
                    </div>

                    <div className="print-section">
                        <h3>Деталі замовлення</h3>
                        <p><strong>Дата прийому:</strong> {new Date(order.receivedDate).toLocaleDateString()}</p>
                        <p><strong>Дата готовності:</strong> {new Date(order.promisedDate).toLocaleDateString()}</p>
                        <p><strong>Філія:</strong> {order.branch}</p>
                        <p><strong>Статус:</strong> {order.status}</p>
                    </div>

                    <div className="print-section">
                        <h3>Речі</h3>
                        <table className="items-table">
                            <thead>
                            <tr>
                                <th>Опис</th>
                                <th>Послуга</th>
                                <th>Матеріал</th>
                                <th>Колір</th>
                                <th>Примітки</th>
                                <th>Ціна</th>
                            </tr>
                            </thead>
                            <tbody>
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.description}</td>
                                    <td>{item.service}</td>
                                    <td>{item.material || '-'}</td>
                                    <td>{item.color || '-'}</td>
                                    <td>{item.notes || '-'}</td>
                                    <td>{item.price} грн</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="print-totals">
                        <p><strong>Загальна сума:</strong> {order.totalAmount} грн</p>
                        {order.discount > 0 && <p><strong>Знижка:</strong> {order.discount}%</p>}
                        <p><strong>До сплати:</strong> {order.totalAmount} грн</p>
                        <p><strong>Оплачено:</strong> {order.isPaid ? 'Так' : 'Ні'}</p>
                        {order.isPaid && <p><strong>Спосіб оплати:</strong> {order.paymentMethod}</p>}
                    </div>
                </div>

                <div className="print-footer">
                    <p>Дякуємо за замовлення!</p>
                    <p>www.aksi.vn.ua | +380 XX XXX XX XX</p>
                </div>
            </div>
        </div>
    );
};

export default PrintOrderPage;