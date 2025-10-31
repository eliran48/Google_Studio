
import React from 'react';
import { Task, TaskStatus } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { EditIcon } from '../ui/Icons';

interface TaskListProps {
  tasks: Task[];
  title: string;
  onEditTask: (task: Task) => void;
  onToggleStatus: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, title, onEditTask, onToggleStatus }) => {

  const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        // Basic check for valid date
        if (isNaN(date.getTime())) {
            return 'תאריך לא חוקי';
        }
        return date.toLocaleDateString('he-IL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        return 'תאריך לא חוקי';
    }
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-center text-gray-500 dark:text-gray-400">אין משימות להצגה.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={task.status === TaskStatus.DONE}
                onChange={() => onToggleStatus(task.id)}
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <p className={`font-medium ${task.status === TaskStatus.DONE ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  תאריך יעד: {formatDate(task.dueDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
                <Badge priority={task.priority} />
                <button onClick={() => onEditTask(task)} className="text-gray-400 hover:text-indigo-600">
                    <EditIcon className="w-5 h-5" />
                </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TaskList;
