import React from 'react';
import { Project, Task, TaskStatus, ProjectStatus } from '../../types';
import Card from '../ui/Card';
import { EditIcon, TrashIcon, PlusIcon } from '../ui/Icons';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  onProjectSelect: (projectId: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string, projectTitle: string) => void;
  onAddProject: () => void;
}

const statusStyles: Record<ProjectStatus, { text: string, bg: string }> = {
    [ProjectStatus.NOT_STARTED]: { text: 'text-gray-800 dark:text-gray-300', bg: 'bg-gray-200 dark:bg-gray-700' },
    [ProjectStatus.IN_PROGRESS]: { text: 'text-blue-800 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900' },
    [ProjectStatus.COMPLETED]: { text: 'text-green-800 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900' },
    [ProjectStatus.ON_HOLD]: { text: 'text-yellow-800 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900' },
};

const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
    const styles = statusStyles[status] || statusStyles[ProjectStatus.NOT_STARTED];
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles.bg} ${styles.text}`}>
            {status}
        </span>
    );
};


const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, tasks, onProjectSelect, onEditProject, onDeleteProject, onAddProject }) => {
  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const completedTasks = projectTasks.filter(t => t.status === TaskStatus.DONE).length;
    const totalTasks = projectTasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, progress };
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">פרויקטים</h2>
            <button
                onClick={onAddProject}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                <PlusIcon className="w-5 h-5" />
                <span>הוסף פרויקט</span>
            </button>
        </div>
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
                <div className="flex justify-between items-start">
                    <div onClick={() => onProjectSelect(project.id)} className="cursor-pointer flex-grow space-y-2">
                        <h3 className="text-xl font-bold mb-2 text-indigo-600 dark:text-indigo-400 flex-1 break-words pr-2">{project.title}</h3>
                        <ProjectStatusBadge status={project.status} />
                    </div>
                    <div className="flex items-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEditProject(project); }} 
                            className="text-gray-400 hover:text-indigo-600 p-1 rounded-full"
                            aria-label={`ערוך פרויקט ${project.title}`}
                        >
                            <EditIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id, project.title); }} 
                            className="text-gray-400 hover:text-red-600 p-1 rounded-full"
                            aria-label={`מחק פרויקט ${project.title}`}
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                 <div onClick={() => onProjectSelect(project.id)} className="cursor-pointer flex-grow mt-2">
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