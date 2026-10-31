import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Evaluation, InterviewConfig, Question } from "../types";

const FUNCTION_NAME = "interview-ai";

async function callFunction<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, { body });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      // The function returns { error: "friendly message" } on failure.
      let message = "The AI service returned an error.";
      try {
        const payload = await error.context.json();
        if (payload && typeof payload.error === "string") message = payload.error;
      } catch {
        // keep default message
      }
      throw new Error(message);
    }
    if (error instanceof FunctionsRelayError || error instanceof FunctionsFetchError) {
      throw new Error(
        "Could not reach the AI service. Check your connection, or make sure the interview-ai function is deployed.",
      );
    }
    throw new Error(error.message || "Unexpected error contacting the AI service.");
  }

  if (!data || typeof data !== "object") {
    throw new Error("The AI service returned an empty response.");
  }
  return data as T;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

export async function generateQuestions(config: InterviewConfig): Promise<Question[]> {
  const data = await callFunction<{ questions?: unknown }>({
    action: "generate_questions",
    role: config.role,
    level: config.level,
    interviewType: config.interviewType,
    focus: config.focus,
    count: config.count,
  });

  const questions = Array.isArray(data.questions) ? data.questions : [];
  const valid = questions.filter(
    (q): q is Question =>
      !!q &&
      typeof q.question === "string" &&
      typeof q.category === "string" &&
      typeof q.hint === "string",
  );
  if (valid.length === 0) throw new Error("No questions were generated. Please try again.");
  return valid;
}

export async function evaluateAnswer(
  config: InterviewConfig,
  question: string,
  answer: string,
): Promise<Evaluation> {
  const data = await callFunction<Partial<Evaluation>>({
    action: "evaluate_answer",
    role: config.role,
    level: config.level,
    interviewType: config.interviewType,
    question,
    answer,
  });

  if (
    typeof data.score !== "number" ||
    typeof data.summary !== "string" ||
    !isStringArray(data.strengths) ||
    !isStringArray(data.improvements) ||
    !isStringArray(data.tips) ||
    typeof data.suggestedAnswer !== "string"
  ) {
    throw new Error("The AI feedback was incomplete. Please try again.");
  }
  return data as Evaluation;
}
