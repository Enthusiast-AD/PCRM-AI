import { useState } from 'react';
import { PoliticianLayout } from '@/layouts/PoliticianLayout';
import { POLITICIAN } from '@/data/mock';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { User, Globe, Bell, Sun, Moon, LogOut, ShieldAlert } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: user?.name || POLITICIAN.name,
    constituency: POLITICIAN.constituency,
  });
  const [notifications, setNotifications] = useState({
    taskCompletion: true,
    newWorkerRegistration: false,
  });
  const [publicDashboard, setPublicDashboard] = useState({
    enabled: true,
    welcomeMessage: 'Welcome to our constituency transparency portal. Track development work in real-time.',
  });

  const inputClass = "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  const handleSave = () => toast.success('Settings saved successfully');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SectionHeader = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{label}</h3>
    </div>
  );

  return (
    <PoliticianLayout>
      <div className="max-w-2xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
        </div>

        {/* Profile */}
        <div className="stat-card space-y-4">
          <SectionHeader icon={User} label="Profile" />
          <div>
            <label className="block text-sm font-medium mb-1.5">Name</label>
            <input className={inputClass} value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Constituency</label>
            <input className={inputClass} value={profile.constituency} onChange={e => setProfile({ ...profile, constituency: e.target.value })} />
          </div>
        </div>

        {/* Appearance */}
        <div className="stat-card space-y-4">
          <SectionHeader icon={theme === 'dark' ? Moon : Sun} label="Appearance" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Currently: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium hover:bg-secondary transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="stat-card space-y-4">
          <SectionHeader icon={Bell} label="Notifications" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Task completion alerts</p>
              <p className="text-xs text-muted-foreground">Get notified when workers complete tasks</p>
            </div>
            <Switch checked={notifications.taskCompletion} onCheckedChange={v => setNotifications({ ...notifications, taskCompletion: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">New worker registration</p>
              <p className="text-xs text-muted-foreground">Get notified when new workers join</p>
            </div>
            <Switch checked={notifications.newWorkerRegistration} onCheckedChange={v => setNotifications({ ...notifications, newWorkerRegistration: v })} />
          </div>
        </div>

        {/* Public Dashboard */}
        <div className="stat-card space-y-4">
          <SectionHeader icon={Globe} label="Public Dashboard" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable public portal</p>
              <p className="text-xs text-muted-foreground">Allow citizens to view the transparency portal</p>
            </div>
            <Switch checked={publicDashboard.enabled} onCheckedChange={v => setPublicDashboard({ ...publicDashboard, enabled: v })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Welcome Message</label>
            <textarea className={inputClass + ' min-h-[80px]'} value={publicDashboard.welcomeMessage} onChange={e => setPublicDashboard({ ...publicDashboard, welcomeMessage: e.target.value })} />
          </div>
        </div>

        <button onClick={handleSave} className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium text-sm hover:opacity-90 transition-opacity">
          Save Settings
        </button>

        {/* Logout / Danger Zone */}
        <div className="stat-card space-y-4 border-destructive/30">
          <SectionHeader icon={ShieldAlert} label="Account" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sign out</p>
              <p className="text-xs text-muted-foreground">You will be redirected to the login page</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </PoliticianLayout>
  );
};

export default Settings;
