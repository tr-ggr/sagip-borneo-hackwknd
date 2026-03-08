import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthSessionGuard } from '../../auth/auth-session.guard';
import { AuthSessionParam } from '../../auth/auth-session.decorator';
import type { AuthSession } from '../../auth/auth.types';
import { EvacuationService } from './evacuation.service';

@ApiTags('evacuation')
@ApiBearerAuth()
@UseGuards(AuthSessionGuard)
@Controller('evacuation')
export class EvacuationController {
  constructor(private readonly evacuationService: EvacuationService) {}

  @Get('areas')
  @ApiOperation({ summary: 'List active evacuation areas' })
  async areas() {
    return this.evacuationService.getAreas();
  }

  @Get('routes/suggested')
  @ApiOperation({ summary: 'Get warning-context route suggestions to shelters' })
  async suggested(@AuthSessionParam() session: AuthSession) {
    return this.evacuationService.getSuggestedRoutes(session.user.id);
  }
}
