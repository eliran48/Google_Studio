import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import Badge from '../ui/Badge';
import { EditIcon, PlusIcon } from '../ui/Icons';

// A smaller Task Card for the Kanban view
const TaskKanbanCard: React.FC<{ 
    task: Task; 
    onEditTask: (task: Task) => void; 
    onToggleStatus: (taskId: string) => void; 
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnter: () => void;
    onDragEnd: () => void;
    isDragging: boolean;
}> = ({ task, onEditTask, onToggleStatus, onDragStart, onDragEnter, onDragEnd, isDragging }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString));
    };

    const isOverdue = !!task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;

    return (
        <div 
            draggable
            onDragStart={onDragStart}
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
            className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-3 cursor-move transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        >
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
const TaskColumn: React.FC<{ 
    title: string; 
    tasks: Task[]; 
    onEditTask: (task: Task) => void; 
    onToggleStatus: (taskId: string) => void; 
    className: string; 
    onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
    onDragEnter: (task: Task) => void;
    onDrop: () => void;
    onDragEnd: () => void;
    draggingTaskId: string | null;
}> = ({ title, tasks, onEditTask, onToggleStatus, className, onDragStart, onDragEnter, onDrop, onDragEnd, draggingTaskId }) => (
    <div 
        className="bg-gray-100 dark:bg-gray-900/50 rounded-xl p-4 flex flex-col h-[calc(100vh-12rem)]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
    >
        <h3 className={`text-lg font-bold mb-4 px-2 ${className}`}>{title} ({tasks.length})</h3>
        <div className="space-y-4 overflow-y-auto pr-1 pb-2 flex-1">
            {tasks.length > 0 ? (
                tasks.map(task => (
                    <TaskKanbanCard 
                        key={task.id} 
                        task={task} 
                        onEditTask={onEditTask} 
                        onToggleStatus={onToggleStatus} 
                        onDragStart={(e) => onDragStart(e, task)}
                        onDragEnter={() => onDragEnter(task)}
                        onDragEnd={onDragEnd}
                        isDragging={draggingTaskId === task.id}
                    />
                ))
            ) : (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg h-24 flex items-center justify-center">
                    <span>אין משימות</span>
                </div>
            )}
        </div>
    </div>
);

interface TasksViewProps {
    tasks: Task[];
    onEditTask: (task: Task) => void;
    onToggleStatus: (taskId: string) => void;
    onAddTask: (defaults?: Partial<Task>) => void;
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, onEditTask, onToggleStatus, onAddTask }) => {
    const [showCompleted, setShowCompleted] = useState(true);

    const [todoTasks, setTodoTasks] = useState<Task[]>([]);
    const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
    const [doneTasks, setDoneTasks] = useState<Task[]>([]);
    
    const draggedTaskRef = useRef<Task | null>(null);
    const dragOverTaskRef = useRef<Task | null>(null);
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

    useEffect(() => {
        const priorityOrder: Record<TaskPriority, number> = {
            [TaskPriority.URGENT]: 4,
            [TaskPriority.HIGH]: 3,
            [TaskPriority.NORMAL]: 2,
            [TaskPriority.LOW]: 1,
        };
        
        const sortedTasks = [...tasks].sort((a, b) => {
          const priorityA = priorityOrder[a.priority];
          const priorityB = priorityOrder[b.priority];
          if (priorityB !== priorityA) {
              return priorityB - priorityA;
          }
          if (a.dueDate && b.dueDate) {
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        setTodoTasks(sortedTasks.filter(t => t.status === TaskStatus.TODO));
        setInProgressTasks(sortedTasks.filter(t => t.status === TaskStatus.IN_PROGRESS));
        setDoneTasks(sortedTasks.filter(t => t.status === TaskStatus.DONE));
    }, [tasks]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
        draggedTaskRef.current = task;
        setDraggingTaskId(task.id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
    };

    const handleDragEnter = (task: Task) => {
        dragOverTaskRef.current = task;
    };

    const handleDrop = (targetStatus: TaskStatus) => {
        const draggedTask = draggedTaskRef.current;
        const dragOverTask = dragOverTaskRef.current;

        if (!draggedTask || !dragOverTask || draggedTask.id === dragOverTask.id || draggedTask.status !== targetStatus || dragOverTask.status !== targetStatus) {
            return;
        }

        let list: Task[];
        let setList: (tasks: Task[]) => void;

        if (targetStatus === TaskStatus.TODO) {
            list = [...todoTasks];
            setList = setTodoTasks;
        } else if (targetStatus === TaskStatus.IN_PROGRESS) {
            list = [...inProgressTasks];
            setList = setInProgressTasks;
        } else {
            list = [...doneTasks];
            setList = setDoneTasks;
        }

        const fromIndex = list.findIndex(t => t.id === draggedTask.id);
        const toIndex = list.findIndex(t => t.id === dragOverTask.id);

        if (fromIndex === -1 || toIndex === -1) return;

        const [removed] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, removed);
        
        setList(list);
    };

    const handleDragEnd = () => {
        draggedTaskRef.current = null;
        dragOverTaskRef.current = null;
        setDraggingTaskId(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">לוח משימות</h2>
                <div className="flex items-center gap-4">
                     <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input 
                            type="checkbox" 
                            checked={showCompleted} 
                            onChange={() => setShowCompleted(!showCompleted)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>הצג טור "הושלם"</span>
                    </label>
                    <button
                        onClick={() => onAddTask()}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>הוסף משימה</span>
                    </button>
                </div>
            </div>
            <div className={`grid grid-cols-1 ${showCompleted ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
                <TaskColumn 
                    title="לביצוע" 
                    tasks={todoTasks} 
                    onEditTask={onEditTask} 
                    onToggleStatus={onToggleStatus} 
                    className="text-red-500" 
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    onDrop={() => handleDrop(TaskStatus.TODO)}
                    onDragEnd={handleDragEnd}
                    draggingTaskId={draggingTaskId}
                />
                <TaskColumn 
                    title="בתהליך" 
                    tasks={inProgressTasks} 
                    onEditTask={onEditTask} 
                    onToggleStatus={onToggleStatus} 
                    className="text-yellow-500" 
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    onDrop={() => handleDrop(TaskStatus.IN_PROGRESS)}
                    onDragEnd={handleDragEnd}
                    draggingTaskId={draggingTaskId}
                />
                {showCompleted && (
                    <TaskColumn 
                        title="הושלם" 
                        tasks={doneTasks} 
                        onEditTask={onEditTask} 
                        onToggleStatus={onToggleStatus} 
                        className="text-green-500" 
                        onDragStart={handleDragStart}
                        onDragEnter={handleDragEnter}
                        onDrop={() => handleDrop(TaskStatus.DONE)}
                        onDragEnd={handleDragEnd}
                        draggingTaskId={draggingTaskId}
                    />
                )}
            </div>
        </div>
    );
};

export default TasksView;