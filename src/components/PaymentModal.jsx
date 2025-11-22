import React, { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Loader, AlertCircle, CheckCircle } from 'lucide-react';

// VITE UYUMLU – ARTIK ÇALIŞACAK!
const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Debug amaçlı (isteğe bağlı – sonra silebilirsin)
if (!PUBLISHABLE_KEY) {
  console.error('VITE_STRIPE_PUBLISHABLE_KEY eksik! Netlify ortam değişkenlerini kontrol et.');
}

const stripePromise = PUBLISHABLE_KEY 
  ? loadStripe(PUBLISHABLE_KEY) 
  : Promise.resolve(null); // Anahtar yoksa boş Promise döndür

// --- CheckoutForm Bileşeni ---
const CheckoutForm = ({ loan, onSuccess, onClose, onApiError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const amountInTL = (loan.fineAmount || 0).toFixed(2);

  if (!stripe || !elements) {
    return (
      <div className="text-center py-8">
        <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Ödeme Servisleri Yükleniyor...</p>
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
      
      // confirmCardPayment, clientSecret kullanarak ödemeyi tamamlar
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(loan.clientSecret, {
        payment_method: { 
          card: cardElement 
        }
      });

      if (stripeError) {
        // Stripe API'den gelen hatayı göster
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Ödeme başarılı, başarılı callback'i çağır
        onSuccess(paymentIntent);
      } else {
        // Beklenmedik durum
        setError(`Ödeme durumu: ${paymentIntent.status}. Lütfen tekrar deneyin.`);
      }
    } catch (err) {
      console.error('Ödeme Onay Hatası:', err);
      setError('Ödeme işlemi sırasında beklenmedik bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-blue-800">Gecikme Cezası</h3>
          <p className="text-sm text-gray-600 truncate">Kitap: {loan.bookTitle}</p>
          <p className="text-sm text-gray-600">{loan.fineDays} gün gecikme</p>
        </div>
        <p className="text-2xl font-extrabold text-blue-700">{amountInTL} ₺</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 flex items-center text-gray-700">
          <CreditCard className="h-4 w-4 mr-2" /> Kart Bilgileri
        </label>
        <div className="border border-gray-300 rounded-lg p-3 shadow-sm focus-within:border-blue-500 transition">
          {/* CardElement, Stripe tarafından güvenli bir şekilde barındırılır */}
          <CardElement options={{ hidePostalCode: true }} />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-100 p-3 rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" /> {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button 
          type="button" 
          onClick={onClose} 
          className="flex-1 py-3 text-gray-700 rounded-xl hover:bg-gray-100 transition border border-gray-300"
        >
          İptal
        </button>
        <button 
          type="submit" 
          disabled={loading || !stripe} 
          className={`flex-1 py-3 rounded-xl transition font-semibold 
            ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader className="h-5 w-5 mr-2 animate-spin" /> Ödeniyor...
            </span>
          ) : (
            `${amountInTL} ₺ Öde`
          )}
        </button>
      </div>
    </form>
  );
};

// --- Ana PaymentModal Bileşeni ---
const PaymentModal = ({ loan, isOpen, onClose, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [stripeReady, setStripeReady] = useState(false);

  useEffect(() => {
    // Stripe Promise'ın yüklenip yüklenmediğini kontrol et
    stripePromise.then(stripe => {
      setStripeReady(!!stripe);
      if (!stripe) {
        setApiError("Ödeme sistemi henüz yapılandırılmadı. Lütfen site yöneticisiyle iletişime geçin.");
      }
    });
  }, []);

  const createPaymentIntent = useCallback(async () => {
    setLoading(true);
    setApiError('');

    if (!loan || !loan.fineAmount || loan.fineAmount <= 0) {
      setApiError("Geçersiz ceza miktarı.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: loan.id,
          amount: loan.fineAmount, // TL cinsinden
          bookTitle: loan.bookTitle,
          fineDays: loan.fineDays
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ödeme niyeti oluşturulamadı.');
      }
      
      setClientSecret(data.clientSecret);

    } catch (error) {
      console.error('API Error:', error);
      setApiError(error.message || 'Ödeme işlemi başlatılırken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  }, [loan]);

  useEffect(() => {
    if (isOpen && loan && stripeReady) {
      createPaymentIntent();
    }
  }, [isOpen, loan, stripeReady, createPaymentIntent]);


  if (!isOpen) return null;
  
  // Anahtar Yoksa Hata Ekranı
  if (!PUBLISHABLE_KEY || !stripeReady) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-8 text-center shadow-2xl">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-700 mb-2">Payment System Not Ready</h2>
                <p className="text-gray-600">Stripe integration not configured. Lütfen yöneticinizle iletişime geçin.</p>
                <button onClick={onClose} className="mt-6 px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                    Close
                </button>
            </div>
        </div>
    );
  }

  // Modal İçeriği
  const renderContent = () => {
    if (apiError) {
      return (
        <div className="text-center py-6">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Hata:</p>
          <p className="text-gray-600">{apiError}</p>
        </div>
      );
    }

    if (loading || !clientSecret) {
      return (
        <div className="text-center py-8">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Ödeme Hazırlanıyor...</p>
        </div>
      );
    }

    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm 
          loan={{...loan, clientSecret}} 
          onSuccess={onSuccess} 
          onClose={onClose} 
          onApiError={setApiError} // Hata yönetimini iyileştir
        />
      </Elements>
    );
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h2 className="text-2xl font-extrabold text-gray-800">Gecikme Cezası Ödeme</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
            <X className="h-6 w-6" />
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentModal;