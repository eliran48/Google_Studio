import React, { useMemo } from 'react';
import { Task, TaskStatus, Project, ViewType, TaskPriority } from '../../types';
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

const StatCard: React.FC<{title: string; value: number | string;}> = ({title, value}) => (
    <Card className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
    </Card>
);

const DashboardView: React.FC<DashboardViewProps> = ({ tasks, projects, onEditTask, onToggleStatus, onProjectSelect, setView }) => {
  const { allOpenTasks, stats } = useMemo(() => {
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

    const statistics = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === TaskStatus.DONE).length,
        inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
    };
    
    return { allOpenTasks: sortedOpenTasks, stats: statistics };
  }, [tasks]);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="סה״כ משימות" value={stats.total} />
            <StatCard title="לביצוע" value={stats.todo} />
            <StatCard title="בתהליך" value={stats.inProgress} />
            <StatCard title="הושלמו" value={stats.completed} />
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <TaskList
              tasks={allOpenTasks}
              title="משימות פתוחות"
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
