import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  User,
  UserPlus,
  ArrowRight,
  Zap,
  Shield,
  FileText,
  Activity,
  LockKeyhole,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { isE2EESupported } from '../utils/crypto';

export const LoginPage: React.FC = () => {
  const { loginUser } = useStore();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form states
  const [email, setEmail] = useState('alex.finops@enterprise.com');
  const [password, setPassword] = useState('admin123');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('ADMIN');
  const [regDept, setRegDept] = useState('Financial Operations');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const demoAccounts = [
    { name: 'Alex Vance', role: 'ADMIN', title: 'VP Financial Operations', email: 'alex.finops@enterprise.com', color: 'from-blue-600 to-cyan-500' },
    { name: 'Sarah Connor', role: 'MANAGER', title: 'Finance & Approvals Lead', email: 'sarah.manager@enterprise.com', color: 'from-emerald-600 to-teal-500' },
    { name: 'David Miller', role: 'FRAUD_ANALYST', title: 'Lead Risk & Fraud Officer', email: 'david.fraud@enterprise.com', color: 'from-rose-600 to-amber-500' },
    { name: 'Elena Rostova', role: 'COMPLIANCE_OFFICER', title: 'Head of Regulatory Audits', email: 'elena.compliance@enterprise.com', color: 'from-purple-600 to-indigo-500' },
  ];

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await api.login(email, password);
      loginUser(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!regName || !regEmail || !regPassword) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        department: regDept,
      });
      setSuccessMessage(`Account created successfully! Logging you in as ${res.user.role}...`);
      setTimeout(() => {
        loginUser(res.user, res.token);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickLogin = async (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword('admin123');
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await api.login(acc.email, 'admin123');
      loginUser(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-center relative overflow-hidden font-sans">
      {/* Ambient background glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Panel: Enterprise Platform Hero & Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-blue-500/25">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-2xl tracking-tight text-white">Agentic FinOps</span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-cyan-500/30">
                    Enterprise AI
                  </span>
                </div>
                <p className="text-xs text-slate-400">Autonomous Financial Operations & Agent Swarm System</p>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Empowering Financial Teams with{' '}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
                  Autonomous Intelligence
                </span>
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                Real-time multi-agent orchestration for instant refund processing, fraud anomaly prevention, automated approval routing, and RBI compliance verification.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Multi-Agent Swarm</h4>
                  <p className="text-[11px] text-slate-400">Collaborative AI agents process tickets & refunds in seconds.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Real-Time Fraud Engine</h4>
                  <p className="text-[11px] text-slate-400">Instant velocity detection & risk score calculation.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">RAG Compliance Engine</h4>
                  <p className="text-[11px] text-slate-400">Automatic policy checks against regulatory frameworks.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cryptographic Audit Logs</h4>
                  <p className="text-[11px] text-slate-400">SHA-256 tamper-proof log trail for human governance.</p>
                </div>
              </div>
            </div>

            {/* Platform Status */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-300">Operational</span>
              </div>
              <span>•</span>
              <span>WebSocket Stream Active</span>
              <span>•</span>
              <span>RBAC Enforced</span>
              <span>•</span>
              {/* E2EE Live Status */}
              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                <LockKeyhole className="w-3 h-3 text-cyan-400" />
                <span className="font-bold text-cyan-400">
                  {isE2EESupported() ? 'E2EE Active — AES-256-GCM' : 'E2EE Unavailable'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Login Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/40 backdrop-blur-xl relative overflow-hidden">
              
              {/* Header & Tabs */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-white">
                      {mode === 'LOGIN' ? 'Sign In to Workspace' : 'Create Enterprise Account'}
                    </h2>
                    <p className="text-xs text-slate-400">Enter your credentials or choose a demo profile</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                      <Lock className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* E2EE Security Status Banner */}
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-semibold ${
                  isE2EESupported()
                    ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-400'
                    : 'bg-yellow-950/30 border-yellow-500/30 text-yellow-400'
                }`}>
                  <LockKeyhole className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isE2EESupported()
                      ? '🔐 End-to-End Encrypted — AES-256-GCM · PBKDF2 (310k iters) · Encrypted Storage'
                      : '⚠️ E2EE unavailable in this browser context'}
                  </span>
                </div>

                {/* Tab Switcher */}
                <div className="p-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-1">
                  <button
                    onClick={() => { setMode('LOGIN'); setError(''); }}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs transition ${
                      mode === 'LOGIN'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMode('REGISTER'); setError(''); }}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs transition ${
                      mode === 'REGISTER'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {mode === 'LOGIN' ? (
                <>
                  {/* One-Click Enterprise User Profiles */}
                  <div className="mb-6 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Instant Demo Sign-In</span>
                      <span className="text-[10px] text-cyan-400 font-semibold">Select Profile →</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {demoAccounts.map((acc, idx) => (
                        <button
                          key={idx}
                          disabled={loading}
                          onClick={() => handleOneClickLogin(acc)}
                          className="p-3 rounded-xl border border-slate-800/90 bg-slate-950/70 hover:bg-slate-800/80 hover:border-blue-500/50 text-left transition group relative overflow-hidden"
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${acc.color} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                              {acc.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div className="overflow-hidden">
                              <div className="font-bold text-xs text-white truncate group-hover:text-cyan-400 transition">{acc.name}</div>
                              <div className="text-[9px] font-semibold text-slate-400 truncate">{acc.role}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-slate-900 px-3 text-slate-500 font-semibold">or login with credentials</span>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                      <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                        {error}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="user@enterprise.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">Password</label>
                        <span className="text-[10px] text-blue-400 hover:underline cursor-pointer">Forgot password?</span>
                      </div>
                      <div className="relative">
                        <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-blue-500/25 disabled:opacity-50 transition flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <span>Authenticating...</span>
                      ) : (
                        <>
                          <span>Enter FinOps Workspace</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegister} className="space-y-3">
                  {error && (
                    <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                      {error}
                    </div>
                  )}
                  {successMessage && (
                    <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      {successMessage}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="John Smith"
                        required
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Work Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="john.smith@enterprise.com"
                        required
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Enterprise Role</label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="FINANCE">FINANCE</option>
                        <option value="FRAUD_ANALYST">FRAUD_ANALYST</option>
                        <option value="COMPLIANCE_OFFICER">COMPLIANCE_OFFICER</option>
                        <option value="SUPPORT">SUPPORT</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Department</label>
                      <input
                        type="text"
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value)}
                        placeholder="Financial Ops"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-teal-500/20 disabled:opacity-50 transition flex items-center justify-center space-x-2 mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{loading ? 'Registering...' : 'Create Account & Sign In'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
