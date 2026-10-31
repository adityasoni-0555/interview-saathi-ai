import { useState } from "react";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import FeedbackCard from "./FeedbackCard";
import { deleteSession } from "../lib/sessions";
import { scoreTone } from "../lib/score";
import { LEVEL_LABELS, TYPE_LABELS, type Page, type SavedSession } from "../types";

type Props = {
  sessions: SavedSession[];
  loading: boolean;
  error: string;
  onReload: () => void;
  onDeleted: (id: string) => void;
  onNavigate: (page: Page) => void;
};

export default function History({ sessions, loading, error, onReload, onDeleted, onNavigate }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete(session: SavedSession) {
    if (!window.confirm(`Delete the "${session.role}" session? This cannot be undone.`)) return;
    setDeleting(session.id);
    setDeleteError("");
    try {
      await deleteSession(session.id);
      onDeleted(session.id);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete the session.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <div className="page-heading heading-row">
        <div>
          <div className="eyebrow">TRACK YOUR GROWTH</div>
          <h1>Practice history</h1>
          <p className="muted">Review past answers, feedback and model answers.</p>
        </div>
        <button className="ghost-btn" onClick={onReload} disabled={loading}>
          {loading ? <Loader2 size={15} className="spin" /> : <RefreshCw size={15} />} Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {deleteError && <div className="alert alert-error">{deleteError}</div>}

      {loading && sessions.length === 0 ? (
        <div className="panel empty-state">Loading your sessions...</div>
      ) : sessions.length === 0 && !error ? (
        <div className="panel empty-state">
          <p>No saved sessions yet.</p>
          <button className="primary-btn" onClick={() => onNavigate("Practice")}>
            Start your first interview
          </button>
        </div>
      ) : (
        <div className="summary-list">
          {sessions.map((s) => (
            <details className="panel summary-item" key={s.id}>
              <summary>
                <div className="summary-question">
                  <div className="session-role">{s.role}</div>
                  <div className="task-meta">
                    <span>{TYPE_LABELS[s.interview_type]}</span>
                    <span>-</span>
                    <span>{LEVEL_LABELS[s.level]}</span>
                    <span>-</span>
                    <span>{s.answered_count}/{s.question_count} answered</span>
                    <span>-</span>
                    <span>{new Date(s.created_at).toLocaleString("en-IN")}</span>
                  </div>
                </div>
                {s.average_score !== null && (
                  <span className={`verdict-badge ${scoreTone(s.average_score)}`}>
                    {s.average_score}
                  </span>
                )}
              </summary>

              {(s.items ?? []).map((item, i) => (
                <div className="history-item" key={i}>
                  <h3><span className="q-number">Q{i + 1}</span> {item.question}</h3>
                  {item.answer ? (
                    <div className="your-answer">
                      <h4>Your answer</h4>
                      <p>{item.answer}</p>
                    </div>
                  ) : (
                    <p className="muted">Skipped</p>
                  )}
                  {item.evaluation && <FeedbackCard evaluation={item.evaluation} />}
                </div>
              ))}

              <div className="answer-actions end">
                <button
                  className="ghost-btn danger"
                  onClick={() => void handleDelete(s)}
                  disabled={deleting === s.id}
                >
                  {deleting === s.id ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
                  Delete session
                </button>
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
