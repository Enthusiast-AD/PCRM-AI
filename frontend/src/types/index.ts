export type UserRole = 'politician' | 'worker';

export type TaskStatus = 'new' | 'in-progress' | 'awaiting-approval' | 'completed' | 'rejected';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  ward?: string;
  avatar?: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  note: string;
  progress: number;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  ward: string;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  assignedWorker: string;
  assignedWorkerName: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  images: string[];
  workerNotes?: string;
  proofImages?: string[];
  politicianFeedback?: string;
  publishedToPublic: boolean;
  activityLog?: ActivityLogEntry[];
  attachments?: FileAttachment[];
  
  // AI fields
  ai_overview?: string;
  suggested_action?: string;
  suggested_assignee_role?: string;
  subcategory?: string;
  priority_reason?: string;
  ticket_id?: string;
  raw_text?: string;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  ward: string;
  activeTasks: number;
  completedTasks: number;
  avatar?: string;
  avgCompletionDays?: number;
}

export interface Update {
  id: string;
  taskId: string;
  taskTitle: string;
  location: string;
  ward: string;
  description: string;
  status: TaskStatus;
  completedAt: string;
  images: string[];
}
