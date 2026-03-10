import { Controller, Get, Param, Query } from '@nestjs/common';
import { TrackerService } from './tracker.service';

@Controller('tracker')
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  @Get('shipments')
  async getShipments(@Query('status') status?: string) {
    return this.trackerService.getShipments(status);
  }

  @Get('shipments/:id')
  async getShipmentById(@Param('id') id: string) {
    return this.trackerService.getShipmentById(id);
  }

  @Get('stats')
  async getStats() {
    return this.trackerService.getStats();
  }

  @Get('relief-zones')
  async getReliefZones() {
    return this.trackerService.getReliefZones();
  }

  @Get('validators')
  async getValidators() {
    return this.trackerService.getValidators();
  }

  @Get('donation-distribution')
  async getDonationDistribution() {
    return this.trackerService.getDonationDistribution();
  }
}
