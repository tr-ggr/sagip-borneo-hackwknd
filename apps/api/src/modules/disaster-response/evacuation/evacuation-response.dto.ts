import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NearestEvacResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  latitude!: number;

  @ApiProperty()
  longitude!: number;

  @ApiPropertyOptional({ nullable: true })
  address!: string | null;

  @ApiPropertyOptional({ nullable: true })
  region!: string | null;

  @ApiPropertyOptional({ nullable: true })
  type?: string | null;

  @ApiPropertyOptional({ nullable: true })
  capacity?: string | null;

  @ApiPropertyOptional({ nullable: true })
  population?: string | null;

  @ApiPropertyOptional({ nullable: true })
  source?: string | null;

  @ApiPropertyOptional()
  durationSeconds?: number;

  @ApiPropertyOptional()
  distanceMeters?: number;

  @ApiPropertyOptional({
    description: 'Route geometry when hazard-aware or OSRM route is available',
    example: { type: 'LineString', coordinates: [[123.9, 10.3], [123.91, 10.31]] },
  })
  geometry?: { type: 'LineString'; coordinates: [number, number][] };

  @ApiPropertyOptional({
    description: 'Average risk (0–1) along the path; present when hazard-aware routing was used',
  })
  avgRisk?: number;

  @ApiPropertyOptional({
    description: 'Total risk cost; present when hazard-aware routing was used',
  })
  totalRiskCost?: number;

  @ApiPropertyOptional({
    description: 'True when route was computed by the hazard-aware routing service',
  })
  hazardAware?: boolean;
}

export class RouteToAreaResponseDto {
  @ApiProperty({ description: 'Evacuation area summary' })
  evacuationArea!: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string | null;
    region: string | null;
  };

  @ApiPropertyOptional({ description: 'Route geometry (LineString)' })
  geometry?: { type: 'LineString'; coordinates: [number, number][] };

  @ApiPropertyOptional()
  durationSeconds?: number;

  @ApiPropertyOptional()
  distanceMeters?: number;

  @ApiPropertyOptional({ description: 'Average risk when hazard-aware' })
  avgRisk?: number;

  @ApiPropertyOptional({ description: 'Total risk cost when hazard-aware' })
  totalRiskCost?: number;

  @ApiPropertyOptional({ description: 'True when hazard-aware routing was used' })
  hazardAware?: boolean;
}
