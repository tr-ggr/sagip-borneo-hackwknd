import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthSessionGuard } from '../../auth/auth-session.guard';
import { AssistantService } from './assistant.service';

class AssistantInquiryDto {
  question!: string;
  location?: string;
  hazardType?: string;
}

@ApiTags('assistant')
@ApiBearerAuth()
@UseGuards(AuthSessionGuard)
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('inquiries')
  @ApiOperation({ summary: 'Ask disaster preparedness assistant' })
  @ApiBody({ type: AssistantInquiryDto })
  async inquire(@Body() body: AssistantInquiryDto) {
    return this.assistantService.answerInquiry({
      question: body.question,
      location: body.location,
      hazardType: body.hazardType,
    });
  }
}
