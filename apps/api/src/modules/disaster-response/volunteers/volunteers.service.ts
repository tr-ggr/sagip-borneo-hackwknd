import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/database.service';

@Injectable()
export class VolunteersService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, notes?: string) {
    const activeApplication = await this.prisma.volunteerApplication.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    if (activeApplication) {
      throw new BadRequestException('You already have a pending volunteer application.');
    }

    await this.prisma.volunteerProfile.upsert({
      where: { userId },
      update: {
        status: 'PENDING',
      },
      create: {
        userId,
        status: 'PENDING',
      },
    });

    return this.prisma.volunteerApplication.create({
      data: {
        userId,
        status: 'PENDING',
        notes,
      },
    });
  }

  async myStatus(userId: string) {
    const [profile, latestApplication] = await Promise.all([
      this.prisma.volunteerProfile.findUnique({ where: { userId } }),
      this.prisma.volunteerApplication.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      profile,
      latestApplication,
    };
  }
}
