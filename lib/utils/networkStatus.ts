import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string | null;
}

class NetworkStatusService {
  private static instance: NetworkStatusService;
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private currentStatus: NetworkStatus = {
    isConnected: false,
    isInternetReachable: false,
    type: null
  };

  private constructor() {
    this.initialize();
  }

  public static getInstance(): NetworkStatusService {
    if (!NetworkStatusService.instance) {
      NetworkStatusService.instance = new NetworkStatusService();
    }
    return NetworkStatusService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Get initial network state
      const state = await NetInfo.fetch();
      this.updateStatus(state);

      // Listen for network state changes
      NetInfo.addEventListener(state => {
        this.updateStatus(state);
      });
    } catch (error) {
      console.error('❌ [NetworkStatus] Failed to initialize network monitoring:', error);
    }
  }

  private updateStatus(state: any): void {
    const newStatus: NetworkStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type
    };

    const statusChanged = 
      this.currentStatus.isConnected !== newStatus.isConnected ||
      this.currentStatus.isInternetReachable !== newStatus.isInternetReachable;

    this.currentStatus = newStatus;

    if (statusChanged) {
      console.log('📡 [NetworkStatus] Network status changed:', newStatus);
      this.notifyListeners();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentStatus);
      } catch (error) {
        console.error('❌ [NetworkStatus] Error notifying listener:', error);
      }
    });
  }

  public getCurrentStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  public addListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  public isOnline(): boolean {
    return this.currentStatus.isConnected && this.currentStatus.isInternetReachable;
  }
}

export default NetworkStatusService;
