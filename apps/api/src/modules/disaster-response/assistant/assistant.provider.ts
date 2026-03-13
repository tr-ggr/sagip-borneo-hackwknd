export interface AssistantAnswerInput {
  question: string;
  context?: {
    location?: string;
    hazardType?: string;
    userId?: string;
    demographics?: {
      age?: number | null;
      ageGroup?: string | null;
      housingType?: string | null;
      pregnantStatus?: boolean | null;
      isPWD?: boolean | null;
      personalInfo?: unknown;
      vulnerabilities?: unknown;
      householdComposition?: unknown;
      emergencySkills?: unknown;
      assets?: unknown;
    };
    /** Incoming weather summary for preparedness (e.g. from forecast API). */
    weather?: string | { summary?: string; temperature?: number; precipitation?: number };
    /** Preferred language for response (SEA-Guard language inclusivity). */
    preferredLanguage?: string;
  };
}

export interface AssistantAnswerResult {
  answer: string;
  disclaimer: string;
  provider: string;
  structuredData?: {
    summary: string;
    steps: string[];
    safetyReminder: string;
  };
}

export interface DisasterAssistantProvider {
  answer(input: AssistantAnswerInput): Promise<AssistantAnswerResult>;
}
