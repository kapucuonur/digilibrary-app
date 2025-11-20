import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe, X } from 'lucide-react';

const MobileLanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' }
  ];

  return (
    <>
      {/* Floating Action Button - Sadece mobile'de görünecek */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-24 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Change language"
      >
        <Globe className="h-6 w-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'tr' ? 'Dil Seçin' : 'Select Language'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                    language === lang.code
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {lang.flag}
                    </span>
                    <div className="text-left">
                      <div className={`font-medium ${language === lang.code ? 'text-blue-800 dark:text-blue-200' : ''}`}>
                        {lang.nativeName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {lang.name}
                      </div>
                    </div>
                  </div>
                  
                  {language === lang.code && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
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