import React, { useState, useEffect } from 'react';
import { Task, TaskType, TaskPriority, Project, Customer, SubTask, TaskStatus } from '../../types';
import Modal from '../ui/Modal';
import { PlusIcon, TrashIcon } from '../ui/Icons';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<void>;
  task: Partial<Task> | null;
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
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSaving(false);
      setTitle(task?.title || '');
      setDescription(task?.description || '');
      setType(task?.type || TaskType.PERSONAL);
      setCustomerId(task?.customerId);
      setProjectId(task?.projectId);
      setDueDate(task?.dueDate ? task.dueDate.split('T')[0] : '');
      setPriority(task?.priority || TaskPriority.NORMAL);
      setStatus(task?.status || TaskStatus.TODO);
      setSubTasks(task?.subTasks || []);
      setNewSubTaskTitle('');
    }
  }, [task, isOpen]);
  
  const handleAddSubTask = () => {
      if(newSubTaskTitle.trim()) {
          const newSubTask: SubTask = {
              id: Date.now().toString(),
              title: newSubTaskTitle.trim(),
              isCompleted: false,
          };
          setSubTasks([...subTasks, newSubTask]);
          setNewSubTaskTitle('');
      }
  };
  
  const handleToggleSubTask = (id: string) => {
      setSubTasks(subTasks.map(st => st.id === id ? {...st, isCompleted: !st.isCompleted} : st));
  };
  
  const handleDeleteSubTask = (id: string) => {
      setSubTasks(subTasks.filter(st => st.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !title.trim()) return;

    setIsSaving(true);
    try {
        const taskData: Partial<Task> = {
          id: task?.id,
          title,
          description,
          type,
          customerId,
          projectId,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          priority,
          status: status,
          createdAt: task?.createdAt,
          subTasks: subTasks,
        };
        await onSave(taskData);
        onClose();
    } catch (error) {
        console.error("Failed to save task", error);
    } finally {
        setIsSaving(false);
    }
  };

  const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task?.id ? 'עריכת משימה' : 'משימה חדשה'}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block mb-1 font-medium">סטטוס</label>
                <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className={commonInputClasses}>
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="block mb-1 font-medium">תאריך יעד</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={commonInputClasses} />
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
        
        {/* Sub-tasks section */}
        <div className="pt-4 border-t dark:border-gray-700">
            <label className="block mb-2 font-medium">תתי-משימות</label>
            <div className="flex gap-2 mb-3">
                <input 
                    type="text" 
                    value={newSubTaskTitle} 
                    onChange={e => setNewSubTaskTitle(e.target.value)}
                    placeholder="הוסף תת-משימה..."
                    className={commonInputClasses}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubTask(); } }}
                />
                <button type="button" onClick={handleAddSubTask} className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800">
                    <PlusIcon className="w-5 h-5"/>
                </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
                {subTasks.map(st => (
                    <div key={st.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                checked={st.isCompleted} 
                                onChange={() => handleToggleSubTask(st.id)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className={st.isCompleted ? 'line-through text-gray-500' : ''}>{st.title}</span>
                        </div>
                        <button type="button" onClick={() => handleDeleteSubTask(st.id)} className="text-gray-400 hover:text-red-500">
                            <TrashIcon className="w-4 h-4"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">ביטול</button>
          <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed w-24 text-center">
            {isSaving ? 'שומר...' : 'שמירה'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;