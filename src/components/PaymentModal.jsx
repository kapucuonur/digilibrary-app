// src/components/PaymentModal.jsx - BASİT TEST VERSİYONU
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Loader, AlertCircle, CheckCircle } from 'lucide-react';

// ⬇️ EN BASİT STRIPE KEY - TEST İÇİN
console.log('🚨 STRIPE DEBUG - ENV Vars:', {
  REACT_APP_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  NORMAL_KEY: process.env.STRIPE_PUBLISHABLE_KEY
});

// GEÇİCİ KEY - SADECE TEST İÇİN
const STRIPE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY;
console.log('🔑 Using Stripe Key:', STRIPE_KEY?.substring(0, 20) + '...');

const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;
console.log('✅ Stripe Promise:', !!stripePromise);

// Basit CheckoutForm
const CheckoutForm = ({ loan, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  console.log('🔔 CheckoutForm - Stripe:', !!stripe, 'Elements:', !!elements);

  if (!stripe || !elements) {
    return (
      <div className="text-center py-8">
        <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Stripe yükleniyor...</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const cardElement = elements.getElement(CardElement);
      const { error } = await stripe.confirmCardPayment(loan.clientSecret, {
        payment_method: { card: cardElement }
      });

      if (error) {
        setError(error.message);
      } else {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (err) {
      setError('Ödeme hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800">Gecikme Cezası</h3>
        <p><strong>{loan.bookTitle}</strong></p>
        <p>{loan.fineDays} gün gecikme</p>
        <p className="text-lg font-bold">{loan.fineAmount} ₺</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Kart Bilgileri</label>
        <div className="border border-gray-300 rounded-lg p-3">
          <CardElement />
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="flex-1 border border-gray-300 py-2 rounded">
          İptal
        </button>
        <button type="submit" disabled={loading} className="flex-1 bg-green-500 text-white py-2 rounded">
          {loading ? 'Ödeniyor...' : `${loan.fineAmount} ₺ Öde`}
        </button>
      </div>
    </form>
  );
};

// Ana Modal
const PaymentModal = ({ loan, isOpen, onClose, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && loan) {
      createPaymentIntent();
    }
  }, [isOpen, loan]);

  const createPaymentIntent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: loan.id,
          amount: loan.fineAmount,
          bookTitle: loan.bookTitle,
          fineDays: loan.fineDays
        })
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ödeme</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Yükleniyor...</p>
          </div>
        ) : clientSecret && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm loan={loan} onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        ) : (
          <div className="text-center py-4">
            <p>Ödeme hazırlanıyor...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;