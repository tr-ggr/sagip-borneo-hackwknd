export interface AssistantAnswerInput {
  question: string;
  context?: {
    location?: string;
    hazardType?: string;
  };
}

export interface AssistantAnswerResult {
  answer: string;
  disclaimer: string;
  provider: string;
}

export interface DisasterAssistantProvider {
  answer(input: AssistantAnswerInput): Promise<AssistantAnswerResult>;
}
