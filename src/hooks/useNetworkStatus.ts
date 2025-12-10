import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export interface NetworkState {
  isOnline: boolean;
  isWifi: boolean;
  type: string | null;
}

/**
 * Hook to monitor network connection status
 * Uses AppState to detect when app comes back online
 * For production, install @react-native-community/netinfo for real-time detection
 */
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: true,
    isWifi: false,
    type: 'unknown',
  });

  useEffect(() => {
    // Track app foreground/background to trigger sync on resume
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (state: AppStateStatus) => {
    if (state === 'active') {
      // App came back to foreground - assume online for sync
      setNetworkState((prev) => ({
        ...prev,
        isOnline: true,
      }));
    }
  };

  return networkState;
};

/**
 * Note: For production use with real-time network detection:
 *
 * 1. Run: npm install @react-native-community/netinfo
 * 2. Update this file to use NetInfo:
 *
 * import NetInfo from '@react-native-community/netinfo';
 *
 * const [networkState, setNetworkState] = useState<NetworkState>({
 *   isOnline: true,
 *   isWifi: false,
 *   type: null,
 * });
 *
 * useEffect(() => {
 *   const checkNetworkStatus = async () => {
 *     try {
 *       const state = await NetInfo.fetch();
 *       setNetworkState({
 *         isOnline: state.isConnected ?? true,
 *         isWifi: state.type === 'wifi',
 *         type: state.type ?? null,
 *       });
 *     } catch (error) {
 *       console.error('Error checking network status:', error);
 *       setNetworkState({ isOnline: true, isWifi: false, type: null });
 *     }
 *   };
 *
 *   checkNetworkStatus();
 *
 *   const unsubscribe = NetInfo.addEventListener((state) => {
 *     setNetworkState({
 *       isOnline: state.isConnected ?? true,
 *       isWifi: state.type === 'wifi',
 *       type: state.type ?? null,
 *     });
 *   });
 *
 *   return unsubscribe;
 * }, []);
 */
