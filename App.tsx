import React, { useState, useCallback, useEffect, ReactElement } from 'react';
// FIX: Imported the 'TaskPriority' type to resolve the 'Cannot find name' error.
import { ViewType, Task, Project, Customer, Idea, TaskStatus, ProjectStatus, IdeaCategory, IdeaImpact, IdeaEffort, TaskType, TaskPriority, Update, ProjectLink, ProjectMilestone, SubTask } from './types';
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
import TaskForm from './components/tasks/TaskForm';
import ProjectForm from './components/projects/ProjectForm';
import IdeaForm from './components/ideas/IdeaForm';
import LoginView from './components/views/LoginView';
import CustomerForm from './components/customers/CustomerForm';
import ConfirmationModal from './components/ui/ConfirmationModal';
import SpeedDial, { SpeedDialAction } from './components/ui/SpeedDial';
import { ChecklistIcon, ProjectIcon, CustomerIcon, IdeaIcon } from './components/ui/Icons';

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
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
    const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
    const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
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

    const handleItemSelect = useCallback((id: string, type: 'project' | 'customer' | 'idea') => {
        setSelectedItemId(id);
        if (type === 'project') setView('project-detail');
        if (type === 'customer') setView('customer-detail');
        if (type === 'idea') setView('idea-detail');
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
    const handleOpenNewTaskModal = (defaults: Partial<Task> = {}) => { setEditingTask(defaults); setIsTaskModalOpen(true); };
    const handleEditTask = (task: Task) => { setEditingTask(task); setIsTaskModalOpen(true); };
    const handleOpenNewProjectModal = (defaults: Partial<Project> = {}) => { setEditingProject(defaults); setIsProjectModalOpen(true); };
    const handleEditProject = (project: Project) => { setEditingProject(project); setIsProjectModalOpen(true); };
    const handleOpenNewCustomerModal = () => { setEditingCustomer(null); setIsCustomerModalOpen(true); };
    const handleEditCustomer = (customer: Customer) => { setEditingCustomer(customer); setIsCustomerModalOpen(true); };
    const handleOpenNewIdeaModal = () => { setEditingIdea(null); setIsIdeaModalOpen(true); };
    const handleEditIdea = (idea: Idea) => { setEditingIdea(idea); setIsIdeaModalOpen(true);};
    
    // --- Confirmation Modal Logic ---
    const handleConfirmAction = async () => {
        if (pendingAction) {
            await pendingAction.onConfirm();
            setPendingAction(null);
        }
    };
    const handleCancelAction = () => setPendingAction(null);

    // --- Save Handlers ---
    const handleSaveTask = async (taskToSave: Partial<Task>) => {
        if (!user) throw new Error("User not authenticated");
        
        const isEditing = !!taskToSave.id;
        
        const taskWithMetadata: Task = {
            id: taskToSave.id || '',
            title: taskToSave.title || 'ללא כותרת',
            description: taskToSave.description,
            type: taskToSave.type || TaskType.PERSONAL,
            customerId: taskToSave.customerId,
            projectId: taskToSave.projectId,
            ideaId: taskToSave.ideaId,
            dueDate: taskToSave.dueDate,
            priority: taskToSave.priority || TaskPriority.NORMAL,
            status: isEditing ? taskToSave.status || TaskStatus.TODO : TaskStatus.TODO,
            createdAt: isEditing ? taskToSave.createdAt || new Date().toISOString() : new Date().toISOString(),
            subTasks: taskToSave.subTasks || [],
        };

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
            throw error;
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
    
    const handleSaveProject = async (projectToSave: Partial<Project>) => {
        if (!user) throw new Error("User not authenticated");
        
        try {
            const { id, ...projectData } = { ...projectToSave, status: projectToSave.status || ProjectStatus.NOT_STARTED };

            const firestoreData: { [key: string]: any } = {};
            Object.keys(projectData).forEach(key => {
                 const value = projectData[key as keyof typeof projectData];
                 if (value !== undefined) {
                    firestoreData[key] = value;
                }
            });

            if (id) {
                const projectDocRef = doc(db, `users/${user.uid}/projects`, id);
                await updateDoc(projectDocRef, firestoreData);
                setProjects(prev => prev.map(p => p.id === id ? { ...p, ...projectData } : p));
            } else {
                 const projectWithDefaults = { ...firestoreData, links: [], milestones: [] };
                const docRef = await addDoc(collection(db, `users/${user.uid}/projects`), projectWithDefaults);
                setProjects(prev => [...prev, { ...projectWithDefaults, id: docRef.id } as Project]);
            }
        } catch (error) {
            console.error("Error saving project:", error);
            throw error;
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
    
    const updateProjectSubCollection = async <T extends { id: string }>(
        projectId: string,
        collectionName: 'links' | 'milestones',
        newItems: T[]
    ) => {
        if (!user) return;
        const projectDocRef = doc(db, `users/${user.uid}/projects`, projectId);
        try {
            await updateDoc(projectDocRef, { [collectionName]: newItems });
            setProjects(prev =>
                prev.map(p =>
                    p.id === projectId ? { ...p, [collectionName]: newItems } : p
                )
            );
        } catch (error) {
            console.error(`Error updating project ${collectionName}:`, error);
        }
    };

    const handleSaveProjectLink = async (projectId: string, link: Omit<ProjectLink, 'id'> & { id?: string }) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const links = project.links || [];
        if (link.id) {
            const updatedLinks = links.map(l => l.id === link.id ? { ...l, ...link } : l);
            await updateProjectSubCollection(projectId, 'links', updatedLinks);
        } else {
            const newLink = { ...link, id: Date.now().toString() };
            await updateProjectSubCollection(projectId, 'links', [...links, newLink]);
        }
    };

    const handleDeleteProjectLink = async (projectId: string, linkId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project || !project.links) return;
        const updatedLinks = project.links.filter(l => l.id !== linkId);
        await updateProjectSubCollection(projectId, 'links', updatedLinks);
    };

    const handleSaveProjectMilestone = async (projectId: string, milestone: Omit<ProjectMilestone, 'id'> & { id?: string }) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const milestones = project.milestones || [];
         if (milestone.id) {
            const updatedMilestones = milestones.map(m => m.id === milestone.id ? { ...m, ...milestone } : m);
            await updateProjectSubCollection(projectId, 'milestones', updatedMilestones);
        } else {
            const newMilestone = { ...milestone, date: new Date().toISOString(), id: Date.now().toString() };
            await updateProjectSubCollection(projectId, 'milestones', [newMilestone, ...milestones]);
        }
    };
    
    const handleDeleteProjectMilestone = async (projectId: string, milestoneId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project || !project.milestones) return;
        const updatedMilestones = project.milestones.filter(m => m.id !== milestoneId);
        await updateProjectSubCollection(projectId, 'milestones', updatedMilestones);
    };

    const handleSaveIdea = async (ideaToSave: Omit<Idea, 'id'> & { id?: string }) => {
        if (!user) throw new Error("User not authenticated");

        const ideaWithDefaults = {
            ...ideaToSave,
            category: ideaToSave.category || IdeaCategory.PRODUCT,
            impact: ideaToSave.impact || IdeaImpact.MEDIUM,
            effort: ideaToSave.effort || IdeaEffort.MEDIUM,
        }

        try {
            const { id, ...ideaData } = ideaWithDefaults;
            if (id) {
                const ideaDocRef = doc(db, `users/${user.uid}/ideas`, id);
                await updateDoc(ideaDocRef, ideaData);
                setIdeas(prev => prev.map(i => i.id === id ? { ...ideaData, id } as Idea : i));
            } else {
                const docRef = await addDoc(collection(db, `users/${user.uid}/ideas`), ideaData);
                setIdeas(prev => [...prev, { ...ideaData, id: docRef.id } as Idea]);
            }
        } catch (error) {
            console.error("Error saving idea:", error);
            throw error;
        }
    };
    
    const handleSaveCustomer = async (customerToSave: Omit<Customer, 'id' | 'updates'> & { id?: string }): Promise<void> => {
        if (!user) {
            throw new Error("User not authenticated");
        }

        try {
            const { id, ...customerData } = customerToSave;

            if (id) {
                // Update
                const customerDocRef = doc(db, `users/${user.uid}/customers`, id);
                await updateDoc(customerDocRef, customerData);
                setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customerData } : c));
            } else {
                // Create
                const customerWithDefaults = { ...customerData, updates: [] };
                const docRef = await addDoc(collection(db, `users/${user.uid}/customers`), customerWithDefaults);
                setCustomers(prev => [...prev, { ...customerWithDefaults, id: docRef.id } as Customer]);
            }
        } catch (error) {
            console.error("Error saving customer:", error);
            throw error;
        }
    };

    const handleSaveCustomerUpdate = async (customerId: string, updateText: string) => {
        if (!user || !updateText.trim()) return;

        const customer = customers.find(c => c.id === customerId);
        if (!customer) return;

        const newUpdate: Update = {
            date: new Date().toISOString(),
            text: updateText.trim(),
        };

        const updatedUpdates = [newUpdate, ...(customer.updates || [])];

        try {
            const customerDocRef = doc(db, `users/${user.uid}/customers`, customerId);
            await updateDoc(customerDocRef, { updates: updatedUpdates });

            setCustomers(prevCustomers =>
                prevCustomers.map(c =>
                    c.id === customerId ? { ...c, updates: updatedUpdates } : c
                )
            );
        } catch (error) {
            console.error("Error saving customer update:", error);
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
            status: ProjectStatus.NOT_STARTED,
            links: [],
            milestones: [],
        };
        try {
            const batch = writeBatch(db);
            
            const projectDocRef = doc(collection(db, `users/${user.uid}/projects`));
            batch.set(projectDocRef, newProjectData);
            
            const tasksToUpdate = tasks.filter(t => t.ideaId === idea.id);
            tasksToUpdate.forEach(task => {
                const taskDocRef = doc(db, `users/${user.uid}/tasks`, task.id);
                batch.update(taskDocRef, { projectId: projectDocRef.id, ideaId: undefined });
            });

            const ideaDocRef = doc(db, `users/${user.uid}/ideas`, idea.id);
            batch.delete(ideaDocRef);
            
            await batch.commit();

            setProjects(prev => [...prev, { ...newProjectData, id: projectDocRef.id } as Project]);
            setIdeas(prev => prev.filter(i => i.id !== idea.id));
            setTasks(prev => prev.map(t => {
                if (t.ideaId === idea.id) {
                    return { ...t, projectId: projectDocRef.id, ideaId: undefined };
                }
                return t;
            }));
            
            if (view === 'idea-detail' && selectedItemId === idea.id) {
                handleSetView('projects');
            }

        } catch(error) {
            console.error("Error converting idea to project:", error);
        }
    };
    
    const handleDeleteIdea = async (ideaId: string) => {
        if (!user) return;
        try {
            const batch = writeBatch(db);
            
            const ideaDocRef = doc(db, `users/${user.uid}/ideas`, ideaId);
            batch.delete(ideaDocRef);

            const tasksToUpdate = tasks.filter(t => t.ideaId === ideaId);
            tasksToUpdate.forEach(task => {
                const taskDocRef = doc(db, `users/${user.uid}/tasks`, task.id);
                batch.update(taskDocRef, { ideaId: undefined });
            });

            await batch.commit();

            setIdeas(prev => prev.filter(i => i.id !== ideaId));
            setTasks(prev => prev.map(t => (t.ideaId === ideaId ? { ...t, ideaId: undefined } : t)));
             if(view === 'idea-detail' && selectedItemId === ideaId) {
                handleSetView('ideas');
            }
        } catch (error) {
            console.error("Error deleting idea:", error);
        }
    }

    const requestDeleteIdea = (idea: Idea) => {
        setPendingAction({
            title: 'מחיקת רעיון',
            message: `האם אתה בטוח שברצונך למחוק את הרעיון "${idea.title}"?`,
            onConfirm: () => handleDeleteIdea(idea.id),
        });
    };

    const speedDialActions: SpeedDialAction[] = [
      {
        icon: <ChecklistIcon />,
        label: 'הוסף משימה',
        ariaLabel: 'הוסף משימה חדשה',
        bgColor: 'bg-blue-500',
        onClick: () => handleOpenNewTaskModal(),
      },
      {
        icon: <ProjectIcon />,
        label: 'הוסף פרויקט',
        ariaLabel: 'הוסף פרויקט חדש',
        bgColor: 'bg-green-500',
        onClick: () => handleOpenNewProjectModal(),
      },
      {
        icon: <CustomerIcon />,
        label: 'הוסף לקוח',
        ariaLabel: 'הוסף לקוח חדש',
        bgColor: 'bg-teal-500',
        onClick: handleOpenNewCustomerModal,
      },
      {
        icon: <IdeaIcon />,
        label: 'הוסף רעיון',
        ariaLabel: 'הוסף רעיון חדש',
        bgColor: 'bg-yellow-500',
        onClick: handleOpenNewIdeaModal,
      },
    ];

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <DashboardView tasks={tasks} projects={projects} onEditTask={handleEditTask} onToggleStatus={requestToggleTaskStatus} onProjectSelect={(id) => handleItemSelect(id, 'project')} setView={handleSetView} />;
            case 'tasks':
                return <TasksView tasks={tasks} onEditTask={handleEditTask} onToggleStatus={requestToggleTaskStatus} onAddTask={handleOpenNewTaskModal} />;
            case 'projects':
                return <ProjectsView projects={projects} tasks={tasks} onProjectSelect={(id) => handleItemSelect(id, 'project')} onEditProject={handleEditProject} onDeleteProject={requestDeleteProject} onAddProject={handleOpenNewProjectModal} onAddTask={handleOpenNewTaskModal} />;
            case 'customers':
                return <CustomersView customers={customers} tasks={tasks} onCustomerSelect={(id) => handleItemSelect(id, 'customer')} onEditCustomer={handleEditCustomer} onDeleteCustomer={requestDeleteCustomer} onAddCustomer={handleOpenNewCustomerModal} onAddTask={handleOpenNewTaskModal} onAddProject={handleOpenNewProjectModal} />;
            case 'ideas':
                return <IdeasView ideas={ideas} onIdeaSelect={(id) => handleItemSelect(id, 'idea')} onConvertToProject={handleConvertIdeaToProject} onAddIdea={handleOpenNewIdeaModal} onEditIdea={handleEditIdea} onDeleteIdea={requestDeleteIdea} onAddTask={handleOpenNewTaskModal} />;
            case 'project-detail':
                const project = projects.find(p => p.id === selectedItemId);
                if (!project) return <div>Project not found</div>;
                return <ProjectDetailView 
                            project={project} 
                            tasks={tasks.filter(t => t.projectId === selectedItemId)} 
                            customers={customers} 
                            onEditTask={handleEditTask} 
                            onToggleStatus={requestToggleTaskStatus} 
                            onEditProject={handleEditProject} 
                            onDeleteProject={requestDeleteProject}
                            onSaveLink={handleSaveProjectLink}
                            onDeleteLink={handleDeleteProjectLink}
                            onSaveMilestone={handleSaveProjectMilestone}
                            onDeleteMilestone={handleDeleteProjectMilestone}
                            onAddTask={handleOpenNewTaskModal}
                            onBack={() => handleSetView('projects')}
                        />;
            case 'customer-detail':
                 const customer = customers.find(c => c.id === selectedItemId);
                 if (!customer) return <div>Customer not found</div>
                 return <CustomerDetailView 
                            customer={customer} 
                            tasks={tasks.filter(t => t.customerId === selectedItemId)} 
                            projects={projects} 
                            onEditTask={handleEditTask} 
                            onToggleStatus={requestToggleTaskStatus} 
                            onEditCustomer={handleEditCustomer} 
                            onDeleteCustomer={requestDeleteCustomer} 
                            onAddTask={handleOpenNewTaskModal} 
                            onSaveUpdate={handleSaveCustomerUpdate}
                            onBack={() => handleSetView('customers')}
                        />;
            case 'idea-detail':
                const idea = ideas.find(i => i.id === selectedItemId);
                if (!idea) return <div>Idea not found</div>;
                return <IdeaDetailView
                            idea={idea}
                            tasks={tasks.filter(t => t.ideaId === selectedItemId)}
                            onEditTask={handleEditTask}
                            onToggleStatus={requestToggleTaskStatus}
                            onAddTask={handleOpenNewTaskModal}
                            onEditIdea={handleEditIdea}
                            onDeleteIdea={requestDeleteIdea}
                            onConvertToProject={handleConvertIdeaToProject}
                            onBack={() => handleSetView('ideas')}
                        />;
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

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" dir="rtl">
            {isSidebarOpen && window.innerWidth <= 1024 && ( <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} aria-hidden="true"></div> )}
            <Sidebar currentView={view} setView={handleSetView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    onLogout={handleLogout} 
                    userEmail={user.email} 
                    onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-6 pb-24">
                    {renderView()}
                </main>
            </div>
            
            <TaskForm isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onSave={handleSaveTask} task={editingTask} projects={projects} customers={customers} />
            <ProjectForm isOpen={isProjectModalOpen} onClose={() => { setIsProjectModalOpen(false); setEditingProject(null); }} onSave={handleSaveProject} project={editingProject} customers={customers} />
            <IdeaForm isOpen={isIdeaModalOpen} onClose={() => { setIsIdeaModalOpen(false); setEditingIdea(null); }} onSave={handleSaveIdea} idea={editingIdea} />
            <CustomerForm isOpen={isCustomerModalOpen} onClose={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }} onSave={handleSaveCustomer} customer={editingCustomer} />
            <ConfirmationModal isOpen={!!pendingAction} onClose={handleCancelAction} onConfirm={handleConfirmAction} title={pendingAction?.title || ''} message={pendingAction?.message || ''} />
            <SpeedDial actions={speedDialActions} />
        </div>
    );
};

export default App;