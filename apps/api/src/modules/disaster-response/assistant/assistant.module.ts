import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { SimpleAssistantProvider } from './simple-assistant.provider';

@Module({
  imports: [AuthModule],
  controllers: [AssistantController],
  providers: [AssistantService, SimpleAssistantProvider],
  exports: [AssistantService],
})
export class AssistantModule {}
