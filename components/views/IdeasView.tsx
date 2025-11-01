import React from 'react';
import { Idea, IdeaImpact, IdeaEffort } from '../../types';
import Card from '../ui/Card';
import { LightBulbIcon, PlusIcon, EditIcon, TrashIcon } from '../ui/Icons';

interface IdeasViewProps {
  ideas: Idea[];
  onConvertToProject: (idea: Idea) => void;
  onAddIdea: () => void;
  onEditIdea: (idea: Idea) => void;
  onDeleteIdea: (idea: Idea) => void;
}

const getBadgeStyle = (type: 'impact' | 'effort', value: IdeaImpact | IdeaEffort) => {
    const impactStyles: Record<IdeaImpact, string> = {
        [IdeaImpact.HIGH]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        [IdeaImpact.MEDIUM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [IdeaImpact.LOW]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    const effortStyles: Record<IdeaEffort, string> = {
        [IdeaEffort.HIGH]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        [IdeaEffort.MEDIUM]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        [IdeaEffort.LOW]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return type === 'impact' ? impactStyles[value as IdeaImpact] : effortStyles[value as IdeaEffort];
};

const InfoBadge: React.FC<{label: string; value: IdeaImpact | IdeaEffort; type: 'impact' | 'effort'}> = ({ label, value, type }) => (
    <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getBadgeStyle(type, value)}`}>
       {label}: {value}
    </div>
);


const IdeasView: React.FC<IdeasViewProps> = ({ ideas, onConvertToProject, onAddIdea, onEditIdea, onDeleteIdea }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">בנק רעיונות</h2>
        <button
            onClick={onAddIdea}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
            <PlusIcon className="w-5 h-5" />
            <span>הוסף רעיון</span>
        </button>
      </div>
      {ideas.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <LightBulbIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">אין עדיין רעיונות</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">השתמש בכפתור ההוספה כדי להוסיף את הרעיון הגדול הבא שלך!</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map(idea => (
            <Card 
              key={idea.id} 
              className="group hover:shadow-xl hover:border-indigo-500 border-transparent border-2 transition-all flex flex-col justify-between relative"
            >
              <div className="absolute top-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={(e) => { e.stopPropagation(); onEditIdea(idea); }} className="p-1.5 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600" aria-label="ערוך רעיון"><EditIcon className="w-4 h-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteIdea(idea); }} className="p-1.5 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 hover:bg-red-200 dark:hover:bg-red-800 hover:text-red-600" aria-label="מחק רעיון"><TrashIcon className="w-4 h-4" /></button>
              </div>
              <div className="flex-grow">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                      <LightBulbIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate pr-16">{idea.title}</h3>
                      <p className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full inline-block mt-1">{idea.category}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-3 line-clamp-3">{idea.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex flex-wrap gap-2">
                     <InfoBadge label="השפעה" value={idea.impact} type="impact" />
                     <InfoBadge label="מאמץ" value={idea.effort} type="effort" />
                  </div>
                  <button 
                    onClick={() => onConvertToProject(idea)}
                    className="w-full text-center mt-2 text-sm font-semibold text-indigo-500 hover:underline"
                    >
                    הפוך לפרויקט &larr;
                  </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IdeasView;