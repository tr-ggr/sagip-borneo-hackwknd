import { BadRequestException } from '@nestjs/common';

export function parseLatitudeLongitude(input: {
  latitude: string | number;
  longitude: string | number;
}): { latitude: number; longitude: number } {
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new BadRequestException('latitude must be a valid number between -90 and 90.');
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new BadRequestException('longitude must be a valid number between -180 and 180.');
  }

  return { latitude, longitude };
}

export function parseDateRange(input: {
  startsAt: string;
  endsAt?: string;
}): { startsAt: Date; endsAt?: Date } {
  const startsAt = new Date(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    throw new BadRequestException('startsAt must be a valid ISO date.');
  }

  if (!input.endsAt) {
    return { startsAt };
  }

  const endsAt = new Date(input.endsAt);
  if (Number.isNaN(endsAt.getTime())) {
    throw new BadRequestException('endsAt must be a valid ISO date.');
  }

  if (endsAt < startsAt) {
    throw new BadRequestException('endsAt must be greater than or equal to startsAt.');
  }

  return { startsAt, endsAt };
}
