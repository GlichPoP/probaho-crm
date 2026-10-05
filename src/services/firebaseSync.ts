import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  type Firestore,
  type Unsubscribe
} from 'firebase/firestore';
import type { CRMDataStore, FirebaseConfig, SyncStatus } from '../types/crm';

const CONFIG_STORAGE_KEY = 'PROBAHO_FIREBASE_CONFIG';
const WORKSPACE_STORAGE_KEY = 'PROBAHO_WORKSPACE_ID';

class FirebaseSyncService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private activeConfig: FirebaseConfig | null = null;
  private activeWorkspaceId: string | null = null;
  private status: SyncStatus = 'disconnected';
  private statusListeners: Array<(status: SyncStatus) => void> = [];
  private unsubscribeSnapshot: Unsubscribe | null = null;
  private isPushingInternally: boolean = false;

  constructor() {
    this.initFromStorage();
  }

  // --- Parser for User Input (JSON or Javascript Config snippet) ---
  public parseFirebaseConfigInput(rawInput: string): FirebaseConfig | null {
    if (!rawInput || !rawInput.trim()) return null;
    let clean = rawInput.trim();

    // 1. Try JSON parse directly
    try {
      const parsed = JSON.parse(clean);
      if (parsed && parsed.apiKey && (parsed.projectId || parsed.project_id)) {
        return {
          apiKey: parsed.apiKey || parsed.api_key,
          authDomain: parsed.authDomain || parsed.auth_domain,
          projectId: parsed.projectId || parsed.project_id,
          storageBucket: parsed.storageBucket || parsed.storage_bucket,
          messagingSenderId: parsed.messagingSenderId || parsed.messaging_sender_id,
          appId: parsed.appId || parsed.app_id,
          measurementId: parsed.measurementId || parsed.measurement_id
        };
      }
    } catch {
      // Not valid JSON, proceed to regex / JS snippet extraction
    }

    // 2. Extract from standard Firebase Javascript snippet:
    // const firebaseConfig = { apiKey: "...", projectId: "...", ... };
    try {
      const extractKey = (keyName: string): string => {
        // match: keyName: "value" or 'value'
        const regex = new RegExp(`['"]?${keyName}['"]?\\s*:\\s*['"]([^'"]+)['"]`, 'i');
        const match = clean.match(regex);
        return match ? match[1].trim() : '';
      };

      const apiKey = extractKey('apiKey');
      const projectId = extractKey('projectId');
      const authDomain = extractKey('authDomain');
      const storageBucket = extractKey('storageBucket');
      const messagingSenderId = extractKey('messagingSenderId');
      const appId = extractKey('appId');
      const measurementId = extractKey('measurementId');

      if (apiKey && projectId) {
        return {
          apiKey,
          projectId,
          authDomain,
          storageBucket,
          messagingSenderId,
          appId: appId || `1:${projectId}:web:probaho`,
          measurementId
        };
      }
    } catch (err) {
      console.error('Error parsing Firebase config snippet:', err);
    }

    return null;
  }

  // --- Initialization ---
  private initFromStorage(): void {
    try {
      const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
      const savedWorkspace = localStorage.getItem(WORKSPACE_STORAGE_KEY);

      if (savedConfig) {
        const config: FirebaseConfig = JSON.parse(savedConfig);
        this.activeConfig = config;
        this.activeWorkspaceId = savedWorkspace || 'PROBAHO-WORKSPACE';
        this.initializeFirebase(config);
      } else {
        this.setStatus('disconnected');
      }
    } catch (err) {
      console.warn('Could not auto-initialize Firebase from storage:', err);
      this.setStatus('error');
    }
  }

  private initializeFirebase(config: FirebaseConfig): boolean {
    try {
      // Disconnect any existing listener
      if (this.unsubscribeSnapshot) {
        this.unsubscribeSnapshot();
        this.unsubscribeSnapshot = null;
      }

      const existingApps = getApps();
      const existing = existingApps.find(a => a.name === 'PROBAHO_CRM_APP');
      if (existing) {
        this.app = existing;
      } else {
        this.app = initializeApp(config, 'PROBAHO_CRM_APP');
      }

      // Initialize Firestore with persistent offline cache support
      try {
        this.db = initializeFirestore(this.app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
          })
        });
      } catch {
        // Fallback if already initialized in this session
        this.db = getFirestore(this.app);
      }

      this.activeConfig = config;
      this.setStatus('connected');
      return true;
    } catch (err) {
      console.error('Failed to initialize Firebase instance:', err);
      this.setStatus('error');
      return false;
    }
  }

  // --- Status Management ---
  public getStatus(): SyncStatus {
    return this.status;
  }

  public getActiveConfig(): FirebaseConfig | null {
    return this.activeConfig;
  }

  public getActiveWorkspaceId(): string {
    return this.activeWorkspaceId || localStorage.getItem(WORKSPACE_STORAGE_KEY) || 'PROBAHO-DEFAULT';
  }

  public setWorkspaceId(workspaceId: string): void {
    const cleanId = workspaceId.trim().toUpperCase();
    this.activeWorkspaceId = cleanId;
    localStorage.setItem(WORKSPACE_STORAGE_KEY, cleanId);
  }

  private setStatus(newStatus: SyncStatus): void {
    this.status = newStatus;
    this.statusListeners.forEach(listener => {
      try {
        listener(newStatus);
      } catch (err) {
        console.error('Error in status listener:', err);
      }
    });
  }

  public onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.statusListeners.push(callback);
    callback(this.status);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== callback);
    };
  }

  // --- Connect / Save Config & Test ---
  public async connectWithConfig(
    config: FirebaseConfig, 
    workspaceId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.setStatus('syncing');
      const cleanId = workspaceId.trim().toUpperCase() || 'PROBAHO-WORKSPACE';
      const ok = this.initializeFirebase(config);
      if (!ok || !this.db) {
        this.setStatus('error');
        return { success: false, message: 'Failed to initialize Firebase with the provided configuration.' };
      }

      // Test write/read to Firestore to ensure rules allow access
      const pingDocRef = doc(this.db, 'workspaces', cleanId, 'system', 'connection_test');
      await setDoc(pingDocRef, {
        tested_at: new Date().toISOString(),
        client: 'PROBAHO CRM Suite',
        status: 'active'
      }, { merge: true });

      // Save valid credentials to storage
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
      this.setWorkspaceId(cleanId);
      this.setStatus('connected');

      return { 
        success: true, 
        message: `Successfully connected to Google Firebase! Cloud Workspace [${cleanId}] is active.` 
      };
    } catch (err: any) {
      console.error('Firebase test connection failed:', err);
      this.setStatus('error');
      
      let hint = err.message || 'Unknown error occurred.';
      if (err.code === 'permission-denied') {
        hint = 'Permission Denied! In your Firebase Console, open "Firestore Database" -> "Rules" tab and allow read/write.';
      } else if (err.code === 'unavailable') {
        hint = 'Network Unavailable. Please check your internet connection and verify Firestore is created in Firebase Console.';
      }
      return { success: false, message: hint };
    }
  }

  // --- Disconnect / Logout Cloud ---
  public disconnect(): void {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }
    this.activeConfig = null;
    this.app = null;
    this.db = null;
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    this.setStatus('disconnected');
  }

  // --- Real-time Cloud Synchronization ---
  public subscribeToCloudUpdates(
    workspaceId: string,
    onRemoteDataReceived: (remoteData: Partial<CRMDataStore>) => void
  ): () => void {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }

    if (!this.db) {
      return () => {};
    }

    const cleanId = workspaceId.trim().toUpperCase();
    const docRef = doc(this.db, 'workspaces', cleanId, 'data', 'store');

    try {
      this.unsubscribeSnapshot = onSnapshot(docRef, (snapshot) => {
        // Ignore remote snapshot if this client is currently pushing its own write
        if (this.isPushingInternally) return;

        if (snapshot.exists()) {
          const remote = snapshot.data() as Partial<CRMDataStore>;
          if (remote) {
            this.setStatus('connected');
            onRemoteDataReceived(remote);
          }
        }
      }, (err) => {
        console.warn('Real-time listener warning:', err);
        if (err.code === 'unavailable') {
          this.setStatus('offline');
        } else {
          this.setStatus('error');
        }
      });

      return () => {
        if (this.unsubscribeSnapshot) {
          this.unsubscribeSnapshot();
          this.unsubscribeSnapshot = null;
        }
      };
    } catch (err) {
      console.error('Failed to attach snapshot listener:', err);
      return () => {};
    }
  }

  // --- Push Local Data Store to Cloud ---
  public async pushDataToCloud(data: CRMDataStore, performedBy: string = 'User'): Promise<boolean> {
    if (!this.db || !this.activeWorkspaceId) {
      return false;
    }

    try {
      this.isPushingInternally = true;
      this.setStatus('syncing');

      const cleanId = this.activeWorkspaceId.trim().toUpperCase();
      const docRef = doc(this.db, 'workspaces', cleanId, 'data', 'store');

      // Safeguard: Optimize payload to remain comfortably below Firestore 1 MB document limit
      const safeActivities = Array.isArray(data.activities) ? data.activities.slice(0, 50) : [];
      const payload: any = {
        ...data,
        activities: safeActivities,
        workspace_id: cleanId,
        last_synced_at: new Date().toISOString(),
        last_synced_by: performedBy
      };

      // Measure approximate JSON payload size
      const serialized = JSON.stringify(payload);
      if (serialized.length > 900000) {
        // Prune activities further if payload approaches 1 MB
        payload.activities = safeActivities.slice(0, 15);
      }

      await setDoc(docRef, payload, { merge: true });

      // Also update workspace root directory metadata
      const metaRef = doc(this.db, 'workspaces', cleanId);
      await setDoc(metaRef, {
        workspace_id: cleanId,
        company_name: data.brand_profile?.brand_name || 'My Business',
        phone: data.brand_profile?.phone || '',
        updated_at: new Date().toISOString(),
        last_modified_by: performedBy,
        orders_count: data.orders?.length || 0,
        products_count: data.products?.length || 0,
        staff_count: data.user_accounts?.length || 0
      }, { merge: true });

      this.setStatus('connected');
      return true;
    } catch (err: any) {
      console.error('Error pushing data to Firebase:', err);
      if (err.code === 'unavailable' || !navigator.onLine) {
        this.setStatus('offline');
      } else {
        this.setStatus('error');
      }
      return false;
    } finally {
      setTimeout(() => {
        this.isPushingInternally = false;
      }, 500);
    }
  }

  // --- One-Time Pull From Cloud ---
  public async pullDataFromCloud(workspaceId: string): Promise<CRMDataStore | null> {
    if (!this.db) return null;

    try {
      this.setStatus('syncing');
      const cleanId = workspaceId.trim().toUpperCase();
      const docRef = doc(this.db, 'workspaces', cleanId, 'data', 'store');
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        this.setStatus('connected');
        return snapshot.data() as CRMDataStore;
      }
      this.setStatus('connected');
      return null;
    } catch (err) {
      console.error('Error pulling data from Firebase:', err);
      this.setStatus('error');
      return null;
    }
  }
}

export const firebaseSync = new FirebaseSyncService();
