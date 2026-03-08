export interface RouteSuggestionInput {
  warningEventId: string;
  userId: string;
  familyId?: string;
  originLatitude: number;
  originLongitude: number;
  evacuationAreaId: string;
  destinationLatitude: number;
  destinationLongitude: number;
}

export interface RouteSuggestionResult {
  etaMinutes: number;
  distanceMeters: number;
  polylineGeoJson?: string;
  provider: string;
}

export interface EvacuationRoutingProvider {
  suggestRoute(input: RouteSuggestionInput): Promise<RouteSuggestionResult>;
}
