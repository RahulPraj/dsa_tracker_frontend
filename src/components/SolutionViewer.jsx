import { useState } from 'react';

function NotionCard({ url }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="notion-card">
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center font-bold text-black text-sm font-display shrink-0">N</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-display font-semibold text-ink-base">Open in Notion</div>
        <div className="text-[11px] text-ink-muted font-mono truncate mt-0.5">{url}</div>
      </div>
      <span className="text-ink-muted text-lg">↗</span>
    </a>
  );
}

function FileCard({ file }) {
  const [lightbox, setLightbox] = useState(false);
  if (!file) return null;
  const isImage = file.isImage || file.type?.startsWith('image/');

  return (
    <>
      {isImage ? (
        <>
          <img src={file.url || file.data} alt={file.name}
            onClick={() => setLightbox(true)}
            className="max-w-full max-h-72 rounded-2xl border border-surface-4 cursor-zoom-in object-contain"
          />
          {lightbox && (
            <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
              onClick={() => setLightbox(false)}>
              <img src={file.url || file.data} alt={file.name}
                className="max-w-full max-h-[90vh] rounded-2xl object-contain" />
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 bg-surface-2 border border-surface-4 rounded-xl">
          <span className="text-2xl">📎</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-mono text-ink-base truncate">{file.name}</div>
            {file.size && <div className="text-[11px] text-ink-muted">{(file.size/1024).toFixed(0)} KB</div>}
          </div>
          <a href={file.url || file.data} download={file.name} target="_blank" rel="noopener noreferrer"
            className="text-xs font-display font-semibold text-lime-400 border border-lime-400/30 px-3 py-1.5 rounded-lg hover:bg-lime-400/10 transition-colors">
            Download
          </a>
        </div>
      )}
    </>
  );
}

const SectionLabel = ({ children }) => (
  <div className="text-[10px] font-display font-bold text-ink-muted uppercase tracking-[0.1em] mb-2">{children}</div>
);

export default function SolutionViewer({ question, onClose }) {
  if (!question) return null;
  const cap     = s => s?.charAt(0).toUpperCase() + s?.slice(1);
  const fmtDate = d => { if (!d) return ''; const [y,m,day]=d.split('-'); return `${day}/${m}/${y.slice(2)}`; };
  const DIFF_CLASS = { easy:'badge-easy', medium:'badge-medium', hard:'badge-hard' };
  const hasSol = question.solution || question.solutionFile || question.notionLink;
  const hasHint = question.hint || question.hintFile;

  return (
    <div className="mt-4 card overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface-2 border-b border-surface-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-lime-400 shrink-0" />
          <h3 className="font-display font-semibold text-ink-base truncate">{question.name}</h3>
          <span className={DIFF_CLASS[question.difficulty]}>{cap(question.difficulty)}</span>
          <span className="text-xs font-mono text-ink-muted hidden sm:block">{fmtDate(question.date)}</span>
          <span className="text-xs font-mono text-ink-muted hidden sm:block">{question.platform}</span>
        </div>
        <button onClick={onClose}
          className="btn-ghost px-3 py-1.5 text-xs ml-3 shrink-0">
          ✕ Close
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Code */}
        {question.solution && (
          <div>
            <SectionLabel>Solution code</SectionLabel>
            <pre className="code-block">{question.solution}</pre>
          </div>
        )}

        {/* Solution file */}
        {question.solutionFile && (
          <div>
            <SectionLabel>Solution file</SectionLabel>
            <FileCard file={question.solutionFile} />
          </div>
        )}

        {/* Notion */}
        {question.notionLink && (
          <div>
            <SectionLabel>Notion page</SectionLabel>
            <NotionCard url={question.notionLink} />
          </div>
        )}

        {/* Hint */}
        {question.hint && (
          <div className="flex gap-3 p-4 bg-surface-2 border-l-2 border-lime-400/50 rounded-r-2xl">
            <span className="text-lg">💡</span>
            <div>
              <SectionLabel>Hint / Approach</SectionLabel>
              <p className="text-sm text-ink-dim font-body">{question.hint}</p>
            </div>
          </div>
        )}

        {/* Hint file */}
        {question.hintFile && (
          <div>
            <SectionLabel>Hint file</SectionLabel>
            <FileCard file={question.hintFile} />
          </div>
        )}

        {!hasSol && !hasHint && (
          <p className="text-ink-muted text-sm font-mono text-center py-6">no solution or hints added yet</p>
        )}
      </div>
    </div>
  );
}
