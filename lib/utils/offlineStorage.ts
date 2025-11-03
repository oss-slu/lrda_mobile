import * as FileSystem from 'expo-file-system/legacy';
import { Note } from '../../types';
import ApiService from './api_calls';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  note: Note;
  timestamp: number;
  retryCount: number;
}

export interface OfflineStorageData {
  notes: Note[];
  actions: OfflineAction[];
  lastSync: number;
}

class OfflineStorageService {
  private static instance: OfflineStorageService;
  private readonly STORAGE_DIR = (FileSystem.documentDirectory || '') + 'offline_storage/';
  private readonly NOTES_FILE = 'notes.json';
  private readonly ACTIONS_FILE = 'actions.json';
  private readonly STORAGE_FILE = 'storage.json';

  private constructor() {}

  public static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  /**
   * Initialize the offline storage directory
   */
  public async initialize(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.STORAGE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.STORAGE_DIR, { intermediates: true });
        console.log('📁 [OfflineStorage] Created offline storage directory');
      }
    } catch (error) {
      console.error('❌ [OfflineStorage] Failed to initialize storage directory:', error);
      throw error;
    }
  }

  /**
   * Check if device is online
   */
  public async isOnline(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save a note to offline storage
   */
  public async saveNoteOffline(note: Note): Promise<void> {
    try {
      await this.initialize();
      
      const storageData = await this.getStorageData();
      
      // Add or update the note in offline storage
      const existingIndex = storageData.notes.findIndex(n => n.id === note.id);
      if (existingIndex >= 0) {
        storageData.notes[existingIndex] = note;
      } else {
        storageData.notes.push(note);
      }

      // Add action to queue if not online
      const isOnline = await this.isOnline();
      if (!isOnline) {
        const action: OfflineAction = {
          id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: existingIndex >= 0 ? 'UPDATE' : 'CREATE',
          note,
          timestamp: Date.now(),
          retryCount: 0
        };
        storageData.actions.push(action);
        console.log('📝 [OfflineStorage] Note saved offline, action queued:', action.id);
      }

      await this.saveStorageData(storageData);
    } catch (error) {
      console.error('❌ [OfflineStorage] Failed to save note offline:', error);
      throw error;
    }
  }

  /**
   * Delete a note from offline storage
   */
  public async deleteNoteOffline(noteId: string): Promise<void> {
    try {
      await this.initialize();
      
      const storageData = await this.getStorageData();
      
      // Remove note from offline storage
      storageData.notes = storageData.notes.filter(n => n.id !== noteId);

      // Add delete action to queue if not online
      const isOnline = await this.isOnline();
      if (!isOnline) {
        const note = storageData.notes.find(n => n.id === noteId);
        if (note) {
          const action: OfflineAction = {
            id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'DELETE',
            note,
            timestamp: Date.now(),
            retryCount: 0
          };
          storageData.actions.push(action);
          console.log('🗑️ [OfflineStorage] Note deleted offline, action queued:', action.id);
        }
      }

      await this.saveStorageData(storageData);
    } catch (error) {
      console.error('❌ [OfflineStorage] Failed to delete note offline:', error);
      throw error;
    }
  }

  /**
   * Get all offline notes
   */
  public async getOfflineNotes(): Promise<Note[]> {
    try {
      await this.initialize();
      const storageData = await this.getStorageData();
      return storageData.notes;
    } catch (error) {
      console.error('❌ [OfflineStorage] Failed to get offline notes:', error);
      return [];
    }
  }

  /**
   * Get offline notes for a specific user
   */
  public async getOfflineNotesForUser(userId: string): Promise<Note[]> {
    try {
      const allNotes = await this.getOfflineNotes();
      return allNotes.filter(note => note.creator === userId);
    } catch (error) {
      console.error('❌ [OfflineStorage] Failed to get offline notes for user:', error);
      return [];
    }
  }

  /**
   * Sync offline actions with the server
   */
  public async syncOfflineActions(): Promise<void> {
    try {
      const isOnline = await this.isOnline();
      if (!isOnline) {
        console.log('📡 [OfflineStorage] No internet connection, skipping sync');
        return;
      }

      const storageData = await this.getStorageData();
      const actionsToProcess = [...storageData.actions];
      
      console.log(`🔄 [OfflineStorage] Starting sync of ${actionsToProcess.length} actions`);

      for (const action of actionsToProcess) {
        try {
          await this.processAction(action);
          
          // Remove successful action from queue
          storageData.actions = storageData.actions.filter(a => a.id !== action.id);
          console.log(`✅ [OfflineStorage] Successfully synced action ${action.id}`);
        } catch (error) {
          console.error(`❌ [OfflineStorage] Failed to sync action ${action.id}:`, error);
          
          // Increment retry count
          const actionIndex = storageData.actions.findIndex(a => a.id === action.id);
          if (actionIndex >= 0) {
            storageData.actions[actionIndex].retryCount += 1;
            
            // Remove action if it has failed too many times
            if (storageData.actions[actionIndex].retryCount >= 3) {
              storageData.actions.splice(actionIndex, 1);
              console.log(`🗑️ [OfflineStorage] Removed action ${action.id} after 3 failed attempts`);
            }
          }
        }
      }

      // Update last sync time
      storageData.lastSync = Date.now();
      await this.saveStorageData(storageData);
      
      console.log('🎉 [OfflineStorage] Sync completed');
    } catch (error) {
      console.error('❌ [OfflineStorage] Failed to sync offline actions:', error);
      throw error;
    }
  }

  /**
   * Process a single offline action
   */
  private async processAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'CREATE':
        await ApiService.writeNewNote(action.note);
        break;
      case 'UPDATE':
        await ApiService.overwriteNote(action.note);
        break;
      case 'DELETE':
        await ApiService.deleteNoteFromAPI(action.note.id, action.note.creator);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Get storage data from file
   */
  private async getStorageData(): Promise<OfflineStorageData> {
    try {
      const filePath = this.STORAGE_DIR + this.STORAGE_FILE;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (!fileInfo.exists) {
        return {
          notes: [],
          actions: [],
          lastSync: 0
        };
      }

      const content = await FileSystem.readAsStringAsync(filePath);
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ [OfflineStorage] Failed to read storage data:', error);
      return {
        notes: [],
        actions: [],
        lastSync: 0
      };
    }
  }

  /**
   * Save storage data to file
   */
  private async saveStorageData(data: OfflineStorageData): Promise<void> {
    try {
      const filePath = this.STORAGE_DIR + this.STORAGE_FILE;
      const content = JSON.stringify(data, null, 2);
      await FileSystem.writeAsStringAsync(filePath, content);
    } catch (error) {
      console.error('❌ [OfflineStorage] Failed to save storage data:', error);
      throw error;
    }
  }

  /**
   * Clear all offline data
   */
  public async clearOfflineData(): Promise<void> {
    try {
      await this.initialize();
      const storageData: OfflineStorageData = {
        notes: [],
        actions: [],
        lastSync: 0
      };
      await this.saveStorageData(storageData);
      console.log('🧹 [OfflineStorage] Cleared all offline data');
    } catch (error) {
      console.error('❌ [OfflineStorage] Failed to clear offline data:', error);
      throw error;
    }
  }

  /**
   * Get pending actions count
   */
  public async getPendingActionsCount(): Promise<number> {
    try {
      const storageData = await this.getStorageData();
      return storageData.actions.length;
    } catch (error) {
      console.error('❌ [OfflineStorage] Failed to get pending actions count:', error);
      return 0;
    }
  }

  /**
   * Get last sync time
   */
  public async getLastSyncTime(): Promise<number> {
    try {
      const storageData = await this.getStorageData();
      return storageData.lastSync;
    } catch (error) {
      console.error('❌ [OfflineStorage] Failed to get last sync time:', error);
      return 0;
    }
  }
}

export default OfflineStorageService;
