import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import QuestionModal  from '../components/QuestionModal';
import SolutionViewer from '../components/SolutionViewer';

const PLATFORMS = ['all','LeetCode','Codeforces','HackerRank','GeeksforGeeks','CodeChef','AtCoder','Other'];
const cap     = s => s?.charAt(0).toUpperCase() + s?.slice(1);
const fmtDate = d => { if (!d) return '—'; const [y,m,day]=d.split('-'); return `${day}/${m}/${y.slice(2)}`; };
const today   = () => new Date().toISOString().slice(0,10);

const DIFF_CYCLE  = { easy:'medium', medium:'hard', hard:'easy' };
const DIFF_BADGE  = { easy:'badge-easy', medium:'badge-medium', hard:'badge-hard' };

/* ── Filter pill ── */
function FilterPill({ label, value, current, onChange }) {
  return (
    <button
      onClick={() => onChange(value)}
      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all
        ${current === value
          ? 'bg-lime-400/10 text-lime-400 border-lime-400/30'
          : 'bg-surface-2 text-ink-muted border-surface-5 hover:border-surface-4 hover:text-ink-dim'}`}
    >
      {label}
    </button>
  );
}

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [filters,   setFilters]   = useState({ search:'', difficulty:'all', status:'all', platform:'all' });
  const [showModal, setShowModal] = useState(false);
  const [editQ,     setEditQ]     = useState(null);
  const [viewId,    setViewId]    = useState(null);
  const [exporting, setExporting] = useState(false);

  const searchRef = useRef();

  /* ── Fetch ── */
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200, sortBy: 'createdAt', order: 'desc' };
      if (filters.search)             params.search     = filters.search;
      if (filters.difficulty !== 'all') params.difficulty = filters.difficulty;
      if (filters.status     !== 'all') params.status     = filters.status;
      if (filters.platform   !== 'all') params.platform   = filters.platform;

      const { data } = await api.get('/questions', { params });
      setQuestions(data.questions);
      setTotal(data.pagination.total);
    } catch (err) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchQuestions, filters.search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchQuestions]);

  /* ── Actions ── */
  const toggleStatus = async (q) => {
    try {
      const { data } = await api.patch(`/questions/${q._id}/toggle-status`);
      setQuestions(qs => qs.map(x => x._id === q._id ? data.question : x));
    } catch { toast.error('Update failed'); }
  };

  const cycleDiff = async (q) => {
    try {
      // Send as FormData
      const fd = new FormData();
      fd.append('difficulty', DIFF_CYCLE[q.difficulty]);
      const { data } = await api.patch(`/questions/${q._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setQuestions(qs => qs.map(x => x._id === q._id ? data.question : x));
    } catch { toast.error('Update failed'); }
  };

  const deleteQ = async (q) => {
    if (!confirm(`Delete "${q.name}"?`)) return;
    try {
      await api.delete(`/questions/${q._id}`);
      setQuestions(qs => qs.filter(x => x._id !== q._id));
      if (viewId === q._id) setViewId(null);
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const onSaved = (saved) => {
    setQuestions(qs => {
      const idx = qs.findIndex(x => x._id === saved._id);
      if (idx !== -1) { const n=[...qs]; n[idx]=saved; return n; }
      return [saved, ...qs];
    });
    setShowModal(false);
    setEditQ(null);
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const res = await api.get('/questions/export/excel', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `DSA_${today()}.xlsx`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported!');
    } catch { toast.error('Export failed'); }
    finally  { setExporting(false); }
  };

  const sf = k => v => setFilters(f => ({ ...f, [k]: v }));
  const viewQ = questions.find(q => q._id === viewId);
  const hasSol = q => q.solution || q.solutionFile || q.notionLink;

  return (
    <div className="p-8 space-y-6 relative z-[1] animate-fade-up">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink-base">Questions</h1>
          <p className="text-ink-muted text-sm mt-0.5 font-mono">{total} total problems</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportExcel} disabled={exporting}
            className="btn-ghost text-xs gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/5"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v8M3 6.5L6.5 10 10 6.5M1 11.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {exporting ? 'Exporting…' : 'Export Excel'}
          </button>
          <button
            onClick={() => { setEditQ(null); setShowModal(true); }}
            className="btn-primary"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add question
          </button>
        </div>
      </div>

      {/* ── Filters bar ── */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search questions…"
            className="input pl-9 text-sm"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-1.5">
          {['all','easy','medium','hard'].map(d => (
            <FilterPill key={d} label={d === 'all' ? 'All' : cap(d)} value={d} current={filters.difficulty} onChange={sf('difficulty')} />
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5">
          <FilterPill label="All" value="all" current={filters.status} onChange={sf('status')} />
          <FilterPill label="Done" value="done" current={filters.status} onChange={sf('status')} />
          <FilterPill label="Pending" value="pending" current={filters.status} onChange={sf('status')} />
        </div>

        {/* Platform select */}
        <select
          className="input w-40 text-sm py-2"
          value={filters.platform}
          onChange={e => setFilters(f => ({ ...f, platform: e.target.value }))}
        >
          {PLATFORMS.map(p => <option key={p} value={p}>{p === 'all' ? 'All platforms' : p}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 860 }}>
            <colgroup>
              <col style={{width:42}}/><col style={{width:95}}/><col />
              <col style={{width:90}}/><col style={{width:110}}/><col style={{width:115}}/>
              <col style={{width:80}}/><col style={{width:76}}/><col style={{width:170}}/>
              <col style={{width:90}}/>
            </colgroup>
            <thead className="tbl-head">
              <tr>
                {['#','Date','Question','Difficulty','Status','Platform','Link','Solution','Hint / Notes',''].map((h,i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="py-20 text-center">
                  <div className="w-7 h-7 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : !questions.length ? (
                <tr><td colSpan={10}>
                  <div className="text-center py-20">
                    <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-surface-4 flex items-center justify-center mx-auto mb-4 text-3xl">✏️</div>
                    <div className="font-display font-semibold text-ink-base mb-1">
                      {filters.search || filters.difficulty !== 'all' || filters.status !== 'all' || filters.platform !== 'all'
                        ? 'No matches found' : 'No questions yet'}
                    </div>
                    <div className="text-ink-muted text-sm font-mono">
                      {filters.search ? 'Try a different search term' : 'Click "+ Add question" to get started'}
                    </div>
                  </div>
                </td></tr>
              ) : questions.map((q, i) => (
                <tr key={q._id} className={`tbl-row group ${viewId === q._id ? 'bg-lime-400/[0.03]' : ''}`}>

                  {/* # */}
                  <td className="font-mono text-ink-muted text-xs">{i+1}</td>

                  {/* Date */}
                  <td className="font-mono text-xs text-ink-muted whitespace-nowrap">
                    {q.date === today() && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400 mr-1.5 mb-0.5 align-middle" />
                    )}
                    {fmtDate(q.date)}
                  </td>

                  {/* Question name */}
                  <td>
                    <div className="font-display font-semibold text-ink-base text-[13px] truncate max-w-[220px]" title={q.name}>
                      {q.name}
                    </div>
                  </td>

                  {/* Difficulty */}
                  <td>
                    <span
                      className={`${DIFF_BADGE[q.difficulty]} cursor-pointer hover:opacity-80 transition-opacity`}
                      onClick={() => cycleDiff(q)}
                      title="Click to cycle"
                    >
                      {cap(q.difficulty)}
                    </span>
                  </td>

                  {/* Status toggle */}
                  <td>
                    <button onClick={() => toggleStatus(q)} className="flex items-center gap-2 group/tog">
                      <div className={`toggle-track ${q.status === 'done' ? 'on' : 'off'}`}>
                        <div className="toggle-thumb" />
                      </div>
                      <span className={`text-xs font-mono font-semibold transition-colors
                        ${q.status === 'done' ? 'text-lime-400' : 'text-ink-muted'}`}>
                        {cap(q.status)}
                      </span>
                    </button>
                  </td>

                  {/* Platform */}
                  <td>
                    <span className="text-[11px] font-mono text-ink-muted bg-surface-3 px-2 py-1 rounded-lg border border-surface-5">
                      {q.platform}
                    </span>
                  </td>

                  {/* Code link */}
                  <td>
                    {q.codeLink
                      ? <a href={q.codeLink} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-lime-400 hover:text-lime-500 font-mono transition-colors">
                          Open ↗
                        </a>
                      : <span className="text-ink-muted/30 font-mono text-xs">—</span>}
                  </td>

                  {/* Solution */}
                  <td>
                    {hasSol(q)
                      ? <button
                          onClick={() => setViewId(viewId === q._id ? null : q._id)}
                          className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border transition-all
                            ${viewId === q._id
                              ? 'bg-lime-400/15 text-lime-400 border-lime-400/40'
                              : 'text-lime-400/70 border-lime-400/20 hover:bg-lime-400/10 hover:text-lime-400 hover:border-lime-400/30'}`}>
                          {viewId === q._id ? '▲ hide' : '▼ view'}
                        </button>
                      : <span className="text-ink-muted/30 font-mono text-xs">—</span>}
                  </td>

                  {/* Hint */}
                  <td>
                    <div className="flex items-center gap-1.5 max-w-[160px]">
                      {q.hintFile && <span className="text-[11px] shrink-0">📎</span>}
                      <span className="text-xs text-ink-muted font-mono truncate" title={q.hint || ''}>
                        {q.hint || <span className="opacity-30">—</span>}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditQ(q); setShowModal(true); }}
                        className="text-[11px] font-mono px-2.5 py-1.5 border border-surface-5 rounded-lg text-ink-muted hover:text-ink-base hover:border-surface-4 hover:bg-surface-3 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteQ(q)}
                        className="text-[11px] font-mono px-2.5 py-1.5 border border-red-500/20 rounded-lg text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Solution viewer ── */}
      {viewQ && <SolutionViewer question={viewQ} onClose={() => setViewId(null)} />}

      {/* ── Modal ── */}
      {showModal && (
        <QuestionModal
          question={editQ}
          onClose={() => { setShowModal(false); setEditQ(null); }}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
