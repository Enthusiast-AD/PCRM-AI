import { PoliticianLayout } from '@/layouts/PoliticianLayout';
import { WARDS, monthlyCompletions } from '@/data/mock';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Clock, TrendingUp, XCircle } from 'lucide-react';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';
import { useAIChat } from '@/contexts/AIChatContext';
import { useState, useEffect } from 'react';
import { apiClient } from '@/services/apiClient';
import { Task, TaskStatus, TaskPriority } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  'New': 'hsl(220, 10%, 58%)',
  'In Progress': 'hsl(210, 80%, 52%)',
  'Awaiting Approval': 'hsl(33, 90%, 55%)',
  'Completed': 'hsl(152, 60%, 40%)',
  'Rejected': 'hsl(0, 72%, 51%)',
};

const mapPriority = (p: number): TaskPriority => {
  if (p >= 5) return 'urgent';
  if (p === 4) return 'high';
  if (p === 3) return 'medium';
  return 'low';
};

const Analytics = () => {
  const { openChat } = useAIChat();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getComplaints();
        if (response.data) {
          setTasks(response.data.map((c: any) => ({
            id: c.id,
            title: c.ticket_id,
            description: c.summary || c.raw_text,
            ward: c.ward_id || 'Unknown',
            category: c.category || 'Unclassified',
            priority: mapPriority(c.priority),
            status: c.status.toLowerCase() as TaskStatus,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            completedAt: c.resolved_at,
          })));
        }
      } catch (err) {
        console.error('Analytics fetch failed', err);
      }
    };
    fetchData();
  }, []);

  // Pie chart data
  const statusData = [
    { name: 'New', value: tasks.filter(t => t.status === 'new').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length },
    { name: 'Awaiting Approval', value: tasks.filter(t => t.status === 'awaiting-approval').length },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length },
    { name: 'Rejected', value: tasks.filter(t => t.status === 'rejected').length },
  ].filter(d => d.value > 0);

  // Bar chart - tasks by ward
  const wardData = WARDS.map(w => ({
    name: w.split(' - ')[1] || w,
    total: tasks.filter(t => t.ward === w).length,
    completed: tasks.filter(t => t.ward === w && t.status === 'completed').length,
  }));

  // KPIs
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const approvedCount = completedTasks.length;
  const rejectedCount = tasks.filter(t => t.status === 'rejected').length;
  const totalDecisions = approvedCount + rejectedCount;
  const approvalRate = totalDecisions > 0 ? Math.round((approvedCount / totalDecisions) * 100) : 0;
  const rejectionRate = totalDecisions > 0 ? Math.round((rejectedCount / totalDecisions) * 100) : 0;

  const avgDays = completedTasks.length > 0
    ? Math.round(completedTasks.reduce((sum, t) => {
        const start = new Date(t.createdAt).getTime();
        const end = new Date(t.completedAt || t.updatedAt).getTime();
        return sum + (end - start) / (1000 * 60 * 60 * 24);
      }, 0) / completedTasks.length)
    : 0;

  return (
    <PoliticianLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Performance insights across the constituency</p>
        </div>

        <AIInsightsCard page="analytics" title="Plain-language summary of your data" onAskFollowUp={openChat} />

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. Completion Time</p>
              <p className="text-2xl font-bold">{avgDays} days</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(152 60% 40% / 0.12)' }}>
              <TrendingUp className="h-5 w-5" style={{ color: 'hsl(152, 60%, 40%)' }} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approval Rate</p>
              <p className="text-2xl font-bold">{approvalRate}%</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(0 72% 51% / 0.12)' }}>
              <XCircle className="h-5 w-5" style={{ color: 'hsl(0, 72%, 51%)' }} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rejection Rate</p>
              <p className="text-2xl font-bold">{rejectionRate}%</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Tasks by Ward */}
          <div className="stat-card">
            <h3 className="font-semibold mb-4">Tasks by Ward</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total" />
                  <Bar dataKey="completed" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tasks by Status - Pie Chart */}
          <div className="stat-card">
            <h3 className="font-semibold mb-4">Tasks by Status</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Line Chart - Monthly Completions (static reference data) */}
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Works Completed per Month (Last 6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyCompletions}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary table */}
        <div className="stat-card overflow-x-auto">
          <h3 className="font-semibold mb-4">Summary by Ward</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium text-muted-foreground">Ward</th>
                <th className="pb-2 font-medium text-muted-foreground text-center">Total</th>
                <th className="pb-2 font-medium text-muted-foreground text-center">Completed</th>
                <th className="pb-2 font-medium text-muted-foreground text-center">In Progress</th>
                <th className="pb-2 font-medium text-muted-foreground text-center">Completion %</th>
              </tr>
            </thead>
            <tbody>
              {WARDS.map(w => {
                const total = tasks.filter(t => t.ward === w).length;
                const done = tasks.filter(t => t.ward === w && t.status === 'completed').length;
                const ip = tasks.filter(t => t.ward === w && t.status === 'in-progress').length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <tr key={w} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">{w}</td>
                    <td className="py-2.5 text-center">{total}</td>
                    <td className="py-2.5 text-center font-medium" style={{ color: 'hsl(152, 60%, 40%)' }}>{done}</td>
                    <td className="py-2.5 text-center font-medium" style={{ color: 'hsl(210, 80%, 52%)' }}>{ip}</td>
                    <td className="py-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-secondary rounded-full">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PoliticianLayout>
  );
};

export default Analytics;
