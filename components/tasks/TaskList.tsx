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
    if (!dateString) return 'אין תאריך יעד';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'תאריך לא חוקי';
        }
        return new Intl.DateTimeFormat('he-IL').format(date);
    } catch (e) {
        return 'תאריך לא חוקי';
    }
  };

  return (
    <Card>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      {tasks.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">אין משימות להצגה.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={task.status === TaskStatus.DONE}
                  onChange={() => onToggleStatus(task.id)}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-1 flex-shrink-0"
                  aria-labelledby={`task-title-${task.id}`}
                />
                <div onClick={() => onEditTask(task)} className="flex-1 cursor-pointer min-w-0">
                  <p id={`task-title-${task.id}`} className={`font-medium truncate ${task.status === TaskStatus.DONE ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </p>
                  {task.description && (
                     <p className={`text-sm text-gray-500 dark:text-gray-400 truncate ${task.status === TaskStatus.DONE ? 'line-through' : ''}`}>
                      {task.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    תאריך יעד: {formatDate(task.dueDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-2">
                  <Badge priority={task.priority} />
                  <button onClick={() => onEditTask(task)} className="text-gray-400 hover:text-indigo-600" aria-label={`ערוך משימה ${task.title}`}>
                      <EditIcon className="w-5 h-5" />
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TaskList;
