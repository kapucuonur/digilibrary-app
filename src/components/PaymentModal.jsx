// src/components/PaymentModal.jsx - DEBUG VERSION
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Loader, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Stripe debug
console.log('🔑 Stripe Key:', 
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 
  process.env.STRIPE_PUBLISHABLE_KEY || 
  'KEY_NOT_FOUND'
);

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 
  process.env.STRIPE_PUBLISHABLE_KEY
);

const CheckoutForm = ({ loan, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { language } = useLanguage();

  console.log('🔔 CheckoutForm - Stripe:', !!stripe, 'Elements:', !!elements, 'ClientSecret:', !!loan?.clientSecret);

  // Stripe Elements yüklendikten sonra kontrol et
  useEffect(() => {
    if (stripe && elements) {
      console.log('✅ Stripe Elements hazır!');
    }
  }, [stripe, elements]);

  const texts = {
    tr: {
      title: 'Gecikme Cezası Ödeme',
      fineDetails: 'Gecikme Cezası',
      book: 'Kitap',
      delay: 'Gecikme Süresi',
      total: 'Toplam Tutar',
      cardInfo: 'Kart Bilgileri',
      cancel: 'İptal',
      pay: 'Öde',
      processing: 'Ödeniyor...',
      paymentProcessing: 'Ödeme işleniyor...',
      paymentSuccess: 'Ödeme başarıyla tamamlandı!',
      systemNotReady: 'Ödeme sistemi hazır değil',
      paymentError: 'Ödeme sırasında bir hata oluştu',
      unexpectedError: 'Ödeme işlemi sırasında beklenmeyen bir hata oluştu',
      testCard: 'Test kartı: 4242 4242 4242 4242 - 04/24 - 242 - 42424',
      days: 'gün',
      securePayment: 'Güvenli ödeme',
      stripeLoading: 'Stripe yükleniyor...'
    },
    en: {
      title: 'Late Fine Payment',
      fineDetails: 'Late Fine',
      book: 'Book',
      delay: 'Delay Duration',
      total: 'Total Amount',
      cardInfo: 'Card Information',
      cancel: 'Cancel',
      pay: 'Pay',
      processing: 'Processing...',
      paymentProcessing: 'Payment processing...',
      paymentSuccess: 'Payment completed successfully!',
      systemNotReady: 'Payment system not ready',
      paymentError: 'An error occurred during payment',
      unexpectedError: 'An unexpected error occurred during payment',
      testCard: 'Test card: 4242 4242 4242 4242 - 04/24 - 242 - 42424',
      days: 'days',
      securePayment: 'Secure payment',
      stripeLoading: 'Stripe loading...'
    }
  };

  const t = texts[language] || texts.tr;

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('💰 Ödeme formu gönderildi');
    
    if (!stripe || !elements) {
      console.error('❌ Stripe veya Elements hazır değil');
      setError(t.systemNotReady);
      return;
    }

    setLoading(true);
    setError('');
    setMessage(t.paymentProcessing);

    try {
      console.log('🔐 Ödeme onaylanıyor...');
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?loanId=${loan.id}`,
        },
        redirect: 'if_required'
      });

      if (submitError) {
        console.error('❌ Stripe ödeme hatası:', submitError);
        setError(submitError.message || t.paymentError);
      } else {
        console.log('✅ Ödeme başarılı!');
        setMessage(t.paymentSuccess);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      console.error('❌ Genel ödeme hatası:', err);
      setError(t.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Ödeme Detayları */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 text-lg mb-2">
          {t.fineDetails}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-yellow-700">{t.book}:</span>
            <span className="text-yellow-900 font-medium">{loan.bookTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-700">{t.delay}:</span>
            <span className="text-yellow-900 font-medium">
              {loan.fineDays} {t.days}
            </span>
          </div>
          <div className="flex justify-between border-t border-yellow-300 pt-2 mt-2">
            <span className="text-yellow-800 font-semibold">{t.total}:</span>
            <span className="text-yellow-900 font-bold text-lg">
              {loan.fineAmount} {language === 'tr' ? '₺' : 'TL'}
            </span>
          </div>
        </div>
      </div>

      {/* Kart Bilgileri - DEBUG EKLENDİ */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <CreditCard className="h-4 w-4 inline mr-1" />
          {t.cardInfo}
        </label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 min-h-[120px]">
          {!stripe ? (
            <div className="text-center py-4 text-gray-500">
              <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
              <div>{t.stripeLoading}</div>
              <div className="text-xs mt-1">Stripe: {stripe ? 'Hazır' : 'Yükleniyor'}</div>
              <div className="text-xs">Elements: {elements ? 'Hazır' : 'Yükleniyor'}</div>
            </div>
          ) : (
            <PaymentElement 
              options={{
                layout: 'tabs',
                fields: {
                  billingDetails: 'never'
                }
              }}
            />
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t.testCard}
        </p>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Butonlar */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
          disabled={loading}
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              {t.processing}
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              {loan.fineAmount} {language === 'tr' ? '₺' : 'TL'} {t.pay}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const PaymentModal = ({ loan, isOpen, onClose, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { language } = useLanguage();

  console.log('🔔 PaymentModal - isOpen:', isOpen, 'loan:', loan?.id, 'amount:', loan?.fineAmount);

  useEffect(() => {
    if (isOpen && loan) {
      console.log('💰 Payment intent oluşturuluyor...');
      createPaymentIntent();
    } else {
      console.log('❌ Modal kapalı veya loan yok');
      setClientSecret('');
      setError('');
      setLoading(false);
    }
  }, [isOpen, loan]);

  const createPaymentIntent = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('📡 API çağrısı yapılıyor: /.netlify/functions/create-payment-intent');
      
      const response = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loanId: loan.id,
          amount: loan.fineAmount,
          bookTitle: loan.bookTitle,
          fineDays: loan.fineDays
        })
      });
      
      console.log('📨 API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('💰 API Response data:', data);
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        console.log('✅ Client secret alındı!');
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Client secret alınamadı');
      }
    } catch (error) {
      console.error('❌ Payment intent error:', error);
      const errorMessage = language === 'tr' 
        ? 'Ödeme bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.'
        : 'Payment connection could not be established. Please try again later.';
      setError(error.message || errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  console.log('🎉 Modal render - loading:', loading, 'clientSecret:', !!clientSecret, 'error:', error);

  const texts = {
    tr: {
      title: 'Gecikme Cezası Ödeme',
      loading: 'Ödeme hazırlanıyor...',
      errorTitle: 'Hata Oluştu',
      tryAgain: 'Tekrar Dene',
      close: 'Kapat',
      paymentError: 'Ödeme bilgileri yüklenemedi'
    },
    en: {
      title: 'Late Fine Payment',
      loading: 'Payment preparing...',
      errorTitle: 'Error Occurred',
      tryAgain: 'Try Again',
      close: 'Close',
      paymentError: 'Payment information could not be loaded'
    }
  };

  const t = texts[language] || texts.tr;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t.loading}</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t.errorTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={createPaymentIntent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t.tryAgain}
              </button>
            </div>
          ) : clientSecret ? (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                },
                locale: language === 'tr' ? 'auto' : 'en'
              }}
            >
              <CheckoutForm 
                loan={{ ...loan, clientSecret }} // clientSecret'i de geç
                onSuccess={onSuccess}
                onClose={onClose}
              />
            </Elements>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 dark:text-gray-400">{t.paymentError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;