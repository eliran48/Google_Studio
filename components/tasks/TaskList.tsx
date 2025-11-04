import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Task, TaskStatus } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { EditIcon, ChecklistIcon } from '../ui/Icons';

interface TaskListProps {
  tasks: Task[];
  title: string;
  onEditTask: (task: Task) => void;
  onToggleStatus: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, title, onEditTask, onToggleStatus }) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);
  
  const draggedTaskRef = useRef<Task | null>(null);
  const dragOverTaskRef = useRef<Task | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const hasCompletedTasks = useMemo(() => tasks.some(t => t.status === TaskStatus.DONE), [tasks]);

  const filteredTasks = useMemo(() => {
    // If the toggle is on, show all tasks.
    if (showCompleted) {
      return tasks;
    }
    // Otherwise, show only non-completed tasks.
    return tasks.filter(task => task.status !== TaskStatus.DONE);
  }, [tasks, showCompleted]);

  // Sync state when props change (e.g., when parent filter changes)
  useEffect(() => {
    setOrderedTasks(filteredTasks);
  }, [filteredTasks]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    draggedTaskRef.current = task;
    setDraggingTaskId(task.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id); // Necessary for Firefox
  };

  const handleDragEnter = (task: Task) => {
    dragOverTaskRef.current = task;
  };
  
  const handleDragEnd = () => {
    draggedTaskRef.current = null;
    dragOverTaskRef.current = null;
    setDraggingTaskId(null);
  };
  
  const handleDrop = () => {
    const draggedTask = draggedTaskRef.current;
    const dragOverTask = dragOverTaskRef.current;

    // Ensure we have a task being dragged, a target to drop on, and they are not the same task
    if (!draggedTask || !dragOverTask || draggedTask.id === dragOverTask.id) {
        handleDragEnd();
        return;
    }

    const fromIndex = orderedTasks.findIndex(t => t.id === draggedTask.id);
    const toIndex = orderedTasks.findIndex(t => t.id === dragOverTask.id);
    
    if (fromIndex === -1 || toIndex === -1) {
        handleDragEnd();
        return;
    }

    // Reorder the array
    const newOrderedTasks = [...orderedTasks];
    const [removed] = newOrderedTasks.splice(fromIndex, 1);
    newOrderedTasks.splice(toIndex, 0, removed);
    
    setOrderedTasks(newOrderedTasks);
    handleDragEnd(); // Cleanup after drop
  };


  const formatDate = (dateString?: string) => {
    if (!dateString) return 'אין תאריך יעד';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'תאריך לא חוקי';
        }
        // Using UTC to prevent timezone-related off-by-one day errors
        return new Intl.DateTimeFormat('he-IL', { timeZone: 'UTC' }).format(date);
    } catch (e) {
        return 'תאריך לא חוקי';
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        {hasCompletedTasks && (
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={() => setShowCompleted(!showCompleted)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              aria-label="הצג משימות שהושלמו"
            />
            <span>הצג משימות שהושלמו</span>
          </label>
        )}
      </div>
      {orderedTasks.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            {hasCompletedTasks && !showCompleted ? 'כל המשימות הפתוחות הושלמו! סמן את התיבה כדי להציג את כולן.' : 'אין משימות להצגה.'}
        </p>
      ) : (
        <div 
            className="space-y-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
          {orderedTasks.map(task => {
            const isOverdue = !!task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;
            const hasSubTasks = task.subTasks && task.subTasks.length > 0;
            const completedSubTasks = hasSubTasks ? task.subTasks!.filter(st => st.isCompleted).length : 0;
            const isDragging = draggingTaskId === task.id;
            
            return (
              <div 
                key={task.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnter={() => handleDragEnter(task)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-all hover:shadow-md cursor-move ${isDragging ? 'opacity-50 shadow-2xl scale-105' : 'opacity-100'}`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={task.status === TaskStatus.DONE}
                      onChange={(e) => {
                        e.preventDefault();
                        onToggleStatus(task.id);
                      }}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-1 flex-shrink-0"
                      aria-labelledby={`task-title-${task.id}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p id={`task-title-${task.id}`} className={`font-medium truncate ${task.status === TaskStatus.DONE ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                       <p className={`text-sm text-gray-500 dark:text-gray-400 truncate ${task.status === TaskStatus.DONE ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                    )}
                    <p className={`text-sm mt-1 ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                      תאריך יעד: {formatDate(task.dueDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pl-2">
                    {hasSubTasks && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400" title="התקדמות תתי-משימות">
                            <ChecklistIcon className="w-4 h-4" />
                            <span>{completedSubTasks}/{task.subTasks!.length}</span>
                        </div>
                    )}
                    <Badge priority={task.priority} />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task);
                      }} 
                      className="text-gray-400 hover:text-indigo-600" aria-label={`ערוך משימה ${task.title}`}
                    >
                        <EditIcon className="w-5 h-5" />
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default TaskList;