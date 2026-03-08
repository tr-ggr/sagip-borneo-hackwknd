export interface TimelineEventContract {
  id: string;
  status: string;
  createdAt: Date;
  note?: string | null;
  actorId?: string | null;
}

export interface GeoPointContract {
  latitude: number;
  longitude: number;
}

export interface GeoTimelineResponseContract {
  location: GeoPointContract;
  timeline: TimelineEventContract[];
}
