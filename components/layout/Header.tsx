import React from 'react';
import { MenuIcon } from '../ui/Icons';

interface HeaderProps {
    userEmail: string | null;
    onLogout: () => void;
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, onLogout, onToggleSidebar }) => {
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';

  return (
    <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar} 
          className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg lg:hidden"
          aria-label="פתח תפריט"
        >
            <MenuIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-200 dark:bg-indigo-900 rounded-full flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300" title={userEmail || ''}>
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