import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const MobileLanguageSelector = () => {
  const { language, setLanguage } = useState();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-24 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        🌐
      </button>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'tr' ? 'Dili Değiştir' : 'Change Language'}
            </h3>
            <div className="space-y-3">
              <button
                onClick={toggleLanguage}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
              >
                {language === 'tr' ? 'Switch to English' : 'Türkçeye Geç'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {language === 'tr' ? 'İptal' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileLanguageSelector;