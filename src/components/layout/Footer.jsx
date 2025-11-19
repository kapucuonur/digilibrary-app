import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { BookOpen, Heart } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <BookOpen className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              DigiLibrary
            </span>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for book lovers</span>
            </p>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 md:mt-0">
            <p>&copy; {new Date().getFullYear()} DigiLibrary. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;