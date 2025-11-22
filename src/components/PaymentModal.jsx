import React, { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext'; // EKLENDİ

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : Promise.resolve(null);

// CheckoutForm
const CheckoutForm = ({ loan, onSuccess, onClose, onApiError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage(); // EKLENDİ
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const amountInTL = (loan.fineAmount || 0).toFixed(2);

  const t = {
    lateFee: language === 'tr' ? 'Gecikme Cezası' : 'Late Fee',
    book: language === 'tr' ? 'Kitap:' : 'Book:',
    daysOverdue: language === 'tr' ? 'gün gecikme' : 'days overdue',
    cardInfo: language === 'tr' ? 'Kart Bilgileri' : 'Card Information',
    cancel: language === 'tr' ? 'İptal' : 'Cancel',
    pay: language === 'tr' ? 'Öde' : 'Pay',
    paying: language === 'tr' ? 'Ödeniyor...' : 'Processing...',
    loadingPayment: language === 'tr' ? 'Ödeme Servisleri Yükleniyor...' : 'Loading Payment Services...',
  };

  if (!stripe || !elements) {
    return (
      <div className="text-center py-8">
        <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{t.loadingPayment}</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(loan.clientSecret, {
        payment_method: { card: cardElement }
      });

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      } else {
        setError(`${language === 'tr' ? 'Ödeme durumu:' : 'Payment status:'} ${paymentIntent.status}. ${language === 'tr' ? 'Lütfen tekrar deneyin.' : 'Please try again.'}`);
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setError(language === 'tr' ? 'Ödeme işlemi sırasında hata oluştu.' : 'An error occurred during payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-blue-800">{t.lateFee}</h3>
          <p className="text-sm text-gray-600 truncate">{t.book} {loan.bookTitle}</p>
          <p className="text-sm text-gray-600">{loan.fineDays} {t.daysOverdue}</p>
        </div>
        <p className="text-2xl font-extrabold text-blue-700">{amountInTL} ₺</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 flex items-center text-gray-700">
          <CreditCard className="h-4 w-4 mr-2" /> {t.cardInfo}
        </label>
        <div className="border border-gray-300 rounded-lg p-3 shadow-sm focus-within:border-blue-500 transition">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-100 p-3 rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" /> {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-700 rounded-xl hover:bg-gray-100 transition border border-gray-300">
          {t.cancel}
        </button>
        <button 
          type="submit" 
          disabled={loading || !stripe} 
          className={`flex-1 py-3 rounded-xl transition font-semibold ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader className="h-5 w-5 mr-2 animate-spin" /> {t.paying}
            </span>
          ) : (
            `${amountInTL} ₺ ${t.pay}`
          )}
        </button>
      </div>
    </form>
  );
};

// Ana PaymentModal
const PaymentModal = ({ loan, isOpen, onClose, onSuccess }) => {
  const { language } = useLanguage(); // EKLENDİ
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [stripeReady, setStripeReady] = useState(false);

  const t = {
    title: language === 'tr' ? 'Gecikme Cezası Ödeme' : 'Late Fee Payment',
    preparing: language === 'tr' ? 'Ödeme Hazırlanıyor...' : 'Preparing Payment...',
    errorTitle: language === 'tr' ? 'Ödeme Sistemi Hazır Değil' : 'Payment System Not Ready',
    errorDesc: language === 'tr' ? 'Stripe entegrasyonu yapılandırılmamış. Lütfen yöneticinizle iletişime geçin.' : 'Stripe integration not configured. Please contact the administrator.',
    close: language === 'tr' ? 'Kapat' : 'Close',
  };

  useEffect(() => {
    stripePromise.then(stripe => {
      setStripeReady(!!stripe);
      if (!stripe) {
        setApiError(t.errorDesc);
      }
    });
  }, [t.errorDesc]);

  const createPaymentIntent = useCallback(async () => {
    setLoading(true);
    setApiError('');

    if (!loan || !loan.fineAmount || loan.fineAmount <= 0) {
      setApiError(language === 'tr' ? "Geçersiz ceza miktarı." : "Invalid fine amount.");
      setLoading(false);
      return;
    }

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

      if (!response.ok) throw new Error(data.error || 'Failed to create payment intent.');

      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('API Error:', error);
      setApiError(error.message || (language === 'tr' ? 'Ödeme başlatılamadı.' : 'Payment could not be initiated.'));
    } finally {
      setLoading(false);
    }
  }, [loan, language]);

  useEffect(() => {
    if (isOpen && loan && stripeReady) {
      createPaymentIntent();
    }
  }, [isOpen, loan, stripeReady, createPaymentIntent]);

  if (!isOpen) return null;

  if (!PUBLISHABLE_KEY || !stripeReady) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center shadow-2xl">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">{t.errorTitle}</h2>
          <p className="text-gray-600">{t.errorDesc}</p>
          <button onClick={onClose} className="mt-6 px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            {t.close}
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (apiError) {
      return (
        <div className="text-center py-6">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{language === 'tr' ? 'Hata:' : 'Error:'}</p>
          <p className="text-gray-600">{apiError}</p>
        </div>
      );
    }

    if (loading || !clientSecret) {
      return (
        <div className="text-center py-8">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t.preparing}</p>
        </div>
      );
    }

    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm loan={{...loan, clientSecret}} onSuccess={onSuccess} onClose={onClose} />
      </Elements>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-5 border-b pb-3 dark:border-gray-700">
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white">{t.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition">
            <X className="h-6 w-6" />
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentModal;