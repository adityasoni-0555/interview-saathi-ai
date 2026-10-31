export const LEVELS = ["intern", "fresher", "junior", "mid", "senior"] as const;
export const INTERVIEW_TYPES = ["technical", "behavioral", "hr", "mixed"] as const;

export type Level = (typeof LEVELS)[number];
export type InterviewType = (typeof INTERVIEW_TYPES)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  intern: "Intern",
  fresher: "Fresher (0 yrs)",
  junior: "Junior (1-2 yrs)",
  mid: "Mid-level (3-5 yrs)",
  senior: "Senior (5+ yrs)",
};

export const TYPE_LABELS: Record<InterviewType, string> = {
  technical: "Technical",
  behavioral: "Behavioral",
  hr: "HR",
  mixed: "Mixed",
};

/** Limits mirrored from the Edge Function so users get instant feedback. */
export const LIMITS = {
  role: 80,
  focus: 200,
  answerMin: 20,
  answerMax: 6000,
  countMin: 3,
  countMax: 10,
} as const;

export type InterviewConfig = {
  role: string;
  level: Level;
  interviewType: InterviewType;
  focus: string;
  count: number;
};

export type Question = {
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  hint: string;
};

export type Verdict = "excellent" | "good" | "average" | "needs_work" | "off_topic";

export type Evaluation = {
  score: number;
  verdict: Verdict;
  summary: string;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
  tips: string[];
};

export type SessionItem = Question & {
  answer: string | null;
  evaluation: Evaluation | null;
};

export type SavedSession = {
  id: string;
  role: string;
  level: Level;
  interview_type: InterviewType;
  focus: string | null;
  average_score: number | null;
  answered_count: number;
  question_count: number;
  items: SessionItem[];
  created_at: string;
};

export type Page = "Dashboard" | "Practice" | "History" | "Resources";
