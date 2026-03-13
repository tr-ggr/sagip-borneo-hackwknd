import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import {
    type AssistantAnswerInput,
    type AssistantAnswerResult,
    type DisasterAssistantProvider,
} from './assistant.provider';
import { SimpleAssistantProvider } from './simple-assistant.provider';
import { getLlmRuntimeConfig, type LlmRuntimeConfig } from '../../../config';

@Injectable()
export class FlaskAssistantProvider
    implements DisasterAssistantProvider, OnModuleInit {
    private readonly logger = new Logger(FlaskAssistantProvider.name);
    private config!: LlmRuntimeConfig;

    constructor(private readonly fallback: SimpleAssistantProvider) { }

    onModuleInit() {
        this.config = getLlmRuntimeConfig();
        this.logger.log(
            `LLM server configured at ${this.config.llmServerUrl} (timeout: ${this.config.llmTimeoutMs}ms)`,
        );
    }

    async answer(input: AssistantAnswerInput): Promise<AssistantAnswerResult> {
        const start = Date.now();

        try {
            const context = input.context ?? {};
            const weather =
                typeof context.weather === 'string'
                    ? context.weather
                    : context.weather?.summary ??
                    (context.weather?.temperature != null
                        ? `Temperature ${context.weather.temperature}°C`
                        : undefined);

            const response = await axios.post(
                `${this.config.llmServerUrl}/api/chat`,
                {
                    question: input.question,
                    context: {
                        hazardType: context.hazardType,
                        location: context.location,
                        userId: context.userId,
                        demographics: context.demographics,
                        weather,
                        preferredLanguage: context.preferredLanguage,
                    },
                },
                { timeout: this.config.llmTimeoutMs },
            );

            const elapsed = Date.now() - start;
            const provider = response.data?.provider ?? 'flask-llm';
            this.logger.log(
                `LLM response received in ${elapsed}ms (provider: ${provider})`,
            );

            const responseData = response.data;
            let rawAnswer = '';
            let structuredData: AssistantAnswerResult['structuredData'];

            if (responseData?.data) {
                const { summary, steps, safety_reminder } = responseData.data;
                const parts = [];
                if (summary) parts.push(summary);
                if (Array.isArray(steps) && steps.length > 0) {
                    parts.push(steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n'));
                }
                if (safety_reminder) parts.push(safety_reminder);
                rawAnswer = parts.join('\n\n');

                structuredData = {
                    summary: summary || '',
                    steps: Array.isArray(steps) ? steps : [],
                    safetyReminder: safety_reminder || '',
                };
            } else {
                rawAnswer = responseData?.answer ?? '';
            }

            return {
                answer: rawAnswer,
                disclaimer:
                    responseData?.disclaimer ??
                    'This assistant provides general guidance only.',
                provider,
                ...(structuredData && { structuredData }),
            };
        } catch (error) {
            const elapsed = Date.now() - start;
            this.logger.warn(
                `LLM server call failed after ${elapsed}ms, activating fallback. Error: ${error instanceof Error ? error.message : String(error)
                }`,
            );
            return this.fallback.answer(input);
        }
    }
}
