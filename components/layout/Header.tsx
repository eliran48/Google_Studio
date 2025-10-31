import React, { useState, useRef, useEffect, ReactElement } from 'react';
import { MenuIcon, PlusIcon, ChevronDownIcon } from '../ui/Icons';

export interface HeaderAction {
    icon: ReactElement;
    onClick: () => void;
    label: string;
}

interface HeaderProps {
    userEmail: string | null;
    onLogout: () => void;
    onToggleSidebar: () => void;
    addActions: HeaderAction[];
}

const Header: React.FC<HeaderProps> = ({ userEmail, onLogout, onToggleSidebar, addActions }) => {
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
            setIsAddMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleActionClick = (action: HeaderAction) => {
    action.onClick();
    setIsAddMenuOpen(false);
  }

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
        <div className="relative" ref={addMenuRef}>
            <button 
                onClick={() => setIsAddMenuOpen(prev => !prev)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                <PlusIcon className="w-5 h-5" />
                <span>הוספה</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isAddMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border dark:border-gray-700">
                    {addActions.map((action) => (
                        <button 
                            key={action.label}
                            onClick={() => handleActionClick(action)}
                            className="w-full text-right flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {React.cloneElement(action.icon, {className: 'w-5 h-5'})}
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
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