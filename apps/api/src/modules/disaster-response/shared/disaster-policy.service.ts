import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/database.service';

@Injectable()
export class DisasterPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  isAdmin(userId: string): boolean {
    const raw = process.env.ADMIN_USER_IDS ?? '';
    const allowed = raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    return allowed.includes(userId);
  }

  async isApprovedVolunteer(userId: string): Promise<boolean> {
    const volunteer = await this.prisma.volunteerProfile.findUnique({
      where: { userId },
      select: { status: true },
    });

    return volunteer?.status === 'APPROVED';
  }
}
