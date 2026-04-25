import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const PLATFORMS = ['LeetCode','Codeforces','HackerRank','GeeksforGeeks','CodeChef','AtCoder','Other'];
const DIFFS     = ['easy','medium','hard'];

const fmtSize = b => b > 1048576 ? (b/1048576).toFixed(1)+' MB' : b > 1024 ? (b/1024).toFixed(0)+' KB' : b+' B';

/* ── Difficulty button ── */
function DiffBtn({ value, active, onClick }) {
  const styles = {
    easy  : active ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40' : 'bg-surface-2 text-ink-muted border-surface-5 hover:border-surface-5/80',
    medium: active ? 'bg-amber-500/15   text-amber-400   border-amber-500/40'   : 'bg-surface-2 text-ink-muted border-surface-5 hover:border-surface-5/80',
    hard  : active ? 'bg-red-500/15     text-red-400     border-red-500/40'     : 'bg-surface-2 text-ink-muted border-surface-5 hover:border-surface-5/80',
  };
  return (
    <button type="button" onClick={onClick}
      className={`flex-1 py-2 rounded-xl text-xs font-mono font-semibold border transition-all ${styles[value]}`}>
      {value[0].toUpperCase() + value.slice(1)}
    </button>
  );
}

/* ── File Drop Zone ── */
function FileDropZone({ label, icon, onFile, current, onRemove }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();

  const handle = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5 MB per file'); return; }
    onFile(file);
  };

  return (
    <div>
      <label className="label">{label}</label>
      {current ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-surface-2 border border-surface-4 rounded-xl">
          <span className="text-xl">{current.type?.startsWith('image/') ? '🖼️' : '📎'}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-ink-base font-mono truncate">{current.name}</div>
            <div className="text-xs text-ink-muted">{fmtSize(current.size)}</div>
          </div>
          <button type="button" onClick={onRemove} className="btn-danger text-xs">✕ Remove</button>
        </div>
      ) : (
        <div
          onClick={() => ref.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
          className={`drop-zone ${drag ? 'dragging' : ''}`}
        >
          <div className="text-2xl mb-2">{icon}</div>
          <div className="text-sm text-ink-dim font-display font-medium">Click or drag & drop</div>
          <div className="text-xs text-ink-muted mt-1 font-mono">max 5 MB</div>
          <input ref={ref} type="file" className="hidden"
            onChange={e => { handle(e.target.files[0]); e.target.value = ''; }} />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   QuestionModal — sends everything as FormData
   Text fields + files in a single multipart request
══════════════════════════════════════════════════ */
export default function QuestionModal({ question = null, onClose, onSaved }) {
  const isEdit = !!question;

  const [form, setForm] = useState({
    name: '', date: new Date().toISOString().slice(0,10),
    difficulty: 'easy', status: 'pending', platform: 'LeetCode',
    codeLink: '', notionLink: '', solution: '', hint: '',
  });
  const [solFile,        setSolFile]        = useState(null);   // File object
  const [hintFile,       setHintFile]       = useState(null);   // File object
  const [removeSolFile,  setRemoveSolFile]  = useState(false);
  const [removeHintFile, setRemoveHintFile] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (question) {
      setForm({
        name      : question.name       || '',
        date      : question.date       || new Date().toISOString().slice(0,10),
        difficulty: question.difficulty || 'easy',
        status    : question.status     || 'pending',
        platform  : question.platform   || 'LeetCode',
        codeLink  : question.codeLink   || '',
        notionLink: question.notionLink || '',
        solution  : question.solution   || '',
        hint      : question.hint       || '',
      });
    }
  }, [question]);

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  /* ── Build FormData and POST/PATCH ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Question name is required'); return; }
    setSaving(true);

    try {
      const fd = new FormData();

      // Append all text fields
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      // Append files if selected
      if (solFile)  fd.append('solutionFile', solFile,  solFile.name);
      if (hintFile) fd.append('hintFile',     hintFile, hintFile.name);

      // Signal removals
      if (removeSolFile)  fd.append('removeSolutionFile', 'true');
      if (removeHintFile) fd.append('removeHintFile',     'true');

      let saved;
      if (isEdit) {
        const { data } = await api.patch(`/questions/${question._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        saved = data.question;
      } else {
        const { data } = await api.post('/questions', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        saved = data.question;
      }

      toast.success(isEdit ? 'Updated!' : 'Question added!');
      onSaved(saved);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // What to show in the file zones
  const currentSolFile  = removeSolFile  ? null : (solFile  ? { name: solFile.name,  size: solFile.size,  type: solFile.type  } : question?.solutionFile ?? null);
  const currentHintFile = removeHintFile ? null : (hintFile ? { name: hintFile.name, size: hintFile.size, type: hintFile.type } : question?.hintFile     ?? null);

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-xl my-auto card p-0 overflow-hidden animate-slide-in">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-3 bg-surface-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse-dot" />
            <h2 className="font-display font-bold text-lg text-ink-base">
              {isEdit ? 'Edit question' : 'Add question'}
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon text-base">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* Date + Platform */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date} onChange={f('date')} />
            </div>
            <div>
              <label className="label">Platform</label>
              <select className="input" value={form.platform} onChange={f('platform')}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Question name */}
          <div>
            <label className="label">Question name *</label>
            <input type="text" className="input" placeholder="e.g. Two Sum" required
              autoFocus value={form.name} onChange={f('name')} />
          </div>

          {/* Difficulty + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Difficulty</label>
              <div className="flex gap-2">
                {DIFFS.map(d => (
                  <DiffBtn key={d} value={d} active={form.difficulty === d}
                    onClick={() => setForm(p => ({ ...p, difficulty: d }))} />
                ))}
              </div>
            </div>
            <div>
              <label className="label">Status</label>
              <div className="flex gap-2">
                {['pending','done'].map(s => (
                  <button key={s} type="button"
                    onClick={() => setForm(p => ({ ...p, status: s }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-semibold border transition-all
                      ${form.status === s
                        ? s === 'done' ? 'bg-lime-400/15 text-lime-400 border-lime-400/40'
                          : 'bg-surface-3 text-ink-dim border-surface-5'
                        : 'bg-surface-2 text-ink-muted border-surface-5 hover:border-surface-5/80'}`}>
                    {s[0].toUpperCase()+s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Code link */}
          <div>
            <label className="label">Code / submission link</label>
            <input type="text" className="input" placeholder="https://leetcode.com/submissions/…"
              value={form.codeLink} onChange={f('codeLink')} />
          </div>

          {/* ── Solution section ── */}
          <div className="section-block">
            <div className="section-title">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M3.5 5l2 2-2 2M7 9h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Solution
            </div>

            <div>
              <label className="label">Paste code</label>
              <textarea className="input-mono" rows={5}
                placeholder="Paste your solution code here…"
                value={form.solution} onChange={f('solution')} />
            </div>

            <div>
              <label className="label">Notion page link</label>
              <input type="text" className="input" placeholder="https://notion.so/your-page-id"
                value={form.notionLink} onChange={f('notionLink')} />
              <p className="text-[11px] text-ink-muted mt-1 font-mono">Renders as a Notion card in the viewer</p>
            </div>

            <FileDropZone
              label="Attach file (code, PDF, image)"
              icon="📎"
              onFile={f => { setSolFile(f); setRemoveSolFile(false); }}
              current={currentSolFile}
              onRemove={() => { setSolFile(null); setRemoveSolFile(true); }}
            />
          </div>

          {/* ── Hint section ── */}
          <div className="section-block">
            <div className="section-title">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M6.5 6v3M6.5 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Hint / Notes
            </div>

            <div>
              <label className="label">Approach / notes</label>
              <input type="text" className="input" placeholder="e.g. Sliding window — O(n) time, O(1) space"
                value={form.hint} onChange={f('hint')} />
            </div>

            <FileDropZone
              label="Attach image or file"
              icon="🖼️"
              onFile={f => { setHintFile(f); setRemoveHintFile(false); }}
              current={currentHintFile}
              onRemove={() => { setHintFile(null); setRemoveHintFile(true); }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 sticky bottom-0 bg-surface-1 pb-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-surface-1/40 border-t-surface-1 rounded-full animate-spin"/>
                    Saving…
                  </span>
                : isEdit ? 'Save changes' : 'Add question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
