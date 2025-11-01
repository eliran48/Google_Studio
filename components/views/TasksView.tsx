import React from 'react';
import { Task, TaskStatus } from '../../types';
import Badge from '../ui/Badge';
import { EditIcon, PlusIcon } from '../ui/Icons';

// A smaller Task Card for the Kanban view
const TaskKanbanCard: React.FC<{ task: Task; onEditTask: (task: Task) => void; onToggleStatus: (taskId: string) => void; }> = ({ task, onEditTask, onToggleStatus }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString));
    };

    const isOverdue = !!task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex justify-between items-start">
                <p className={`font-bold break-words ${task.status === TaskStatus.DONE ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                </p>
                <button onClick={() => onEditTask(task)} className="text-gray-400 hover:text-indigo-600 flex-shrink-0 ml-2" aria-label={`ערוך משימה ${task.title}`}>
                    <EditIcon className="w-5 h-5" />
                </button>
            </div>
            {task.description && <p className="text-sm text-gray-600 dark:text-gray-400 break-words line-clamp-2">{task.description}</p>}
            <div className="flex justify-between items-center text-sm">
                <span className={`font-medium ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {formatDate(task.dueDate)}
                </span>
                <Badge priority={task.priority} />
            </div>
             <div className="flex items-center pt-2 border-t border-gray-100 dark:border-gray-700 mt-3">
                <input
                  type="checkbox"
                  checked={task.status === TaskStatus.DONE}
                  onChange={(e) => {
                    e.preventDefault();
                    onToggleStatus(task.id);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  id={`kanban-check-${task.id}`}
                />
                <label htmlFor={`kanban-check-${task.id}`} className="mr-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                    {task.status === TaskStatus.DONE ? 'הושלם' : 'סמן כהושלם'}
                </label>
            </div>
        </div>
    );
};

// The Column component
const TaskColumn: React.FC<{ title: string; tasks: Task[]; onEditTask: (task: Task) => void; onToggleStatus: (taskId: string) => void; className: string; }> = ({ title, tasks, onEditTask, onToggleStatus, className }) => (
    <div className="bg-gray-100 dark:bg-gray-900/50 rounded-xl p-4">
        <h3 className={`text-lg font-bold mb-4 px-2 ${className}`}>{title} ({tasks.length})</h3>
        <div className="space-y-4 overflow-y-auto pr-2">
            {tasks.length > 0 ? (
                tasks.map(task => (
                    <TaskKanbanCard key={task.id} task={task} onEditTask={onEditTask} onToggleStatus={onToggleStatus} />
                ))
            ) : (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    אין משימות להצגה.
                </div>
            )}
        </div>
    </div>
);

interface TasksViewProps {
    tasks: Task[];
    onEditTask: (task: Task) => void;
    onToggleStatus: (taskId: string) => void;
    onAddTask: () => void;
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, onEditTask, onToggleStatus, onAddTask }) => {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      if (!a.dueDate && !b.dueDate) return 0;
      return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
    });

    const todoTasks = sortedTasks.filter(t => t.status === TaskStatus.TODO);
    const inProgressTasks = sortedTasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
    const doneTasks = sortedTasks.filter(t => t.status === TaskStatus.DONE);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">לוח משימות</h2>
                <button
                    onClick={onAddTask}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>הוסף משימה</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TaskColumn title="לביצוע" tasks={todoTasks} onEditTask={onEditTask} onToggleStatus={onToggleStatus} className="text-red-500" />
                <TaskColumn title="בתהליך" tasks={inProgressTasks} onEditTask={onEditTask} onToggleStatus={onToggleStatus} className="text-yellow-500" />
                <TaskColumn title="הושלם" tasks={doneTasks} onEditTask={onEditTask} onToggleStatus={onToggleStatus} className="text-green-500" />
            </div>
        </div>
    );
};

export default TasksView;