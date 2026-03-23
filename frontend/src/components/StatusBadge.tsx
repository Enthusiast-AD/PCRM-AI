import { TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  'new': { label: 'New', className: 'status-new' },
  'in-progress': { label: 'In Progress', className: 'status-in-progress' },
  'awaiting-approval': { label: 'Awaiting Approval', className: 'status-awaiting' },
  'completed': { label: 'Completed', className: 'status-completed' },
  'rejected': { label: 'Rejected', className: 'status-rejected' },
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  // Gracefully handle undefined or unknown statuses
  const safeStatus = (status || 'new').toLowerCase() as TaskStatus;
  const config = statusConfig[safeStatus] || statusConfig['new'];
  
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', config.className, className)}>
      {config.label}
    </span>
  );
}
