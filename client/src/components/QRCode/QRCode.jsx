import React from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Змінити імпорт на іменований
import './QRCode.css';
import PropTypes from 'prop-types';

const OrderQRCode = ({ orderNumber, size = 128 }) => {
    const qrValue = orderNumber || 'Номер замовлення відсутній';

    return (
        <div className="qr-code-container">
            <QRCodeSVG
                value={qrValue}
                size={size}
                level="H"
            />
            <p className="order-number">{qrValue}</p>
        </div>
    );
};

OrderQRCode.propTypes = {
    orderNumber: PropTypes.string.isRequired,
    size: PropTypes.number
};

export default OrderQRCode;