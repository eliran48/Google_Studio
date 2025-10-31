import React from 'react';
import { Project, Task, Customer } from '../../types';
import TaskList from '../tasks/TaskList';
import Card from '../ui/Card';

interface ProjectDetailViewProps {
  project: Project;
  tasks: Task[];
  customers: Customer[];
  onEditTask: (task: Task) => void;
  onToggleStatus: (taskId: string) => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, tasks, customers, onEditTask, onToggleStatus }) => {
  const projectCustomers = customers.filter(c => tasks.some(t => t.customerId === c.id));

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{project.title}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{project.description}</p>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <TaskList tasks={tasks} onEditTask={onEditTask} title="משימות בפרויקט" onToggleStatus={onToggleStatus} />
        </div>
        <div>
            <Card>
                <h3 className="text-xl font-bold mb-4">לקוחות מעורבים</h3>
                {projectCustomers.length > 0 ? (
                    <ul className="space-y-2">
                        {projectCustomers.map(customer => (
                            <li key={customer.id} className="text-gray-700 dark:text-gray-200">{customer.name}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">אין לקוחות המשויכים לפרויקט זה.</p>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailView;