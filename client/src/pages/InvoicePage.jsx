import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import InvoicePrint from '../components/InvoicePrint/InvoicePrint';
import '../styles/PrintStyles.css'; // Імпорт глобальних стилів для друку

const InvoicePage = () => {
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
                <title>Друк квитанції #${order?.orderNumber || 'N/A'}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    .invoice-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                    }
                    .company-info {
                        text-align: right;
                    }
                    .invoice-title {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 10px;
                    }
                    .invoice-items {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    .invoice-items th, .invoice-items td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    .invoice-items th {
                        background-color: #f2f2f2;
                    }
                    .signature-block {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 30px;
                    }
                    .signature-line {
                        border-top: 1px solid #000;
                        padding-top: 5px;
                        width: 45%;
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
                Друкувати квитанцію
            </button>

            <div ref={printContentRef}>
                <InvoicePrint order={order} />
            </div>
        </div>
    );
};

export default InvoicePage;