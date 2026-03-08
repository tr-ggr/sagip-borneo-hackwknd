import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ApprovedVolunteerGuard } from './approved-volunteer.guard';

describe('ApprovedVolunteerGuard', () => {
  const policyMock = {
    isApprovedVolunteer: jest.fn(),
  };

  const guard = new ApprovedVolunteerGuard(policyMock as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects when auth session is missing', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ authSession: undefined }),
      }),
    } as never;

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects users without approved volunteer status', async () => {
    policyMock.isApprovedVolunteer.mockResolvedValue(false);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ authSession: { user: { id: 'user-1' } } }),
      }),
    } as never;

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('allows approved volunteers', async () => {
    policyMock.isApprovedVolunteer.mockResolvedValue(true);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ authSession: { user: { id: 'volunteer-1' } } }),
      }),
    } as never;

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
