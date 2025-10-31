import React from 'react';

interface HeaderProps {
    userEmail: string | null;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, onLogout }) => {
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
  
  return (
    <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold">ברוכים הבאים!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">ניהול המשימות והפרויקטים שלך במקום אחד.</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center font-bold text-indigo-700" title={userEmail || ''}>
          {userInitial}
        </div>
        <button onClick={onLogout} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
          התנתק
        </button>
      </div>
    </header>
  );
};

export default Header;
