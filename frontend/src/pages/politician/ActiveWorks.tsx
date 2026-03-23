import { useState, useEffect } from 'react';
import { PoliticianLayout } from '@/layouts/PoliticianLayout';
import { WARDS, CATEGORIES } from '@/data/mock';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Search, MapPin, Calendar, User, X, Sparkles, BrainCircuit } from 'lucide-react';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';
import { useAIChat } from '@/contexts/AIChatContext';
import { apiClient } from '@/services/apiClient';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { Input } from '@/components/ui/input';

const ActiveWorks = () => {
  const { openChat } = useAIChat();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiClient.getComplaints();
        if (response.data) {
          const mappedTasks = response.data.map((c: any) => ({
            id: c.id,
            title: c.ticket_id,
            description: c.summary || c.raw_text,
            ward: c.ward_id || 'Unknown', 
            location: c.ward_id || 'Unknown',
            category: c.category || 'Unclassified',
            priority: mapPriority(c.priority),
            status: c.status.toLowerCase() as TaskStatus,
            deadline: c.sla_deadline ? new Date(c.sla_deadline).toLocaleDateString() : 'No deadline',
            assignedWorkerName: 'Unassigned',
            ai_overview: c.ai_overview,
            suggested_action: c.suggested_action,
            suggested_assignee_role: c.suggested_assignee_role,
            subcategory: c.subcategory,
            priority_reason: c.priority_reason,
            progress: c.status === 'Completed' ? 100 : c.status === 'In Progress' ? 50 : c.status === 'Awaiting Approval' ? 90 : 0
          }));
          setTasks(mappedTasks);
        }
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const mapPriority = (p: number): TaskPriority => {
    if (p >= 5) return 'urgent';
    if (p === 4) return 'high';
    if (p === 3) return 'medium';
    return 'low';
  };

  const hasFilters = search || wardFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setWardFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
  };

  const filtered = tasks.filter(t => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.assignedWorkerName.toLowerCase().includes(q)) return false;
    }
    if (wardFilter !== 'all' && t.ward !== wardFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });

  return (
    <PoliticianLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Active Works</h1>
          <p className="text-sm text-muted-foreground">All tasks across the constituency</p>
        </div>

        <AIInsightsCard page="active-works" title="Overdue or stalled task alerts" onAskFollowUp={openChat} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-full pl-9"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={wardFilter} onChange={e => setWardFilter(e.target.value)}>
            <option value="all">All Wards</option>
            {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="awaiting-approval">Awaiting Approval</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground border rounded-md px-3 py-2 transition-colors">
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {loading ? <p>Loading tasks...</p> : filtered.length === 0 ? <p className="text-muted-foreground">No tasks found matching filters.</p> : 
            filtered.map(task => (
            <div key={task.id} className="stat-card">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground">
                      {task.category}
                    </span>
                  </div>
                  
                  {/* AI Overview Section */}
                  {task.ai_overview && (
                    <div className="mb-3 bg-accent/10 p-3 rounded-md border border-accent/20">
                      <div className="flex items-center gap-1.5 text-accent font-medium text-sm mb-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Overview
                      </div>
                      <p className="text-sm text-foreground/90">{task.ai_overview}</p>
                      {task.suggested_action && (
                         <div className="mt-2 text-xs text-muted-foreground flex justify-between gap-4">
                            <div>
                              <span className="font-medium text-foreground">Suggested Action: </span> 
                              {task.suggested_action}
                            </div>
                            {task.suggested_assignee_role && (
                              <div className="shrink-0 text-right">
                                <span className="font-medium text-foreground">Assign To: </span>
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                  {task.suggested_assignee_role}
                                </span>
                              </div>
                            )}
                         </div>
                      )}
                    </div>
                  )}

                  {!task.ai_overview && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{task.assignedWorkerName}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{task.ward}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Due: {task.deadline}</span>
                  </div>

                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{task.progress}%</p>
                    <div className="w-20 h-1.5 bg-secondary rounded-full mt-1">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PoliticianLayout>
  );
};

export default ActiveWorks;
