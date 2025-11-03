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

export enum ProjectStatus {
  NOT_STARTED = 'טרם התחיל',
  IN_PROGRESS = 'בתהליך',
  COMPLETED = 'הושלם',
  ON_HOLD = 'בהמתנה',
}

export enum IdeaCategory {
  PRODUCT = 'מוצר',
  MARKETING = 'שיווק',
  OPERATIONS = 'תפעול',
  SALES = 'מכירות',
}

export enum IdeaImpact {
  HIGH = 'גבוהה',
  MEDIUM = 'בינונית',
  LOW = 'נמוכה',
}

export enum IdeaEffort {
  HIGH = 'גבוה',
  MEDIUM = 'בינוני',
  LOW = 'נמוך',
}

export interface Update {
  date: string;
  text: string;
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  customerId?: string; 
  projectId?: string; 
  ideaId?: string;
  dueDate?: string; 
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  subTasks?: SubTask[];
}

export interface Customer {
  id: string;
  name: string;
  classification?: string;
  generalNotes?: string;
  updates?: Update[];
}

export interface ProjectLink {
  id: string;
  title: string;
  url: string;
}

export interface ProjectMilestone {
  id: string;
  date: string;
  description: string;
}

export interface Project {
  id:string;
  title: string;
  description?: string;
  ideaId?: string;
  customerIds?: string[];
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  links?: ProjectLink[];
  milestones?: ProjectMilestone[];
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  impact: IdeaImpact;
  effort: IdeaEffort;
}

export type ViewType = 'dashboard' | 'projects' | 'customers' | 'ideas' | 'project-detail' | 'customer-detail' | 'tasks' | 'idea-detail';