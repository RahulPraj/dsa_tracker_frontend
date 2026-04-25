import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be 6+ characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface-0 flex relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#adbac7 1px, transparent 1px), linear-gradient(90deg, #adbac7 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-lime-400/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-lime-400 flex items-center justify-center shadow-glow-lime">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 6l5 5-5 5M10 15h7" stroke="#0d1117" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="font-display font-bold text-xl text-ink-base">DSA Tracker</div>
                <div className="text-[11px] text-ink-muted font-mono">solve. log. repeat.</div>
              </div>
            </div>
          </div>

          <div className="card p-7">
            <h1 className="font-display font-bold text-2xl text-ink-base mb-1">Create account</h1>
            <p className="text-ink-muted text-sm mb-7">Start tracking your DSA journey today</p>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Full name</label>
                <input type="text" required className="input" placeholder="Your name"
                  value={form.name} onChange={f('name')} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" required className="input" placeholder="you@example.com"
                  value={form.email} onChange={f('email')} />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" required minLength={6} className="input" placeholder="Min. 6 characters"
                  value={form.password} onChange={f('password')} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-surface-1/40 border-t-surface-1 rounded-full animate-spin"/>Creating…</span>
                  : 'Create account →'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-ink-muted mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-lime-400 hover:text-lime-500 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
