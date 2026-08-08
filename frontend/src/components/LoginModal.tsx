import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, Key, User, UserPlus, Building, Briefcase } from 'lucide-react';
import { api } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [email, setEmail] = useState('alex.finops@enterprise.com');
  const [password, setPassword] = useState('admin123');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('ADMIN');
  const [regDept, setRegDept] = useState('Financial Operations');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const demoAccounts = [
    { name: 'Alex Vance', role: 'ADMIN', email: 'alex.finops@enterprise.com' },
    { name: 'Sarah Connor', role: 'MANAGER', email: 'sarah.manager@enterprise.com' },
    { name: 'David Miller', role: 'FRAUD_ANALYST', email: 'david.fraud@enterprise.com' },
    { name: 'Elena Rostova', role: 'COMPLIANCE_OFFICER', email: 'elena.compliance@enterprise.com' },
  ];

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await api.login(email, password);
      localStorage.setItem('finops_auth_token', res.token);
      setSuccessMessage(`Authenticated as ${res.user.name} (${res.user.role})!`);
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
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
      setError('Please fill in Name, Email, and Password.');
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

      localStorage.setItem('finops_auth_token', res.token);
      setSuccessMessage(`Account created successfully for ${res.user.name}! Authenticated as ${res.user.role}.`);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const selectAccount = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword('admin123');
    setMode('LOGIN');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">
                {mode === 'LOGIN' ? 'Enterprise Authentication' : 'Create New User Account'}
              </h2>
              <p className="text-[10px] text-slate-400">Role-Based Access Control (RBAC)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-2">
          <button
            onClick={() => { setMode('LOGIN'); setError(''); }}
            className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
              mode === 'LOGIN' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('REGISTER'); setError(''); }}
            className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
              mode === 'REGISTER' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {mode === 'LOGIN' ? (
          <>
            {/* One-Click Login Cards */}
            <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                One-Click Login — Select Any Enterprise User
              </div>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    disabled={loading}
                    onClick={async () => {
                      setEmail(acc.email);
                      setPassword('admin123');
                      setLoading(true);
                      setError('');
                      setSuccessMessage('');
                      try {
                        const res = await api.login(acc.email, 'admin123');
                        localStorage.setItem('finops_auth_token', res.token);
                        setSuccessMessage(`✓ Signed in as ${res.user.name} (${res.user.role})`);
                        setTimeout(() => onClose(), 900);
                      } catch (err: any) {
                        setError(err.message || 'Login failed');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition group relative overflow-hidden ${
                      email === acc.email
                        ? 'border-blue-500 bg-blue-950/50 shadow-md shadow-blue-500/10'
                        : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800 hover:border-blue-500/40'
                    }`}
                  >
                    {/* Initials avatar */}
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-[10px] shrink-0 ${
                        acc.role === 'ADMIN' ? 'bg-blue-600' :
                        acc.role === 'MANAGER' ? 'bg-emerald-600' :
                        acc.role === 'FRAUD_ANALYST' ? 'bg-rose-600' :
                        'bg-purple-600'
                      }`}>
                        {acc.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white leading-tight truncate">{acc.name}</div>
                        <div className={`text-[9px] font-bold ${
                          acc.role === 'ADMIN' ? 'text-blue-400' :
                          acc.role === 'MANAGER' ? 'text-emerald-400' :
                          acc.role === 'FRAUD_ANALYST' ? 'text-rose-400' :
                          'text-purple-400'
                        }`}>{acc.role}</div>
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-500 group-hover:text-slate-300 transition">Click to sign in →</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="p-5 space-y-4">
              {error && <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}
              {successMessage && <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold">{successMessage}</div>}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-blue-500/20 disabled:opacity-50 transition"
              >
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              </button>
            </form>
          </>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="p-5 space-y-3">
            {error && <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}
            {successMessage && <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold">{successMessage}</div>}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. John Smith"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="john.smith@enterprise.com"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Choose password"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Enterprise Role</label>
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
                <label className="text-[11px] font-semibold text-slate-300">Department</label>
                <input
                  type="text"
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                  placeholder="Department"
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
              <span>{loading ? 'Creating User...' : 'Create Enterprise User Account'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
