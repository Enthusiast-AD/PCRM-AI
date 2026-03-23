import { PublicLayout } from '@/layouts/PublicLayout';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { WARDS, CATEGORIES } from '@/data/mock';
import { CheckCircle2, Clock, AlertCircle, Users, MapPin, Calendar, Filter, BadgeCheck, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ComplaintForm } from "@/components/ComplaintForm";
import { apiClient } from "@/services/apiClient";
import { Task, TaskStatus } from "@/types";

const Index = () => {
  const [wardFilter, setWardFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const response = await apiClient.getPublicComplaints();
        if (response.data) {
          const mappedTasks = response.data.map((c: any) => ({
            id: c.id,
            title: c.ticket_id,
            description: c.ai_overview || c.summary || c.raw_text, // Use AI Overview primarily
            ward: c.ward_id || 'Unknown',
            location: c.ward_id || 'Unknown',
            category: c.category,
            priority: 'medium', // Default for public view or map if needed
            status: c.status.toLowerCase() as TaskStatus,
            ai_overview: c.ai_overview,
            publishedToPublic: true,
            completedAt: c.resolved_at ? new Date(c.resolved_at).toLocaleDateString() : undefined,
            createdAt: c.created_at
          }));
          setTasks(mappedTasks);

          // Derive updates from completed tasks or specific logic
          const recentUpdates = mappedTasks
            .filter((t: any) => t.status === 'completed')
            .slice(0, 5)
            .map((t: any) => ({
              id: t.id,
              taskId: t.id,
              taskTitle: t.title,
              location: t.location,
              ward: t.ward,
              description: t.description,
              status: t.status,
              completedAt: t.completedAt,
              images: []
            }));
          setUpdates(recentUpdates);
        }
      } catch (error) {
        console.error("Failed to fetch public data:", error);
      }
    };
    fetchPublicData();
  }, []);

  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'awaiting-approval').length;
  const total = tasks.length;

  // Only show published tasks on public dashboard
  const filteredTasks = tasks.filter(t => {
    if (wardFilter !== 'all' && t.ward !== wardFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <PublicLayout>
      {/* Hero section */}
      <section className="hero-section text-white py-20 lg:py-32">
        <div className="animated-blob bg-sidebar-ring/40 w-96 h-96 rounded-full top-0 left-10 pt-10"></div>
        <div className="animated-blob bg-secondary/20 w-80 h-80 rounded-full bottom-0 right-20" style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight animate-fade-in text-white/95">
            Your Voice, <span className="text-accent underline decoration-4 underline-offset-8">Amplified.</span>
          </h1>
          <p className="text-lg md:text-xl relative z-10 mb-10 max-w-2xl mx-auto opacity-90 text-zinc-100 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Directly connect with your local representative. Report issues, track progress, and build a better community together.
          </p>
          
          <div className="animate-fade-in flex justify-center pb-8" style={{ animationDelay: '0.2s' }}>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-xl hover:scale-105 transition-transform bg-accent text-accent-foreground border-border">
                  <FileText className="mr-2 h-5 w-5" />
                  File a Complaint
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] glass-panel max-h-[90vh] overflow-y-auto text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Submit a Grievance</DialogTitle>
                </DialogHeader>
                <ComplaintForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Hero stats */}
      <section className="bg-background relative -mt-8 z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}><StatCard title="Works Completed" value={completed} icon={CheckCircle2} /></div>
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}><StatCard title="In Progress" value={inProgress} icon={Clock} /></div>
            <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}><StatCard title="Pending Approval" value={pending} icon={AlertCircle} /></div>
            <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}><StatCard title="Total Projects" value={total} icon={Users} /></div>
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section id="updates" className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Latest Approved Updates</h2>
        {updates.length === 0 ? (
          <p className="text-muted-foreground">No updates yet.</p>
        ) : (
          <div className="space-y-4">
            {updates.map(update => (
              <div key={update.id} className="stat-card">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{update.taskTitle}</h3>
                      <StatusBadge status={update.status} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{update.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{update.completedAt}</span>
                    </div>
                    <p className="mt-2 text-sm">{update.description}</p>
                    {update.images && update.images.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {update.images.map((img: string, i: number) => (
                           <img key={i} src={img} alt="update" className="h-20 w-20 object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium shrink-0" style={{ color: 'hsl(152, 60%, 40%)' }}>
                    <BadgeCheck className="h-4 w-4" />
                    Approved by Politician
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Projects List - only published */}
      <section id="projects" className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Published Projects</h2>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select value={wardFilter} onChange={e => setWardFilter(e.target.value)} className="rounded-md border bg-card px-2 py-1.5 text-sm">
              <option value="all">All Wards</option>
              {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-md border bg-card px-2 py-1.5 text-sm">
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-md border bg-card px-2 py-1.5 text-sm">
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredTasks.map(task => (
            <div key={task.id} className="stat-card">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{task.title}</h3>
                <StatusBadge status={task.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{task.ward}</span>
                <span>{task.category}</span>
                {task.completedAt && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{task.completedAt}</span>}
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${task.progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{task.progress}% complete</p>
              </div>
            </div>
          ))}
        </div>
        {filteredTasks.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No published projects match your filters.</p>
        )}
      </section>
    </PublicLayout>
  );
};

export default Index;
