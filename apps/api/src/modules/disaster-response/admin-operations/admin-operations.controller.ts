import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthSessionGuard } from '../../auth/auth-session.guard';
import { AuthSessionParam } from '../../auth/auth-session.decorator';
import type { AuthSession } from '../../auth/auth.types';
import { AdminRoleGuard } from '../shared/admin-role.guard';
import { parseDateRange } from '../shared/request-validation';
import { AdminOperationsService } from './admin-operations.service';

class ReviewVolunteerDto {
  nextStatus!: 'APPROVED' | 'REJECTED';
  reason?: string;
}

class WarningTargetDto {
  areaName!: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  polygonGeoJson?: string;
}

class CreateWarningDto {
  title!: string;
  message!: string;
  hazardType!: 'FLOOD' | 'TYPHOON' | 'EARTHQUAKE' | 'AFTERSHOCK';
  severity!: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  startsAt!: string;
  endsAt?: string;
  suggestedPrompt?: string;
  targets!: WarningTargetDto[];
  evacuationAreaIds!: string[];
}

class WarningPromptSuggestionDto {
  hazardType!: string;
  areaOrRegion!: string;
  radiusKm?: number;
}

@ApiTags('admin-operations')
@ApiBearerAuth()
@UseGuards(AuthSessionGuard, AdminRoleGuard)
@Controller('admin')
export class AdminOperationsController {
  constructor(private readonly adminService: AdminOperationsService) {}

  @Post('volunteers/applications/:id/review')
  @ApiOperation({ summary: 'Approve or reject volunteer application' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: ReviewVolunteerDto })
  async reviewVolunteer(
    @Param('id') applicationId: string,
    @AuthSessionParam() session: AuthSession,
    @Body() body: ReviewVolunteerDto,
  ) {
    return this.adminService.reviewVolunteerApplication({
      applicationId,
      reviewerId: session.user.id,
      nextStatus: body.nextStatus,
      reason: body.reason,
    });
  }

  @Post('warnings')
  @ApiOperation({ summary: 'Manually create and dispatch warning event' })
  @ApiBody({ type: CreateWarningDto })
  async createWarning(
    @AuthSessionParam() session: AuthSession,
    @Body() body: CreateWarningDto,
  ) {
    const schedule = parseDateRange({
      startsAt: body.startsAt,
      endsAt: body.endsAt,
    });

    return this.adminService.createWarning({
      title: body.title,
      message: body.message,
      hazardType: body.hazardType,
      severity: body.severity,
      startsAt: schedule.startsAt,
      endsAt: schedule.endsAt,
      suggestedPrompt: body.suggestedPrompt,
      creatorId: session.user.id,
      targets: body.targets,
      evacuationAreaIds: body.evacuationAreaIds,
    });
  }

  @Get('vulnerable-regions')
  @ApiOperation({ summary: 'Get vulnerable region dashboard data' })
  async vulnerableRegions() {
    return this.adminService.getVulnerableRegions();
  }

  @Get('pins/statuses')
  @ApiOperation({ summary: 'Get operational pin statuses' })
  async pinStatuses() {
    return this.adminService.getPinStatuses();
  }

  @Post('warnings/prompt-suggestion')
  @ApiOperation({ summary: 'Get suggested warning prompt template' })
  @ApiBody({ type: WarningPromptSuggestionDto })
  getPromptSuggestion(@Body() body: WarningPromptSuggestionDto) {
    return this.adminService.getWarningPromptSuggestion(body);
  }
}
