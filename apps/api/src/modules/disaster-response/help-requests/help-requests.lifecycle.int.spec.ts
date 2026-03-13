import { Test, TestingModule } from '@nestjs/testing';
import { HelpRequestsController } from './help-requests.controller';
import { HelpRequestsService } from './help-requests.service';
import { TriageService } from './triage.service';
import { AuthSessionGuard } from '../../auth/auth-session.guard';
import { AuthService } from '../../auth/auth.service';
import { ApprovedVolunteerGuard } from '../shared/approved-volunteer.guard';
import { DisasterPolicyService } from '../shared/disaster-policy.service';
import { PrismaService } from '../../../core/database/database.service';

describe('HelpRequests Lifecycle (Integration)', () => {
  let controller: HelpRequestsController;
  let service: HelpRequestsService;
  let prisma: PrismaService;

  const mockPrisma = {
    helpRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    helpAssignment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    helpRequestEvent: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  const mockTriageService = {
    triage: jest.fn().mockReturnValue({ category: 'TRAPPED', suggestedUrgency: 'CRITICAL' }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelpRequestsController],
      providers: [
        HelpRequestsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TriageService, useValue: mockTriageService },
        { provide: AuthService, useValue: { getSession: jest.fn() } },
        { provide: AuthSessionGuard, useValue: { canActivate: jest.fn().mockResolvedValue(true) } },
        { provide: ApprovedVolunteerGuard, useValue: { canActivate: jest.fn().mockResolvedValue(true) } },
        {
          provide: DisasterPolicyService,
          useValue: { isApprovedVolunteer: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    controller = module.get<HelpRequestsController>(HelpRequestsController);
    service = module.get<HelpRequestsService>(HelpRequestsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a help request', async () => {
    const dto = {
      hazardType: 'FLOOD' as const,
      urgency: 'HIGH' as const,
      description: 'Stuck on roof',
      latitude: 1.5,
      longitude: 110.3,
    };
    const session = { user: { id: 'requester-1' } } as any;

    mockPrisma.helpRequest.create.mockResolvedValue({ id: 'hr-1', ...dto, requesterId: 'requester-1', status: 'OPEN', triageCategory: 'TRAPPED' });

    const result = await controller.create(session, dto);
    expect(result.id).toBe('hr-1');
    expect(mockPrisma.helpRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          description: 'Stuck on roof',
          triageCategory: 'TRAPPED',
          urgency: 'CRITICAL',
        }),
      }),
    );
  });

  it('should list open help requests', async () => {
    const session = { user: { id: 'vol-1' } } as any;
    mockPrisma.helpRequest.findMany.mockResolvedValue([{ id: 'hr-1', status: 'OPEN' }]);

    const result = await controller.listOpen(session);
    expect(result).toHaveLength(1);
    expect(mockPrisma.helpRequest.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ status: 'OPEN' }),
    }));
  });

  it('should claim a help request', async () => {
    const session = { user: { id: 'volunteer-1' } } as any;
    mockPrisma.helpRequest.findUnique.mockResolvedValue({ id: 'hr-1', status: 'OPEN' });
    mockPrisma.helpAssignment.create.mockResolvedValue({ id: 'as-1', helpRequestId: 'hr-1' });

    const result = await controller.claim('hr-1', session);
    expect(result.id).toBe('as-1');
    expect(mockPrisma.helpAssignment.create).toHaveBeenCalled();
    expect(mockPrisma.helpRequest.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { status: 'CLAIMED' }
    }));
  });

  it('should update assignment status', async () => {
    const session = { user: { id: 'volunteer-1' } } as any;
    mockPrisma.helpAssignment.findFirst.mockResolvedValue({ id: 'as-1', helpRequestId: 'hr-1' });
    mockPrisma.helpRequest.update.mockResolvedValue({ id: 'hr-1', status: 'IN_PROGRESS' });

    const result = await controller.updateStatus('hr-1', session, { nextStatus: 'IN_PROGRESS' });
    expect(result.status).toBe('IN_PROGRESS');
    expect(mockPrisma.helpAssignment.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { status: 'ON_SITE' }
    }));
  });
});
