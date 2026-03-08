import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../core/database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { WarningsController } from './warnings.controller';
import { WarningsService } from './warnings.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [WarningsController],
  providers: [WarningsService],
  exports: [WarningsService],
})
export class WarningsModule {}
