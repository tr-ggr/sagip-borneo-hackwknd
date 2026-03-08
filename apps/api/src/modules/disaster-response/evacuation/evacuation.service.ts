import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/database.service';
import { SimpleRoutingProvider } from './simple-routing.provider';

@Injectable()
export class EvacuationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly routingProvider: SimpleRoutingProvider,
  ) {}

  async getAreas() {
    return this.prisma.evacuationArea.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getSuggestedRoutes(userId: string) {
    const [location, warning] = await Promise.all([
      this.prisma.userLocationSnapshot.findUnique({
        where: { userId },
      }),
      this.prisma.warningEvent.findFirst({
        where: {
          status: 'SENT',
          OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
        },
        include: {
          evacuationAreas: {
            include: {
              evacuationArea: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (!location || !warning || warning.evacuationAreas.length === 0) {
      return [];
    }

    try {
      const suggestions = await Promise.all(
        warning.evacuationAreas.map(async (link) => {
          const result = await this.routingProvider.suggestRoute({
            warningEventId: warning.id,
            userId,
            evacuationAreaId: link.evacuationArea.id,
            originLatitude: location.latitude,
            originLongitude: location.longitude,
            destinationLatitude: link.evacuationArea.latitude,
            destinationLongitude: link.evacuationArea.longitude,
          });

          return this.prisma.evacuationRouteSuggestion.create({
            data: {
              warningEventId: warning.id,
              userId,
              evacuationAreaId: link.evacuationArea.id,
              originLatitude: location.latitude,
              originLongitude: location.longitude,
              etaMinutes: result.etaMinutes,
              distanceMeters: result.distanceMeters,
              polylineGeoJson: result.polylineGeoJson,
              provider: result.provider,
            },
            include: {
              evacuationArea: true,
            },
          });
        }),
      );

      return suggestions;
    } catch {
      throw new ServiceUnavailableException(
        'Route suggestions are temporarily unavailable. Please use recommended evacuation areas directly.',
      );
    }
  }
}
