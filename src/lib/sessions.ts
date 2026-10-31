import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { InterviewConfig, SavedSession, SessionItem } from "../types";

const TABLE = "interview_sessions";

export const MISSING_TABLE_MESSAGE =
  "Practice history is not set up yet. Run the SQL migration in supabase/migrations to enable saving.";

function isMissingTable(error: PostgrestError) {
  // 42P01 = undefined_table (Postgres); PGRST205 = table not in schema cache (PostgREST)
  return error.code === "42P01" || error.code === "PGRST205";
}

function toMessage(error: PostgrestError) {
  return isMissingTable(error) ? MISSING_TABLE_MESSAGE : error.message;
}

export function averageScore(items: SessionItem[]): number | null {
  const scores = items
    .map((item) => item.evaluation?.score)
    .filter((s): s is number => typeof s === "number");
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export async function listSessions(): Promise<SavedSession[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(toMessage(error));
  return (data ?? []) as SavedSession[];
}

export async function saveSession(
  config: InterviewConfig,
  items: SessionItem[],
): Promise<SavedSession> {
  const answered = items.filter((item) => item.evaluation).length;
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      role: config.role,
      level: config.level,
      interview_type: config.interviewType,
      focus: config.focus || null,
      average_score: averageScore(items),
      answered_count: answered,
      question_count: items.length,
      items,
    })
    .select()
    .single();
  if (error) throw new Error(toMessage(error));
  return data as SavedSession;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(toMessage(error));
}
