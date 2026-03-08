export function withinRadiusKm(input: {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  radiusKm: number;
}): boolean {
  const distance = haversineKm(
    input.fromLat,
    input.fromLng,
    input.toLat,
    input.toLng,
  );

  return distance <= input.radiusKm;
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}
