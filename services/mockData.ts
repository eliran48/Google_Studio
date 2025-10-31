import { Task, Project, Customer, Idea, TaskType, TaskPriority, TaskStatus } from '../types';

export const initialCustomers: Customer[] = [
  { id: 'cust-1', name: 'ישראלה ישראלי', email: 'israela@example.com' },
  { id: 'cust-2', name: 'משה כהן', email: 'moshe@example.com' },
  { id: 'cust-3', name: 'חברת הייטק בע"מ', email: 'contact@hightech.co.il' },
];

export const initialProjects: Project[] = [
  { id: 'proj-1', title: 'פיתוח אפליקציה חדשה', description: 'אפליקציית מובייל לניהול הוצאות.' },
  { id: 'proj-2', title: 'קמפיין שיווקי Q3', description: 'השקת קמפיין ברשתות החברתיות.' },
  { id: 'proj-3', title: 'אתר תדמית חדש', description: 'שדרוג האתר הישן לעיצוב מודרני ורספונסיבי.' },
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'עיצוב מסכי אפליקציה',
    description: 'עיצוב ממשק משתמש ב-Figma',
    type: TaskType.BUSINESS,
    customerId: 'cust-3',
    projectId: 'proj-1',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    priority: TaskPriority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'פגישת אפיון עם לקוח',
    type: TaskType.BUSINESS,
    customerId: 'cust-1',
    projectId: 'proj-3',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    priority: TaskPriority.URGENT,
    status: TaskStatus.TODO,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'לקבוע תור לרופא שיניים',
    type: TaskType.PERSONAL,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    priority: TaskPriority.NORMAL,
    status: TaskStatus.TODO,
    createdAt: new Date().toISOString(),
  },
    {
    id: 'task-4',
    title: 'לשלם חשבון חשמל',
    type: TaskType.PERSONAL,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    priority: TaskPriority.URGENT,
    status: TaskStatus.TODO,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'סיום פיתוח API',
    description: 'השלמת כל ה-endpoints הנדרשים לפרויקט',
    type: TaskType.BUSINESS,
    customerId: 'cust-3',
    projectId: 'proj-1',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    priority: TaskPriority.HIGH,
    status: TaskStatus.TODO,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-6',
    title: 'בדיקות QA לאתר החדש',
    type: TaskType.BUSINESS,
    projectId: 'proj-3',
    customerId: 'cust-1',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString(),
    priority: TaskPriority.NORMAL,
    status: TaskStatus.DONE,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
  },
   {
    id: 'task-7',
    title: 'הכנת תוכן לרשתות חברתיות',
    type: TaskType.BUSINESS,
    projectId: 'proj-2',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString(),
    priority: TaskPriority.NORMAL,
    status: TaskStatus.IN_PROGRESS,
    createdAt: new Date().toISOString(),
  },
];

export const initialIdeas: Idea[] = [
    {id: 'idea-1', title: 'פלטפורמת קורסים אונליין', description: 'ליצור מערכת שתאפשר למרצים להעלות ולמכור קורסים דיגיטליים במגוון נושאים.'},
    {id: 'idea-2', title: 'שירות משלוחי אוכל בריא', description: 'אפליקציה להזמנת ארוחות בריאות מוכנות עם תפריט משתנה מדי שבוע.'},
    // FIX: Removed a large block of erroneous text and replaced it with a valid 'Idea' object.
    {id: 'idea-3', title: 'מרקטפלייס לעבודות יד', description: 'פלטפורמה שתחבר בין אמנים ויוצרים לבין קהל שמחפש מוצרים ייחודיים בעבודת יד.'},
];
