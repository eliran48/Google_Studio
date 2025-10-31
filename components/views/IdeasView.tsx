import React from 'react';
import { Idea } from '../../types';
import Card from '../ui/Card';
import { LightBulbIcon } from '../ui/Icons';

interface IdeasViewProps {
  ideas: Idea[];
  onConvertToProject: (idea: Idea) => void;
}

const IdeasView: React.FC<IdeasViewProps> = ({ ideas, onConvertToProject }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">בנק רעיונות</h2>
      {ideas.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <LightBulbIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">אין עדיין רעיונות</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">השתמש בכפתור הצף כדי להוסיף את הרעיון הגדול הבא שלך!</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map(idea => (
            <Card 
              key={idea.id} 
              className="group cursor-pointer hover:shadow-xl hover:border-indigo-500 border-transparent border-2 transition-all flex flex-col justify-between"
              onClick={() => onConvertToProject(idea)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onConvertToProject(idea)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <LightBulbIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">{idea.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-3">{idea.description}</p>
                </div>
              </div>
              <div className="text-right mt-4">
                  <span className="text-sm font-semibold text-indigo-500 group-hover:underline">
                    הפוך לפרויקט &larr;
                  </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IdeasView;
