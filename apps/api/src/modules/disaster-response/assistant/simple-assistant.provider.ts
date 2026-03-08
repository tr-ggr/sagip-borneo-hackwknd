import { Injectable } from '@nestjs/common';
import {
  type AssistantAnswerInput,
  type AssistantAnswerResult,
  type DisasterAssistantProvider,
} from './assistant.provider';

@Injectable()
export class SimpleAssistantProvider implements DisasterAssistantProvider {
  async answer(
    input: AssistantAnswerInput,
  ): Promise<AssistantAnswerResult> {
    const prefix = input.context?.hazardType
      ? `For ${input.context.hazardType.toLowerCase()} preparedness, `
      : '';

    return {
      answer: `${prefix}prioritize official advisories, keep emergency kits ready, and coordinate with your family safety plan. Inquiry: ${input.question}`,
      disclaimer:
        'This assistant provides general preparedness guidance only and cannot issue warnings or operational commands.',
      provider: 'simple-disaster-assistant',
    };
  }
}
