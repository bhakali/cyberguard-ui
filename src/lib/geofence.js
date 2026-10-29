// Static post-coordinate lookup, matching the exact site-post names used by
// employees[].siteAssigned (and therefore by roster.svelte.js / the
// attendance roster grid). No dedicated posts registry exists in this
// prototype — this mirrors that same scope trim, just for coordinates
// instead of names.
export const SITE_COORDINATES = {
  'Copperbelt Regional HQ - Kitwe': { lat: -12.8024, lng: 28.2132, radiusMeters: 300 },
  'Corporate HQ - Lusaka': { lat: -15.3875, lng: 28.3228, radiusMeters: 300 },
  'KCM Open Pit Perimeter Post 4': { lat: -12.5085, lng: 27.8371, radiusMeters: 500 },
  'Kansanshi Copper Gate 1 & 2': { lat: -12.1621, lng: 26.4075, radiusMeters: 500 },
  'Kitwe Industrial Area Cluster': { lat: -12.8252, lng: 28.1974, radiusMeters: 400 },
  'Konkola Mine Smelter Post': { lat: -12.7747, lng: 27.8878, radiusMeters: 500 },
  'Lusaka Breweries Logistics Gate': { lat: -15.4304, lng: 28.2802, radiusMeters: 300 },
  'Lusaka Commercial Roster': { lat: -15.4067, lng: 28.2871, radiusMeters: 300 },
  'National Ops Command Hub': { lat: -15.3875, lng: 28.3228, radiusMeters: 300 },
  'Southern Regional HQ - Lusaka': { lat: -15.4166, lng: 28.2833, radiusMeters: 300 }
};

export function haversineDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// coords is a GeolocationCoordinates-like object: { latitude, longitude }.
// Returns null distance/false withinRadius if the post has no known
// coordinates or no device coordinates were supplied (manual override path).
export function checkGeofence(post, coords) {
  const site = SITE_COORDINATES[post];
  if (!site || !coords) {
    return { distanceMeters: null, withinRadius: false };
  }
  const distanceMeters = Math.round(
    haversineDistanceMeters(coords.latitude, coords.longitude, site.lat, site.lng)
  );
  return { distanceMeters, withinRadius: distanceMeters <= site.radiusMeters };
}
