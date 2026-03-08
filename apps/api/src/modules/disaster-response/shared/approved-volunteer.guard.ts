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
export class ApprovedVolunteerGuard implements CanActivate {
  constructor(private readonly policy: DisasterPolicyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.authSession?.user.id;

    if (!userId) {
      throw new UnauthorizedException('Authentication is required.');
    }

    const approved = await this.policy.isApprovedVolunteer(userId);
    if (!approved) {
      throw new ForbiddenException(
        'Only approved volunteers can perform this action.',
      );
    }

    return true;
  }
}
