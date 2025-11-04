import React, { useState, useCallback, useEffect, ReactElement } from 'react';
import { ViewType, Task, Project, Customer, Idea, TaskStatus, ProjectStatus, IdeaCategory, IdeaImpact, IdeaEffort, TaskType, TaskPriority, Update, ProjectLink, ProjectMilestone, SubTask, EnrichmentItem, EnrichmentStatus, EnrichmentType } from './types';
import { db, auth } from './services/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/views/DashboardView';
import ProjectsView from './components/views/ProjectsView';
import CustomersView from './components/views/CustomersView';
import IdeasView from './components/views/IdeasView';
import ProjectDetailView from './components/views/ProjectDetailView';
import CustomerDetailView from './components/views/CustomerDetailView';
import TasksView from './components/views/TasksView';
import IdeaDetailView from './components/views/IdeaDetailView';
import EnrichmentView from './components/views/EnrichmentView';
import TaskForm from './components/tasks/TaskForm';
import ProjectForm from './components/projects/ProjectForm';
import IdeaForm from './components/ideas/IdeaForm';
import LoginView from './components/views/LoginView';
import CustomerForm from './components/customers/CustomerForm';
import EnrichmentItemForm from './components/enrichment/EnrichmentItemForm';
import ConfirmationModal from './components/ui/ConfirmationModal';
import SpeedDial, { SpeedDialAction } from './components/ui/SpeedDial';
import { ChecklistIcon, ProjectIcon, CustomerIcon, IdeaIcon, SparklesIcon } from './components/ui/Icons';

