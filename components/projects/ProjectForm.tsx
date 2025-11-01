import React, { useState, useEffect, useRef } from 'react';
import { Project, Customer, ProjectStatus } from '../../types';
import Modal from '../ui/Modal';
import { ChevronDownIcon } from '../ui/Icons';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id'> & { id?: string }) => void;
  project: Project | null;
  customers: Customer[];
}

const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, onClose, onSave, project, customers }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.NOT_STARTED);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
        if (project) {
            setTitle(project.title);
            setDescription(project.description || '');
            setSelectedCustomerIds(project.customerIds || []);
            setStatus(project.status || ProjectStatus.NOT_STARTED);
            setStartDate(project.startDate ? project.startDate.split('T')[0] : '');
            setEndDate(project.endDate ? project.endDate.split('T')[0] : '');
            setBudget(project.budget || '');
        } else {
            setTitle('');
            setDescription('');
            setSelectedCustomerIds([]);
            setStatus(ProjectStatus.NOT_STARTED);
            setStartDate('');
            setEndDate('');
            setBudget('');
        }
    }
  }, [project, isOpen]);

  const handleCustomerSelection = (customerId: string) => {
    setSelectedCustomerIds(prev =>
        prev.includes(customerId)
            ? prev.filter(id => id !== customerId)
            : [...prev, customerId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      id: project ? project.id : undefined,
      title,
      description,
      customerIds: selectedCustomerIds,
      status,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      budget: typeof budget === 'number' ? budget : undefined,
    };
    onSave(projectData);
  };
  
  const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? "עריכת פרויקט" : "פרויקט חדש"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">שם הפרויקט</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={commonInputClasses}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">תיאור</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={commonInputClasses}
            rows={3}
          ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">סטטוס</label>
            <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className={commonInputClasses}>
              {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">תקציב (₪)</label>
             <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className={commonInputClasses}
              placeholder="לדוגמה: 5000"
            />
          </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">תאריך התחלה</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={commonInputClasses} />
          </div>
          <div>
            <label className="block mb-1 font-medium">תאריך סיום</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={commonInputClasses} />
          </div>
        </div>
        
        <div>
          <label className="block mb-1 font-medium">שיוך לקוחות</label>
          <div className="relative" ref={dropdownRef}>
            <button 
              type="button" 
              onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)} 
              className={`${commonInputClasses} flex justify-between items-center text-right`}
              aria-haspopup="listbox"
              aria-expanded={isCustomerDropdownOpen}
            >
              <span>{selectedCustomerIds.length > 0 ? `${selectedCustomerIds.length} לקוחות נבחרו` : 'בחר לקוחות'}</span>
              <ChevronDownIcon className={`w-5 h-5 transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCustomerDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {customers.length > 0 ? customers.map(customer => (
                  <label key={customer.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedCustomerIds.includes(customer.id)} 
                      onChange={() => handleCustomerSelection(customer.id)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{customer.name}</span>
                  </label>
                )) : <div className="px-4 py-2 text-sm text-gray-500">אין לקוחות להצגה.</div>}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">ביטול</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">שמור פרויקט</button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectForm;