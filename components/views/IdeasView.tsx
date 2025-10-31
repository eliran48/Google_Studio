
import React from 'react';
import { Idea } from '../../types';
import Card from '../ui/Card';
import { LightBulbIcon } from '../ui/Icons';

interface IdeasViewProps {
  ideas: Idea[];
}

const IdeasView: React.FC<IdeasViewProps> = ({ ideas }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">בנק רעיונות</h2>
      {ideas.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 dark:text-gray-400">עדיין אין רעיונות. הוסף רעיון חדש כדי להתחיל!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map(idea => (
            <Card key={idea.id}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <LightBulbIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{idea.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{idea.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IdeasView;
