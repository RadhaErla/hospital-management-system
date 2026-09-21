import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Stethoscope, User, UserPlus } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
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
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200/80 shadow-dropdown overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header */}
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Aura<span className="text-brand-600">Health</span>
              </span>
            </Link>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
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
                className="w-full mt-2"
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

        {/* Right Info & 1-Click Demo Accounts (Light Healthcare Theme) */}
        <div className="lg:col-span-5 bg-slate-50/70 p-8 sm:p-10 text-slate-800 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-3">
              <span>Verified Test Accounts</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
              1-Click Demo Logins
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Click any clinical or patient role below to autofill verified demo credentials:
            </p>

            <div className="space-y-2.5">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@hospital.com', 'Password@123')}
                className="w-full p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-left transition-all hover:border-brand-400 shadow-soft flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                      Admin Portal
                    </h4>
                    <p className="text-[11px] text-slate-500">admin@hospital.com</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-brand-600">Autofill →</span>
              </button>

              {/* Doctor Button */}
              <button
                type="button"
                onClick={() => fillDemoAccount('doctor@hospital.com', 'Password@123')}
                className="w-full p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-left transition-all hover:border-brand-400 shadow-soft flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                      Doctor / Physician
                    </h4>
                    <p className="text-[11px] text-slate-500">doctor@hospital.com</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-brand-600">Autofill →</span>
              </button>

              {/* Receptionist Button */}
              <button
                type="button"
                onClick={() => fillDemoAccount('receptionist@hospital.com', 'Password@123')}
                className="w-full p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-left transition-all hover:border-brand-400 shadow-soft flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                      Receptionist / Front Desk
                    </h4>
                    <p className="text-[11px] text-slate-500">receptionist@hospital.com</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-brand-600">Autofill →</span>
              </button>

              {/* Patient Button */}
              <button
                type="button"
                onClick={() => fillDemoAccount('patient@hospital.com', 'Password@123')}
                className="w-full p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-left transition-all hover:border-brand-400 shadow-soft flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                      Patient Portal
                    </h4>
                    <p className="text-[11px] text-slate-500">patient@hospital.com</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-brand-600">Autofill →</span>
              </button>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-200/80 text-[11px] text-slate-500">
            <p>Demo Password: <span className="text-slate-800 font-mono font-semibold">Password@123</span></p>
            <p className="mt-0.5">Role-based access control is enforced at API endpoints.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
