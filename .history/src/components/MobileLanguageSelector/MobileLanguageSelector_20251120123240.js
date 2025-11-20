// src/components/MobileLanguageSelector/MobileLanguageSelector.jsx
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe, X } from 'lucide-react';

const MobileLanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe' },
    { code: 'en', name: 'English', nativeName: 'English' }
  ];

  return (
    <>
      {/* Floating Action Button - Sadece mobile'de görünecek */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden mobile-language-btn"
        aria-label="Change language"
      >
        <Globe className="h-6 w-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="language-modal">
          <div className="language-modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dil Seçin / Select Language
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    language === lang.code
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg ${language === lang.code ? 'font-bold' : 'font-medium'}`}>
                      {lang.code === 'tr' ? '🇹🇷' : '🇺🇸'}
                    </span>
                    <span className={language === lang.code ? 'font-semibold' : ''}>
                      {lang.nativeName}
                    </span>
                  </div>
                  
                  {language === lang.code && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileLanguageSelector;