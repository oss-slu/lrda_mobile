import { useState, useEffect } from 'react';
import NetworkStatusService, { NetworkStatus } from '../utils/networkStatus';

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    isInternetReachable: false,
    type: null
  });

  useEffect(() => {
    const networkService = NetworkStatusService.getInstance();
    
    // Get initial status
    setNetworkStatus(networkService.getCurrentStatus());
    
    // Subscribe to network changes
    const unsubscribe = networkService.addListener((status) => {
      setNetworkStatus(status);
    });

    return unsubscribe;
  }, []);

  return networkStatus;
};

export default useNetworkStatus;
