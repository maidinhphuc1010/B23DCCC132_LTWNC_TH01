import { useMemo, useState } from 'react';
import type { Assignment, AssignmentStatus } from './types';

export const getDateDiff = (dueDate: string, today = new Date()): number => {
  const due = new Date(`${dueDate}T23:59:59`);
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
};

export const useAssignmentFilters = (assignments: Assignment[]) => {
  const [status, setStatus] = useState<AssignmentStatus>('all');
  const filteredAssignments = useMemo(() => assignments.filter((assignment) => {
    const overdue = !assignment.completed && getDateDiff(assignment.dueDate) < 0;
    if (status === 'completed') return assignment.completed;
    if (status === 'pending') return !assignment.completed && !overdue;
    if (status === 'overdue') return overdue;
    return true;
  }), [assignments, status]);
  return { status, setStatus, filteredAssignments };
};
