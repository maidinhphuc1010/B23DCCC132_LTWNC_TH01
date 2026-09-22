export type Priority = 'low' | 'medium' | 'high';
export type AssignmentStatus = 'all' | 'pending' | 'overdue' | 'completed';

export interface Assignment {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  priority: Priority;
  completed: boolean;
}

export type NewAssignment = Omit<Assignment, 'id' | 'completed'>;

export const isPriority = (value: unknown): value is Priority =>
  value === 'low' || value === 'medium' || value === 'high';

export const isAssignment = (value: unknown): value is Assignment => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Assignment>;
  return (
    typeof item.id === 'string' &&
    typeof item.subject === 'string' &&
    typeof item.title === 'string' &&
    typeof item.dueDate === 'string' &&
    isPriority(item.priority) &&
    typeof item.completed === 'boolean'
  );
};

export const priorityLabels: Record<Priority, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
};
