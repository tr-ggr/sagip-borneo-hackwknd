import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/database/database.service';

@Injectable()
export class FamiliesService {
  constructor(private readonly prisma: PrismaService) {}

  async createFamily(userId: string, name: string) {
    const code = this.generateFamilyCode();

    return this.prisma.family.create({
      data: {
        name,
        code,
        createdById: userId,
        members: {
          create: {
            userId,
            role: 'LEADER',
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async joinFamily(userId: string, code: string) {
    const family = await this.prisma.family.findUnique({ where: { code } });
    if (!family) {
      throw new NotFoundException('Family code not found.');
    }

    return this.prisma.familyMember.upsert({
      where: {
        familyId_userId: {
          familyId: family.id,
          userId,
        },
      },
      update: {},
      create: {
        familyId: family.id,
        userId,
      },
      include: {
        family: true,
      },
    });
  }

  async getMyFamilies(userId: string) {
    return this.prisma.familyMember.findMany({
      where: { userId },
      include: {
        family: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    locationSnapshot: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getMyFamilyMap(userId: string) {
    const families = await this.getMyFamilies(userId);

    return families.map((membership) => ({
      familyId: membership.family.id,
      familyName: membership.family.name,
      familyCode: membership.family.code,
      members: membership.family.members.map((member) => ({
        userId: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
        location: member.user.locationSnapshot,
      })),
    }));
  }

  private generateFamilyCode(): string {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
  }
}
