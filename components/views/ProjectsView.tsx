import React from 'react';
import { Project, Task, TaskStatus } from '../../types';
import Card from '../ui/Card';
import { EditIcon } from '../ui/Icons';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  onProjectSelect: (projectId: string) => void;
  onEditProject: (project: Project) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, tasks, onProjectSelect, onEditProject }) => {
  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const completedTasks = projectTasks.filter(t => t.status === TaskStatus.DONE).length;
    const totalTasks = projectTasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, progress };
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">פרויקטים</h2>
      {projects.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 dark:text-gray-400">לא נמצאו פרויקטים. נסה להוסיף פרויקט חדש!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const { totalTasks, progress } = getProjectStats(project.id);
            return (
              <Card key={project.id} className="group hover:shadow-lg hover:border-indigo-500 border-transparent border-2 transition-all flex flex-col" >
                <div onClick={() => onProjectSelect(project.id)} className="cursor-pointer flex-grow">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold mb-2 text-indigo-600 dark:text-indigo-400 flex-1 break-words pr-2">{project.title}</h3>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEditProject(project); }} 
                            className="text-gray-400 hover:text-indigo-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`ערוך פרויקט ${project.title}`}
                        >
                            <EditIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 h-12 overflow-hidden">{project.description}</p>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>התקדמות</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">{totalTasks} משימות</p>
                    <p className="text-xs text-gray-400">{project.customerIds?.length || 0} לקוחות</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsView;