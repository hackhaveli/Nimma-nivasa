import * as Location from 'expo-location';

interface GeocodeResult {
    formattedAddress: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
}

export const GeocodingService = {
    /**
     * Reverse Geocode: Convert Latitude & Longitude to Address
     * Uses expo-location's built-in geocoding (no API key needed)
     */
    reverseGeocode: async (latitude: number, longitude: number): Promise<GeocodeResult | null> => {
        try {
            const addresses = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (addresses && addresses.length > 0) {
                const result = addresses[0];

                // Build formatted address
                const parts = [];
                if (result.street) parts.push(result.street);
                if (result.name && result.name !== result.street) parts.push(result.name);
                if (result.district) parts.push(result.district);
                if (result.city) parts.push(result.city);
                if (result.region) parts.push(result.region);
                if (result.postalCode) parts.push(result.postalCode);

                return {
                    formattedAddress: parts.join(', ') || 'Unknown Location',
                    area: result.street || result.name || result.district || result.subregion || '',
                    city: result.city || result.region || '',
                    state: result.region || '',
                    pincode: result.postalCode || ''
                };
            }

            return null;
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return null;
        }
    }
};
