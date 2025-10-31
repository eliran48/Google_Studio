import React, { useState, ReactElement } from 'react';
import { PlusIcon } from './Icons';

export interface SpeedDialAction {
  icon: ReactElement;
  onClick: () => void;
  bgColor: string;
  ariaLabel: string;
  label: string;
}

interface SpeedDialProps {
  actions: SpeedDialAction[];
}

const SpeedDial: React.FC<SpeedDialProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleActionClick = (actionOnClick: () => void) => {
    actionOnClick();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-30 flex flex-col items-end gap-4">
      {/* Action buttons list */}
      <div 
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
      >
        <div className="flex flex-col-reverse items-end gap-4">
            {actions.map((action, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="bg-white dark:bg-gray-700 px-3 py-1 rounded-lg shadow-lg text-sm font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                  {action.label}
                </span>
                <button
                  onClick={() => handleActionClick(action.onClick)}
                  className={`${action.bgColor} text-white rounded-full p-3 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 ${action.bgColor.replace('bg-', 'focus:ring-')}`}
                  aria-label={action.ariaLabel}
                  title={action.ariaLabel}
                >
                  {React.cloneElement(action.icon, { className: 'w-6 h-6' })}
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Main toggle button with a label */}
      <div className="flex items-center gap-3">
        {!isOpen && (
            <span className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-lg text-sm font-semibold text-gray-800 dark:text-gray-100">
                הוספה
            </span>
        )}
        <button
          onClick={toggleMenu}
          className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 ease-in-out hover:scale-110"
          aria-label={isOpen ? "סגור תפריט פעולות" : "פתח תפריט פעולות"}
          aria-expanded={isOpen}
        >
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
            <PlusIcon className="w-8 h-8" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default SpeedDial;