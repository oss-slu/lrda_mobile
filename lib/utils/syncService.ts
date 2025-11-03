import { AppState, AppStateStatus } from 'react-native';
import EnhancedApiService from './enhancedApiService';
import NetworkStatusService from './networkStatus';

class SyncService {
  private static instance: SyncService;
  private enhancedApi: EnhancedApiService;
  private networkStatus: NetworkStatusService;
  private isInitialized: boolean = false;
  private syncInProgress: boolean = false;
  private appStateSubscription: any = null;
  private networkSubscription: any = null;

  private constructor() {
    this.enhancedApi = EnhancedApiService.getInstance();
    this.networkStatus = NetworkStatusService.getInstance();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Initialize the sync service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize enhanced API service
      await this.enhancedApi.initialize();

      // Listen for app state changes
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange.bind(this));

      // Listen for network status changes
      this.networkSubscription = this.networkStatus.addListener(this.handleNetworkChange.bind(this));

      this.isInitialized = true;
      console.log('✅ [SyncService] Initialized successfully');
    } catch (error) {
      console.error('❌ [SyncService] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Handle app state changes
   */
  private async handleAppStateChange(nextAppState: AppStateStatus): Promise<void> {
    if (nextAppState === 'active') {
      console.log('📱 [SyncService] App became active, checking for sync');
      await this.attemptSync();
    }
  }

  /**
   * Handle network status changes
   */
  private async handleNetworkChange(status: any): Promise<void> {
    if (status.isConnected && status.isInternetReachable) {
      console.log('📡 [SyncService] Network connection restored, attempting sync');
      await this.attemptSync();
    }
  }

  /**
   * Attempt to sync offline actions
   */
  public async attemptSync(): Promise<void> {
    if (this.syncInProgress) {
      console.log('🔄 [SyncService] Sync already in progress, skipping');
      return;
    }

    try {
      this.syncInProgress = true;
      const isOnline = this.networkStatus.isOnline();
      
      if (!isOnline) {
        console.log('📡 [SyncService] No internet connection, skipping sync');
        return;
      }

      const pendingCount = await this.enhancedApi.getPendingActionsCount();
      if (pendingCount === 0) {
        console.log('✅ [SyncService] No pending actions to sync');
        return;
      }

      console.log(`🔄 [SyncService] Starting sync of ${pendingCount} pending actions`);
      await this.enhancedApi.syncOfflineActions();
      console.log('🎉 [SyncService] Sync completed successfully');
    } catch (error) {
      console.error('❌ [SyncService] Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Force sync (for manual trigger)
   */
  public async forceSync(): Promise<void> {
    console.log('🔄 [SyncService] Force sync requested');
    await this.attemptSync();
  }

  /**
   * Get pending actions count
   */
  public async getPendingActionsCount(): Promise<number> {
    return await this.enhancedApi.getPendingActionsCount();
  }

  /**
   * Get last sync time
   */
  public async getLastSyncTime(): Promise<number> {
    return await this.enhancedApi.getLastSyncTime();
  }

  /**
   * Check if device is online
   */
  public isOnline(): boolean {
    return this.networkStatus.isOnline();
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    if (this.networkSubscription) {
      this.networkSubscription();
      this.networkSubscription = null;
    }

    this.isInitialized = false;
    console.log('🧹 [SyncService] Cleaned up resources');
  }
}

export default SyncService;
