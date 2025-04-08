const geocodeCache = new Map<string, { coords: [number, number]; timestamp: number }>();
const DEFAULT_COORDS: [number, number] = [1.3521, 103.8198]; // Singapore center
const CACHE_EXPIRY = 1000 * 60 * 60 * 24; // 1 day in milliseconds
const REQUEST_DELAY = 50;

let lastRequestTime = 0;

async function geocodeSingaporeAddress(postalCode: string): Promise<[number, number]> {
  const cacheKey = postalCode.trim();

  const cached = geocodeCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRY) {
    return cached.coords;
  }

  const now = Date.now();
  const delay = Math.max(0, REQUEST_DELAY - (now - lastRequestTime));
  await new Promise(resolve => setTimeout(resolve, delay));
  lastRequestTime = Date.now();

  try {
    const response = await fetch(
      `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(postalCode)}&returnGeom=Y&getAddrDetails=Y`
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    if (data.results?.length > 0) {
      const coords: [number, number] = [
        parseFloat(data.results[0].LATITUDE),
        parseFloat(data.results[0].LONGITUDE)
      ];
      geocodeCache.set(cacheKey, { coords, timestamp: Date.now() });
      return coords;
    }

    return DEFAULT_COORDS;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return DEFAULT_COORDS;
  }
}

export { geocodeSingaporeAddress };