import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthSessionGuard } from '../../auth/auth-session.guard';
import { AuthSessionParam } from '../../auth/auth-session.decorator';
import type { AuthSession } from '../../auth/auth.types';
import { WarningsService } from './warnings.service';

@ApiTags('warnings')
@ApiBearerAuth()
@UseGuards(AuthSessionGuard)
@Controller('warnings')
export class WarningsController {
  constructor(private readonly warningsService: WarningsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get active warnings affecting current user' })
  async me(@AuthSessionParam() session: AuthSession) {
    return this.warningsService.getMyWarnings(session.user.id);
  }

  @Get('family')
  @ApiOperation({ summary: 'Get active warnings affecting current family group' })
  async family(@AuthSessionParam() session: AuthSession) {
    return this.warningsService.getFamilyWarnings(session.user.id);
  }
}
