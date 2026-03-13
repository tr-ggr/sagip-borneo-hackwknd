import { Test, TestingModule } from '@nestjs/testing';
import { FamiliesController } from './families/families.controller';
import { FamiliesService } from './families/families.service';
import { AdminOperationsController } from './admin-operations/admin-operations.controller';
import { AdminOperationsService } from './admin-operations/admin-operations.service';
import { HelpRequestsController } from './help-requests/help-requests.controller';
import { HelpRequestsService } from './help-requests/help-requests.service';
import { EvacuationController } from './evacuation/evacuation.controller';
import { EvacuationService } from './evacuation/evacuation.service';
import { AuthSessionGuard } from '../auth/auth-session.guard';
import { AuthService } from '../auth/auth.service';
import { AdminRoleGuard } from './shared/admin-role.guard';
import { ApprovedVolunteerGuard } from './shared/approved-volunteer.guard';
import { DisasterPolicyService } from './shared/disaster-policy.service';

describe('DisasterResponse critical flows (integration-ish)', () => {
  let moduleRef: TestingModule;
  let familiesController: FamiliesController;
  let adminController: AdminOperationsController;
  let helpRequestsController: HelpRequestsController;
  let evacuationController: EvacuationController;

  const familiesServiceMock = {
    joinFamily: jest.fn(),
  };

  const adminServiceMock = {
    createWarning: jest.fn(),
    reviewVolunteerApplication: jest.fn(),
  };

  const helpRequestsServiceMock = {
    claim: jest.fn(),
  };

  const evacuationServiceMock = {
    getSuggestedRoutes: jest.fn(),
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [
        FamiliesController,
        AdminOperationsController,
        HelpRequestsController,
        EvacuationController,
      ],
      providers: [
        { provide: AuthSessionGuard, useValue: { canActivate: jest.fn().mockResolvedValue(true) } },
        { provide: AdminRoleGuard, useValue: { canActivate: jest.fn().mockResolvedValue(true) } },
        { provide: ApprovedVolunteerGuard, useValue: { canActivate: jest.fn().mockResolvedValue(true) } },
        {
          provide: DisasterPolicyService,
          useValue: {
            isAdmin: jest.fn().mockReturnValue(true),
            isApprovedVolunteer: jest.fn().mockResolvedValue(true),
          },
        },
        { provide: AuthService, useValue: { getSession: jest.fn() } },
        { provide: FamiliesService, useValue: familiesServiceMock },
        { provide: AdminOperationsService, useValue: adminServiceMock },
        { provide: HelpRequestsService, useValue: helpRequestsServiceMock },
        { provide: EvacuationService, useValue: evacuationServiceMock },
      ],
    }).compile();

    familiesController = moduleRef.get(FamiliesController);
    adminController = moduleRef.get(AdminOperationsController);
    helpRequestsController = moduleRef.get(HelpRequestsController);
    evacuationController = moduleRef.get(EvacuationController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('covers family join critical flow', async () => {
    familiesServiceMock.joinFamily.mockResolvedValue({ familyId: 'family-1' });

    await expect(
      familiesController.joinFamily(
        { user: { id: 'user-1' } } as never,
        { code: 'ABCD1234' },
      ),
    ).resolves.toEqual({ familyId: 'family-1' });
  });

  it('covers admin warning dispatch and volunteer approval flows', async () => {
    adminServiceMock.reviewVolunteerApplication.mockResolvedValue({ id: 'app-1' });
    adminServiceMock.createWarning.mockResolvedValue({ id: 'warning-1' });

    await expect(
      adminController.reviewVolunteer(
        'app-1',
        { user: { id: 'admin-1' } } as never,
        { nextStatus: 'APPROVED' },
      ),
    ).resolves.toEqual({ id: 'app-1' });

    await expect(
      adminController.createWarning(
        { user: { id: 'admin-1' } } as never,
        {
          title: 'Flood alert',
          message: 'Move to higher ground',
          hazardType: 'FLOOD',
          severity: 'HIGH',
          startsAt: '2030-01-01T00:00:00.000Z',
          targets: [{ areaName: 'Zone A', radiusKm: 5 }],
          evacuationAreaIds: ['evac-1'],
        },
      ),
    ).resolves.toEqual({ id: 'warning-1' });
  });

  it('covers help assignment and route suggestion retrieval flows', async () => {
    helpRequestsServiceMock.claim.mockResolvedValue({ id: 'assignment-1' });
    evacuationServiceMock.getSuggestedRoutes.mockResolvedValue([
      { id: 'route-1' },
    ]);

    await expect(
      helpRequestsController.claim('help-1', { user: { id: 'vol-1' } } as never),
    ).resolves.toEqual({ id: 'assignment-1' });

    await expect(
      evacuationController.suggested({ user: { id: 'user-1' } } as never),
    ).resolves.toEqual([{ id: 'route-1' }]);
  });
});
