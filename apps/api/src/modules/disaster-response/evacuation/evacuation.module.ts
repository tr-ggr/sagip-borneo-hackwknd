import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../core/database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { RoutingModule } from '../../routing/routing.module';
import { EvacuationController } from './evacuation.controller';
import { EvacuationService } from './evacuation.service';
import { HazardRiskLayerController } from './hazard-risk-layer.controller';
import { HttpHazardRoutingProvider } from './hazard-routing.provider';
import { SimpleRoutingProvider } from './simple-routing.provider';

@Module({
  imports: [DatabaseModule, AuthModule, RoutingModule],
  controllers: [EvacuationController, HazardRiskLayerController],
  providers: [EvacuationService, SimpleRoutingProvider, HttpHazardRoutingProvider],
  exports: [EvacuationService],
})
export class EvacuationModule {}
