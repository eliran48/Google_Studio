import React from 'react';
import { Idea, Task, TaskType, IdeaCategory, IdeaImpact, IdeaEffort } from '../../types';
import TaskList from '../tasks/TaskList';
import Card from '../ui/Card';
import { EditIcon, TrashIcon, PlusIcon } from '../ui/Icons';

interface IdeaDetailViewProps {
  idea: Idea;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onToggleStatus: (taskId: string) => void;
  onEditIdea: (idea: Idea) => void;
  onDeleteIdea: (idea: Idea) => void;
  onConvertToProject: (idea: Idea) => void;
  onBack: () => void;
}

const InfoItem: React.FC<{label: string; value?: string | number | null}> = ({label, value}) => (
    <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-md font-semibold text-gray-800 dark:text-gray-200">{value || 'לא הוגדר'}</p>
    </div>
);


const IdeaDetailView: React.FC<IdeaDetailViewProps> = ({
    idea,
    tasks,
    onEditTask,
    onToggleStatus,
    onEditIdea,
    onDeleteIdea,
    onConvertToProject,
    onBack,
}) => {
  return (
    <div className="space-y-6">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
        </svg>
        <span>חזרה לרשימת הרעיונות</span>
      </button>

      <Card>
        <div className="flex justify-between items-start">
            <div className="flex-grow">
                <h2 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{idea.title}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-prose">{idea.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => onEditIdea(idea)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDeleteIdea(idea)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900 text-gray-600 dark:text-gray-300 hover:text-red-600">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
         <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
             <button
                onClick={() => onConvertToProject(idea)}
                className="w-full px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                >
                הפוך לפרויקט &rarr;
            </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <TaskList tasks={tasks} onEditTask={onEditTask} title="משימות עבור הרעיון" onToggleStatus={onToggleStatus} />
        </div>
        <div className="space-y-6">
            <Card>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">פרטי הרעיון</h3>
                <div className="grid grid-cols-1 gap-4">
                    <InfoItem label="קטגוריה" value={idea.category} />
                    <InfoItem label="השפעה (Impact)" value={idea.impact} />
                    <InfoItem label="מאמץ (Effort)" value={idea.effort} />
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetailView;