// components/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Loader, AlertCircle } from 'lucide-react';

// Stripe'ı yükle - environment variable kontrolü
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY);

// Ödeme formu component'ı
const CheckoutForm = ({ loan, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  console.log('🔔 CheckoutForm rendered - Stripe:', !!stripe, 'Elements:', !!elements);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Ödeme sistemi hazır değil');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('Ödeme işleniyor...');

    try {
      console.log('💰 Ödeme başlatılıyor...');
      
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?loanId=${loan.id}`,
        },
        redirect: 'if_required'
      });

      if (submitError) {
        console.error('❌ Stripe error:', submitError);
        setError(submitError.message || 'Ödeme sırasında bir hata oluştu');
      } else {
        console.log('✅ Ödeme başarılı!');
        setMessage('Ödeme başarıyla tamamlandı!');
        
        // Başarı callback'ini çağır
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      console.error('❌ General error:', err);
      setError('Ödeme işlemi sırasında beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Ödeme Detayları */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 text-lg mb-2">Gecikme Cezası</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-yellow-700">Kitap:</span>
            <span className="text-yellow-900 font-medium">{loan.bookTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-700">Gecikme Süresi:</span>
            <span className="text-yellow-900 font-medium">{loan.fineDays} gün</span>
          </div>
          <div className="flex justify-between border-t border-yellow-300 pt-2 mt-2">
            <span className="text-yellow-800 font-semibold">Toplam Tutar:</span>
            <span className="text-yellow-900 font-bold text-lg">{loan.fineAmount} ₺</span>
          </div>
        </div>
      </div>

      {/* Kart Bilgileri */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          <CreditCard className="h-4 w-4 inline mr-1" />
          Kart Bilgileri
        </label>
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <PaymentElement 
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false
              }
            }}
          />
        </div>
        <p className="text-xs text-gray-500 text-center">
          💳 Test kartı: 4242 4242 4242 4242 - 04/24 - 242 - 42424
        </p>
      </div>

      {/* Mesaj ve Hata Alanları */}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <div className="flex-shrink-0">
            <Loader className="h-4 w-4 animate-spin" />
          </div>
          <span className="ml-2">{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <div className="flex-shrink-0">
            <AlertCircle className="h-4 w-4" />
          </div>
          <span className="ml-2">{error}</span>
        </div>
      )}

      {/* Butonlar */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          disabled={loading}
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Ödeniyor...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              {loan.fineAmount} ₺ Öde
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Ana PaymentModal Component'ı
const PaymentModal = ({ loan, isOpen, onClose, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log('🔔 PaymentModal PROPS:', { 
    isOpen, 
    loan: loan ? { id: loan.id, title: loan.bookTitle, amount: loan.fineAmount } : 'no loan' 
  });

  useEffect(() => {
    console.log('🔄 PaymentModal useEffect triggered', { isOpen, loanId: loan?.id });
    
    if (isOpen && loan) {
      console.log('💰 Creating payment intent for loan:', loan.id, 'Amount:', loan.fineAmount);
      createPaymentIntent();
    } else {
      console.log('❌ Modal kapalı veya loan yok, resetting...');
      setClientSecret('');
      setError('');
      setLoading(false);
    }
  }, [isOpen, loan]);

  const createPaymentIntent = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('📡 API Calling: /.netlify/functions/create-payment-intent');
      
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
      
      console.log('📨 API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('💰 API Response Data:', data);
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        console.log('✅ Client secret başarıyla alındı');
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Client secret alınamadı');
      }
    } catch (error) {
      console.error('❌ Payment intent creation error:', error);
      setError(error.message || 'Ödeme bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Modal kapalıysa hiçbir şey render etme
  if (!isOpen) {
    return null;
  }

  console.log('🎉 PaymentModal rendering - loading:', loading, 'clientSecret:', !!clientSecret, 'error:', error);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl transform transition-all animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Gecikme Cezası Ödeme</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Ödeme hazırlanıyor...</p>
              <p className="text-sm text-gray-500 mt-1">Lütfen bekleyin</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hata Oluştu</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Kapat
                </button>
                <button
                  onClick={createPaymentIntent}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          ) : clientSecret ? (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#059669',
                    borderRadius: '8px'
                  }
                }
              }}
            >
              <CheckoutForm 
                loan={loan} 
                onSuccess={onSuccess}
                onClose={onClose}
              />
            </Elements>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600">Ödeme bilgileri yüklenemedi</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 pb-4">
          <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-4">
            <p>🔒 Güvenli ödeme işlemi</p>
            <p className="mt-1">Stripe ile korunmaktadır</p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};
