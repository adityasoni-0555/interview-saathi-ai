import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Loader2,
  RotateCcw,
  SkipForward,
  Sparkles,
} from "lucide-react";
import FeedbackCard from "./FeedbackCard";
import { evaluateAnswer, generateQuestions } from "../lib/interviewApi";
import { averageScore, saveSession } from "../lib/sessions";
import { scoreTone } from "../lib/score";
import {
  INTERVIEW_TYPES,
  LEVELS,
  LEVEL_LABELS,
  LIMITS,
  TYPE_LABELS,
  type InterviewConfig,
  type SavedSession,
  type SessionItem,
} from "../types";

type Phase = "setup" | "loading" | "answering" | "summary";
type SaveState = "idle" | "saving" | "saved" | "error";

const ROLE_SUGGESTIONS = [
  "Software Engineer",
  "Frontend Developer",
  "Data Analyst",
  "Python Developer",
  "Product Manager",
  "Digital Marketing Executive",
];

const DEFAULT_CONFIG: InterviewConfig = {
  role: "",
  level: "fresher",
  interviewType: "mixed",
  focus: "",
  count: 5,
};

type Props = {
  onSaved: (session: SavedSession) => void;
};

export default function Practice({ onSaved }: Props) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [config, setConfig] = useState<InterviewConfig>(DEFAULT_CONFIG);
  const [items, setItems] = useState<SessionItem[]>([]);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");

  const inProgress = phase === "answering" && items.some((item) => item.answer);

  // Warn before closing the tab mid-interview.
  useEffect(() => {
    if (!inProgress) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [inProgress]);

  // ---------- setup ----------

  function validateConfig(): string | null {
    const role = config.role.trim();
    if (!role) return "Please enter the role you are preparing for.";
    if (role.length > LIMITS.role) return `Role must be at most ${LIMITS.role} characters.`;
    if (config.focus.trim().length > LIMITS.focus) {
      return `Focus areas must be at most ${LIMITS.focus} characters.`;
    }
    if (config.count < LIMITS.countMin || config.count > LIMITS.countMax) {
      return `Choose between ${LIMITS.countMin} and ${LIMITS.countMax} questions.`;
    }
    return null;
  }

  async function handleStart(event: FormEvent) {
    event.preventDefault();
    const problem = validateConfig();
    if (problem) {
      setError(problem);
      return;
    }

    const clean = { ...config, role: config.role.trim(), focus: config.focus.trim() };
    setConfig(clean);
    setError("");
    setPhase("loading");

    try {
      const questions = await generateQuestions(clean);
      setItems(questions.map((q) => ({ ...q, answer: null, evaluation: null })));
      setIndex(0);
      setDraft("");
      setShowHint(false);
      setSaveState("idle");
      setPhase("answering");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate questions.");
      setPhase("setup");
    }
  }

  // ---------- answering ----------

  const current = items[index];
  const answerLength = draft.trim().length;
  const answerTooShort = answerLength < LIMITS.answerMin;
  const answerTooLong = draft.length > LIMITS.answerMax;

  async function handleSubmitAnswer(event: FormEvent) {
    event.preventDefault();
    if (!current || evaluating) return;
    if (answerTooShort) {
      setError(`Please write at least ${LIMITS.answerMin} characters so the feedback is useful.`);
      return;
    }
    if (answerTooLong) {
      setError(`Answers can be at most ${LIMITS.answerMax} characters.`);
      return;
    }

    const answer = draft.trim();
    setError("");
    setEvaluating(true);
    try {
      const evaluation = await evaluateAnswer(config, current.question, answer);
      setItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, answer, evaluation } : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not evaluate your answer.");
    } finally {
      setEvaluating(false);
    }
  }

  function goNext() {
    setError("");
    setShowHint(false);
    setDraft("");
    if (index + 1 < items.length) {
      setIndex(index + 1);
    } else {
      void finish(items);
    }
  }

  function skip() {
    goNext();
  }

  async function finish(finalItems: SessionItem[]) {
    setPhase("summary");
    if (!finalItems.some((item) => item.evaluation)) return;
    setSaveState("saving");
    setSaveError("");
    try {
      const saved = await saveSession(config, finalItems);
      setSaveState("saved");
      onSaved(saved);
    } catch (err) {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Could not save this session.");
    }
  }

  function restart() {
    setPhase("setup");
    setItems([]);
    setIndex(0);
    setDraft("");
    setError("");
    setSaveState("idle");
  }

  // ---------- render ----------

  if (phase === "setup" || phase === "loading") {
    const loading = phase === "loading";
    return (
      <>
        <div className="page-heading">
          <div className="eyebrow">MOCK INTERVIEW</div>
          <h1>Set up your practice interview</h1>
          <p className="muted">
            Tell us the role you are targeting. AI will create realistic questions and give
            feedback on every answer.
          </p>
        </div>

        <form className="panel setup-form" onSubmit={handleStart} noValidate>
          <label className="field">
            <span>Target role *</span>
            <input
              value={config.role}
              onChange={(e) => setConfig({ ...config, role: e.target.value })}
              placeholder="e.g. Frontend Developer"
              maxLength={LIMITS.role}
              disabled={loading}
              list="role-suggestions"
              required
            />
            <datalist id="role-suggestions">
              {ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
            </datalist>
          </label>

          <div className="field-row">
            <label className="field">
              <span>Experience level</span>
              <select
                value={config.level}
                onChange={(e) =>
                  setConfig({ ...config, level: e.target.value as InterviewConfig["level"] })
                }
                disabled={loading}
              >
                {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
              </select>
            </label>

            <label className="field">
              <span>Number of questions</span>
              <select
                value={config.count}
                onChange={(e) => setConfig({ ...config, count: Number(e.target.value) })}
                disabled={loading}
              >
                {[3, 5, 7, 10].map((n) => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </label>
          </div>

          <fieldset className="field" disabled={loading}>
            <span>Interview type</span>
            <div className="chip-group" role="radiogroup">
              {INTERVIEW_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={config.interviewType === t}
                  className={`chip ${config.interviewType === t ? "chip-active" : ""}`}
                  onClick={() => setConfig({ ...config, interviewType: t })}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span>Focus areas (optional)</span>
            <input
              value={config.focus}
              onChange={(e) => setConfig({ ...config, focus: e.target.value })}
              placeholder="e.g. React hooks, SQL joins, teamwork"
              maxLength={LIMITS.focus}
              disabled={loading}
            />
          </label>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <button className="primary-btn wide" type="submit" disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
            {loading ? "Generating your questions..." : "Start interview"}
          </button>
          {loading && (
            <p className="muted center">This usually takes 10-30 seconds.</p>
          )}
        </form>
      </>
    );
  }

  if (phase === "summary") {
    const avg = averageScore(items);
    const answered = items.filter((item) => item.evaluation);
    return (
      <>
        <div className="page-heading">
          <div className="eyebrow">INTERVIEW COMPLETE</div>
          <h1>{config.role} - your results</h1>
          <p className="muted">
            {answered.length} of {items.length} questions answered
            {avg !== null && <> - average score <strong>{avg}/100</strong></>}
          </p>
        </div>

        {saveState === "saving" && (
          <div className="alert alert-info"><Loader2 size={15} className="spin" /> Saving session...</div>
        )}
        {saveState === "saved" && (
          <div className="alert alert-success"><CheckCircle2 size={15} /> Saved to your history.</div>
        )}
        {saveState === "error" && <div className="alert alert-error">{saveError}</div>}

        <div className="summary-list">
          {items.map((item, i) => (
            <details className="panel summary-item" key={i} open={i === 0}>
              <summary>
                <span className="q-number">Q{i + 1}</span>
                <span className="summary-question">{item.question}</span>
                {item.evaluation ? (
                  <span className={`verdict-badge ${scoreTone(item.evaluation.score)}`}>
                    {item.evaluation.score}
                  </span>
                ) : (
                  <span className="verdict-badge muted-badge">Skipped</span>
                )}
              </summary>
              {item.answer && (
                <div className="your-answer">
                  <h4>Your answer</h4>
                  <p>{item.answer}</p>
                </div>
              )}
              {item.evaluation && <FeedbackCard evaluation={item.evaluation} />}
            </details>
          ))}
        </div>

        <button className="primary-btn" onClick={restart}>
          <RotateCcw size={16} /> Practise again
        </button>
      </>
    );
  }

  // phase === "answering"
  if (!current) return null;
  const evaluated = current.evaluation;
  const progress = Math.round(((index + (evaluated ? 1 : 0)) / items.length) * 100);

  return (
    <>
      <div className="interview-top">
        <div>
          <div className="eyebrow">
            {config.role.toUpperCase()} - {TYPE_LABELS[config.interviewType].toUpperCase()}
          </div>
          <div className="muted">
            Question {index + 1} of {items.length}
          </div>
        </div>
        <button className="ghost-btn" onClick={() => void finish(items)} disabled={evaluating}>
          End interview
        </button>
      </div>
      <div className="progress-track interview-progress">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <section className="panel question-card">
        <div className="question-meta">
          <span className="resource-category">{current.category}</span>
          <span className={`difficulty ${current.difficulty}`}>{current.difficulty}</span>
        </div>
        <h2 className="question-text">{current.question}</h2>

        {!evaluated && (
          <button type="button" className="ghost-btn" onClick={() => setShowHint((v) => !v)}>
            <Lightbulb size={15} /> {showHint ? "Hide hint" : "Show hint"}
          </button>
        )}
        {showHint && !evaluated && <div className="hint">{current.hint}</div>}

        {!evaluated ? (
          <form onSubmit={handleSubmitAnswer} className="answer-form">
            <label className="field">
              <span>Your answer</span>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your answer as you would say it in the interview..."
                rows={8}
                disabled={evaluating}
                aria-invalid={answerTooLong}
              />
            </label>
            <div className="answer-footer">
              <span className={`char-count ${answerTooLong ? "over" : ""}`}>
                {draft.length}/{LIMITS.answerMax}
              </span>
              <div className="answer-actions">
                <button type="button" className="ghost-btn" onClick={skip} disabled={evaluating}>
                  <SkipForward size={15} /> Skip
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={evaluating || answerTooShort || answerTooLong}
                >
                  {evaluating ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                  {evaluating ? "Evaluating..." : "Submit answer"}
                </button>
              </div>
            </div>
            {error && <div className="alert alert-error" role="alert">{error}</div>}
          </form>
        ) : (
          <>
            <div className="your-answer">
              <h4>Your answer</h4>
              <p>{current.answer}</p>
            </div>
            <FeedbackCard evaluation={evaluated} />
            <div className="answer-actions end">
              <button className="primary-btn" onClick={goNext}>
                {index + 1 < items.length ? "Next question" : "See results"}
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
