import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SyncService from '../utils/syncService';
import OfflineStorageService from '../utils/offlineStorage';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from './ThemeProvider';

const OfflineTestPanel: React.FC = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState(0);
  const [offlineNotes, setOfflineNotes] = useState(0);
  const { theme } = useTheme();
  const networkStatus = useNetworkStatus();

  useEffect(() => {
    const updateStats = async () => {
      try {
        const syncService = SyncService.getInstance();
        const offlineStorage = OfflineStorageService.getInstance();
        
        const count = await syncService.getPendingActionsCount();
        const lastSyncTime = await syncService.getLastSyncTime();
        const notes = await offlineStorage.getOfflineNotes();
        
        setPendingCount(count);
        setLastSync(lastSyncTime);
        setOfflineNotes(notes.length);
      } catch (error) {
        console.error('❌ [OfflineTestPanel] Failed to update stats:', error);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const testOfflineSave = async () => {
    try {
      const offlineStorage = OfflineStorageService.getInstance();
      const testNote = {
        id: `test_${Date.now()}`,
        title: 'Test Offline Note',
        text: '<p>This is a test note created while offline</p>',
        creator: 'test_user',
        media: [],
        audio: [],
        tags: ['test'],
        latitude: '0',
        longitude: '0',
        published: false,
        time: new Date().toISOString(),
      };

      await offlineStorage.saveNoteOffline(testNote);
      Alert.alert('Success', 'Test note saved offline!');
    } catch (error) {
      Alert.alert('Error', `Failed to save test note: ${error.message}`);
    }
  };

  const testSync = async () => {
    try {
      const syncService = SyncService.getInstance();
      await syncService.forceSync();
      Alert.alert('Success', 'Sync completed!');
    } catch (error) {
      Alert.alert('Error', `Sync failed: ${error.message}`);
    }
  };

  const clearOfflineData = async () => {
    try {
      const offlineStorage = OfflineStorageService.getInstance();
      await offlineStorage.clearOfflineData();
      Alert.alert('Success', 'Offline data cleared!');
    } catch (error) {
      Alert.alert('Error', `Failed to clear data: ${error.message}`);
    }
  };

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.homeColor }]}>
      <Text style={[styles.title, { color: theme.text }]}>Offline Test Panel</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Ionicons name="wifi" size={16} color={networkStatus.isConnected ? '#4caf50' : '#ff6b6b'} />
          <Text style={[styles.statText, { color: theme.text }]}>
            {networkStatus.isConnected ? 'Online' : 'Offline'}
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <Ionicons name="sync" size={16} color="#ffa726" />
          <Text style={[styles.statText, { color: theme.text }]}>
            Pending: {pendingCount}
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <Ionicons name="document" size={16} color="#2196f3" />
          <Text style={[styles.statText, { color: theme.text }]}>
            Offline Notes: {offlineNotes}
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <Ionicons name="time" size={16} color="#9c27b0" />
          <Text style={[styles.statText, { color: theme.text }]}>
            Last Sync: {formatTime(lastSync)}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#4caf50' }]} onPress={testOfflineSave}>
          <Text style={styles.buttonText}>Test Offline Save</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, { backgroundColor: '#2196f3' }]} onPress={testSync}>
          <Text style={styles.buttonText}>Force Sync</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, { backgroundColor: '#ff6b6b' }]} onPress={clearOfflineData}>
          <Text style={styles.buttonText}>Clear Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statText: {
    marginLeft: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: '30%',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default OfflineTestPanel;
