import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthSessionGuard } from '../../auth/auth-session.guard';
import { AuthSessionParam } from '../../auth/auth-session.decorator';
import type { AuthSession } from '../../auth/auth.types';
import { VolunteersService } from './volunteers.service';

class VolunteerApplicationDto {
  notes?: string;
}

@ApiTags('volunteers')
@ApiBearerAuth()
@UseGuards(AuthSessionGuard)
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Post('applications')
  @ApiOperation({ summary: 'Submit volunteer application' })
  @ApiBody({ type: VolunteerApplicationDto })
  async apply(
    @AuthSessionParam() session: AuthSession,
    @Body() body: VolunteerApplicationDto,
  ) {
    return this.volunteersService.apply(session.user.id, body.notes);
  }

  @Get('me/status')
  @ApiOperation({ summary: 'Get volunteer profile/application status' })
  async getStatus(@AuthSessionParam() session: AuthSession) {
    return this.volunteersService.myStatus(session.user.id);
  }
}
