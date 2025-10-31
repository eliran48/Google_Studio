import React from 'react';
import { Customer, Task, TaskStatus } from '../../types';
import Card from '../ui/Card';
import { UserGroupIcon } from '../ui/Icons';

interface CustomersViewProps {
  customers: Customer[];
  tasks: Task[];
  onCustomerSelect: (customerId: string) => void;
}

const CustomersView: React.FC<CustomersViewProps> = ({ customers, tasks, onCustomerSelect }) => {
    const getCustomerTaskCount = (customerId: string) => {
        return tasks.filter(t => t.customerId === customerId && t.status !== TaskStatus.DONE).length;
    }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">לקוחות</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {customers.map(customer => (
          <Card key={customer.id} className="cursor-pointer hover:shadow-xl transition-shadow" onClick={() => onCustomerSelect(customer.id)}>
            <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
                    <UserGroupIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400"/>
                </div>
                <h3 className="text-lg font-bold">{customer.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                <p className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{getCustomerTaskCount(customer.id)} משימות פעילות</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomersView;