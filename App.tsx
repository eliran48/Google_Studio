import React, { useState, useCallback, useMemo } from 'react';
import { Task, Project, Customer, Idea, ViewType, TaskStatus } from './types';
import { initialTasks, initialProjects, initialCustomers, initialIdeas } from './services/mockData';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/views/DashboardView';
import ProjectsView from './components/views/ProjectsView';
import CustomersView from './components/views/CustomersView';
import IdeasView from './components/views/IdeasView';
import LoginView from './components/views/LoginView';
import ProjectDetailView from './components/views/ProjectDetailView';
import CustomerDetailView from './components/views/CustomerDetailView';
import { PlusIcon } from './components/ui/Icons';
import TaskForm from './components/tasks/TaskForm';
import ProjectForm from './components/projects/ProjectForm';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [view, setView] = useState<ViewType>('dashboard');
  
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleLogin = () => setIsLoggedIn(true);

  const navigateToProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setView('project-detail');
  };

  const navigateToCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setView('customer-detail');
  };

  const handleTaskSave = (task: Task) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      setTasks([task, ...tasks]);
    }
    setEditingTask(null);
    setIsTaskModalOpen(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };
  
  const handleProjectSave = (project: Project) => {
    setProjects(prev => [project, ...prev]);
    setIsProjectModalOpen(false);
  };

  const convertIdeaToProject = useCallback((idea: Idea) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: idea.title,
      description: idea.description,
      ideaId: idea.id,
    };
    setProjects(prev => [newProject, ...prev]);
    setIdeas(prev => prev.filter(i => i.id !== idea.id));
    navigateToProject(newProject.id);
  }, []);

  const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  const selectedCustomer = useMemo(() => customers.find(c => c.id === selectedCustomerId), [customers, selectedCustomerId]);
  
  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
      <Sidebar currentView={view} setView={setView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 lg:p-8">
          {view === 'dashboard' && <DashboardView tasks={tasks} projects={projects} customers={customers} onEditTask={handleEditTask}/>}
          {view === 'projects' && <ProjectsView projects={projects} tasks={tasks} onProjectSelect={navigateToProject} />}
          {view === 'project-detail' && selectedProject && <ProjectDetailView project={selectedProject} tasks={tasks.filter(t => t.projectId === selectedProject.id)} onEditTask={handleEditTask} customers={customers} />}
          {view === 'customers' && <CustomersView customers={customers} tasks={tasks} onCustomerSelect={navigateToCustomer} />}
          {view === 'customer-detail' && selectedCustomer && <CustomerDetailView customer={selectedCustomer} tasks={tasks.filter(t => t.customerId === selectedCustomer.id)} onEditTask={handleEditTask} projects={projects} />}
          {view === 'ideas' && <IdeasView ideas={ideas} onConvertToProject={convertIdeaToProject} />}
        </main>
      </div>

      <div className="fixed bottom-8 left-8 z-50">
        <button
          onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 flex items-center justify-center"
          aria-label="הוסף משימה חדשה"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
         <button
          onClick={() => setIsProjectModalOpen(true)}
          className="mt-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 flex items-center justify-center"
          aria-label="הוסף פרויקט חדש"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        </button>
      </div>

      <TaskForm
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleTaskSave}
        task={editingTask}
        projects={projects}
        customers={customers}
      />
      
      <ProjectForm
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleProjectSave}
      />
    </div>
  );
};

export default App;