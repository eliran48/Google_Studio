import React from 'react';
import { Project, Task, Customer } from '../../types';
import TaskList from '../tasks/TaskList';
import Card from '../ui/Card';
import { EditIcon, TrashIcon } from '../ui/Icons';

interface ProjectDetailViewProps {
  project: Project;
  tasks: Task[];
  customers: Customer[];
  onEditTask: (task: Task) => void;
  onToggleStatus: (taskId: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string, projectTitle: string) => void;
}

const InfoItem: React.FC<{label: string; value?: string | number | null}> = ({label, value}) => (
    <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-md font-semibold text-gray-800 dark:text-gray-200">{value || 'לא הוגדר'}</p>
    </div>
);

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, tasks, customers, onEditTask, onToggleStatus, onEditProject, onDeleteProject }) => {
  const projectCustomers = customers.filter(c => project.customerIds?.includes(c.id));

  const formatDate = (dateString?: string) => {
    if (!dateString) return undefined;
    return new Intl.DateTimeFormat('he-IL').format(new Date(dateString));
  };
  
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return undefined;
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-start">
            <div className="flex-grow">
                <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{project.title}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-prose">{project.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => onEditProject(project)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDeleteProject(project.id, project.title)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900 text-gray-600 dark:text-gray-300 hover:text-red-600">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <TaskList tasks={tasks} onEditTask={onEditTask} title="משימות בפרויקט" onToggleStatus={onToggleStatus} />
        </div>
        <div className="space-y-6">
            <Card>
                <h3 className="text-xl font-bold mb-4">פרטי הפרויקט</h3>
                <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="סטטוס" value={project.status} />
                    <InfoItem label="תקציב" value={formatCurrency(project.budget)} />
                    <InfoItem label="תאריך התחלה" value={formatDate(project.startDate)} />
                    <InfoItem label="תאריך סיום" value={formatDate(project.endDate)} />
                </div>
            </Card>
            <Card>
                <h3 className="text-xl font-bold mb-4">לקוחות משויכים</h3>
                {projectCustomers.length > 0 ? (
                    <ul className="space-y-2">
                        {projectCustomers.map(customer => (
                            <li key={customer.id} className="text-gray-700 dark:text-gray-200">{customer.name}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">אין לקוחות המשויכים ישירות לפרויקט זה.</p>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailView;