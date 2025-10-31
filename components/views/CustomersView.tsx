import React from 'react';
import { Customer, Task, TaskStatus } from '../../types';
import Card from '../ui/Card';
import { UserGroupIcon, EditIcon, TrashIcon } from '../ui/Icons';

interface CustomersViewProps {
  customers: Customer[];
  tasks: Task[];
  onCustomerSelect: (customerId: string) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string, customerName: string) => void;
}

const CustomersView: React.FC<CustomersViewProps> = ({ customers, tasks, onCustomerSelect, onEditCustomer, onDeleteCustomer }) => {
    const getCustomerTaskCount = (customerId: string) => {
        return tasks.filter(t => t.customerId === customerId && t.status !== TaskStatus.DONE).length;
    }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">לקוחות</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {customers.map(customer => (
          <Card key={customer.id} className="group cursor-pointer hover:shadow-xl transition-shadow relative" onClick={() => onCustomerSelect(customer.id)}>
             <div className="absolute top-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onEditCustomer(customer); }}
                    className="p-1.5 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    aria-label={`ערוך לקוח ${customer.name}`}
                >
                    <EditIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDeleteCustomer(customer.id, customer.name); }}
                    className="p-1.5 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 hover:bg-red-200 dark:hover:bg-red-800 hover:text-red-600"
                    aria-label={`מחק לקוח ${customer.name}`}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
            <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
                    <UserGroupIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400"/>
                </div>
                <h3 className="text-lg font-bold">{customer.name}</h3>
                {customer.email ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 break-all">{customer.email}</p>
                ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">אין אימייל</p>
                )}
                <p className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{getCustomerTaskCount(customer.id)} משימות פעילות</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomersView;
