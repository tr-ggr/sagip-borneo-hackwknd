import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthSessionParam } from './auth/auth-session.decorator';
import { AuthSessionGuard } from './auth/auth-session.guard';
import type { AuthSession } from './auth/auth.types';
import { AppService } from './app.service';
import { MessageResponseDto, ProtectedDataResponseDto } from './dto/app.dto';

@Controller()
@ApiTags('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get a greeting message' })
  @ApiOkResponse({ type: MessageResponseDto })
  async getData(): Promise<MessageResponseDto> {
    return this.appService.getData();
  }

  @Get('protected')
  @UseGuards(AuthSessionGuard)
  @ApiOperation({ summary: 'Get protected data for the authenticated user' })
  @ApiOkResponse({ type: ProtectedDataResponseDto })
  async getProtectedData(
    @AuthSessionParam() authSession: AuthSession,
  ): Promise<ProtectedDataResponseDto> {
    return {
      message: `Hello ${authSession.user.name}`,
      userId: authSession.user.id,
      authenticated: true,
    };
  }
}
