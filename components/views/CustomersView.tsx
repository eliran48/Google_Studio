import React from 'react';
import { Customer, Task, TaskStatus, Project, TaskType } from '../../types';
import Card from '../ui/Card';
import { EditIcon, TrashIcon, PlusIcon } from '../ui/Icons';

interface CustomersViewProps {
  customers: Customer[];
  tasks: Task[];
  onCustomerSelect: (customerId: string) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string, customerName: string) => void;
  onAddCustomer: () => void;
  onAddTask: (defaults: Partial<Task>) => void;
  onAddProject: (defaults: Partial<Project>) => void;
}

const CustomersView: React.FC<CustomersViewProps> = ({ customers, tasks, onCustomerSelect, onEditCustomer, onDeleteCustomer, onAddCustomer, onAddTask, onAddProject }) => {
    const getCustomerTaskCount = (customerId: string) => {
        return tasks.filter(t => t.customerId === customerId && t.status !== TaskStatus.DONE).length;
    }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">לקוחות</h2>
        <button
            onClick={onAddCustomer}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
            <PlusIcon className="w-5 h-5" />
            <span>הוסף לקוח</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(customer => (
          <Card key={customer.id} className="group flex flex-col justify-between hover:shadow-xl transition-shadow relative p-0">
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-start">
              <div className="cursor-pointer" onClick={() => onCustomerSelect(customer.id)}>
                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{customer.name}</h3>
                {customer.classification && (
                    <span className="text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full mt-1 inline-block">{customer.classification}</span>
                )}
              </div>
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
            </div>

            {/* Body */}
            <div className="p-4 flex-grow">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">הערות כלליות</h4>
              <div className="text-sm text-gray-600 dark:text-gray-300 h-20 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-2 rounded prose-sm">
                <p className="whitespace-pre-wrap">{customer.generalNotes || 'אין הערות.'}</p>
              </div>
              <p className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{getCustomerTaskCount(customer.id)} משימות פעילות</p>
            </div>
            
            {/* Footer */}
            <div className="p-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-2">
                <button onClick={() => onAddTask({ customerId: customer.id, type: TaskType.BUSINESS })} className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-900">הוסף משימה</button>
                <button onClick={() => onAddProject({ customerIds: [customer.id] })} className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors text-teal-700 bg-teal-100 hover:bg-teal-200 dark:text-teal-200 dark:bg-teal-900/50 dark:hover:bg-teal-900">הוסף פרויקט</button>
            </div>

          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomersView;