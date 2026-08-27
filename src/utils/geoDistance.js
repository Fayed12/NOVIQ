/**
 * NOVIQ Geolocation & Distance Utility
 * Provides Haversine distance calculations and coordinate mapping.
 */

// Egypt Governorates & Key District Presets for Geolocation Filtering
export const POPULAR_CITIES = [
    { name: "All Cities (Egypt)", lat: null, lng: null },
    { name: "Cairo (Downtown)", lat: 30.0444, lng: 31.2357 },
    { name: "New Cairo (5th Settlement)", lat: 30.0271, lng: 31.4913 },
    { name: "Sheikh Zayed & 6th of October", lat: 30.0543, lng: 30.9789 },
    { name: "Heliopolis & Nasr City", lat: 30.0883, lng: 31.3361 },
    { name: "Maadi & Zamalek", lat: 29.9602, lng: 31.2569 },
    { name: "Giza & Dokki", lat: 30.0131, lng: 31.2089 },
    { name: "Alexandria", lat: 31.2001, lng: 29.9187 },
    { name: "Mansoura", lat: 31.0409, lng: 31.3785 },
    { name: "Tanta", lat: 30.7865, lng: 31.0004 },
    { name: "Port Said", lat: 31.2653, lng: 32.3019 },
    { name: "Ismailia", lat: 30.5965, lng: 32.2715 },
    { name: "Hurghada & El Gouna", lat: 27.2579, lng: 33.8116 },
    { name: "Sharm El Sheikh", lat: 27.9158, lng: 34.3299 },
    { name: "Luxor & Aswan", lat: 25.6872, lng: 32.6396 }
];

/**
 * Calculates distance in kilometers between two geo coordinates using Haversine formula
 */
export const calculateHaversineDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return Math.round(d * 10) / 10; // Round to 1 decimal place
};

/**
 * Formats distance display string
 */
export const formatDistance = (distanceKm) => {
    if (distanceKm === null || distanceKm === undefined) return "";
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m away`;
    }
    return `${distanceKm} km away`;
};

/**
 * Prompts browser geolocation API with timeout and promise wrapper
 */
export const getCurrentBrowserPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
            },
            (error) => {
                let msg = "Unable to retrieve your location";
                if (error.code === error.PERMISSION_DENIED) {
                    msg = "Location access was denied. Please allow permissions to use 'Near Me'.";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    msg = "Location information is unavailable.";
                } else if (error.code === error.TIMEOUT) {
                    msg = "Location request timed out.";
                }
                reject(new Error(msg));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    });
};
