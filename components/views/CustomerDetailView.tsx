import React, { useState } from 'react';
import { Customer, Task, Project, TaskType } from '../../types';
import TaskList from '../tasks/TaskList';
import Card from '../ui/Card';
import { EditIcon, TrashIcon, PlusIcon } from '../ui/Icons';

interface CustomerDetailViewProps {
  customer: Customer;
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onToggleStatus: (taskId: string) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string, customerName: string) => void;
  onSaveUpdate: (customerId: string, updateText: string) => Promise<void>;
  onBack: () => void;
}

const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({ customer, tasks, projects, onEditTask, onToggleStatus, onEditCustomer, onDeleteCustomer, onSaveUpdate, onBack }) => {
    const customerProjects = projects.filter(p => p.customerIds?.includes(customer.id) || tasks.some(t => t.projectId === p.id && t.customerId === customer.id));
    const [newUpdateText, setNewUpdateText] = useState('');
    const [isSavingUpdate, setIsSavingUpdate] = useState(false);

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUpdateText.trim() || isSavingUpdate) return;
        setIsSavingUpdate(true);
        await onSaveUpdate(customer.id, newUpdateText);
        setNewUpdateText('');
        setIsSavingUpdate(false);
    };

    const sortedUpdates = (customer.updates || []).slice().sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        if (isNaN(timeA)) return 1;
        if (isNaN(timeB)) return -1;
        return timeB - timeA;
    });
    
    const formatUpdateDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'תאריך לא חוקי';
        }
        return date.toLocaleDateString('he-IL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

  return (
    <div className="space-y-6">
       <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span>חזרה לרשימת הלקוחות</span>
        </button>
      <Card>
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-3xl font-bold text-teal-700 dark:text-teal-400">{customer.name}</h2>
                {customer.classification && (
                    <span className="text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full mt-2 inline-block">{customer.classification}</span>
                )}
            </div>
             <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => onEditCustomer(customer)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDeleteCustomer(customer.id, customer.name)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900 text-gray-600 dark:text-gray-300 hover:text-red-600">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <TaskList tasks={tasks} onEditTask={onEditTask} title={`משימות עבור ${customer.name}`} onToggleStatus={onToggleStatus} />
        </div>
        <div className="space-y-6">
            <Card>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">סיכומי שיחה / עדכונים</h3>
                <form onSubmit={handleUpdateSubmit} className="space-y-2 mb-4">
                    <textarea
                        value={newUpdateText}
                        onChange={(e) => setNewUpdateText(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                        rows={3}
                        placeholder="הוסף סיכום שיחה או עדכון חדש..."
                        required
                        disabled={isSavingUpdate}
                    />
                    <button
                        type="submit"
                        disabled={isSavingUpdate || !newUpdateText.trim()}
                        className="w-full px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isSavingUpdate ? 'שומר...' : 'הוסף עדכון'}
                    </button>
                </form>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                    {sortedUpdates.length > 0 ? (
                        sortedUpdates.map((update, index) => (
                            <div key={index} className="pb-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    {formatUpdateDate(update.date)}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{update.text}</p>
                            </div>
                        ))
                    )
                    : (
                        <p className="text-sm text-center text-gray-500 dark:text-gray-400">אין עדכונים.</p>
                    )}
                </div>
            </Card>
            <Card>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">פרויקטים קשורים</h3>
                {customerProjects.length > 0 ? (
                    <ul className="space-y-2">
                        {customerProjects.map(project => (
                            <li key={project.id} className="text-gray-700 dark:text-gray-200">{project.title}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">אין פרויקטים המשויכים ללקוח זה.</p>
                )}
            </Card>
            {customer.generalNotes && (
                <Card>
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">הערות כלליות</h3>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{customer.generalNotes}</p>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailView;