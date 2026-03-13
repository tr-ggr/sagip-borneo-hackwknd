import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/database/database.service';
import { RiskIntelligenceService } from '../risk-intelligence/risk-intelligence.service';
import type { AssistantAnswerInput } from './assistant.provider';
import { type DisasterAssistantProvider } from './assistant.provider';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    @Inject('DisasterAssistantProvider')
    private readonly provider: DisasterAssistantProvider,
    private readonly prisma: PrismaService,
    private readonly riskIntelligence: RiskIntelligenceService,
  ) {}

  async answerInquiry(input: {
    userId: string;
    question: string;
    location?: string;
    hazardType?: string;
    preferredLanguage?: string;
  }) {
    this.logger.log(
      `Inquiry userId=${input.userId} questionLength=${input.question.length} hasLocation=${!!input.location} hazardType=${input.hazardType ?? 'none'} preferredLanguage=${input.preferredLanguage ?? 'none'}`,
    );

    const context: NonNullable<AssistantAnswerInput['context']> = {
      location: input.location,
      hazardType: input.hazardType,
      userId: input.userId,
      preferredLanguage: input.preferredLanguage,
    };

    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: {
        age: true,
        ageGroup: true,
        housingType: true,
        pregnantStatus: true,
        isPWD: true,
        personalInfo: true,
        vulnerabilities: true,
        householdComposition: true,
        emergencySkills: true,
        assets: true,
        locationSnapshot: true,
      },
    });

    if (user) {
      context.demographics = {
        age: user.age ?? undefined,
        ageGroup: user.ageGroup ?? undefined,
        housingType: user.housingType ?? undefined,
        pregnantStatus: user.pregnantStatus ?? undefined,
        isPWD: user.isPWD ?? undefined,
        personalInfo: user.personalInfo as unknown,
        vulnerabilities: user.vulnerabilities as unknown,
        householdComposition: user.householdComposition as unknown,
        emergencySkills: user.emergencySkills as unknown,
        assets: user.assets as unknown,
      };

      if (user.locationSnapshot?.latitude != null && user.locationSnapshot?.longitude != null) {
        try {
          const result = await this.riskIntelligence.getForecast(
            user.locationSnapshot.latitude,
            user.locationSnapshot.longitude,
          );
          const data = result?.forecast as { current_weather?: { temperature?: number }; daily?: { precipitation_sum?: number[] } } | undefined;
          const current = data?.current_weather;
          const daily = data?.daily;
          if (current || daily) {
            const parts: string[] = [];
            if (current && typeof current.temperature === 'number') {
              parts.push(`temperature ${current.temperature}°C`);
            }
            if (daily?.precipitation_sum?.[0] != null) {
              parts.push(`precipitation ${daily.precipitation_sum[0]} mm`);
            }
            if (parts.length > 0) {
              context.weather = `Current weather at user location: ${parts.join(', ')}.`;
            }
          }
        } catch {
          // omit weather on forecast failure
        }
      }
    }

    return this.provider.answer({
      question: input.question,
      context,
    });
  }
}
