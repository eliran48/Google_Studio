import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold">ברוכים הבאים!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">ניהול המשימות והפרויקטים שלך במקום אחד.</p>
      </div>
      <div>
        {/* Placeholder for user menu or other actions */}
        <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center font-bold text-indigo-700">
          A
        </div>
      </div>
    </header>
  );
};

export default Header;