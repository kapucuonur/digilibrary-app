// src/components/MobileLanguageSelector/MobileLanguageSelector.jsx
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const MobileLanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setIsOpen(false);
    // Sayfayı yenilemeye gerek yok, context state değişince tüm component'ler update olacak
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-24 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        {language === 'tr' ? '🌐' : '🌍'}
      </button>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {language === 'tr' ? 'Dil Seçin' : 'Select Language'}
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleLanguageChange('tr')}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  language === 'tr' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🇹🇷 Türkçe
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  language === 'en' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🇺🇸 English
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {language === 'tr' ? 'İptal' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileLanguageSelector;