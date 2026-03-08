import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../auth/auth-session.guard';
import { DisasterPolicyService } from './disaster-policy.service';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private readonly policy: DisasterPolicyService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.authSession?.user.id;

    if (!userId) {
      throw new UnauthorizedException('Authentication is required.');
    }

    const role = request.authSession?.user.role;

    if (!this.policy.isAdmin(userId, role)) {
      throw new ForbiddenException('Admin access is required for this action.');
    }

    return true;
  }
}
