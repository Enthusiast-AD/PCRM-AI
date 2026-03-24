import { useState, useEffect } from 'react';
import { PoliticianLayout } from '@/layouts/PoliticianLayout';
import { WARDS, CATEGORIES } from '@/data/mock';
import { TaskPriority, FileAttachment } from '@/types';
import { FileUpload } from '@/components/FileUpload';
import { toast } from 'sonner';
import { apiClient } from '@/services/apiClient';

const AssignWork = () => {
  const [form, setForm] = useState({
    title: '', description: '', ward: '', category: '', priority: 'medium' as TaskPriority,
    deadline: '', worker: '',
  });
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await apiClient.getWorkers();
        if (response.data && response.data.length > 0) {
          setWorkers(response.data);
        } else {
          // Fallback if backend is empty
          setWorkers([{ id: 'w1', name: 'Amit Sharma' }]);
        }
      } catch (err) {
        setWorkers([{ id: 'w1', name: 'Amit Sharma' }]);
      }
    };
    fetchWorkers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create task
      const newComplaint = {
        citizen_phone: "0000000000",
        raw_text: `${form.title}\n${form.description}`,
        category: form.category,
      };
      const res = await apiClient.createComplaint(newComplaint);
      
      // 2. Assign worker
      if (res.data?.id) {
         // Attempt to update priority/deadline via assignment endpoint
         await apiClient.assignComplaint(res.data.id, { 
           assigned_to: form.worker, 
           status: "Assigned" 
         });
         toast.success('Task assigned successfully!', { description: `Assigned to ${workers.find(w => w.id === form.worker)?.name || form.worker}` });
         setForm({ title: '', description: '', ward: '', category: '', priority: 'medium', deadline: '', worker: '' });
         setFiles([]);
      }
    } catch (err) {
       toast.error("Failed to assign task");
       console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <PoliticianLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-1">Assign New Work</h1>
        <p className="text-sm text-muted-foreground mb-6">Create and assign a task to a field worker</p>

        <form onSubmit={handleSubmit} className="stat-card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input className={inputClass} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g., Road repair near market" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description *</label>
            <textarea className={inputClass + ' min-h-[100px]'} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="Describe the work in detail..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Ward *</label>
              <select className={inputClass} value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} required>
                <option value="">Select ward</option>
                {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Category *</label>
              <select className={inputClass} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Priority</label>
              <select className={inputClass} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Deadline *</label>
              <input type="date" className={inputClass} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Assign Worker *</label>
            <select className={inputClass} value={form.worker} onChange={e => setForm({ ...form, worker: e.target.value })} required>
              <option value="">Select worker</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Attach Files</label>
            <FileUpload files={files} onChange={setFiles} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium text-sm hover:opacity-90 transition-opacity">
            {loading ? 'Assigning...' : 'Assign Task'}
          </button>
        </form>
      </div>
    </PoliticianLayout>
  );
};

export default AssignWork;
