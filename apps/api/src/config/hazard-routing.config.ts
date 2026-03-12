export interface HazardRoutingConfig {
  hazardRoutingServerUrl: string;
  hazardRoutingTimeoutMs: number;
}

/**
 * Returns hazard routing config when HAZARD_ROUTING_SERVER_URL is set.
 * When not set, the API uses OSRM-only routing (no hazard-aware paths).
 */
export function getHazardRoutingConfig(): HazardRoutingConfig | null {
  const url = process.env.HAZARD_ROUTING_SERVER_URL?.trim();
  if (!url) return null;
  const timeoutMs = parseInt(
    process.env.HAZARD_ROUTING_TIMEOUT_MS?.trim() || '15000',
    10,
  );
  if (Number.isNaN(timeoutMs) || timeoutMs <= 0) {
    return { hazardRoutingServerUrl: url, hazardRoutingTimeoutMs: 15000 };
  }
  return { hazardRoutingServerUrl: url, hazardRoutingTimeoutMs: timeoutMs };
}
