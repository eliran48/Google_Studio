import React, { useMemo, useState } from 'react';
import { Task, TaskStatus, Project, ViewType, TaskPriority, TaskType } from '../../types';
import TaskList from '../tasks/TaskList';
import Card from '../ui/Card';
import { ProjectFolderIcon } from '../ui/Icons';

interface DashboardViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onToggleStatus: (taskId: string) => void;
  onProjectSelect: (projectId: string) => void;
  setView: (view: ViewType) => void;
}

const StatCard: React.FC<{ title: string; value: number | string; onClick?: () => void; isActive?: boolean }> = ({ title, value, onClick, isActive }) => {
    const cardBaseClasses = "text-center transition-all duration-200 h-full flex flex-col justify-center";
    const interactiveClasses = onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-1" : "";
    const activeClasses = isActive ? "ring-2 ring-indigo-500 shadow-lg" : "shadow-md";

    const cardContent = (
         <Card className={`${cardBaseClasses} ${interactiveClasses} ${activeClasses}`}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </Card>
    );

    if (onClick) {
        return <div onClick={onClick} className="h-full">{cardContent}</div>;
    }
    return cardContent;
};

const DashboardView: React.FC<DashboardViewProps> = ({ tasks, projects, onEditTask, onToggleStatus, onProjectSelect, setView }) => {
  const [taskFilter, setTaskFilter] = useState<'all' | TaskType>('all');
  
  const { filteredOpenTasks, stats } = useMemo(() => {
    const incompleteTasks = tasks.filter(t => t.status !== TaskStatus.DONE);

    const priorityOrder: Record<TaskPriority, number> = {
        [TaskPriority.URGENT]: 4,
        [TaskPriority.HIGH]: 3,
        [TaskPriority.NORMAL]: 2,
        [TaskPriority.LOW]: 1,
    };
    
    const sortedOpenTasks = [...incompleteTasks].sort((a, b) => {
        const priorityA = priorityOrder[a.priority];
        const priorityB = priorityOrder[b.priority];
        if (priorityB !== priorityA) {
            return priorityB - priorityA; // Higher priority first
        }

        // Sort by due date (earliest first, no due date last)
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) {
            return -1; // a has a due date, b doesn't, so a comes first
        }
        if (b.dueDate) {
            return 1; // b has a due date, a doesn't, so b comes first
        }

        // As a fallback, sort by creation date (oldest first)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const filteredTasks = sortedOpenTasks.filter(task => {
        if (taskFilter === 'all') return true;
        return task.type === taskFilter;
    });

    const statistics = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === TaskStatus.DONE).length,
        inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
        personal: tasks.filter(t => t.type === TaskType.PERSONAL).length,
        business: tasks.filter(t => t.type === TaskType.BUSINESS).length,
    };
    
    return { filteredOpenTasks: filteredTasks, stats: statistics };
  }, [tasks, taskFilter]);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <StatCard title="כלל המשימות" value={stats.total} onClick={() => setTaskFilter('all')} isActive={taskFilter === 'all'} />
            <StatCard title="משימות אישיות" value={stats.personal} onClick={() => setTaskFilter(TaskType.PERSONAL)} isActive={taskFilter === TaskType.PERSONAL} />
            <StatCard title="משימות עסקיות" value={stats.business} onClick={() => setTaskFilter(TaskType.BUSINESS)} isActive={taskFilter === TaskType.BUSINESS} />
            <StatCard title="לביצוע" value={stats.todo} />
            <StatCard title="בתהליך" value={stats.inProgress} />
            <StatCard title="הושלמו" value={stats.completed} />
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <TaskList
              tasks={filteredOpenTasks}
              title={`משימות פתוחות ${taskFilter !== 'all' ? `(${taskFilter})` : ''}`}
              onEditTask={onEditTask}
              onToggleStatus={onToggleStatus}
            />
        </div>
        <div className="space-y-6">
            <Card className="hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-4">פרויקטים פעילים</h3>
                <div className="space-y-3">
                    {projects.slice(0, 5).map(project => (
                        <div key={project.id} onClick={() => onProjectSelect(project.id)} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                            <ProjectFolderIcon className="w-6 h-6 text-indigo-500" />
                            <span className="font-medium">{project.title}</span>
                        </div>
                    ))}
                    {projects.length > 5 && (
                         <button onClick={() => setView('projects')} className="text-sm font-semibold text-indigo-600 hover:underline mt-2">
                            הצג את כל הפרויקטים
                        </button>
                    )}
                    {projects.length === 0 && <p className="text-sm text-gray-500">אין פרויקטים להצגה.</p>}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;