import React, { useState, useEffect } from 'react';
import { Task, TaskType, TaskPriority, TaskStatus, Project, Customer } from '../../types';
import Modal from '../ui/Modal';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task: Task | null;
  projects: Project[];
  customers: Customer[];
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSave, task, projects, customers }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>(TaskType.PERSONAL);
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.NORMAL);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setType(task.type);
      setCustomerId(task.customerId);
      setProjectId(task.projectId);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : ''); // Safely format for date input
      setPriority(task.priority);
    } else {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setType(TaskType.PERSONAL);
      setCustomerId(undefined);
      setProjectId(undefined);
      setDueDate('');
      setPriority(TaskPriority.NORMAL);
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskData: Task = {
      id: task ? task.id : '',
      title,
      description,
      type,
      customerId,
      projectId,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      priority,
      status: task ? task.status : TaskStatus.TODO,
      createdAt: task ? task.createdAt : new Date().toISOString(),
    };
    onSave(taskData);
  };

  const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'עריכת משימה' : 'משימה חדשה'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">כותרת</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={commonInputClasses} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">תיאור</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className={commonInputClasses} rows={3}></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">סוג משימה</label>
              <select value={type} onChange={e => setType(e.target.value as TaskType)} className={commonInputClasses}>
                {Object.values(TaskType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">דחיפות</label>
              <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className={commonInputClasses}>
                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
        </div>
        {type === TaskType.BUSINESS && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">לקוח</label>
              <select value={customerId || ''} onChange={e => setCustomerId(e.target.value || undefined)} className={commonInputClasses}>
                <option value="">בחר לקוח</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">פרויקט</label>
              <select value={projectId || ''} onChange={e => setProjectId(e.target.value || undefined)} className={commonInputClasses}>
                <option value="">בחר פרויקט</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </div>
        )}
        <div>
            <label className="block mb-1 font-medium">תאריך יעד</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={commonInputClasses} />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">ביטול</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">שמירה</button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;