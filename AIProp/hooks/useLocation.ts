import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { GeocodingService } from '@/services/geocoding';

export interface UserLocation {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    address?: {
        area: string;
        city: string;
        state: string;
        formatted: string;
    };
}

export function useLocation() {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setPermissionStatus('denied');
                setError('Location permission denied');
                setLoading(false);
                return;
            }

            setPermissionStatus('granted');
            await getCurrentLocation();
        } catch (err: any) {
            console.error('Location permission error:', err);
            setError('Failed to get location permission');
            setLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        try {
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            // Get address details
            const address = await GeocodingService.reverseGeocode(
                currentLocation.coords.latitude,
                currentLocation.coords.longitude
            );

            setLocation({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                accuracy: currentLocation.coords.accuracy,
                address: address ? {
                    area: address.area,
                    city: address.city,
                    state: address.state,
                    formatted: address.formattedAddress
                } : undefined
            });
            setError(null);
            setLoading(false);
        } catch (err: any) {
            console.error('Get location error:', err);
            setError('Failed to get current location');
            setLoading(false);
        }
    };

    const refresh = async () => {
        setLoading(true);
        setError(null);
        await getCurrentLocation();
    };

    return {
        location,
        loading,
        error,
        permissionStatus,
        refresh
    };
}
