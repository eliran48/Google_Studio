import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import Modal from '../ui/Modal';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'updates'> & { id?: string }) => Promise<void>;
  customer: Customer | null;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ isOpen, onClose, onSave, customer }) => {
  const [name, setName] = useState('');
  const [classification, setClassification] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setIsSaving(false);
        if (customer) {
            setName(customer.name);
            setClassification(customer.classification || '');
            setGeneralNotes(customer.generalNotes || '');
        } else {
            setName('');
            setClassification('');
            setGeneralNotes('');
        }
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;
    
    setIsSaving(true);
    try {
        const customerData = {
          id: customer ? customer.id : undefined,
          name,
          classification: classification.trim(),
          generalNotes: generalNotes.trim(),
        };
        await onSave(customerData);
        onClose();
    } catch (error) {
        console.error("Failed to save customer:", error);
        // Optionally show an error message to the user here
    } finally {
        setIsSaving(false);
    }
  };
  
  const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? "עריכת לקוח" : "לקוח חדש"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">שם הלקוח</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={commonInputClasses}
            required
          />
        </div>
        <div>
            <label className="block mb-1 font-medium">סיווג</label>
            <input
                type="text"
                value={classification}
                onChange={e => setClassification(e.target.value)}
                className={commonInputClasses}
                placeholder="לדוגמה: ליד, לקוח פעיל, VIP"
            />
        </div>
        <div>
          <label className="block mb-1 font-medium">הערות כלליות</label>
          <textarea
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            className={commonInputClasses}
            rows={4}
            placeholder="רשום כאן פרטים חשובים על הלקוח..."
          ></textarea>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSaving}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            ביטול
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed w-28 text-center"
          >
            {isSaving ? 'שומר...' : 'שמור לקוח'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerForm;