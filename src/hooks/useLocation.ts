import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Coordinates } from '@/utils/location';

export type LocationPermissionStatus =
  | 'undetermined'
  | 'granted'
  | 'denied'
  | 'restricted';

export interface UseLocationResult {
  location: Coordinates | null;
  permissionStatus: LocationPermissionStatus;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<LocationPermissionStatus>('undetermined');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermission = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermissionStatus(status as LocationPermissionStatus);
    return status === 'granted';
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status as LocationPermissionStatus);
    return status === 'granted';
  }, []);

  const refreshLocation = useCallback(async () => {
    const hasPermission = await checkPermission();
    if (!hasPermission) {
      setError('Location permission not granted');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to get the last known location first (works better on simulator)
      let result;
      try {
        result = await Location.getLastKnownPositionAsync({
          maxAge: 60000, // Accept location up to 1 minute old
        });
      } catch (lastKnownError) {
        console.log('Last known location not available, trying current position');
      }

      // If no last known location, try current position
      if (!result) {
        result = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 1000,
          distanceInterval: 0,
        });
      }

      if (result) {
        setLocation({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        });
      } else {
        throw new Error('Could not obtain location');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      // Provide more helpful error message for simulator
      if (errorMessage.includes('kCLErrorDomain') || errorMessage.includes('Cannot obtain current location')) {
        setError('Simulator location not set. In Xcode Simulator: Features → Location → Custom Location or Apple');
        console.error('Location error (Simulator):', 'Please set a custom location in the iOS Simulator');
      } else {
        setError('Failed to get current location');
        console.error('Location error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [checkPermission]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    location,
    permissionStatus,
    loading,
    error,
    requestPermission,
    refreshLocation,
  };
}
