import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function StatCard({ label, value, accent = false, sub }) {
  return (
    <div className="card p-5 relative overflow-hidden group hover:border-surface-5 transition-colors">
      {accent && <div className="absolute inset-x-0 top-0 h-[2px] bg-lime-400 shadow-glow-sm" />}
      <div className="label mb-3">{label}</div>
      <div className={`font-mono font-bold text-4xl tracking-tight ${accent ? 'text-lime-400' : 'text-ink-base'}`}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-ink-muted mt-1 font-mono">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 shadow-card">
      <p className="font-display font-semibold text-ink-base text-sm mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-xs font-mono" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const diffData = stats ? [
    { name: 'Easy',   done: stats.diffStats.easy.done,   total: stats.diffStats.easy.total   },
    { name: 'Medium', done: stats.diffStats.medium.done, total: stats.diffStats.medium.total },
    { name: 'Hard',   done: stats.diffStats.hard.done,   total: stats.diffStats.hard.total   },
  ] : [];

  const COLORS = { Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' };
  const pct = stats?.total ? Math.round((stats.done / stats.total) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 space-y-8 relative z-[1] animate-fade-up">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-ink-muted text-sm font-mono mb-1">
            {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
          </div>
          <h1 className="font-display font-bold text-3xl text-ink-base">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-ink-muted mt-1 text-sm">Here's your progress at a glance.</p>
        </div>
        <Link to="/questions" className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add question
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total solved" value={stats?.done ?? 0}       accent sub={`of ${stats?.total ?? 0} total`} />
        <StatCard label="Today"        value={stats?.todayCount ?? 0} sub="questions logged" />
        <StatCard label="Streak"       value={`${stats?.streak ?? 0}🔥`} sub="consecutive days" />
        <StatCard label="Pending"      value={stats?.pending ?? 0}    sub="to solve" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Bar chart */}
        <div className="xl:col-span-3 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-ink-base">By difficulty</h2>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-ink-muted"><span className="w-2 h-2 rounded-sm bg-surface-5 inline-block"/>Total</span>
              <span className="flex items-center gap-1.5 text-ink-muted"><span className="w-2 h-2 rounded-sm bg-lime-400 inline-block"/>Solved</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={diffData} barGap={6} barCategoryGap="35%">
              <XAxis dataKey="name" tick={{ fill:'#7d8590', fontSize:12, fontFamily:'Space Grotesk', fontWeight:600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#7d8590', fontSize:11, fontFamily:'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="total" name="Total" radius={[6,6,0,0]} fill="#1c2330" />
              <Bar dataKey="done"  name="Solved" radius={[6,6,0,0]}>
                {diffData.map(d => <Cell key={d.name} fill={COLORS[d.name]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform + progress */}
        <div className="xl:col-span-2 space-y-4">
          {/* Progress ring area */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-ink-base mb-4">Overall progress</h2>
            <div className="flex items-center gap-5">
              {/* Circular progress */}
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#1c2330" strokeWidth="8"/>
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#b5f23d" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
                    style={{ transition:'stroke-dashoffset 1s ease', filter:'drop-shadow(0 0 6px rgba(181,242,61,0.4))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono font-bold text-lg text-lime-400">{pct}%</span>
                </div>
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex justify-between text-xs font-mono"><span className="text-ink-muted">Solved</span><span className="text-emerald-400">{stats?.done}</span></div>
                <div className="flex justify-between text-xs font-mono"><span className="text-ink-muted">Pending</span><span className="text-ink-dim">{stats?.pending}</span></div>
                <div className="flex justify-between text-xs font-mono"><span className="text-ink-muted">Easy</span><span className="text-emerald-400">{stats?.diffStats.easy.done}</span></div>
                <div className="flex justify-between text-xs font-mono"><span className="text-ink-muted">Medium</span><span className="text-amber-400">{stats?.diffStats.medium.done}</span></div>
                <div className="flex justify-between text-xs font-mono"><span className="text-ink-muted">Hard</span><span className="text-red-400">{stats?.diffStats.hard.done}</span></div>
              </div>
            </div>
          </div>

          {/* Platforms */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-ink-base mb-4">Platforms</h2>
            {stats?.byPlatform?.length ? (
              <div className="space-y-3">
                {stats.byPlatform.slice(0,5).map(p => (
                  <div key={p._id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-mono text-ink-dim">{p._id}</span>
                      <span className="font-mono text-ink-muted">{p.done}/{p.count}</span>
                    </div>
                    <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
                      <div className="h-full bg-lime-400/70 rounded-full transition-all duration-700"
                        style={{ width: `${p.count ? (p.done/p.count)*100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ink-muted text-sm font-mono text-center py-4">no data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
