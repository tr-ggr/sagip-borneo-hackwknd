import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminRoleGuard } from './admin-role.guard';

describe('AdminRoleGuard', () => {
  const policyMock = {
    isAdmin: jest.fn(),
  };

  const guard = new AdminRoleGuard(policyMock as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects when auth session is missing', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ authSession: undefined }),
      }),
    } as never;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects non-admin users', async () => {
    policyMock.isAdmin.mockReturnValue(false);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ authSession: { user: { id: 'user-1' } } }),
      }),
    } as never;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows admins', async () => {
    policyMock.isAdmin.mockReturnValue(true);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ authSession: { user: { id: 'admin-1' } } }),
      }),
    } as never;

    expect(guard.canActivate(context)).toBe(true);
  });
});
