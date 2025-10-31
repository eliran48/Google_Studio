
export enum TaskType {
  PERSONAL = 'אישי',
  BUSINESS = 'עסקי',
}

export enum TaskPriority {
  LOW = 'נמוכה',
  NORMAL = 'רגילה',
  HIGH = 'גבוהה',
  URGENT = 'דחופה',
}

export enum TaskStatus {
  TODO = 'לביצוע',
  IN_PROGRESS = 'בתהליך',
  DONE = 'הושלם',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  customerId?: string; 
  projectId?: string; 
  dueDate: string; 
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  ideaId?: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
}

export type ViewType = 'dashboard' | 'projects' | 'customers' | 'ideas' | 'project-detail' | 'customer-detail';
