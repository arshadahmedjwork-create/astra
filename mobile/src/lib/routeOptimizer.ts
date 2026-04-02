/**
 * routeOptimizer.ts
 * ─────────────────────────────────────────────────────────────────
 * Nearest-Neighbour route optimizer for delivery partners.
 *
 * Algorithm:
 *   1. Build distance matrix via OSRM Table API (actual road distances).
 *      Falls back to Haversine if OSRM is unreachable.
 *   2. Run Nearest-Neighbour greedy heuristic over the matrix: O(N²).
 *   3. Return the ordered stop list + road polyline for the map.
 *
 * Public OSRM endpoint is used (no API key required).
 * For production you should self-host or use a paid routing API.
 */

export interface LatLng {
    lat: number;
    lng: number;
}

export interface DeliveryStop {
    orderId:      string;
    customerName: string;
    addressText:  string;
    lat:          number;
    lng:          number;
    totalAmount:  number;
    status:       string;
    raw:          any; // original order row from Supabase
}

export interface OptimizationResult {
    sorted:           DeliveryStop[];
    totalRouteKm:     number;
    estimatedMinutes: number; // ≈ 20 km/h city average
    polyline:         LatLng[];
}

// ─── Distance helpers ─────────────────────────────────────────────────────────

/** Haversine great-circle distance in **metres** (offline fallback). */
export function haversineMeters(a: LatLng, b: LatLng): number {
    const R = 6_371_000;
    const φ1 = (a.lat * Math.PI) / 180;
    const φ2 = (b.lat * Math.PI) / 180;
    const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
    const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
    const h  =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Nominatim (OpenStreetMap) free geocoder — used when addresses lack lat/lng. */
export async function geocodeAddress(address: string): Promise<LatLng | null> {
    try {
        const q   = encodeURIComponent(`${address}, India`);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`;
        const res = await fetch(url, {
            headers: { 'Accept-Language': 'en', 'User-Agent': 'AstraDairy/1.0' },
        });
        const data = await res.json();
        if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        return null;
    } catch {
        return null;
    }
}

// ─── OSRM wrappers ────────────────────────────────────────────────────────────

const OSRM_BASE = 'https://router.project-osrm.org';

/**
 * OSRM Table API — returns a full N×N road-distance matrix (metres).
 * Falls back to Haversine matrix on network failure.
 */
export async function getOSRMDistanceMatrix(coords: LatLng[]): Promise<number[][]> {
    if (coords.length < 2) return [[0]];
    try {
        const coordStr = coords.map(c => `${c.lng},${c.lat}`).join(';');
        const url = `${OSRM_BASE}/table/v1/driving/${coordStr}?annotations=distance`;
        const res  = await fetch(url);
        const data = await res.json();
        if (data.code === 'Ok' && data.distances) return data.distances as number[][];
        throw new Error(data.code || 'OSRM error');
    } catch {
        // Fallback: Haversine matrix
        return coords.map(a => coords.map(b => haversineMeters(a, b)));
    }
}

/**
 * OSRM Route API — returns simplified road polyline for map display.
 * Falls back to straight-line waypoints on failure.
 */
export async function getOSRMRoutePolyline(coords: LatLng[]): Promise<LatLng[]> {
    if (coords.length < 2) return coords;
    try {
        const coordStr = coords.map(c => `${c.lng},${c.lat}`).join(';');
        const url  = `${OSRM_BASE}/route/v1/driving/${coordStr}?overview=simplified&geometries=geojson`;
        const res  = await fetch(url);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
            return (data.routes[0].geometry.coordinates as [number, number][]).map(
                ([lng, lat]) => ({ lat, lng }),
            );
        }
        return coords;
    } catch {
        return coords;
    }
}

// ─── Nearest-Neighbour algorithm ──────────────────────────────────────────────

/**
 * Runs Nearest-Neighbour heuristic on a pre-computed distance matrix.
 *
 * @param distances  (n+1)×(n+1) matrix where index 0 = driver location,
 *                   indices 1..n = delivery stops.
 * @param orderCount Number of orders (n).
 * @returns          0-based indices into the original orders array, in visit order.
 */
export function nearestNeighborRoute(distances: number[][], orderCount: number): number[] {
    const visited = new Set<number>();
    const route:   number[] = [];
    let current = 0; // start from driver position (index 0)

    while (route.length < orderCount) {
        let best     = -1;
        let bestDist = Infinity;
        for (let i = 1; i <= orderCount; i++) {
            if (!visited.has(i)) {
                const d = distances[current]?.[i] ?? Infinity;
                if (d < bestDist) { bestDist = d; best = i; }
            }
        }
        if (best === -1) break;
        visited.add(best);
        route.push(best - 1); // to 0-based order index
        current = best;
    }
    return route;
}

// ─── Main optimizer entry point ───────────────────────────────────────────────

/**
 * Optimizes the delivery route for a driver.
 *
 * Steps:
 *  1. Resolve lat/lng for each order (from stored address, or Nominatim geocode).
 *  2. Fetch OSRM road-distance matrix (falls back to Haversine).
 *  3. Run Nearest-Neighbour to produce the optimal visit sequence.
 *  4. Fetch road polyline for map display.
 *
 * @param driverLocation  Driver's current GPS position.
 * @param orders          Raw order rows from Supabase
 *                        (must include `customers(full_name, addresses(*))`).
 */
export async function optimizeDeliveryRoute(
    driverLocation: LatLng,
    orders: any[],
): Promise<OptimizationResult> {

    // ── 1. Build stop list with resolved coordinates ──────────────────────────
    const stops: DeliveryStop[] = [];

    for (const order of orders) {
        const cust = Array.isArray(order.customers) ? order.customers[0] : order.customers;
        const addr = cust?.addresses?.[0] ?? cust?.address ?? {};

        let lat = addr?.lat  ? parseFloat(String(addr.lat))  : NaN;
        let lng = addr?.lng  ? parseFloat(String(addr.lng))  : NaN;

        // Geocode if no coordinates stored
        if (!isFinite(lat) || !isFinite(lng)) {
            const addrStr = [addr?.door_no, addr?.street, addr?.area, addr?.city]
                .filter(Boolean).join(', ');
            if (addrStr) {
                const geo = await geocodeAddress(addrStr);
                if (geo) { lat = geo.lat; lng = geo.lng; }
            }
        }

        // Last resort: driver location (effectively sorted last by NN)
        if (!isFinite(lat) || !isFinite(lng)) {
            lat = driverLocation.lat;
            lng = driverLocation.lng;
        }

        stops.push({
            orderId:      order.id,
            customerName: cust?.full_name ?? 'Unknown',
            addressText:  [addr?.door_no, addr?.street, addr?.area, addr?.city]
                              .filter(Boolean).join(', ') || 'Address unavailable',
            lat,
            lng,
            totalAmount: order.total_amount ?? 0,
            status:      order.status ?? 'pending',
            raw:         order,
        });
    }

    if (stops.length === 0) {
        return { sorted: [], totalRouteKm: 0, estimatedMinutes: 0, polyline: [] };
    }

    // ── 2. Build coordinate list (driver first) ───────────────────────────────
    const coords: LatLng[] = [
        driverLocation,
        ...stops.map(s => ({ lat: s.lat, lng: s.lng })),
    ];

    // ── 3. Distance matrix ───────────────────────────────────────────────────
    const matrix = await getOSRMDistanceMatrix(coords);

    // ── 4. Nearest-Neighbour sort ────────────────────────────────────────────
    const orderedIndices = nearestNeighborRoute(matrix, stops.length);
    const sorted = orderedIndices.map(i => stops[i]);

    // ── 5. Total route distance ──────────────────────────────────────────────
    let totalMeters = 0;
    let prev = 0;
    for (const idx of orderedIndices) {
        totalMeters += matrix[prev]?.[idx + 1] ?? 0;
        prev = idx + 1;
    }
    const totalRouteKm = parseFloat((totalMeters / 1000).toFixed(1));

    // ── 6. Road polyline (driver → stop1 → stop2 → …) ────────────────────────
    const routeWaypoints: LatLng[] = [
        driverLocation,
        ...sorted.map(s => ({ lat: s.lat, lng: s.lng })),
    ];
    // Limit OSRM waypoints to 25 to stay within free-tier limits
    const polylineWaypoints = routeWaypoints.length > 25
        ? routeWaypoints.filter((_, i) => i % 2 === 0)
        : routeWaypoints;
    const polyline = await getOSRMRoutePolyline(polylineWaypoints);

    return {
        sorted,
        totalRouteKm,
        estimatedMinutes: Math.round((totalRouteKm / 20) * 60), // 20 km/h city avg
        polyline,
    };
}
