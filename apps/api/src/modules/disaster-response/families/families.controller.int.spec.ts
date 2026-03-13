import { Test, TestingModule } from '@nestjs/testing';
import { AuthSessionGuard } from '../../auth/auth-session.guard';
import { AuthService } from '../../auth/auth.service';
import { FamiliesController } from './families.controller';
import { FamiliesService } from './families.service';

describe('FamiliesController (integration-ish)', () => {
  let moduleRef: TestingModule;
  let controller: FamiliesController;

  const familiesServiceMock = {
    createFamily: jest.fn(),
    joinFamily: jest.fn(),
    getMyFamilies: jest.fn(),
    getMyFamilyMap: jest.fn(),
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [FamiliesController],
      providers: [
        {
          provide: AuthSessionGuard,
          useValue: {
            canActivate: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getSession: jest.fn(),
          },
        },
        {
          provide: FamiliesService,
          useValue: familiesServiceMock,
        },
      ],
    }).compile();

    controller = moduleRef.get<FamiliesController>(FamiliesController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a family from authenticated session context', async () => {
    familiesServiceMock.createFamily.mockResolvedValue({
      id: 'family-1',
      code: 'ABCDE123',
      name: 'Household Alpha',
    });

    await expect(
      controller.createFamily(
        { user: { id: 'user-1' } } as never,
        { name: 'Household Alpha' },
      ),
    ).resolves.toEqual({
      id: 'family-1',
      code: 'ABCDE123',
      name: 'Household Alpha',
    });

    expect(familiesServiceMock.createFamily).toHaveBeenCalledWith(
      'user-1',
      'Household Alpha',
    );
  });
});
