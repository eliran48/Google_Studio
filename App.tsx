
import React, { useState } from 'react';
import { ViewType, Task, Project, Customer, Idea, TaskStatus } from './types';
import { initialTasks, initialProjects, initialCustomers, initialIdeas } from './services/mockData';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/views/DashboardView';
import ProjectsView from './components/views/ProjectsView';
import CustomersView from './components/views/CustomersView';
import IdeasView from './components/views/IdeasView';
import ProjectDetailView from './components/views/ProjectDetailView';
import CustomerDetailView from './components/views/CustomerDetailView';
import LoginView from './components/views/LoginView';
import TaskForm from './components/tasks/TaskForm';
import { PlusIcon } from './components/ui/Icons';
import ProjectForm from './components/projects/ProjectForm';


const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [view, setView] = useState<ViewType>('dashboard');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleSetView = (newView: ViewType) => {
        setView(newView);
        setSelectedProjectId(null);
        setSelectedCustomerId(null);
    };

    const handleProjectSelect = (projectId: string) => {
        setSelectedProjectId(projectId);
        setView('project-detail');
    };

    const handleCustomerSelect = (customerId: string) => {
        setSelectedCustomerId(customerId);
        setView('customer-detail');
    };

    const handleOpenNewTaskModal = () => {
        setEditingTask(null);
        setIsTaskModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    const handleSaveTask = (taskToSave: Task) => {
        const existingIndex = tasks.findIndex(t => t.id === taskToSave.id);
        if (existingIndex > -1) {
            const updatedTasks = [...tasks];
            updatedTasks[existingIndex] = taskToSave;
            setTasks(updatedTasks);
        } else {
            setTasks([...tasks, taskToSave]);
        }
        setIsTaskModalOpen(false);
        setEditingTask(null);
    };

    const handleToggleTaskStatus = (taskId: string) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: t.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE } : t));
    };

    const handleSaveProject = (projectToSave: Project) => {
        setProjects([...projects, projectToSave]);
        setIsProjectModalOpen(false);
    };
    
    const renderView = () => {
        if (selectedProjectId) {
            const project = projects.find(p => p.id === selectedProjectId);
            if (project) {
                const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
                return <ProjectDetailView project={project} tasks={projectTasks} customers={customers} onEditTask={handleEditTask} onToggleStatus={handleToggleTaskStatus} />;
            }
        }
        if (selectedCustomerId) {
            const customer = customers.find(c => c.id === selectedCustomerId);
            if (customer) {
                const customerTasks = tasks.filter(t => t.customerId === selectedCustomerId);
                return <CustomerDetailView customer={customer} tasks={customerTasks} projects={projects} onEditTask={handleEditTask} onToggleStatus={handleToggleTaskStatus}/>;
            }
        }

        switch (view) {
            case 'dashboard':
                return <DashboardView tasks={tasks} projects={projects} onEditTask={handleEditTask} onToggleStatus={handleToggleTaskStatus} onProjectSelect={handleProjectSelect} />;
            case 'projects':
                return <ProjectsView projects={projects} tasks={tasks} onProjectSelect={handleProjectSelect} />;
            case 'customers':
                return <CustomersView customers={customers} tasks={tasks} onCustomerSelect={handleCustomerSelect} />;
            case 'ideas':
                return <IdeasView ideas={ideas} />;
            default:
                return <DashboardView tasks={tasks} projects={projects} onEditTask={handleEditTask} onToggleStatus={handleToggleTaskStatus} onProjectSelect={handleProjectSelect} />;
        }
    };
    
    if (!isAuthenticated) {
        return <LoginView onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" dir="rtl">
            <Sidebar currentView={view} setView={handleSetView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-6">
                    {renderView()}
                </main>
            </div>
            
            <div className="fixed bottom-8 left-8 z-40">
                <button 
                  onClick={handleOpenNewTaskModal}
                  className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-label="הוסף משימה חדשה"
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
            </div>
            
            <TaskForm
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleSaveTask}
                task={editingTask}
                projects={projects}
                customers={customers}
            />

            <ProjectForm 
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onSave={handleSaveProject}
            />
        </div>
    );
};

export default App;
