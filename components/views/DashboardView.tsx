import React, { useMemo, useState } from 'react';
import { Task, TaskStatus, Project, ViewType, TaskPriority, TaskType, ProjectStatus } from '../../types';
import TaskList from '../tasks/TaskList';
import Card from '../ui/Card';
import { BriefcaseIcon, ChecklistIcon, ExclamationTriangleIcon, UserIcon } from '../ui/Icons';

interface DashboardViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onToggleStatus: (taskId: string) => void;
  onProjectSelect: (projectId: string) => void;
  setView: (view: ViewType) => void;
  userEmail: string | null;
}

const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactElement;
    colors: { text: string; bg: string; border: string; };
    onClick?: () => void;
    isActive?: boolean
}> = ({ title, value, icon, colors, onClick, isActive }) => {
    const cardBaseClasses = "relative p-4 rounded-xl shadow-md transition-all duration-300 h-full flex flex-col justify-between bg-white dark:bg-gray-900 border-t-4";
    const interactiveClasses = onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-1" : "";
    const activeClasses = isActive ? "ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800" : "";
    const activeRingColor = isActive ? colors.border.replace('border-', 'ring-') : '';

    return (
        <div onClick={onClick} className={`${cardBaseClasses} ${colors.border} ${interactiveClasses} ${activeClasses} ${activeRingColor}`}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className={`text-2xl md:text-3xl font-bold mt-1 ${colors.text}`}>{value}</p>
                </div>
                <div className={`p-2 md:p-3 rounded-lg ${colors.bg}`}>
                    {React.cloneElement(icon, { className: `w-5 h-5 md:w-6 md:h-6 ${colors.text}` })}
                </div>
            </div>
        </div>
    );
};


const UrgentTaskItem: React.FC<{ task: Task; onEditTask: (task: Task) => void; }> = ({ task, onEditTask }) => {
    const isOverdue = !!task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;
    return (
        <div 
            onClick={() => onEditTask(task)}
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
        >
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{task.title}</p>
            </div>
            {isOverdue ? (
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 ml-2 flex-shrink-0">עבר הזמן</span>
            ) : (
                <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 ml-2 flex-shrink-0">דחוף</span>
            )}
        </div>
    );
};

const DashboardView: React.FC<DashboardViewProps> = ({ tasks, projects, onEditTask, onToggleStatus, onProjectSelect, setView, userEmail }) => {
  const [taskFilter, setTaskFilter] = useState<'all' | TaskType | TaskStatus>('all');
  
  const { filteredOpenTasks, stats, urgentAndOverdueTasks } = useMemo(() => {
    const incompleteTasks = tasks.filter(t => t.status !== TaskStatus.DONE);
    const now = new Date();

    const priorityOrder: Record<TaskPriority, number> = {
        [TaskPriority.URGENT]: 4,
        [TaskPriority.HIGH]: 3,
        [TaskPriority.NORMAL]: 2,
        [TaskPriority.LOW]: 1,
    };
    
    const sortedOpenTasks = [...incompleteTasks].sort((a, b) => {
        const priorityA = priorityOrder[a.priority];
        const priorityB = priorityOrder[b.priority];
        if (priorityB !== priorityA) return priorityB - priorityA;
        if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const filteredTasks = sortedOpenTasks.filter(task => {
        if (taskFilter === 'all') return true;
        if (taskFilter === TaskType.PERSONAL || taskFilter === TaskType.BUSINESS) return task.type === taskFilter;
        if (taskFilter === TaskStatus.IN_PROGRESS) return task.status === taskFilter;
        return true;
    });
    
    const urgentTasks = incompleteTasks.filter(t => t.priority === TaskPriority.URGENT);
    const overdueTasks = incompleteTasks.filter(t => !!t.dueDate && new Date(t.dueDate) < now);
    
    const combinedUrgentAndOverdue = [...new Set([...urgentTasks, ...overdueTasks])];
    
    const statistics = {
        total: incompleteTasks.length,
        inProgress: incompleteTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        personal: incompleteTasks.filter(t => t.type === TaskType.PERSONAL).length,
        business: incompleteTasks.filter(t => t.type === TaskType.BUSINESS).length,
        urgent: urgentTasks.length,
        overdue: overdueTasks.length
    };
    
    return { filteredOpenTasks: filteredTasks, stats: statistics, urgentAndOverdueTasks: combinedUrgentAndOverdue };
  }, [tasks, taskFilter]);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 18) return 'צהריים טובים';
    return 'ערב טוב';
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const completedTasks = projectTasks.filter(t => t.status === TaskStatus.DONE).length;
    const totalTasks = projectTasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, progress };
  };

    const statCardsData = [
        { key: 'all', title: 'משימות פעילות', value: stats.total, icon: <ChecklistIcon />, colors: {
            text: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-100 dark:bg-blue-900/50',
            border: 'border-blue-500'
        } },
        { key: TaskType.PERSONAL, title: 'אישיות פעילות', value: stats.personal, icon: <UserIcon />, colors: {
            text: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-100 dark:bg-green-900/50',
            border: 'border-green-500'
        } },
        { key: TaskType.BUSINESS, title: 'עסקיות פעילות', value: stats.business, icon: <BriefcaseIcon />, colors: {
            text: 'text-teal-600 dark:text-teal-400',
            bg: 'bg-teal-100 dark:bg-teal-900/50',
            border: 'border-teal-500'
        } },
        { key: TaskStatus.IN_PROGRESS, title: 'בתהליך', value: stats.inProgress, icon: <ChecklistIcon />, colors: {
            text: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-100 dark:bg-yellow-900/50',
            border: 'border-yellow-500'
        } },
    ];

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{getGreeting()}, {userEmail?.split('@')[0] || 'משתמש'}!</h1>
            <p className="text-md text-gray-600 dark:text-gray-300">
                {stats.urgent > 0 || stats.overdue > 0 ? 
                    `יש לך ${stats.urgent} משימות דחופות ו-${stats.overdue} משימות שזמן היעד שלהן עבר.` :
                    "אין לך משימות דחופות או באיחור. יום רגוע!"
                }
            </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {statCardsData.map(card => (
                 <div key={card.key}>
                    <StatCard 
                        title={card.title} 
                        value={card.value}
                        icon={card.icon}
                        colors={card.colors}
                        onClick={() => setTaskFilter(card.key as any)} 
                        isActive={taskFilter === card.key} 
                    />
                 </div>
            ))}
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
            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500"/>
                    <h3 className="text-xl font-bold">דחוף ובאיחור</h3>
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                    {urgentAndOverdueTasks.length > 0 ? urgentAndOverdueTasks.map(task => (
                        <UrgentTaskItem key={task.id} task={task} onEditTask={onEditTask} />
                    )) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">אין משימות דחופות או באיחור.</p>
                    )}
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-bold mb-4">פרויקטים פעילים</h3>
                <div className="space-y-4">
                    {projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).slice(0, 5).map(project => {
                        const { completedTasks, totalTasks, progress } = getProjectStats(project.id);
                        return (
                        <div key={project.id} onClick={() => onProjectSelect(project.id)} className="group cursor-pointer">
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{project.title}</span>
                                <span className="text-gray-500 dark:text-gray-400">{completedTasks}/{totalTasks}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )})}
                    {projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length > 5 && (
                         <button onClick={() => setView('projects')} className="text-sm font-semibold text-indigo-600 hover:underline mt-2">
                            הצג את כל הפרויקטים
                        </button>
                    )}
                    {projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length === 0 && <p className="text-sm text-gray-500">אין פרויקטים פעילים כרגע.</p>}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;