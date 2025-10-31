import React from 'react';
import { ViewType } from '../../types';
import { DashboardIcon, ProjectIcon, CustomerIcon, IdeaIcon, ChecklistIcon } from '../ui/Icons';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: 'dashboard', label: 'דאשבורד', icon: DashboardIcon },
    { view: 'tasks', label: 'משימות', icon: ChecklistIcon },
    { view: 'projects', label: 'פרויקטים', icon: ProjectIcon },
    { view: 'customers', label: 'לקוחות', icon: CustomerIcon },
    { view: 'ideas', label: 'רעיונות', icon: IdeaIcon },
  ] as const;

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-center h-16 mb-4">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">TaskFlow</h1>
      </div>
      <nav>
        <ul>
          {navItems.map(({ view, label, icon: Icon }) => (
            <li key={view} className="mb-2">
              <button
                onClick={() => setView(view)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  currentView === view
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-6 h-6 ml-3" />
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;