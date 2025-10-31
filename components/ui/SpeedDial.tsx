import React, { useState, ReactElement } from 'react';
import { PlusIcon } from './Icons';

export interface SpeedDialAction {
  icon: ReactElement;
  onClick: () => void;
  bgColor: string;
  ariaLabel: string;
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
    <div className="fixed bottom-8 right-8 z-30 flex flex-col items-center">
      <div 
        className={`flex flex-col-reverse items-center gap-4 transition-all duration-300 ease-in-out mb-4 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action.onClick)}
            className={`${action.bgColor} text-white rounded-full p-3 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 ${action.bgColor.replace('bg-', 'focus:ring-')}`}
            aria-label={action.ariaLabel}
            title={action.ariaLabel}
          >
            {React.cloneElement(action.icon, { className: 'w-6 h-6' })}
          </button>
        ))}
      </div>

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
  );
};

export default SpeedDial;
