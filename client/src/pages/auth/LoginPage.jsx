import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Stethoscope, User, UserPlus } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectUrl = searchParams.get('redirect');
  const isExpired = searchParams.get('expired');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);

      // Role redirection
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        switch (user.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'doctor':
            navigate('/doctor/dashboard');
            break;
          case 'receptionist':
            navigate('/receptionist/dashboard');
            break;
          default:
            navigate('/patient/dashboard');
            break;
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header */}
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Aura<span className="text-brand-600">Health</span>
              </span>
            </Link>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Hospital Portal Sign In
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Enter your credentials to access your clinical or patient dashboard
            </p>

            {isExpired && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                Your session has expired. Please sign in again.
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 mb-4 p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hospital.com"
                    className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              <Button
                variant="primary"
                type="submit"
                size="lg"
                isLoading={loading}
                className="w-full shadow-lg shadow-brand-500/20 mt-2"
              >
                Sign In to Portal
              </Button>
            </form>
          </div>

          {/* Register Footer */}
          <div className="pt-6 border-t border-slate-100 text-xs text-center text-slate-500">
            Don't have a patient account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Register now
            </Link>
          </div>
        </div>

        {/* Right Info & 1-Click Demo Accounts */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-4">
              <span>Quick Review Access</span>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight mb-2">
              1-Click Demo Accounts
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Click any role below to pre-fill verified demo credentials with full permissions:
            </p>

            <div className="space-y-2.5">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@hospital.com', 'Password@123')}
                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all hover:border-brand-500 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">
                      Admin Portal
                    </h4>
                    <p className="text-[11px] text-slate-400">admin@hospital.com</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-white">Auto-fill →</span>
              </button>

              {/* Doctor Button */}
              <button
                type="button"
                onClick={() => fillDemoAccount('doctor@hospital.com', 'Password@123')}
                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all hover:border-brand-500 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">
                      Doctor / Physician
                    </h4>
                    <p className="text-[11px] text-slate-400">doctor@hospital.com</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-white">Auto-fill →</span>
              </button>

              {/* Receptionist Button */}
              <button
                type="button"
                onClick={() => fillDemoAccount('receptionist@hospital.com', 'Password@123')}
                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all hover:border-brand-500 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">
                      Receptionist / Front Desk
                    </h4>
                    <p className="text-[11px] text-slate-400">receptionist@hospital.com</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-white">Auto-fill →</span>
              </button>

              {/* Patient Button */}
              <button
                type="button"
                onClick={() => fillDemoAccount('patient@hospital.com', 'Password@123')}
                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all hover:border-brand-500 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">
                      Patient Portal
                    </h4>
                    <p className="text-[11px] text-slate-400">patient@hospital.com</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-white">Auto-fill →</span>
              </button>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800 text-[11px] text-slate-500">
            <p>Demo Password: <span className="text-slate-300 font-mono">Password@123</span></p>
            <p className="mt-0.5">Role-based access is strictly enforced at backend API boundaries.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
