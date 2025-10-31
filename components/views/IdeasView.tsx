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
      <h2 className="text-2xl font-bold mb-6">רעיונות עסקיים</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map(idea => (
          <Card key={idea.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-3">
                <LightBulbIcon className="w-6 h-6 text-yellow-500 ml-2" />
                <h3 className="text-xl font-bold">{idea.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{idea.description}</p>
            </div>
            <button
              onClick={() => onConvertToProject(idea)}
              className="mt-6 w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              הפוך לפרויקט
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IdeasView;