/* eslint-disable prettier/prettier */
/**
 * useNetworkStatus - Hook to monitor network connectivity
 * Provides real-time network status and shows toast on changes
 */
import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { ToastService } from '../services/ToastService';

const useNetworkStatus = (showToasts = true) => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    let previousState = true;

    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      
      setIsConnected(connected);
      setConnectionType(state.type);
      setIsInternetReachable(state.isInternetReachable);

      // Show toast only on status change
      if (showToasts && previousState !== connected) {
        if (connected) {
          ToastService.showMessage('online');
        } else {
          ToastService.showMessage('offline');
        }
      }

      previousState = connected;
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
      setConnectionType(state.type);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => unsubscribe();
  }, [showToasts]);

  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected && state.isInternetReachable);
    setConnectionType(state.type);
    setIsInternetReachable(state.isInternetReachable);
    return state.isConnected && state.isInternetReachable;
  }, []);

  return {
    isConnected,
    isOffline: !isConnected,
    connectionType,
    isInternetReachable,
    refresh,
  };
};

export default useNetworkStatus;
