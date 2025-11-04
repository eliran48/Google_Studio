import React, { useState, useRef } from 'react';
import { Task } from '../../types';
import Card from '../ui/Card';
import { XIcon, EditIcon } from '../ui/Icons';

interface DailyTasksListProps {
  tasks: Task[];
  onRemove: (taskId: string) => void;
  onReorder: (reorderedTasks: Task[]) => void;
  onEditTask: (task: Task) => void;
}

const DailyTaskItem: React.FC<{
    task: Task;
    onRemove: () => void;
    onEdit: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnter: () => void;
    onDragEnd: () => void;
    isDragging: boolean;
}> = ({ task, onRemove, onEdit, onDragStart, onDragEnter, onDragEnd, isDragging }) => {
    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
            className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-all hover:shadow-md cursor-move group ${isDragging ? 'opacity-50 shadow-2xl scale-105' : 'opacity-100'}`}
        >
            <p className="font-medium truncate flex-1 pr-2 text-gray-900 dark:text-gray-100">{task.title}</p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="text-gray-400 hover:text-indigo-600 p-1" aria-label="ערוך משימה">
                    <EditIcon className="w-4 h-4" />
                </button>
                <button onClick={onRemove} className="text-gray-400 hover:text-red-600 p-1" aria-label="הסר מהרשימה היומית">
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const DailyTasksList: React.FC<DailyTasksListProps> = ({ tasks, onRemove, onReorder, onEditTask }) => {
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
    const draggedTaskRef = useRef<Task | null>(null);
    const dragOverTaskRef = useRef<Task | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
        draggedTaskRef.current = task;
        setDraggingTaskId(task.id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
    };

    const handleDragEnter = (task: Task) => {
        dragOverTaskRef.current = task;
    };

    const handleDrop = () => {
        const draggedTask = draggedTaskRef.current;
        const dragOverTask = dragOverTaskRef.current;

        if (!draggedTask || !dragOverTask || draggedTask.id === dragOverTask.id) {
            handleDragEnd();
            return;
        }

        const fromIndex = tasks.findIndex(t => t.id === draggedTask.id);
        const toIndex = tasks.findIndex(t => t.id === dragOverTask.id);

        if (fromIndex === -1 || toIndex === -1) {
            handleDragEnd();
            return;
        }

        const reorderedTasks = [...tasks];
        const [removed] = reorderedTasks.splice(fromIndex, 1);
        reorderedTasks.splice(toIndex, 0, removed);
        
        onReorder(reorderedTasks);
        handleDragEnd();
    };

    const handleDragEnd = () => {
        draggedTaskRef.current = null;
        dragOverTaskRef.current = null;
        setDraggingTaskId(null);
    };
    
    return (
        <Card className="h-full">
            <h3 className="text-xl font-bold mb-4">היום</h3>
            <div 
                className="space-y-4"
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
            >
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <DailyTaskItem
                            key={task.id}
                            task={task}
                            onRemove={() => onRemove(task.id)}
                            onEdit={() => onEditTask(task)}
                            onDragStart={(e) => handleDragStart(e, task)}
                            onDragEnter={() => handleDragEnter(task)}
                            onDragEnd={handleDragEnd}
                            isDragging={draggingTaskId === task.id}
                        />
                    ))
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg min-h-[100px] flex items-center justify-center">
                        <p>גרור משימות לכאן כדי לתכנן את היום.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default DailyTasksList;