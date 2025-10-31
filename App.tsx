import React, { useState, useCallback, useEffect } from 'react';
import { ViewType, Task, Project, Customer, Idea, TaskStatus } from './types';
import { db, auth } from './services/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

import Sidebar from './components/layout/Sidebar';
import Header, { HeaderAction } from './components/layout/Header';
import DashboardView from './components/views/DashboardView';
import ProjectsView from './components/views/ProjectsView';
import CustomersView from './components/views/CustomersView';
import IdeasView from './components/views/IdeasView';
import ProjectDetailView from './components/views/ProjectDetailView';
import CustomerDetailView from './components/views/CustomerDetailView';
import TasksView from './components/views/TasksView';
import TaskForm from './components/tasks/TaskForm';
import { PlusIcon, ProjectFolderIcon, LightBulbIcon, UserGroupIcon } from './components/ui/Icons';
import ProjectForm from './components/projects/ProjectForm';
import IdeaForm from './components/ideas/IdeaForm';
import LoginView from './components/views/LoginView';
import CustomerForm from './components/customers/CustomerForm';
import ConfirmationModal from './components/ui/ConfirmationModal';

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
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    
    const [pendingAction, setPendingAction] = useState<{ title: string; message: string; onConfirm: () => Promise<void> } | null>(null);

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
    
    // --- Modal Open/Close Handlers ---
    const handleOpenNewTaskModal = () => { setEditingTask(null); setIsTaskModalOpen(true); };
    const handleEditTask = (task: Task) => { setEditingTask(task); setIsTaskModalOpen(true); };
    const handleOpenNewProjectModal = () => { setEditingProject(null); setIsProjectModalOpen(true); };
    const handleEditProject = (project: Project) => { setEditingProject(project); setIsProjectModalOpen(true); };
    const handleOpenNewCustomerModal = () => { setEditingCustomer(null); setIsCustomerModalOpen(true); };
    const handleEditCustomer = (customer: Customer) => { setEditingCustomer(customer); setIsCustomerModalOpen(true); };
    
    // --- Confirmation Modal Logic ---
    const handleConfirmAction = async () => {
        if (pendingAction) {
            await pendingAction.onConfirm();
            setPendingAction(null);
        }
    };
    const handleCancelAction = () => setPendingAction(null);

    // --- Save Handlers ---
    const handleSaveTask = async (taskToSave: Omit<Task, 'id' | 'status' | 'createdAt'> & { id?: string }) => {
        if (!user) return;
        
        const existingTask = taskToSave.id ? tasks.find(t => t.id === taskToSave.id) : null;

        const taskWithMetadata: Task = {
            id: existingTask?.id || '',
            title: taskToSave.title,
            description: taskToSave.description,
            type: taskToSave.type,
            customerId: taskToSave.customerId,
            projectId: taskToSave.projectId,
            dueDate: taskToSave.dueDate,
            priority: taskToSave.priority,
            status: existingTask?.status || TaskStatus.TODO,
            createdAt: existingTask?.createdAt || new Date().toISOString(),
        };

        setIsTaskModalOpen(false);
        setEditingTask(null);
        
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...taskData } = taskWithMetadata;
            
            const firestoreData: { [key: string]: any } = {};
            Object.keys(taskData).forEach(key => {
                 if (taskData[key as keyof typeof taskData] !== undefined) {
                    firestoreData[key] = taskData[key as keyof typeof taskData];
                }
            });
    
            if (id) {
                const taskDocRef = doc(db, `users/${user.uid}/tasks`, id);
                await updateDoc(taskDocRef, firestoreData);
                setTasks(prevTasks => prevTasks.map(t => t.id === id ? taskWithMetadata : t));
            } else {
                const docRef = await addDoc(collection(db, `users/${user.uid}/tasks`), firestoreData);
                setTasks(prevTasks => [...prevTasks, { ...taskWithMetadata, id: docRef.id }]);
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
    
    const requestToggleTaskStatus = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const isCompleting = task.status !== TaskStatus.DONE;
        setPendingAction({
            title: isCompleting ? 'אישור השלמת משימה' : 'ביטול השלמת משימה',
            message: `האם אתה בטוח שברצונך ${isCompleting ? 'לסמן את המשימה כהושלמה' : 'להחזיר את המשימה לביצוע'}?`,
            onConfirm: () => handleToggleTaskStatus(taskId),
        });
    };
    
    const handleSaveProject = async (projectToSave: Omit<Project, 'id'> & { id?: string }) => {
        if (!user) return;
        setIsProjectModalOpen(false);
        setEditingProject(null);
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...projectData } = projectToSave;

            const firestoreData: { [key: string]: any } = {};
            Object.keys(projectData).forEach(key => {
                 if (projectData[key as keyof typeof projectData] !== undefined) {
                    firestoreData[key] = projectData[key as keyof typeof projectData];
                }
            });

            if (id) {
                const projectDocRef = doc(db, `users/${user.uid}/projects`, id);
                await updateDoc(projectDocRef, firestoreData);
                setProjects(prev => prev.map(p => p.id === id ? { ...projectData, id } as Project : p));
            } else {
                const docRef = await addDoc(collection(db, `users/${user.uid}/projects`), firestoreData);
                setProjects(prev => [...prev, { ...projectData, id: docRef.id } as Project]);
            }
        } catch (error) {
            console.error("Error saving project:", error);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!user) return;

        try {
            const batch = writeBatch(db);
            const projectDocRef = doc(db, `users/${user.uid}/projects`, projectId);
            batch.delete(projectDocRef);

            const tasksToUpdate = tasks.filter(t => t.projectId === projectId);
            tasksToUpdate.forEach(task => {
                const taskDocRef = doc(db, `users/${user.uid}/tasks`, task.id);
                batch.update(taskDocRef, { projectId: undefined });
            });

            await batch.commit();

            setProjects(prev => prev.filter(p => p.id !== projectId));
            setTasks(prev => prev.map(t => t.projectId === projectId ? { ...t, projectId: undefined } : t));
            if(view === 'project-detail' && selectedItemId === projectId) {
                handleSetView('projects');
            }
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    const requestDeleteProject = (projectId: string, projectTitle: string) => {
        setPendingAction({
            title: 'מחיקת פרויקט',
            message: `האם אתה בטוח שברצונך למחוק את הפרויקט "${projectTitle}"? פעולה זו תסיר את שיוך הפרויקט מכל המשימות הקשורות.`,
            onConfirm: () => handleDeleteProject(projectId),
        });
    };

    const handleSaveIdea = async (ideaToSave: Omit<Idea, 'id'>) => {
        if (!user) return;
        setIsIdeaModalOpen(false);
        try {
            const docRef = await addDoc(collection(db, `users/${user.uid}/ideas`), ideaToSave);
            setIdeas(prev => [...prev, { ...ideaToSave, id: docRef.id } as Idea]);
        } catch (error) {
            console.error("Error saving idea:", error);
        }
    };
    
    const handleSaveCustomer = async (customerToSave: Omit<Customer, 'id'> & { id?: string }) => {
        if (!user) return;
        setIsCustomerModalOpen(false);
        setEditingCustomer(null);
        try {
            const { id, ...customerData } = customerToSave;
            if (id) { // Update
                const customerDocRef = doc(db, `users/${user.uid}/customers`, id);
                await updateDoc(customerDocRef, customerData);
                setCustomers(prev => prev.map(c => c.id === id ? { ...customerData, id } as Customer : c));
            } else { // Create
                const docRef = await addDoc(collection(db, `users/${user.uid}/customers`), customerData);
                setCustomers(prev => [...prev, { ...customerData, id: docRef.id } as Customer]);
            }
        } catch (error) {
            console.error("Error saving customer:", error);
        }
    };

    const handleDeleteCustomer = async (customerId: string) => {
        if (!user) return;
        try {
            const batch = writeBatch(db);
            
            const customerDocRef = doc(db, `users/${user.uid}/customers`, customerId);
            batch.delete(customerDocRef);

            tasks.filter(t => t.customerId === customerId).forEach(task => {
                const taskDocRef = doc(db, `users/${user.uid}/tasks`, task.id);
                batch.update(taskDocRef, { customerId: undefined });
            });

            projects.filter(p => p.customerIds?.includes(customerId)).forEach(project => {
                const projectDocRef = doc(db, `users/${user.uid}/projects`, project.id);
                const newCustomerIds = project.customerIds?.filter(id => id !== customerId);
                batch.update(projectDocRef, { customerIds: newCustomerIds });
            });
            
            await batch.commit();

            setCustomers(prev => prev.filter(c => c.id !== customerId));
            setTasks(prev => prev.map(t => t.customerId === customerId ? { ...t, customerId: undefined } : t));
            setProjects(prev => prev.map(p => {
                if (p.customerIds?.includes(customerId)) {
                    return { ...p, customerIds: p.customerIds.filter(id => id !== customerId) };
                }
                return p;
            }));

            if(view === 'customer-detail' && selectedItemId === customerId) {
                handleSetView('customers');
            }
        } catch (error) {
            console.error("Error deleting customer:", error);
        }
    };

    const requestDeleteCustomer = (customerId: string, customerName: string) => {
        setPendingAction({
            title: 'מחיקת לקוח',
            message: `האם אתה בטוח שברצונך למחוק את הלקוח "${customerName}"? פעולה זו תסיר את שיוך הלקוח מכל המשימות והפרויקטים הקשורים.`,
            onConfirm: () => handleDeleteCustomer(customerId),
        });
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
                return <DashboardView tasks={tasks} projects={projects} onEditTask={handleEditTask} onToggleStatus={requestToggleTaskStatus} onProjectSelect={(id) => handleItemSelect(id, 'project')} setView={handleSetView} />;
            case 'tasks':
                return <TasksView tasks={tasks} onEditTask={handleEditTask} onToggleStatus={requestToggleTaskStatus} />;
            case 'projects':
                return <ProjectsView projects={projects} tasks={tasks} onProjectSelect={(id) => handleItemSelect(id, 'project')} onEditProject={handleEditProject} onDeleteProject={requestDeleteProject} />;
            case 'customers':
                return <CustomersView customers={customers} tasks={tasks} onCustomerSelect={(id) => handleItemSelect(id, 'customer')} onEditCustomer={handleEditCustomer} onDeleteCustomer={requestDeleteCustomer} />;
            case 'ideas':
                return <IdeasView ideas={ideas} onConvertToProject={handleConvertIdeaToProject} />;
            case 'project-detail':
                const project = projects.find(p => p.id === selectedItemId);
                if (!project) return <div>Project not found</div>;
                return <ProjectDetailView project={project} tasks={tasks.filter(t => t.projectId === selectedItemId)} customers={customers} onEditTask={handleEditTask} onToggleStatus={requestToggleTaskStatus} onEditProject={handleEditProject} onDeleteProject={requestDeleteProject} />;
            case 'customer-detail':
                 const customer = customers.find(c => c.id === selectedItemId);
                 if (!customer) return <div>Customer not found</div>
                 return <CustomerDetailView customer={customer} tasks={tasks.filter(t => t.customerId === selectedItemId)} projects={projects} onEditTask={handleEditTask} onToggleStatus={requestToggleTaskStatus} onEditCustomer={handleEditCustomer} onDeleteCustomer={requestDeleteCustomer} />;
            default:
                return <DashboardView tasks={tasks} projects={projects} onEditTask={handleEditTask} onToggleStatus={requestToggleTaskStatus} onProjectSelect={(id) => handleItemSelect(id, 'project')} setView={handleSetView} />;
        }
    };

    if (authLoading) {
        return <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-800" dir="rtl"><div className="text-xl font-semibold text-gray-700 dark:text-gray-200">טוען...</div></div>;
    }
    
    if (!user) {
        return <LoginView />;
    }

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-800" dir="rtl"><div className="text-xl font-semibold text-gray-700 dark:text-gray-200">טוען נתונים...</div></div>;
    }
    
    const addActions: HeaderAction[] = [
        { icon: <PlusIcon />, onClick: handleOpenNewTaskModal, label: "משימה" },
        { icon: <ProjectFolderIcon />, onClick: handleOpenNewProjectModal, label: "פרויקט" },
        { icon: <UserGroupIcon />, onClick: handleOpenNewCustomerModal, label: "לקוח" },
        { icon: <LightBulbIcon />, onClick: () => setIsIdeaModalOpen(true), label: "רעיון" },
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" dir="rtl">
            {isSidebarOpen && window.innerWidth <= 1024 && ( <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} aria-hidden="true"></div> )}
            <Sidebar currentView={view} setView={handleSetView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    onLogout={handleLogout} 
                    userEmail={user.email} 
                    onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                    addActions={addActions}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-6">
                    {renderView()}
                </main>
            </div>
            
            <TaskForm isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onSave={handleSaveTask} task={editingTask} projects={projects} customers={customers} />
            <ProjectForm isOpen={isProjectModalOpen} onClose={() => { setIsProjectModalOpen(false); setEditingProject(null); }} onSave={handleSaveProject} project={editingProject} customers={customers} />
            <IdeaForm isOpen={isIdeaModalOpen} onClose={() => setIsIdeaModalOpen(false)} onSave={handleSaveIdea} />
            <CustomerForm isOpen={isCustomerModalOpen} onClose={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }} onSave={handleSaveCustomer} customer={editingCustomer} />
            <ConfirmationModal isOpen={!!pendingAction} onClose={handleCancelAction} onConfirm={handleConfirmAction} title={pendingAction?.title || ''} message={pendingAction?.message || ''} />
        </div>
    );
};

export default App;