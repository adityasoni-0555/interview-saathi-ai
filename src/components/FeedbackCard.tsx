import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Lightbulb, TriangleAlert } from "lucide-react";
import type { Evaluation, Verdict } from "../types";
import { scoreTone } from "../lib/score";

const VERDICT_LABEL: Record<Verdict, string> = {
  excellent: "Excellent",
  good: "Good",
  average: "Average",
  needs_work: "Needs work",
  off_topic: "Off topic",
};

export default function FeedbackCard({ evaluation }: { evaluation: Evaluation }) {
  const [showModel, setShowModel] = useState(false);
  const tone = scoreTone(evaluation.score);

  return (
    <div className="feedback">
      <div className="feedback-head">
        <div className={`score-ring ${tone}`} aria-label={`Score ${evaluation.score} out of 100`}>
          {evaluation.score}
          <span>/100</span>
        </div>
        <div>
          <span className={`verdict-badge ${tone}`}>
            {VERDICT_LABEL[evaluation.verdict] ?? evaluation.verdict}
          </span>
          <p className="feedback-summary">{evaluation.summary}</p>
        </div>
      </div>

      <div className="feedback-grid">
        {evaluation.strengths.length > 0 && (
          <div className="feedback-block">
            <h4><CheckCircle2 size={16} className="text-green" /> Strengths</h4>
            <ul>{evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
        {evaluation.improvements.length > 0 && (
          <div className="feedback-block">
            <h4><TriangleAlert size={16} className="text-orange" /> Improve</h4>
            <ul>{evaluation.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
      </div>

      {evaluation.tips.length > 0 && (
        <div className="feedback-block">
          <h4><Lightbulb size={16} className="text-purple" /> Tips</h4>
          <ul>{evaluation.tips.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}

      <button
        type="button"
        className="ghost-btn"
        onClick={() => setShowModel((v) => !v)}
        aria-expanded={showModel}
      >
        {showModel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {showModel ? "Hide model answer" : "Show model answer"}
      </button>
      {showModel && <div className="model-answer">{evaluation.suggestedAnswer}</div>}
    </div>
  );
}