const App: React.FC = () => {
    const [view, setView] = useState<ViewType>('dashboard');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [enrichmentItems, setEnrichmentItems] = useState<EnrichmentItem[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
    const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
    const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isEnrichmentModalOpen, setIsEnrichmentModalOpen] = useState(false);
    const [editingEnrichmentItem, setEditingEnrichmentItem] = useState<EnrichmentItem | null>(null);
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
            setEnrichmentItems([]);
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

                const [tasksData, projectsData, customersData, ideasData, enrichmentData] = await Promise.all([
                    fetchCollection<Task>('tasks'),
                    fetchCollection<Project>('projects'),
                    fetchCollection<Customer>('customers'),
                    fetchCollection<Idea>('ideas'),
                    fetchCollection<EnrichmentItem>('enrichments'),
                ]);

                setTasks(tasksData);
                setProjects(projectsData);
                setCustomers(customersData);
                setIdeas(ideasData);
                setEnrichmentItems(enrichmentData);

            } catch (error) {
                console.error("Error fetching data from Firestore: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        if (!user || tasks.length === 0) return;

        const checkAndClearDailyTasks = async () => {
            const lastClearedKey = `lastClearedDate_${user.uid}`;
            const lastClearedDate = localStorage.getItem(lastClearedKey);
            const today = new Date().toISOString().split('T')[0];

            if (lastClearedDate !== today) {
                console.log("New day detected, clearing daily tasks...");
                const dailyTasksToClear = tasks.filter(t => t.isDaily);
                
                if (dailyTasksToClear.length > 0) {
                    const batch = writeBatch(db);
                    dailyTasksToClear.forEach(task => {
                        const taskDocRef = doc(db, `users/${user.uid}/tasks`, task.id);
                        batch.update(taskDocRef, { isDaily: false, dailyOrder: -1 });
                    });
                    await batch.commit();
                    
                    setTasks(prevTasks => prevTasks.map(t => dailyTasksToClear.find(dt => dt.id === t.id) ? { ...t, isDaily: false, dailyOrder: -1 } : t));
                }
                
                localStorage.setItem(lastClearedKey, today);
            }
        };

        checkAndClearDailyTasks();
    }, [user, tasks]);

    const handleSaveTask = async (taskData: Partial<Task>) => {
        if (!user) return;
        const collectionPath = `users/${user.uid}/tasks`;
        if (taskData.id) {
            const taskDocRef = doc(db, collectionPath, taskData.id);
            await updateDoc(taskDocRef, taskData);
            setTasks(tasks.map(t => t.id === taskData.id ? { ...t, ...taskData } as Task : t));
        } else {
            const { id, ...dataToSave } = taskData;
            const newTaskData = { 
                ...dataToSave, 
                createdAt: new Date().toISOString() 
            };
            const docRef = await addDoc(collection(db, collectionPath), newTaskData);
            setTasks([...tasks, { ...newTaskData, id: docRef.id } as Task]);
        }
    };
    
    const handleToggleTaskStatus = useCallback(async (taskId: string) => {
        if (!user) return;
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const newStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
        const completedAt = newStatus === TaskStatus.DONE ? new Date().toISOString() : undefined;
        
        const taskDocRef = doc(db, `users/${user.uid}/tasks`, taskId);
        await updateDoc(taskDocRef, { 
            status: newStatus,
            completedAt: completedAt || null
        });

        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus, completedAt } : t));
    }, [tasks, user]);

    const handleSetTaskDailyStatus = useCallback(async (taskId: string, isDaily: boolean) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || !user) return;
        
        const dailyTasks = tasks.filter(t => t.isDaily && t.id !== taskId);
        const dailyOrder = isDaily ? dailyTasks.length : -1;

        const taskDocRef = doc(db, `users/${user.uid}/tasks`, taskId);
        await updateDoc(taskDocRef, { isDaily, dailyOrder });
        
        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, isDaily, dailyOrder } : t));
    }, [tasks, user]);

    const handleReorderDailyTasks = useCallback(async (reorderedDailyTasks: Task[]) => {
        if (!user) return;

        const batch = writeBatch(db);
        reorderedDailyTasks.forEach((task, index) => {
            const taskDocRef = doc(db, `users/${user.uid}/tasks`, task.id);
            batch.update(taskDocRef, { dailyOrder: index });
        });
        await batch.commit();
        
        setTasks(prevTasks => {
            const dailyTaskMap = new Map(reorderedDailyTasks.map((t, i) => [t.id, i]));
            return prevTasks.map(t => {
                if (t.isDaily) {
                    return { ...t, dailyOrder: dailyTaskMap.get(t.id) ?? t.dailyOrder };
                }
                return t;
            }).sort((a,b) => (a.dailyOrder ?? Infinity) - (b.dailyOrder ?? Infinity));
        });
    }, [user, tasks]);


    // Generic handlers
    const createSaveHandler = <T extends { id: string }>(
        collectionName: 'projects' | 'customers' | 'ideas' | 'enrichments',
        state: T[],
        setState: React.Dispatch<React.SetStateAction<T[]>>
    ) => async (itemData: Partial<Omit<T, 'id'>> & { id?: string }) => {
        if (!user) return;
        const collectionPath = `users/${user.uid}/${collectionName}`;
        if (itemData.id) {
            const itemDocRef = doc(db, collectionPath, itemData.id);
            await updateDoc(itemDocRef, itemData);
            setState(state.map(i => i.id === itemData.id ? { ...i, ...itemData } as T : i));
        } else {
            // Destructure to remove the `id` property for new items, which would be `undefined` and cause a Firestore error.
            const { id, ...dataToSave } = itemData;
            
            // For new enrichment items, `createdAt` is a required field but not supplied by the form, so we add it here.
            if (collectionName === 'enrichments') {
                (dataToSave as Partial<EnrichmentItem>).createdAt = new Date().toISOString();
            }

            const docRef = await addDoc(collection(db, collectionPath), dataToSave);
            // Update local state with the newly created item, including the Firestore-generated ID.
            setState([...state, { ...dataToSave, id: docRef.id } as unknown as T]);
        }
    };
    
    const createDeleteHandler = <T extends { id: string }>(
        collectionName: 'tasks' | 'projects' | 'customers' | 'ideas' | 'enrichments',
        state: T[],
        setState: React.Dispatch<React.SetStateAction<T[]>>
    ) => async (itemId: string) => {
        if (!user) return;
        const collectionPath = `users/${user.uid}/${collectionName}`;
        await deleteDoc(doc(db, collectionPath, itemId));
        setState(state.filter(i => i.id !== itemId));
    };
    
    const handleSaveProject = createSaveHandler('projects', projects, setProjects);
    const handleDeleteProject = createDeleteHandler('projects', projects, setProjects);
    
    const handleSaveCustomer = createSaveHandler('customers', customers, setCustomers);
    const handleDeleteCustomer = createDeleteHandler('customers', customers, setCustomers);
    
    const handleSaveIdea = createSaveHandler('ideas', ideas, setIdeas);
    const handleDeleteIdea = createDeleteHandler('ideas', ideas, setIdeas);

    const handleSaveEnrichmentItem = createSaveHandler('enrichments', enrichmentItems, setEnrichmentItems);
    const handleDeleteEnrichmentItem = createDeleteHandler('enrichments', enrichmentItems, setEnrichmentItems);
    
    // Handlers for nested data in detail views
    const handleSaveCustomerUpdate = async (customerId: string, text: string) => {
        if (!user) return;
        const customerDocRef = doc(db, `users/${user.uid}/customers`, customerId);
        const customerToUpdate = customers.find(c => c.id === customerId);
        if (!customerToUpdate) return;
        const newUpdate: Update = { date: new Date().toISOString(), text };
        const updatedUpdates = [...(customerToUpdate.updates || []), newUpdate];
        await updateDoc(customerDocRef, { updates: updatedUpdates });
        setCustomers(customers.map(c => c.id === customerId ? { ...c, updates: updatedUpdates } : c));
    };


    const withConfirmation = (action: () => Promise<void>, title: string, message: string) => {
        setPendingAction({
            title,
            message,
            onConfirm: async () => {
                await action();
                setPendingAction(null);
            },
        });
    };

    // Modal openers
    const openTaskModal = (task: Partial<Task> | null = null) => { setEditingTask(task); setIsTaskModalOpen(true); };
    const openProjectModal = (project: Partial<Project> | null = null) => { setEditingProject(project); setIsProjectModalOpen(true); };
    const openCustomerModal = (customer: Customer | null = null) => { setEditingCustomer(customer); setIsCustomerModalOpen(true); };
    const openIdeaModal = (idea: Idea | null = null) => { setEditingIdea(idea); setIsIdeaModalOpen(true); };
    const openEnrichmentModal = (item: EnrichmentItem | null = null) => { setEditingEnrichmentItem(item); setIsEnrichmentModalOpen(true); };
    
    const handleLogout = () => {
        signOut(auth);
    };

    const handleNavigate = (view: ViewType, itemId: string | null = null) => {
        setView(view);
        setSelectedItemId(itemId);
    };

    const speedDialActions: SpeedDialAction[] = [
        { icon: <ChecklistIcon />, onClick: () => openTaskModal(), bgColor: 'bg-blue-500', ariaLabel: 'הוסף משימה', label: 'הוסף משימה' },
        { icon: <ProjectIcon />, onClick: () => openProjectModal(), bgColor: 'bg-green-500', ariaLabel: 'הוסף פרויקט', label: 'הוסף פרויקט' },
        { icon: <CustomerIcon />, onClick: () => openCustomerModal(), bgColor: 'bg-teal-500', ariaLabel: 'הוסף לקוח', label: 'הוסף לקוח' },
        { icon: <IdeaIcon />, onClick: () => openIdeaModal(), bgColor: 'bg-yellow-500', ariaLabel: 'הוסף רעיון', label: 'הוסף רעיון' },
        { icon: <SparklesIcon />, onClick: () => openEnrichmentModal(), bgColor: 'bg-purple-500', ariaLabel: 'הוסף העשרה', label: 'הוסף העשרה' },
    ];
    
    const renderView = () => {
      switch (view) {
        case 'dashboard':
          return <DashboardView 
                    tasks={tasks} 
                    projects={projects} 
                    onEditTask={openTaskModal} 
                    onToggleStatus={handleToggleTaskStatus} 
                    onProjectSelect={(id) => handleNavigate('project-detail', id)}
                    setView={setView}
                    userEmail={user?.email || null}
                    onSetTaskDailyStatus={handleSetTaskDailyStatus}
                    onReorderDailyTasks={handleReorderDailyTasks}
                 />;
        case 'tasks':
          return <TasksView tasks={tasks} onEditTask={openTaskModal} onToggleStatus={handleToggleTaskStatus} />;
        case 'projects':
          return <ProjectsView 
                    projects={projects} 
                    tasks={tasks}
                    onProjectSelect={(id) => handleNavigate('project-detail', id)}
                    onEditProject={openProjectModal}
                    onDeleteProject={(id, title) => withConfirmation(() => handleDeleteProject(id), "מחיקת פרויקט", `האם אתה בטוח שברצונך למחוק את הפרויקט "${title}"?`)}
                  />;
        case 'customers':
          return <CustomersView 
                    customers={customers}
                    tasks={tasks}
                    onCustomerSelect={(id) => handleNavigate('customer-detail', id)}
                    onEditCustomer={openCustomerModal}
                    onDeleteCustomer={(id, name) => withConfirmation(() => handleDeleteCustomer(id), "מחיקת לקוח", `האם אתה בטוח שברצונך למחוק את הלקוח "${name}"?`)}
                    />;
        case 'ideas':
          return <IdeasView
                    ideas={ideas}
                    onIdeaSelect={(id) => handleNavigate('idea-detail', id)}
                    onConvertToProject={idea => openProjectModal({ title: idea.title, description: idea.description, ideaId: idea.id })}
                    onEditIdea={openIdeaModal}
                    onDeleteIdea={(idea) => withConfirmation(() => handleDeleteIdea(idea.id), "מחיקת רעיון", `האם למחוק את הרעיון "${idea.title}"?`)}
                  />;
        case 'enrichment':
            return <EnrichmentView 
                    items={enrichmentItems}
                    onEditItem={openEnrichmentModal}
                    onDeleteItem={(item) => withConfirmation(() => handleDeleteEnrichmentItem(item.id), "מחיקת פריט", `האם למחוק את "${item.title}"?`)}
                    />;
        case 'project-detail': {
            const project = projects.find(p => p.id === selectedItemId);
            // TODO: Implement handlers for links and milestones
            return project ? <ProjectDetailView project={project} tasks={tasks.filter(t => t.projectId === project.id)} customers={customers} onEditTask={openTaskModal} onToggleStatus={handleToggleTaskStatus} onEditProject={openProjectModal} onDeleteProject={(id, title) => withConfirmation(() => handleDeleteProject(id), "מחיקת פרויקט", `האם אתה בטוח שברצונך למחוק את הפרויקט "${title}"?`)} onSaveLink={() => {}} onDeleteLink={() => {}} onSaveMilestone={() => {}} onDeleteMilestone={() => {}} onBack={() => handleNavigate('projects')} /> : <div>טוען פרויקט...</div>;
        }
        case 'customer-detail': {
            const customer = customers.find(c => c.id === selectedItemId);
            return customer ? <CustomerDetailView customer={customer} tasks={tasks.filter(t => t.customerId === customer.id)} projects={projects} onEditTask={openTaskModal} onToggleStatus={handleToggleTaskStatus} onEditCustomer={openCustomerModal} onDeleteCustomer={(id, name) => withConfirmation(() => handleDeleteCustomer(id), "מחיקת לקוח", `האם אתה בטוח שברצונך למחוק את הלקוח "${name}"?`)} onSaveUpdate={handleSaveCustomerUpdate} onBack={() => handleNavigate('customers')} /> : <div>טוען לקוח...</div>;
        }
        case 'idea-detail': {
            const idea = ideas.find(i => i.id === selectedItemId);
            return idea ? <IdeaDetailView idea={idea} tasks={tasks.filter(t => t.ideaId === idea.id)} onEditTask={openTaskModal} onToggleStatus={handleToggleTaskStatus} onEditIdea={openIdeaModal} onDeleteIdea={(i) => withConfirmation(() => handleDeleteIdea(i.id), "מחיקת רעיון", `האם למחוק את הרעיון "${i.title}"?`)} onConvertToProject={i => openProjectModal({ title: i.title, description: i.description, ideaId: i.id })} onBack={() => handleNavigate('ideas')} /> : <div>טוען רעיון...</div>;
        }
        default:
          return <DashboardView tasks={tasks} projects={projects} onEditTask={openTaskModal} onToggleStatus={handleToggleTaskStatus} onProjectSelect={(id) => handleNavigate('project-detail', id)} setView={setView} userEmail={user?.email || null} onSetTaskDailyStatus={handleSetTaskDailyStatus} onReorderDailyTasks={handleReorderDailyTasks} />;
      }
    };
    
    if (authLoading) {
        return <div className="flex justify-center items-center h-screen">טוען...</div>;
    }

    if (!user) {
        return <LoginView />;
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-800" dir="rtl">
          <Sidebar currentView={view} setView={(v) => handleNavigate(v)} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header userEmail={user?.email || null} onLogout={handleLogout} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
              {loading ? <div className="text-center">טוען נתונים...</div> : renderView()}
            </main>
          </div>
          
          <SpeedDial actions={speedDialActions} />
          
          <TaskForm isOpen={isTaskModalOpen} onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }} onSave={handleSaveTask} task={editingTask} projects={projects} customers={customers} />
          <ProjectForm isOpen={isProjectModalOpen} onClose={() => { setIsProjectModalOpen(false); setEditingProject(null); }} onSave={handleSaveProject} project={editingProject} customers={customers} />
          <CustomerForm isOpen={isCustomerModalOpen} onClose={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }} onSave={handleSaveCustomer} customer={editingCustomer} />
          <IdeaForm isOpen={isIdeaModalOpen} onClose={() => { setIsIdeaModalOpen(false); setEditingIdea(null); }} onSave={handleSaveIdea} idea={editingIdea} />
          <EnrichmentItemForm isOpen={isEnrichmentModalOpen} onClose={() => { setIsEnrichmentModalOpen(false); setEditingEnrichmentItem(null);}} onSave={handleSaveEnrichmentItem} item={editingEnrichmentItem} />

          <ConfirmationModal 
            isOpen={!!pendingAction} 
            onClose={() => setPendingAction(null)}
            onConfirm={pendingAction?.onConfirm || (() => {})}
            title={pendingAction?.title || ''}
            message={pendingAction?.message || ''}
          />
        </div>
      );
};

export default App;