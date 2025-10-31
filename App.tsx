import React, { useState, useCallback, useEffect } from 'react';
import { ViewType, Task, Project, Customer, Idea, TaskStatus } from './types';
import { db, auth } from './services/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/views/DashboardView';
import ProjectsView from './components/views/ProjectsView';
import CustomersView from './components/views/CustomersView';
import IdeasView from './components/views/IdeasView';
import ProjectDetailView from './components/views/ProjectDetailView';
import CustomerDetailView from './components/views/CustomerDetailView';
import TaskForm from './components/tasks/TaskForm';
import { PlusIcon, ProjectFolderIcon, LightBulbIcon } from './components/ui/Icons';
import ProjectForm from './components/projects/ProjectForm';
import IdeaForm from './components/ideas/IdeaForm';
import LoginView from './components/views/LoginView';

const App: React.FC = () => {
    const [view, setView] = useState<ViewType>('dashboard');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) {
            setTasks([]);
            setProjects([]);
            setCustomers([]);
            setIdeas([]);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const fetchCollection = async <T extends { id: string }>(collectionName: string): Promise<T[]> => {
                    const collectionPath = `users/${user.uid}/${collectionName}`;
                    const querySnapshot = await getDocs(collection(db, collectionPath));
                    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
                };

                const [tasksData, projectsData, customersData, ideasData] = await Promise.all([
                    fetchCollection<Task>('tasks'),
                    fetchCollection<Project>('projects'),
                    fetchCollection<Customer>('customers'),
                    fetchCollection<Idea>('ideas'),
                ]);

                setTasks(tasksData);
                setProjects(projectsData);
                setCustomers(customersData);
                setIdeas(ideasData);

            } catch (error) {
                console.error("Error fetching data from Firestore: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleSetView = useCallback((newView: ViewType) => {
        setView(newView);
        setSelectedItemId(null);
    }, []);

    const handleItemSelect = useCallback((id: string, type: 'project' | 'customer') => {
        setSelectedItemId(id);
        setView(type === 'project' ? 'project-detail' : 'customer-detail');
    }, []);
    
    const handleLogout = async () => {
        try {
            await signOut(auth);
            setView('dashboard');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleOpenNewTaskModal = () => {
        setEditingTask(null);
        setIsTaskModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    const handleSaveTask = async (taskToSave: Task) => {
        if (!user) return;
        setIsTaskModalOpen(false);
        setEditingTask(null);
        try {
            const existingTask = tasks.find(t => t.id === taskToSave.id);
            if (existingTask) {
                const taskDocRef = doc(db, `users/${user.uid}/tasks`, taskToSave.id);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...taskData } = taskToSave;
                await updateDoc(taskDocRef, taskData);
                setTasks(prevTasks => prevTasks.map(t => t.id === taskToSave.id ? taskToSave : t));
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...taskData } = taskToSave;
                const docRef = await addDoc(collection(db, `users/${user.uid}/tasks`), taskData);
                setTasks(prevTasks => [...prevTasks, { ...taskData, id: docRef.id } as Task]);
            }
        } catch (error) {
            console.error("Error saving task:", error);
        }
    };

    const handleToggleTaskStatus = async (taskId: string) => {
        if (!user) return;
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const newStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
        try {
            const taskDocRef = doc(db, `users/${user.uid}/tasks`, taskId);
            await updateDoc(taskDocRef, { status: newStatus });
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error("Error toggling task status:", error);
        }
    };
    
    const handleSaveProject = async (projectToSave: Project) => {
        if (!user) return;
        setIsProjectModalOpen(false);
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...projectData } = projectToSave;
            const docRef = await addDoc(collection(db, `users/${user.uid}/projects`), projectData);
            setProjects(prev => [...prev, { ...projectData, id: docRef.id } as Project]);
        } catch (error) {
            console.error("Error saving project:", error);
        }
    };
    
    const handleSaveIdea = async (ideaToSave: Idea) => {
        if (!user) return;
        setIsIdeaModalOpen(false);
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...ideaData } = ideaToSave;
            const docRef = await addDoc(collection(db, `users/${user.uid}/ideas`), ideaData);
            setIdeas(prev => [...prev, { ...ideaData, id: docRef.id } as Idea]);
        } catch (error) {
            console.error("Error saving idea:", error);
        }
    };

    const handleConvertIdeaToProject = async (idea: Idea) => {
        if (!user) return;
        const newProjectData: Omit<Project, 'id'> = {
            title: idea.title,
            description: idea.description,
            ideaId: idea.id,
        };

        try {
            const batch = writeBatch(db);
            
            const projectDocRef = doc(collection(db, `users/${user.uid}/projects`));
            batch.set(projectDocRef, newProjectData);

            const ideaDocRef = doc(db, `users/${user.uid}/ideas`, idea.id);
            batch.delete(ideaDocRef);

            await batch.commit();

            setProjects(prev => [...prev, { ...newProjectData, id: projectDocRef.id } as Project]);
            setIdeas(prev => prev.filter(i => i.id !== idea.id));
            
            handleSetView('projects');
        } catch(error) {
            console.error("Error converting idea to project:", error);
        }
    };

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <DashboardView tasks={tasks} projects={projects} onEditTask={handleEditTask} onToggleStatus={handleToggleTaskStatus} onProjectSelect={(id) => handleItemSelect(id, 'project')} setView={handleSetView} />;
            case 'projects':
                return <ProjectsView projects={projects} tasks={tasks} onProjectSelect={(id) => handleItemSelect(id, 'project')} />;
            case 'customers':
                return <CustomersView customers={customers} tasks={tasks} onCustomerSelect={(id) => handleItemSelect(id, 'customer')} />;
            case 'ideas':
                return <IdeasView ideas={ideas} onConvertToProject={handleConvertIdeaToProject} />;
            case 'project-detail':
                const project = projects.find(p => p.id === selectedItemId);
                if (!project) return <div>Project not found</div>;
                const projectTasks = tasks.filter(t => t.projectId === selectedItemId);
                return <ProjectDetailView project={project} tasks={projectTasks} customers={customers} onEditTask={handleEditTask} onToggleStatus={handleToggleTaskStatus} />;
            case 'customer-detail':
                 const customer = customers.find(c => c.id === selectedItemId);
                 if (!customer) return <div>Customer not found</div>
                 const customerTasks = tasks.filter(t => t.customerId === selectedItemId);
                 return <CustomerDetailView customer={customer} tasks={customerTasks} projects={projects} onEditTask={handleEditTask} onToggleStatus={handleToggleTaskStatus}/>;
            default:
                return <DashboardView tasks={tasks} projects={projects} onEditTask={handleEditTask} onToggleStatus={handleToggleTaskStatus} onProjectSelect={(id) => handleItemSelect(id, 'project')} setView={handleSetView} />;
        }
    };

    if (authLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-800" dir="rtl">
                <div className="text-xl font-semibold text-gray-700 dark:text-gray-200">טוען...</div>
            </div>
        );
    }
    
    if (!user) {
        return <LoginView />;
    }

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-800" dir="rtl">
                <div className="text-xl font-semibold text-gray-700 dark:text-gray-200">טוען נתונים...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" dir="rtl">
            <Sidebar currentView={view} setView={handleSetView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onLogout={handleLogout} userEmail={user.email} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-6">
                    {renderView()}
                </main>
            </div>
            
            <div className="fixed bottom-8 right-8 z-40 flex flex-col items-center gap-4">
                 <button 
                  onClick={() => setIsIdeaModalOpen(true)}
                  className="bg-yellow-500 text-white rounded-full p-4 shadow-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-transform hover:scale-110"
                  aria-label="הוסף רעיון חדש"
                  title="הוסף רעיון חדש"
                >
                    <LightBulbIcon className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform hover:scale-110"
                  aria-label="הוסף פרויקט חדש"
                  title="הוסף פרויקט חדש"
                >
                    <ProjectFolderIcon className="w-6 h-6" />
                </button>
                 <button 
                  onClick={handleOpenNewTaskModal}
                  className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-110"
                  aria-label="הוסף משימה חדשה"
                  title="הוסף משימה חדשה"
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

            <IdeaForm
                isOpen={isIdeaModalOpen}
                onClose={() => setIsIdeaModalOpen(false)}
                onSave={handleSaveIdea}
            />
        </div>
    );
};

export default App;