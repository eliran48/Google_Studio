import React, { useState } from 'react';
import { Project, Task, Customer, ProjectLink, ProjectMilestone, TaskType } from '../../types';
import TaskList from '../tasks/TaskList';
import Card from '../ui/Card';
import { EditIcon, TrashIcon, PlusIcon, XIcon } from '../ui/Icons';

interface ProjectDetailViewProps {
  project: Project;
  tasks: Task[];
  customers: Customer[];
  onEditTask: (task: Task) => void;
  onToggleStatus: (taskId: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string, projectTitle: string) => void;
  onSaveLink: (projectId: string, link: Omit<ProjectLink, 'id'> & { id?: string }) => void;
  onDeleteLink: (projectId: string, linkId: string) => void;
  onSaveMilestone: (projectId: string, milestone: Partial<Omit<ProjectMilestone, 'id' | 'date'>>) => void;
  onDeleteMilestone: (projectId: string, milestoneId: string) => void;
  onAddTask: (defaults: Partial<Task>) => void;
  onBack: () => void;
}

const InfoItem: React.FC<{label: string; value?: string | number | null}> = ({label, value}) => (
    <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-md font-semibold text-gray-800 dark:text-gray-200">{value || 'לא הוגדר'}</p>
    </div>
);

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ 
    project, tasks, customers, onEditTask, onToggleStatus, onEditProject, onDeleteProject,
    onSaveLink, onDeleteLink, onSaveMilestone, onDeleteMilestone, onAddTask, onBack
}) => {
  const projectCustomers = customers.filter(c => project.customerIds?.includes(c.id));
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return undefined;
    return new Intl.DateTimeFormat('he-IL', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(new Date(dateString));
  };
  
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return undefined;
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
  }
  
  const handleMilestoneSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newMilestoneDesc.trim()) {
          onSaveMilestone(project.id, { description: newMilestoneDesc });
          setNewMilestoneDesc('');
      }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newLink.title.trim() && newLink.url.trim()) {
          onSaveLink(project.id, newLink);
          setNewLink({ title: '', url: '' });
          setShowAddLinkForm(false);
      }
  };
  
  const sortedMilestones = (project.milestones || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  return (
    <div className="space-y-6">
        <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span>חזרה לרשימת הפרויקטים</span>
        </button>

      <Card>
        <div className="flex justify-between items-start">
            <div className="flex-grow">
                <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{project.title}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-prose">{project.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                 <button onClick={() => onAddTask({ projectId: project.id, type: TaskType.BUSINESS })} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" aria-label="הוסף משימה לפרויקט">
                    <PlusIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onEditProject(project)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDeleteProject(project.id, project.title)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900 text-gray-600 dark:text-gray-300 hover:text-red-600">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <TaskList tasks={tasks} onEditTask={onEditTask} title="משימות בפרויקט" onToggleStatus={onToggleStatus} />
        </div>
        <div className="space-y-6">
            <Card>
                <h3 className="text-xl font-bold mb-4">פרטי הפרויקט</h3>
                <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="סטטוס" value={project.status} />
                    <InfoItem label="תקציב" value={formatCurrency(project.budget)} />
                    <InfoItem label="תאריך התחלה" value={formatDate(project.startDate)} />
                    <InfoItem label="תאריך סיום" value={formatDate(project.endDate)} />
                </div>
            </Card>
            <Card>
                <h3 className="text-xl font-bold mb-4">אבני דרך</h3>
                <form onSubmit={handleMilestoneSubmit} className="flex gap-2 mb-4">
                    <input type="text" value={newMilestoneDesc} onChange={(e) => setNewMilestoneDesc(e.target.value)} placeholder="הוסף אבן דרך..." className="flex-grow p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:border-gray-600" />
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400" disabled={!newMilestoneDesc.trim()}>הוסף</button>
                </form>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                    {sortedMilestones.map(m => (
                        <div key={m.id} className="text-sm flex justify-between items-start group">
                            <div>
                                <p className="font-semibold">{m.description}</p>
                                <p className="text-xs text-gray-500">{new Date(m.date).toLocaleDateString('he-IL')}</p>
                            </div>
                            <button onClick={() => onDeleteMilestone(project.id, m.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700">
                                <XIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    ))}
                    {sortedMilestones.length === 0 && <p className="text-sm text-gray-500">אין אבני דרך.</p>}
                </div>
            </Card>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">קישורים חשובים</h3>
                    <button onClick={() => setShowAddLinkForm(!showAddLinkForm)} className="text-indigo-600 hover:text-indigo-800">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                {showAddLinkForm && (
                    <form onSubmit={handleLinkSubmit} className="space-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <input type="text" value={newLink.title} onChange={(e) => setNewLink(p => ({...p, title: e.target.value}))} placeholder="כותרת הקישור" className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" required />
                        <input type="url" value={newLink.url} onChange={(e) => setNewLink(p => ({...p, url: e.target.value}))} placeholder="https://example.com" className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" required />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowAddLinkForm(false)} className="px-3 py-1 text-sm rounded-md">ביטול</button>
                            <button type="submit" className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">שמור</button>
                        </div>
                    </form>
                )}
                 <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(project.links || []).map(l => (
                        <div key={l.id} className="flex justify-between items-center group">
                            <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate dark:text-indigo-400 pr-2">{l.title}</a>
                             <button onClick={() => onDeleteLink(project.id, l.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700">
                                <XIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    ))}
                    {!project.links?.length && <p className="text-sm text-gray-500">אין קישורים.</p>}
                 </div>
            </Card>
            <Card>
                <h3 className="text-xl font-bold mb-4">לקוחות משויכים</h3>
                {projectCustomers.length > 0 ? (
                    <ul className="space-y-2">
                        {projectCustomers.map(customer => (
                            <li key={customer.id} className="text-gray-700 dark:text-gray-200">{customer.name}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">אין לקוחות המשויכים ישירות לפרויקט זה.</p>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailView;