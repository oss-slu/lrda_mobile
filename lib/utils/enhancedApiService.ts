import ApiService from './api_calls';
import OfflineStorageService from './offlineStorage';
import NetworkStatusService from './networkStatus';
import { Note } from '../../types';

class EnhancedApiService {
  private static instance: EnhancedApiService;
  private offlineStorage: OfflineStorageService;
  private networkStatus: NetworkStatusService;

  private constructor() {
    this.offlineStorage = OfflineStorageService.getInstance();
    this.networkStatus = NetworkStatusService.getInstance();
  }

  public static getInstance(): EnhancedApiService {
    if (!EnhancedApiService.instance) {
      EnhancedApiService.instance = new EnhancedApiService();
    }
    return EnhancedApiService.instance;
  }

  /**
   * Initialize the enhanced API service
   */
  public async initialize(): Promise<void> {
    try {
      await this.offlineStorage.initialize();
      console.log('✅ [EnhancedApiService] Initialized successfully');
    } catch (error) {
      console.error('❌ [EnhancedApiService] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Save a note with offline support
   */
  public async saveNote(note: Note, isNew: boolean = true): Promise<{ success: boolean; isOffline: boolean }> {
    try {
      const isOnline = this.networkStatus.isOnline();
      
      if (isOnline) {
        // Try to save online first
        try {
          if (isNew) {
            await ApiService.writeNewNote(note);
          } else {
            await ApiService.overwriteNote(note);
          }
          console.log('✅ [EnhancedApiService] Note saved online successfully');
          return { success: true, isOffline: false };
        } catch (error) {
          console.warn('⚠️ [EnhancedApiService] Online save failed, falling back to offline:', error);
          // Fall through to offline save
        }
      }

      // Save offline
      await this.offlineStorage.saveNoteOffline(note);
      console.log('📱 [EnhancedApiService] Note saved offline');
      return { success: true, isOffline: true };
    } catch (error) {
      console.error('❌ [EnhancedApiService] Failed to save note:', error);
      return { success: false, isOffline: !this.networkStatus.isOnline() };
    }
  }

  /**
   * Delete a note with offline support
   */
  public async deleteNote(noteId: string, userId: string): Promise<{ success: boolean; isOffline: boolean }> {
    try {
      const isOnline = this.networkStatus.isOnline();
      
      if (isOnline) {
        // Try to delete online first
        try {
          const success = await ApiService.deleteNoteFromAPI(noteId, userId);
          if (success) {
            console.log('✅ [EnhancedApiService] Note deleted online successfully');
            return { success: true, isOffline: false };
          }
        } catch (error) {
          console.warn('⚠️ [EnhancedApiService] Online delete failed, falling back to offline:', error);
          // Fall through to offline delete
        }
      }

      // Delete offline
      await this.offlineStorage.deleteNoteOffline(noteId);
      console.log('📱 [EnhancedApiService] Note deleted offline');
      return { success: true, isOffline: true };
    } catch (error) {
      console.error('❌ [EnhancedApiService] Failed to delete note:', error);
      return { success: false, isOffline: !this.networkStatus.isOnline() };
    }
  }

  /**
   * Fetch notes with offline support
   */
  public async fetchNotes(
    global: boolean,
    published: boolean,
    userId: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<{ notes: Note[]; isOffline: boolean }> {
    try {
      const isOnline = this.networkStatus.isOnline();
      
      if (isOnline) {
        try {
          const notes = await ApiService.fetchMessagesBatch(global, published, userId, limit, skip);
          console.log('✅ [EnhancedApiService] Notes fetched online successfully');
          return { notes, isOffline: false };
        } catch (error) {
          console.warn('⚠️ [EnhancedApiService] Online fetch failed, falling back to offline:', error);
          // Fall through to offline fetch
        }
      }

      // Fetch from offline storage
      const offlineNotes = await this.offlineStorage.getOfflineNotesForUser(userId);
      console.log('📱 [EnhancedApiService] Notes fetched from offline storage');
      return { notes: offlineNotes, isOffline: true };
    } catch (error) {
      console.error('❌ [EnhancedApiService] Failed to fetch notes:', error);
      return { notes: [], isOffline: !this.networkStatus.isOnline() };
    }
  }

  /**
   * Sync offline actions when connection is restored
   */
  public async syncOfflineActions(): Promise<void> {
    try {
      const isOnline = this.networkStatus.isOnline();
      if (!isOnline) {
        console.log('📡 [EnhancedApiService] No internet connection, skipping sync');
        return;
      }

      await this.offlineStorage.syncOfflineActions();
      console.log('🔄 [EnhancedApiService] Offline actions synced successfully');
    } catch (error) {
      console.error('❌ [EnhancedApiService] Failed to sync offline actions:', error);
      throw error;
    }
  }

  /**
   * Get pending actions count
   */
  public async getPendingActionsCount(): Promise<number> {
    return await this.offlineStorage.getPendingActionsCount();
  }

  /**
   * Get last sync time
   */
  public async getLastSyncTime(): Promise<number> {
    return await this.offlineStorage.getLastSyncTime();
  }

  /**
   * Clear all offline data
   */
  public async clearOfflineData(): Promise<void> {
    await this.offlineStorage.clearOfflineData();
  }

  /**
   * Check if device is online
   */
  public isOnline(): boolean {
    return this.networkStatus.isOnline();
  }
}

export default EnhancedApiService;
