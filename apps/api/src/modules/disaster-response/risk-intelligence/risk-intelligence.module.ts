import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../core/database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { OpenMeteoModule } from '../../../providers/open-meteo/open-meteo.module';
import { RiskIntelligenceController } from './risk-intelligence.controller';
import { RiskIntelligenceService } from './risk-intelligence.service';

@Module({
  imports: [DatabaseModule, OpenMeteoModule, AuthModule],
  controllers: [RiskIntelligenceController],
  providers: [RiskIntelligenceService],
  exports: [RiskIntelligenceService],
})
export class RiskIntelligenceModule {}
