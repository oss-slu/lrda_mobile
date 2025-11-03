import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SyncService from '../utils/syncService';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from './ThemeProvider';

interface SyncStatusIndicatorProps {
  onPress?: () => void;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ onPress }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  const networkStatus = useNetworkStatus();

  useEffect(() => {
    const updateStatus = async () => {
      try {
        const syncService = SyncService.getInstance();
        const count = await syncService.getPendingActionsCount();
        const lastSyncTime = await syncService.getLastSyncTime();
        
        setPendingCount(count);
        setLastSync(lastSyncTime);
        setIsVisible(count > 0 || !networkStatus.isConnected);
      } catch (error) {
        console.error('❌ [SyncStatusIndicator] Failed to update status:', error);
      }
    };

    updateStatus();
    
    // Update status every 30 seconds
    const interval = setInterval(updateStatus, 30000);
    
    return () => clearInterval(interval);
  }, [networkStatus.isConnected]);

  if (!isVisible) {
    return null;
  }

  const getStatusText = () => {
    if (!networkStatus.isConnected) {
      return 'Offline';
    }
    if (pendingCount > 0) {
      return `${pendingCount} pending sync`;
    }
    return 'Synced';
  };

  const getStatusColor = () => {
    if (!networkStatus.isConnected) {
      return '#ff6b6b'; // Red for offline
    }
    if (pendingCount > 0) {
      return '#ffa726'; // Orange for pending
    }
    return '#4caf50'; // Green for synced
  };

  const getStatusIcon = () => {
    if (!networkStatus.isConnected) {
      return 'cloud-offline-outline';
    }
    if (pendingCount > 0) {
      return 'sync-outline';
    }
    return 'checkmark-circle-outline';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.homeColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={getStatusIcon()}
        size={16}
        color={getStatusColor()}
      />
      <Text style={[styles.text, { color: theme.text }]}>
        {getStatusText()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  text: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SyncStatusIndicator;
