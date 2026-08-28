/**
 * Egyptian Governorates & Major Cities dataset with accurate coordinates
 * Used for business location selection and geolocation proximity matching.
 */

export const EGYPTIAN_CITIES = [
    {
        id: "cairo",
        name: "Cairo",
        arabicName: "القاهرة",
        region: "Greater Cairo",
        lat: 30.0444,
        lng: 31.2357,
    },
    {
        id: "giza",
        name: "Giza",
        arabicName: "الجيزة",
        region: "Greater Cairo",
        lat: 30.0131,
        lng: 31.2089,
    },
    {
        id: "new_cairo",
        name: "New Cairo / 5th Settlement",
        arabicName: "القاهرة الجديدة / التجمع الخامس",
        region: "Greater Cairo",
        lat: 30.0074,
        lng: 31.4913,
    },
    {
        id: "october_6th",
        name: "6th of October City",
        arabicName: "مدينة السادس من أكتوبر",
        region: "Greater Cairo",
        lat: 29.9723,
        lng: 30.9419,
    },
    {
        id: "sheikh_zayed",
        name: "Sheikh Zayed City",
        arabicName: "مدينة الشيخ زايد",
        region: "Greater Cairo",
        lat: 30.0526,
        lng: 30.9856,
    },
    {
        id: "nasr_city",
        name: "Nasr City / Heliopolis",
        arabicName: "مدينة نصر / مصر الجديدة",
        region: "Greater Cairo",
        lat: 30.0561,
        lng: 31.3414,
    },
    {
        id: "alexandria",
        name: "Alexandria",
        arabicName: "الإسكندرية",
        region: "Alexandria & North Coast",
        lat: 31.2001,
        lng: 29.9187,
    },
    {
        id: "north_coast",
        name: "North Coast / Sahel",
        arabicName: "الساحل الشمالي",
        region: "Alexandria & North Coast",
        lat: 30.8653,
        lng: 29.0722,
    },
    {
        id: "mansoura",
        name: "Mansoura (Dakahlia)",
        arabicName: "المنصورة (الدقهلية)",
        region: "Nile Delta",
        lat: 31.0409,
        lng: 31.3785,
    },
    {
        id: "tanta",
        name: "Tanta (Gharbia)",
        arabicName: "طنطا (الغربية)",
        region: "Nile Delta",
        lat: 30.7865,
        lng: 31.0004,
    },
    {
        id: "zagazig",
        name: "Zagazig (Sharqia)",
        arabicName: "الزقازيق (الشرقية)",
        region: "Nile Delta",
        lat: 30.5877,
        lng: 31.5020,
    },
    {
        id: "damanhour",
        name: "Damanhour (Beheira)",
        arabicName: "دمنهور (البحيرة)",
        region: "Nile Delta",
        lat: 31.0414,
        lng: 30.4704,
    },
    {
        id: "ismailia",
        name: "Ismailia",
        arabicName: "الإسماعيلية",
        region: "Suez Canal",
        lat: 30.5965,
        lng: 32.2715,
    },
    {
        id: "port_said",
        name: "Port Said",
        arabicName: "بورسعيد",
        region: "Suez Canal",
        lat: 31.2653,
        lng: 32.3019,
    },
    {
        id: "suez",
        name: "Suez",
        arabicName: "السويس",
        region: "Suez Canal",
        lat: 29.9668,
        lng: 32.5498,
    },
    {
        id: "hurghada",
        name: "Hurghada (Red Sea)",
        arabicName: "الغردقة (البحر الأحمر)",
        region: "Red Sea",
        lat: 27.2579,
        lng: 33.8116,
    },
    {
        id: "el_gouna",
        name: "El Gouna",
        arabicName: "الجونة",
        region: "Red Sea",
        lat: 27.3955,
        lng: 33.6766,
    },
    {
        id: "sharm_el_sheikh",
        name: "Sharm El Sheikh (South Sinai)",
        arabicName: "شرم الشيخ (جنوب سيناء)",
        region: "Sinai",
        lat: 27.9158,
        lng: 34.3299,
    },
    {
        id: "dahab",
        name: "Dahab",
        arabicName: "دهب",
        region: "Sinai",
        lat: 28.5097,
        lng: 34.5136,
    },
    {
        id: "luxor",
        name: "Luxor",
        arabicName: "الأقصر",
        region: "Upper Egypt",
        lat: 25.6872,
        lng: 32.6396,
    },
    {
        id: "aswan",
        name: "Aswan",
        arabicName: "أسوان",
        region: "Upper Egypt",
        lat: 24.0889,
        lng: 32.8998,
    },
    {
        id: "asyut",
        name: "Asyut",
        arabicName: "أسيوط",
        region: "Upper Egypt",
        lat: 27.1801,
        lng: 31.1837,
    },
    {
        id: "minya",
        name: "Minya",
        arabicName: "المنيا",
        region: "Upper Egypt",
        lat: 28.1099,
        lng: 30.7503,
    },
    {
        id: "sohag",
        name: "Sohag",
        arabicName: "سوهاج",
        region: "Upper Egypt",
        lat: 26.5569,
        lng: 31.6948,
    },
    {
        id: "qena",
        name: "Qena",
        arabicName: "قنا",
        region: "Upper Egypt",
        lat: 26.1551,
        lng: 32.7160,
    },
    {
        id: "fayoum",
        name: "Fayoum",
        arabicName: "الفيوم",
        region: "Upper Egypt",
        lat: 29.3084,
        lng: 30.8428,
    },
    {
        id: "beni_suef",
        name: "Beni Suef",
        arabicName: "بني سويف",
        region: "Upper Egypt",
        lat: 29.0661,
        lng: 31.0994,
    },
    {
        id: "damietta",
        name: "Damietta",
        arabicName: "دمياط",
        region: "Nile Delta",
        lat: 31.4175,
        lng: 31.8144,
    },
    {
        id: "kafr_el_sheikh",
        name: "Kafr El Sheikh",
        arabicName: "كفر الشيخ",
        region: "Nile Delta",
        lat: 31.1107,
        lng: 30.9388,
    }
];

/**
 * Calculate Great-Circle Distance (Haversine Formula) in Kilometers
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

/**
 * Sorts all Egyptian cities by distance from user's coordinates
 */
export function getSortedEgyptianCitiesByLocation(userLat, userLng) {
    if (!userLat || !userLng) return EGYPTIAN_CITIES;

    return EGYPTIAN_CITIES.map((city) => {
        const distanceKm = calculateDistanceKm(userLat, userLng, city.lat, city.lng);
        return {
            ...city,
            distanceKm,
        };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
}
