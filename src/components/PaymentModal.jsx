import React, { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Loader, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : Promise.resolve(null);

// CheckoutForm
const CheckoutForm = ({ loan, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();

  // Para birimi otomatik
  const currencySymbol = language === 'tr' ? '₺' : '€';
  const amount = (loan.fineAmount || 0).toFixed(2);

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        payment_method: { card: cardElement },
      });

      if (stripeError) {
        setError(stripeError.message || (language === 'tr' ? 'Kart hatası' : 'Card error'));
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      } else {
        // BURASI DÜZELTİLDİ – Fazladan ) yok!
        setError(
          language === 'tr'
            ? `Ödeme durumu: ${paymentIntent.status}. Lütfen tekrar deneyin.`
            : `Payment status: ${paymentIntent.status}. Please try again.`
        );
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
      {/* Ceza Bilgileri */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-300 rounded-xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <h3 className="font-bold text-blue-900 dark:text-blue-300 text-lg">{t.lateFee}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 truncate max-w-xs">
            {t.book} <span className="font-medium">{loan.bookTitle}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {loan.fineDays} {t.daysOverdue}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">
            {amount} {currencySymbol}
          </p>
        </div>
      </div>

      {/* Kart Alanı */}
      <div>
        <label className="block text-sm font-semibold mb-2 flex items-center text-gray-800 dark:text-gray-200">
          <CreditCard className="h-4 w-4 mr-2" /> {t.cardInfo}
        </label>
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-white dark:bg-gray-800 focus-within:border-blue-500 transition-shadow hover:shadow-md">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1f2937',
                  '::placeholder': { color: '#9ca3af' },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Hata */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center text-sm">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Butonlar */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={loading || !stripe}
          className={`flex-1 py-3.5 rounded-xl font-bold text-white transition shadow-lg flex items-center justify-center gap-2 ${
            loading
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
          }`}
        >
          {loading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              {t.paying}
            </>
          ) : (
            <>
              {amount} {currencySymbol} {t.pay}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Ana PaymentModal
const PaymentModal = ({ loan, isOpen, onClose, onSuccess }) => {
  const { language } = useLanguage();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [stripeReady, setStripeReady] = useState(false);

  const currencySymbol = language === 'tr' ? '₺' : '€';

  const t = {
    title: language === 'tr' ? 'Gecikme Cezası Ödeme' : 'Late Fee Payment',
    preparing: language === 'tr' ? 'Ödeme Hazırlanıyor...' : 'Preparing Payment...',
    errorTitle: language === 'tr' ? 'Ödeme Sistemi Hazır Değil' : 'Payment System Not Ready',
    errorDesc: language === 'tr'
      ? 'Stripe entegrasyonu yapılandırılmamış. Lütfen yöneticinizle iletişime geçin.'
      : 'Stripe integration not configured. Please contact the administrator.',
    close: language === 'tr' ? 'Kapat' : 'Close',
  };

  useEffect(() => {
    stripePromise.then((stripe) => {
      setStripeReady(!!stripe);
      if (!stripe) setApiError(t.errorDesc);
    });
  }, [t.errorDesc]);

  const createPaymentIntent = useCallback(async () => {
    setLoading(true);
    setApiError('');

    if (!loan?.fineAmount || loan.fineAmount <= 0) {
      setApiError(language === 'tr' ? 'Geçersiz ceza miktarı.' : 'Invalid fine amount.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: loan.id,
          amount: loan.fineAmount,
          currency: language === 'tr' ? 'try' : 'eur',
          bookTitle: loan.bookTitle,
          fineDays: loan.fineDays,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment intent error');

      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error('API Error:', err);
      setApiError(err.message || (language === 'tr' ? 'Ödeme başlatılamadı.' : 'Could not start payment.'));
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
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">{t.errorTitle}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{t.errorDesc}</p>
          <button onClick={onClose} className="px-8 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            {t.close}
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (apiError) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 font-bold mb-2">
            {language === 'tr' ? 'Hata' : 'Error'}
          </p>
          <p className="text-gray-600 dark:text-gray-400">{apiError}</p>
        </div>
      );
    }

    if (loading || !clientSecret) {
      return (
        <div className="text-center py-12">
          <Loader className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">{t.preparing}</p>
        </div>
      );
    }

    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm loan={{ ...loan, clientSecret }} onSuccess={onSuccess} onClose={onClose} />
      </Elements>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{t.title}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X className="h-7 w-7" />
          </button>
        </div>
        <div className="p-6 pt-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default PaymentModal;