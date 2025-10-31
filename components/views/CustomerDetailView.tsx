import React from 'react';
import { Customer, Task, Project } from '../../types';
import TaskList from '../tasks/TaskList';
import Card from '../ui/Card';

interface CustomerDetailViewProps {
  customer: Customer;
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onToggleStatus: (taskId: string) => void;
}

const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({ customer, tasks, projects, onEditTask, onToggleStatus }) => {
    const customerProjects = projects.filter(p => tasks.some(t => t.projectId === p.id));
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-bold text-teal-700 dark:text-teal-400">{customer.name}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{customer.email}</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <TaskList tasks={tasks} onEditTask={onEditTask} title={`משימות עבור ${customer.name}`} onToggleStatus={onToggleStatus} />
        </div>
        <div>
            <Card>
                <h3 className="text-xl font-bold mb-4">פרויקטים קשורים</h3>
                {customerProjects.length > 0 ? (
                    <ul className="space-y-2">
                        {customerProjects.map(project => (
                            <li key={project.id} className="text-gray-700 dark:text-gray-200">{project.title}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">אין פרויקטים המשויכים ללקוח זה.</p>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailView;