


// ключевые аспекты реализации платёжной функциональности для сервиса.

// 1. Улучшенная логика JavaScript

//  /* Валидация и обработка данных */

function validateForm() {
    const amount = parseFloat(document.getElementById('amount').value);
    const comment = document.getElementById('comment').value.trim();
    
    // Проверка суммы
    if (isNaN(amount) || amount < 49 || amount > 10000) {
        showError('Сумма должна быть от 49 до 10 000 ₽.');
        return false;
    }
    
    // Проверка комментария (опционально)
    if (comment.length > 500) {
        showError('Комментарий не должен превышать 500 символов.');
        return false;
    }
    
    return true;
}

function showError(message) {
    alert(message);
    // Дополнительно можно подсветить поле ошибки
}



//  /* Улучшенная функция оплаты */


async function pay(method) {
    if (!validateForm()) return;

    const paymentData = {
        amount: parseFloat(document.getElementById('amount').value),
        comment: document.getElementById('comment').value,
        fee: document.getElementById('fee').checked,
        method: method,
        recipient: 'Sergej A. Lazarev'
    };

    try {
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (result.success) {
            alert(`Платёж на ${paymentData.amount} ₽ успешно отправлен!`);
            // Переадресация на страницу подтверждения
            window.location.href = `/payment-success?id=${result.paymentId}`;
        } else {
            showError(`Ошибка платежа: ${result.message}`);
        }
    } catch (error) {
        showError('Произошла ошибка сети. Попробуйте ещё раз.');
        console.error('Payment error:', error);
    }
}



//  2. Интеграция с платёжными системами  Общая архитектура Создайте единый API‑эндпоинт /api/payment, который будет:
//  Принимать данные платежа
//  Определять метод оплаты
//  Вызывать соответствующий платёжный провайдер
//  Возвращать статус операции
//  Реализация для каждого метода:


//  T‑Pay 

// В серверной части (Node.js пример)
const tpay = require('tpay-sdk');

async function processTPayPayment(paymentData) {
    try {
        const tpayResponse = await tpay.createPayment({
            amount: paymentData.amount,
            orderId: generateOrderId(),
            description: paymentData.comment || 'Чаевые',
            returnUrl: 'https://yoursite.com/payment-success',
            failUrl: 'https://yoursite.com/payment-failed'
        });
        
        return {
            success: true,
            paymentId: tpayResponse.orderId,
            redirectUrl: tpayResponse.paymentUrl
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
}



//  СБП (Система быстрых платежей) 


async function processSbpPayment(paymentData) {
    try {
        const sbpResponse = await fetch('https://sbp-api.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_API_KEY',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: paymentData.amount * 100, // в копейках
                currency: 'RUB',
                order_id: generateOrderId(),
                description: paymentData.comment,
                return_url: 'https://yoursite.com/payment-success'
            })
        });

        const data = await sbpResponse.json();
        
        if (data.status === 'success') {
            // Для СБП часто требуется QR‑код
            return {
                success: true,
                paymentId: data.payment_id,
                qrCode: data.qr_code // base64 или URL
            };
        } else {
            return { success: false, message: data.error };
        }
    } catch (error) {
        return { success: false, message: 'Ошибка сети' };
    }
}


//  Банковская карта (через платёжный агрегатор)

 async function processCardPayment(paymentData) {
    try {
        // Использование Stripe, Tinkoff, CloudPayments и т. п.
        const paymentIntent = await stripe.createPaymentIntent({
            amount: paymentData.amount * 100,
            currency: 'rub',
            payment_method_types: ['card'],
            description: paymentData.comment
        });

        // Перенаправление на платёжную форму
        return {
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentId: paymentIntent.id
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
}


// 3. Серверная часть (пример на Node.js)


const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/payment', async (req, res) => {
    const { amount, comment, fee, method } = req.body;

    let paymentResult;

    switch (method) {
        case 't-pay':
            paymentResult = await processTPayPayment({ amount, comment, fee });
            break;
        case 'sbp':
            paymentResult = await processSbpPayment({ amount, comment, fee });
            break;
        case 'card':
            paymentResult = await processCardPayment({ amount, comment, fee });
            break;
        default:
            return res.status(400).json({ success: false, message: 'Неизвестный метод оплаты' });
    }

    res.json(paymentResult);
});

app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});



















