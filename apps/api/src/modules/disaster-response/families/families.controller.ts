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
import { FamiliesService } from './families.service';

class CreateFamilyDto {
  name!: string;
}

class JoinFamilyDto {
  code!: string;
}

@ApiTags('families')
@ApiBearerAuth()
@UseGuards(AuthSessionGuard)
@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a family with permanent join code' })
  @ApiBody({ type: CreateFamilyDto })
  async createFamily(
    @AuthSessionParam() session: AuthSession,
    @Body() body: CreateFamilyDto,
  ) {
    return this.familiesService.createFamily(session.user.id, body.name);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join an existing family using code' })
  @ApiBody({ type: JoinFamilyDto })
  async joinFamily(
    @AuthSessionParam() session: AuthSession,
    @Body() body: JoinFamilyDto,
  ) {
    return this.familiesService.joinFamily(session.user.id, body.code);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user family memberships' })
  async getMe(@AuthSessionParam() session: AuthSession) {
    return this.familiesService.getMyFamilies(session.user.id);
  }

  @Get('me/map')
  @ApiOperation({ summary: 'Get map-focused family member visibility' })
  async getMyFamilyMap(@AuthSessionParam() session: AuthSession) {
    return this.familiesService.getMyFamilyMap(session.user.id);
  }
}
