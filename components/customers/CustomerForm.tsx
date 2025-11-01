import React, { useState, useEffect } from 'react';
import { Customer, CustomerClassification } from '../../types';
import Modal from '../ui/Modal';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id'> & { id?: string }) => void;
  customer: Customer | null;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ isOpen, onClose, onSave, customer }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [classification, setClassification] = useState<CustomerClassification>(CustomerClassification.LEAD);

  useEffect(() => {
    if (isOpen) {
        if (customer) {
            setName(customer.name);
            setEmail(customer.email || '');
            setClassification(customer.classification || CustomerClassification.LEAD);
        } else {
            setName('');
            setEmail('');
            setClassification(CustomerClassification.LEAD);
        }
    }
  }, [customer, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const customerData = {
      id: customer ? customer.id : undefined,
      name,
      email: email.trim() ? email.trim() : undefined,
      classification,
    };
    onSave(customerData);
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
          <label className="block mb-1 font-medium">כתובת אימייל (רשות)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={commonInputClasses}
          />
        </div>
        <div>
            <label className="block mb-1 font-medium">סיווג</label>
            <select value={classification} onChange={e => setClassification(e.target.value as CustomerClassification)} className={commonInputClasses}>
                {Object.values(CustomerClassification).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">ביטול</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">שמור לקוח</button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerForm;