import React from 'react';
import { Task, TaskStatus } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { EditIcon } from '../ui/Icons';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  title?: string;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask, title }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isOverdue = (task: Task) => {
    return new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;
  }

  return (
    <Card className="h-full">
      {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
      {tasks.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">אין משימות להצגה.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map(task => (
            <li key={task.id} className={`p-3 rounded-lg flex items-center justify-between transition-colors ${isOverdue(task) ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <div className="flex items-center">
                <input type="checkbox" checked={task.status === TaskStatus.DONE} readOnly className="ml-3 form-checkbox h-5 w-5 text-indigo-600 rounded" />
                <div>
                    <p className={`font-semibold ${task.status === TaskStatus.DONE ? 'line-through text-gray-500' : ''}`}>{task.title}</p>
                    <p className={`text-sm ${isOverdue(task) ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{formatDate(task.dueDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge priority={task.priority} />
                <button onClick={() => onEditTask(task)} className="text-gray-400 hover:text-indigo-600">
                  <EditIcon className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default TaskList;