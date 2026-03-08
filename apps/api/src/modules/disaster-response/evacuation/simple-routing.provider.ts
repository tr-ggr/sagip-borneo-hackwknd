import { Injectable } from '@nestjs/common';
import { haversineKm } from '../shared/geo.util';
import {
  type EvacuationRoutingProvider,
  type RouteSuggestionInput,
  type RouteSuggestionResult,
} from './routing.provider';

@Injectable()
export class SimpleRoutingProvider implements EvacuationRoutingProvider {
  async suggestRoute(
    input: RouteSuggestionInput,
  ): Promise<RouteSuggestionResult> {
    const km = haversineKm(
      input.originLatitude,
      input.originLongitude,
      input.destinationLatitude,
      input.destinationLongitude,
    );

    const distanceMeters = Math.round(km * 1000);
    const etaMinutes = Math.max(2, Math.round((km / 30) * 60));

    return {
      etaMinutes,
      distanceMeters,
      provider: 'simple-haversine-routing',
      polylineGeoJson: undefined,
    };
  }
}
