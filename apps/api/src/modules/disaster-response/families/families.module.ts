import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../core/database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { FamiliesController } from './families.controller';
import { FamiliesService } from './families.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [FamiliesController],
  providers: [FamiliesService],
  exports: [FamiliesService],
})
export class FamiliesModule {}
