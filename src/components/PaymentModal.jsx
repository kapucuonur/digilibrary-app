// components/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ loan, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    
    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required'
      });

      if (submitError) {
        setError(submitError.message);
      } else {
        // Ödeme başarılı
        await onSuccess();
      }
    } catch (err) {
      setError('Ödeme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800">Gecikme Cezası</h3>
        <p className="text-yellow-700">
          {loan.bookTitle} - {loan.fineDays} gün gecikme
        </p>
        <p className="text-lg font-bold text-yellow-900">
          Toplam: {loan.fineAmount} ₺
        </p>
      </div>
      
      <PaymentElement />
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 btn-outline"
          disabled={loading}
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 btn-primary"
        >
          {loading ? 'Ödeniyor...' : `${loan.fineAmount} ₺ Öde`}
        </button>
      </div>
    </form>
  );
};

export const PaymentModal = ({ loan, isOpen, onClose, onSuccess }) => {
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
          amount: loan.fineAmount
        })
      });
      
      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
    } catch (error) {
      console.error('Payment intent error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Gecikme Cezası Ödeme</h2>
        
        {loading ? (
          <div>Yükleniyor...</div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm 
              loan={loan} 
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        ) : (
          <div>Hata oluştu</div>
        )}
      </div>
    </div>
  );
};