import React, { useState, useMemo } from 'react';
import { Task, Project, Customer, TaskStatus, TaskPriority } from '../../types';
import TaskList from '../tasks/TaskList';
import Card from '../ui/Card';

interface DashboardViewProps {
  tasks: Task[];
  projects: Project[];
  customers: Customer[];
  onEditTask: (task: Task) => void;
}

type FilterType = 'active' | 'completed' | 'urgent';

const DashboardView: React.FC<DashboardViewProps> = ({ tasks, projects, customers, onEditTask }) => {
    const [filter, setFilter] = useState<FilterType>('active');

    const filteredTasks = useMemo(() => {
        switch (filter) {
            case 'completed':
                return tasks.filter(t => t.status === TaskStatus.DONE);
            case 'urgent':
                return tasks.filter(t => t.priority === TaskPriority.URGENT && t.status !== TaskStatus.DONE);
            case 'active':
            default:
                return tasks.filter(t => t.status !== TaskStatus.DONE);
        }
    }, [tasks, filter]);

    const activeTasksCount = useMemo(() => tasks.filter(t => t.status !== TaskStatus.DONE).length, [tasks]);
    const overdueTasksCount = useMemo(() => tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.DONE).length, [tasks]);


  const getFilterButtonClass = (buttonFilter: FilterType) => {
    return `px-4 py-2 rounded-md text-sm font-medium transition ${
      filter === buttonFilter 
        ? 'bg-indigo-600 text-white' 
        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">משימות פעילות</h3>
            <p className="text-4xl font-bold mt-2">{activeTasksCount}</p>
        </Card>
        <Card>
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">פרויקטים</h3>
            <p className="text-4xl font-bold mt-2">{projects.length}</p>
        </Card>
        <Card>
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">משימות דחופות באיחור</h3>
            <p className={`text-4xl font-bold mt-2 ${overdueTasksCount > 0 ? 'text-red-500' : ''}`}>{overdueTasksCount}</p>
        </Card>
      </div>

      <div>
        <div className="mb-4 bg-gray-200 dark:bg-gray-900 p-1 rounded-lg flex items-center justify-start max-w-min">
            <button onClick={() => setFilter('active')} className={getFilterButtonClass('active')}>פעילות</button>
            <button onClick={() => setFilter('urgent')} className={getFilterButtonClass('urgent')}>דחופות</button>
            <button onClick={() => setFilter('completed')} className={getFilterButtonClass('completed')}>הושלמו</button>
        </div>

        <TaskList tasks={filteredTasks} onEditTask={onEditTask} />
      </div>
    </div>
  );
};

export default DashboardView;