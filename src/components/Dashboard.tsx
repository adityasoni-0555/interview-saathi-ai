import type { ReactNode } from "react";
import { ArrowRight, Award, CalendarDays, ClipboardList, MessageSquareText, TrendingUp } from "lucide-react";
import { scoreTone } from "../lib/score";
import { TYPE_LABELS, type Page, type SavedSession } from "../types";

type Props = {
  name: string;
  sessions: SavedSession[];
  loading: boolean;
  error: string;
  onNavigate: (page: Page) => void;
};

export default function Dashboard({ name, sessions, loading, error, onNavigate }: Props) {
  const scored = sessions.filter((s) => s.average_score !== null);
  const totalAnswered = sessions.reduce((sum, s) => sum + s.answered_count, 0);
  const avg = scored.length
    ? Math.round(scored.reduce((sum, s) => sum + (s.average_score ?? 0), 0) / scored.length)
    : null;
  const best = scored.length ? Math.max(...scored.map((s) => s.average_score ?? 0)) : null;
  const recent = sessions.slice(0, 5);

  const date = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="welcome">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> YOUR INTERVIEW PREP HQ
          </div>
          <h1>Ready for your next interview{name ? `, ${name}` : ""}?</h1>
          <p className="muted">Practise with AI, learn from feedback, and track your progress.</p>
        </div>
        <div className="date-chip">
          <CalendarDays size={17} />
          {date}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <Stat label="Sessions completed" icon={<ClipboardList size={19} />} tone="purple"
          value={loading ? "-" : sessions.length} foot="Mock interviews saved" />
        <Stat label="Questions answered" icon={<MessageSquareText size={19} />} tone="blue"
          value={loading ? "-" : totalAnswered} foot="Across all sessions" />
        <Stat label="Average score" icon={<TrendingUp size={19} />} tone="green"
          value={loading || avg === null ? "-" : avg} suffix={avg !== null ? "/100" : ""} foot="Mean of session averages"
          progress={avg ?? undefined} />
        <Stat label="Best session" icon={<Award size={19} />} tone="orange"
          value={loading || best === null ? "-" : best} suffix={best !== null ? "/100" : ""} foot="Your top average score" />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Recent sessions</div>
              <div className="panel-subtitle">Your latest mock interviews.</div>
            </div>
            {sessions.length > 0 && (
              <button className="ghost-btn" onClick={() => onNavigate("History")}>
                View all <ArrowRight size={15} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="empty-state">Loading your sessions...</div>
          ) : recent.length === 0 ? (
            <div className="empty-state">
              No sessions yet. Start your first mock interview to see progress here.
            </div>
          ) : (
            <div className="session-list">
              {recent.map((s) => (
                <button key={s.id} className="session-row" onClick={() => onNavigate("History")}>
                  <div>
                    <div className="session-role">{s.role}</div>
                    <div className="task-meta">
                      <span>{TYPE_LABELS[s.interview_type]}</span>
                      <span>-</span>
                      <span>{new Date(s.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                  {s.average_score !== null && (
                    <span className={`verdict-badge ${scoreTone(s.average_score)}`}>
                      {s.average_score}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="panel focus-panel cta-panel">
          <div>
            <div className="eyebrow">YOUR NEXT MOVE</div>
            <h2>Practice beats nerves.</h2>
            <p className="muted">
              A 10-minute mock interview a day builds clear, confident answers.
            </p>
          </div>
          <button className="primary-btn" onClick={() => onNavigate("Practice")}>
            Start a mock interview <ArrowRight size={16} />
          </button>
        </section>
      </div>
    </>
  );
}

type StatProps = {
  label: string;
  icon: ReactNode;
  tone: "purple" | "blue" | "green" | "orange";
  value: string | number;
  suffix?: string;
  foot: string;
  progress?: number;
};

function Stat({ label, icon, tone, value, suffix, foot, progress }: StatProps) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className={`stat-icon ${tone}`}>{icon}</div>
      </div>
      <div className="stat-value">
        {value}
        {suffix && <span>{suffix}</span>}
      </div>
      {progress !== undefined ? (
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      ) : (
        <div className="stat-foot">{foot}</div>
      )}
    </div>
  );
}
