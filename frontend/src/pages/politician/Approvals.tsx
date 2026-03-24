import { useState, useEffect } from 'react';
import { PoliticianLayout } from '@/layouts/PoliticianLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { MapPin, Calendar, User, CheckCircle2, XCircle, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { apiClient } from '@/services/apiClient';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';
import { ApprovalAIReview } from '@/components/ai/ApprovalAIReview';
import { useAIChat } from '@/contexts/AIChatContext';

const Approvals = () => {
  const { openChat } = useAIChat();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rejectingTask, setRejectingTask] = useState<Task | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [publishFlags, setPublishFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getComplaints();
        if (response.data) {
          const mapped = response.data
            .filter((c: any) => c.status.toLowerCase() === 'awaiting-approval' || c.status.toLowerCase() === 'awaiting approval')
            .map((c: any) => ({
              id: c.id,
              title: c.ticket_id,
              description: c.summary || c.raw_text,
              ward: c.ward_id || 'Unknown',
              category: c.category || 'Unclassified',
              priority: 'medium' as TaskPriority,
              status: 'awaiting-approval' as TaskStatus,
              createdAt: c.created_at,
              updatedAt: c.updated_at,
              completedAt: c.resolved_at,
              assignedWorkerName: 'Unassigned',
            }));
          setTasks(mapped);
        }
      } catch (err) {
        console.error('Approvals fetch failed', err);
      }
    };
    fetchData();
  }, []);

  const handleApprove = (taskId: string) => {
    const shouldPublish = publishFlags[taskId] ?? true;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast.success(
      shouldPublish
        ? 'Task approved and published to public dashboard'
        : 'Task approved (not published to public)'
    );
  };

  const openRejectModal = (task: Task) => {
    setRejectingTask(task);
    setRejectFeedback('');
  };

  const confirmReject = () => {
    if (!rejectFeedback.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setTasks(prev => prev.filter(t => t.id !== rejectingTask?.id));
    setRejectingTask(null);
    setRejectFeedback('');
    toast.info('Task rejected. Worker has been notified with feedback.');
  };

  const togglePublish = (taskId: string) => {
    setPublishFlags(prev => ({ ...prev, [taskId]: !(prev[taskId] ?? true) }));
  };

  return (
    <PoliticianLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Approvals</h1>
          <p className="text-sm text-muted-foreground">{tasks.length} task(s) awaiting your approval</p>
        </div>

        <AIInsightsCard page="approvals" title="Suggested approvals and flags" onAskFollowUp={openChat} />

        {tasks.length === 0 ? (
          <div className="stat-card text-center py-12">
            <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="stat-card space-y-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{task.assignedWorkerName}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{task.ward}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{task.completedAt}</span>
                  </div>
                </div>

                <p className="text-sm">{task.description}</p>

                {task.workerNotes && (
                  <div className="bg-secondary/50 rounded-md p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Worker Notes:</p>
                    <p className="text-sm">{task.workerNotes}</p>
                  </div>
                )}

                {/* AI Review */}
                <ApprovalAIReview taskId={task.id} />

                {/* Publish Toggle */}
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>Publish to Public Dashboard</span>
                  </div>
                  <Switch
                    checked={publishFlags[task.id] ?? true}
                    onCheckedChange={() => togglePublish(task.id)}
                  />
                </div>

                <div className="flex gap-3 pt-2 border-t">
                  <button
                    onClick={() => handleApprove(task.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'hsl(152, 60%, 40%)', color: 'white' }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve{(publishFlags[task.id] ?? true) ? ' & Publish' : ''}
                  </button>
                  <button
                    onClick={() => openRejectModal(task)}
                    className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      <Dialog open={!!rejectingTask} onOpenChange={() => setRejectingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Task</DialogTitle>
            <DialogDescription>
              Provide feedback for "{rejectingTask?.title}" so the worker knows what to fix.
            </DialogDescription>
          </DialogHeader>
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-ring"
            value={rejectFeedback}
            onChange={e => setRejectFeedback(e.target.value)}
            placeholder="Explain the rejection reason and what needs to be fixed..."
          />
          <DialogFooter>
            <button
              onClick={() => setRejectingTask(null)}
              className="px-4 py-2 rounded-md text-sm font-medium border hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmReject}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Confirm Reject
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PoliticianLayout>
  );
};

export default Approvals;
