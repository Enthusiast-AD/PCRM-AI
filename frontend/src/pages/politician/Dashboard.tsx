import { PoliticianLayout } from '@/layouts/PoliticianLayout';
import { StatCard } from '@/components/StatCard';
import { WARDS } from '@/data/mock';
import { ClipboardList, Clock, AlertCircle, CheckCircle2, MapPin, Calendar, User, Sparkles } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';
import { useAIChat } from '@/contexts/AIChatContext';
import { useEffect, useState } from 'react';
import { apiClient } from '@/services/apiClient';
import { Task, TaskPriority, TaskStatus } from '@/types';

const STATUS_COLORS = ['hsl(220,10%,58%)', 'hsl(210,80%,52%)', 'hsl(33,90%,55%)', 'hsl(152,60%,40%)', 'hsl(0,72%,51%)'];

const PoliticianDashboard = () => {
  const { openChat } = useAIChat();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await apiClient.getComplaints();
        if (response.data) {
          const mappedTasks = response.data.map((c: any) => ({
            id: c.id,
            title: c.ticket_id,
            description: c.summary || c.raw_text,
            ward: c.ward_id || 'Unknown', // Ideally fetch ward name
            location: c.ward_id || 'Unknown',
            category: c.category,
            priority: mapPriority(c.priority),
            status: c.status.toLowerCase() as TaskStatus,
            ai_overview: c.ai_overview,
            suggested_action: c.suggested_action,
            subcategory: c.subcategory,
            priority_reason: c.priority_reason,
            publishedToPublic: c.publishedToPublic || false,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            assignment: c.assigned_to
          }));
          setTasks(mappedTasks);
        }
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComplaints();
  }, []);

  const mapPriority = (p: number): TaskPriority => {
    if (p >= 5) return 'urgent';
    if (p === 4) return 'high';
    if (p === 3) return 'medium';
    return 'low';
  };

  const totalTasks = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'awaiting-approval').length;
  const completed = tasks.filter(t => t.status === 'completed').length;

  const statusData = [
    { name: 'New', value: tasks.filter(t => t.status === 'new').length },
    { name: 'In Progress', value: inProgress },
    { name: 'Awaiting', value: pending },
    { name: 'Completed', value: completed },
    { name: 'Rejected', value: tasks.filter(t => t.status === 'rejected').length },
  ].filter(d => d.value > 0);

  const wardData = WARDS.map(w => ({
    name: w.replace('Ward ', 'W').split(' - ')[0],
    tasks: tasks.filter(t => t.ward === w).length, // Note: backend returns ID, frontend mock uses name. Need to align this eventually.
  }));


  return (
    <PoliticianLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of constituency work</p>
        </div>

        <AIInsightsCard page="dashboard" title="Priority actions for today" onAskFollowUp={openChat} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Assigned" value={totalTasks} icon={ClipboardList} />
          <StatCard title="In Progress" value={inProgress} icon={Clock} />
          <StatCard title="Pending Approval" value={pending} icon={AlertCircle} />
          <StatCard title="Completed" value={completed} icon={CheckCircle2} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="stat-card">
            <h3 className="font-semibold mb-4">Works by Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="font-semibold mb-4">Works by Ward</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Complaints List */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Recent Complaints</h2>
          {loading ? <p>Loading complaints...</p> : tasks.length === 0 ? <p className="text-muted-foreground">No recent complaints found.</p> : 
            [...tasks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map(task => (
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
                    </div>
                  )}

                  {!task.ai_overview && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{task.ward}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(task.createdAt).toLocaleDateString()}</span>
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

export default PoliticianDashboard;
