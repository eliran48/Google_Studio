import React from 'react';
import { TaskPriority } from '../../types';

interface BadgeProps {
  priority: TaskPriority;
}

const priorityStyles: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [TaskPriority.NORMAL]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [TaskPriority.HIGH]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [TaskPriority.URGENT]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const Badge: React.FC<BadgeProps> = ({ priority }) => {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityStyles[priority]}`}>
      {priority}
    </span>
  );
};

export default Badge;