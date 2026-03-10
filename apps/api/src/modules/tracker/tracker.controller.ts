import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TrackerService } from './tracker.service';

@ApiTags('tracker')
@Controller('tracker')
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  @Get('shipments')
  @ApiOperation({ summary: 'Get all shipments' })
  async getShipments(@Query('status') status?: string) {
    return this.trackerService.getShipments(status);
  }

  @Get('shipments/:id')
  @ApiOperation({ summary: 'Get shipment by ID' })
  async getShipmentById(@Param('id') id: string) {
    return this.trackerService.getShipmentById(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get tracker statistics' })
  async getStats() {
    return this.trackerService.getStats();
  }

  @Get('relief-zones')
  @ApiOperation({ summary: 'Get relief zones' })
  async getReliefZones() {
    return this.trackerService.getReliefZones();
  }

  @Get('validators')
  @ApiOperation({ summary: 'Get validators' })
  async getValidators() {
    return this.trackerService.getValidators();
  }

  @Get('donation-distribution')
  @ApiOperation({ summary: 'Get donation distribution' })
  async getDonationDistribution() {
    return this.trackerService.getDonationDistribution();
  }
}
