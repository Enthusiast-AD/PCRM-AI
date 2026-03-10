import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Loader2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        // User role is determined from API response and stored in context
        navigate('/politician/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Constituency Work Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage constituency work</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-3">Demo Credentials</p>
          
          <div className="space-y-3">
            {/* Politician */}
            <div className="bg-white dark:bg-blue-900 rounded p-2.5">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Politician</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Email: <span className="font-mono text-gray-800 dark:text-gray-200">rajesh@example.com</span></p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Password: <span className="font-mono text-gray-800 dark:text-gray-200">password</span></p>
            </div>

            {/* Worker */}
            <div className="bg-white dark:bg-blue-900 rounded p-2.5">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Worker</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Email: <span className="font-mono text-gray-800 dark:text-gray-200">amit@example.com</span></p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Password: <span className="font-mono text-gray-800 dark:text-gray-200">password</span></p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone or Email</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your phone number or email"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Enter your phone number (or email) and password to log in
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
