import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { KeyRound, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Invalid email or password. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Invalid email or password. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-12 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundImage: "url('/auth_bg.jpg')" }}
    >
      {/* Background Ambient Darkener Overlay */}
      <div className="absolute inset-0 bg-primary-950/45 backdrop-blur-[3px] z-0"></div>

      <div className="w-full max-w-md glass-premium p-8 rounded-[2rem] shadow-2xl z-10 border border-white/15 dark:border-white/5">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight">Welcome Back</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
            Enter details to access your matches and teams
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-start space-x-2 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-gray-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-3d-glow bg-primary-650 hover:bg-primary-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Create one free
          </Link>
        </p>

        {/* Demo Credentials alert */}
        <div className="mt-8 p-4 bg-primary-50 dark:bg-slate-700/50 border border-primary-100 dark:border-slate-650 rounded-2xl text-xs shadow-sm">
          <p className="font-bold text-primary-800 dark:text-primary-300 mb-2 flex items-center">
            <span className="material-icons text-base mr-1">bolt</span>
            One-Click Demo Login Personas:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('admin@teamup.com', 'password')}
              className="py-2 px-3 bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-slate-700 hover:scale-[1.03] active:scale-[0.98] border border-primary-200 rounded-xl font-bold text-[10px] text-primary-750 transition-all flex items-center justify-center space-x-1 shadow-sm"
            >
              <span>🔑 Admin Console</span>
            </button>
            <button
              onClick={() => handleQuickLogin('owner@teamup.com', 'password')}
              className="py-2 px-3 bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-slate-700 hover:scale-[1.03] active:scale-[0.98] border border-primary-200 rounded-xl font-bold text-[10px] text-primary-750 transition-all flex items-center justify-center space-x-1 shadow-sm"
            >
              <span>🏟️ Ground Owner</span>
            </button>
            <button
              onClick={() => handleQuickLogin('rahul@teamup.com', 'password')}
              className="py-2 px-3 bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-slate-700 hover:scale-[1.03] active:scale-[0.98] border border-primary-200 rounded-xl font-bold text-[10px] text-primary-750 transition-all flex items-center justify-center space-x-1 shadow-sm"
            >
              <span>👤 Player (Rahul)</span>
            </button>
            <button
              onClick={() => handleQuickLogin('amit@teamup.com', 'password')}
              className="py-2 px-3 bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-slate-700 hover:scale-[1.03] active:scale-[0.98] border border-primary-200 rounded-xl font-bold text-[10px] text-primary-750 transition-all flex items-center justify-center space-x-1 shadow-sm"
            >
              <span>👤 Player (Amit)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
