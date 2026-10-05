// Software Update Checker & In-App Installation Service
// Handles automated and manual update checks, version comparison, changelog retrieval, background downloading, and in-place installer execution

export const APP_VERSION = '1.0.0';

export interface DownloadProgress {
  percent: number;
  receivedBytes: number;
  totalBytes: number;
}

export type DownloadState = 'idle' | 'downloading' | 'downloaded' | 'error';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  status: 'idle' | 'checking' | 'up-to-date' | 'update-available' | 'error';
  downloadStatus: DownloadState;
  downloadProgress?: DownloadProgress;
  downloadError?: string;
  releaseDate?: string;
  releaseTitle?: string;
  changelog?: string[];
  installerDownloadUrl?: string;
  portableDownloadUrl?: string;
  releasePageUrl?: string;
  errorMessage?: string;
  lastCheckedAt?: string;
}

const STORAGE_KEY_CONFIG = 'probaho_update_config';
const STORAGE_KEY_CACHE = 'probaho_last_update_info';

export interface UpdateConfig {
  githubRepo: string;          // e.g. "GlichPoP/probaho-crm"
  autoCheckOnStartup: boolean; // Check in background on launch
  customFeedUrl?: string;      // Custom JSON feed if not using GitHub
}

const DEFAULT_CONFIG: UpdateConfig = {
  githubRepo: 'GlichPoP/probaho-crm',
  autoCheckOnStartup: true,
};

/**
 * Semver comparator: returns true if remoteVersion is strictly newer than currentVersion
 * Supports versions like "1.0.0", "v1.1.0", "1.2.3-beta"
 */
export function isNewerVersion(remoteVersion: string, currentVersion: string): boolean {
  const cleanRemote = remoteVersion.replace(/^v/i, '').trim();
  const cleanCurrent = currentVersion.replace(/^v/i, '').trim();

  if (cleanRemote === cleanCurrent) return false;

  const remoteParts = cleanRemote.split('.').map(n => parseInt(n, 10) || 0);
  const currentParts = cleanCurrent.split('.').map(n => parseInt(n, 10) || 0);

  const maxLen = Math.max(remoteParts.length, currentParts.length);
  for (let i = 0; i < maxLen; i++) {
    const r = remoteParts[i] || 0;
    const c = currentParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }

  return false;
}

class UpdateService {
  private config: UpdateConfig;
  private currentStatus: UpdateInfo;
  private listeners: Set<(info: UpdateInfo) => void> = new Set();
  private progressCleanup: (() => void) | null = null;

  constructor() {
    this.config = this.loadConfig();
    this.currentStatus = this.loadCachedStatus();

    // Auto-check on startup if enabled
    if (this.config.autoCheckOnStartup) {
      setTimeout(() => {
        this.checkForUpdates(false).catch(() => {});
      }, 3500); // Gentle 3.5s delay to avoid competing with initial app load
    }
  }

  private loadConfig(): UpdateConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load update config:', e);
    }
    return { ...DEFAULT_CONFIG };
  }

  public saveConfig(newConfig: Partial<UpdateConfig>) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to save update config:', e);
    }
  }

  public getConfig(): UpdateConfig {
    return { ...this.config };
  }

  private loadCachedStatus(): UpdateInfo {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CACHE);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasUpdate = isNewerVersion(parsed.latestVersion || APP_VERSION, APP_VERSION);
        return {
          ...parsed,
          currentVersion: APP_VERSION,
          hasUpdate,
          status: hasUpdate ? 'update-available' : 'up-to-date',
          downloadStatus: 'idle',
          downloadProgress: undefined,
          downloadError: undefined
        };
      }
    } catch (e) {
      console.warn('Failed to load cached update status:', e);
    }
    return {
      currentVersion: APP_VERSION,
      latestVersion: APP_VERSION,
      hasUpdate: false,
      status: 'idle',
      downloadStatus: 'idle'
    };
  }

  private saveCachedStatus(info: UpdateInfo) {
    try {
      localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(info));
    } catch (e) {
      console.warn('Failed to save update cache:', e);
    }
  }

  public getStatus(): UpdateInfo {
    return { ...this.currentStatus };
  }

  public subscribe(listener: (info: UpdateInfo) => void): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach(fn => {
      try {
        fn(status);
      } catch (e) {
        console.error('UpdateService listener error:', e);
      }
    });
  }

  /**
   * Primary check method. Fetches from GitHub Releases API or custom JSON endpoint.
   */
  public async checkForUpdates(_force = true): Promise<UpdateInfo> {
    this.currentStatus = {
      ...this.currentStatus,
      status: 'checking',
      currentVersion: APP_VERSION
    };
    this.notify();

    try {
      let latestVersion = APP_VERSION;
      let releaseTitle = '';
      let releaseDate = '';
      let changelog: string[] = [];
      let installerUrl = '';
      let portableUrl = '';
      let releasePageUrl = '';

      if (this.config.customFeedUrl) {
        const res = await fetch(this.config.customFeedUrl, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Custom feed returned status ${res.status}`);
        const data = await res.json();
        latestVersion = data.version || APP_VERSION;
        releaseTitle = data.title || `Release v${latestVersion}`;
        releaseDate = data.releaseDate || new Date().toISOString().split('T')[0];
        changelog = Array.isArray(data.changelog) ? data.changelog : [];
        installerUrl = data.installerUrl || '';
        portableUrl = data.portableUrl || '';
        releasePageUrl = data.releasePageUrl || '';
      } else {
        const repo = this.config.githubRepo.trim();
        const apiUrl = `https://api.github.com/repos/${repo}/releases/latest`;

        const res = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          },
          cache: 'no-cache'
        });

        if (res.status === 404) {
          const checkedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          this.currentStatus = {
            currentVersion: APP_VERSION,
            latestVersion: APP_VERSION,
            hasUpdate: false,
            status: 'up-to-date',
            downloadStatus: 'idle',
            lastCheckedAt: checkedTime,
            releaseTitle: 'Official Production Release',
            changelog: ['You are running the official production build of PROBAHO CRM Solutions.']
          };
          this.saveCachedStatus(this.currentStatus);
          this.notify();
          return this.getStatus();
        }

        if (!res.ok) {
          throw new Error(`Release check responded with status ${res.status} (${res.statusText})`);
        }

        const data = await res.json();
        latestVersion = (data.tag_name || '').replace(/^v/i, '').trim() || APP_VERSION;
        releaseTitle = data.name || `Release v${latestVersion}`;
        releaseDate = data.published_at ? new Date(data.published_at).toLocaleDateString() : '';
        releasePageUrl = data.html_url || `https://github.com/${repo}/releases`;

        if (data.body) {
          changelog = data.body
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.startsWith('-') || line.startsWith('*') || line.startsWith('•'))
            .map((line: string) => line.replace(/^[-*•]\s*/, '').trim())
            .filter(Boolean);
        }

        if (Array.isArray(data.assets)) {
          const installerAsset = data.assets.find((a: any) => a.name.endsWith('.exe') && !a.name.toLowerCase().includes('portable'));
          const portableAsset = data.assets.find((a: any) => a.name.toLowerCase().includes('portable') && a.name.endsWith('.exe'));
          if (installerAsset) installerUrl = installerAsset.browser_download_url;
          if (portableAsset) portableUrl = portableAsset.browser_download_url;
        }
      }

      const hasUpdate = isNewerVersion(latestVersion, APP_VERSION);
      const checkedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      this.currentStatus = {
        currentVersion: APP_VERSION,
        latestVersion,
        hasUpdate,
        status: hasUpdate ? 'update-available' : 'up-to-date',
        downloadStatus: this.currentStatus.downloadStatus === 'downloaded' ? 'downloaded' : 'idle',
        releaseDate,
        releaseTitle: releaseTitle || (hasUpdate ? `Version ${latestVersion} Now Available` : `v${APP_VERSION} Up to Date`),
        changelog: changelog.length > 0 ? changelog : (hasUpdate ? ['Stability and performance enhancements.'] : ['You are running the latest version.']),
        installerDownloadUrl: installerUrl,
        portableDownloadUrl: portableUrl,
        releasePageUrl,
        lastCheckedAt: checkedTime
      };

      this.saveCachedStatus(this.currentStatus);
      this.notify();
      return this.getStatus();

    } catch (err: any) {
      console.warn('Update check failed:', err);
      const checkedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.currentStatus = {
        ...this.currentStatus,
        status: 'error',
        errorMessage: err.message || 'Unable to check for updates. Please verify your internet connection.',
        lastCheckedAt: checkedTime
      };
      this.notify();
      return this.getStatus();
    }
  }

  /**
   * Starts downloading the update binary in the background with progress reporting
   */
  public async startDownload(): Promise<void> {
    const installerUrl = this.currentStatus.installerDownloadUrl || this.currentStatus.portableDownloadUrl;
    if (!installerUrl) {
      this.currentStatus = {
        ...this.currentStatus,
        downloadStatus: 'error',
        downloadError: 'No installer package found in the release.'
      };
      this.notify();
      return;
    }

    // If running in Electron desktop environment, use direct background download
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.downloadUpdate === 'function') {
      this.currentStatus = {
        ...this.currentStatus,
        downloadStatus: 'downloading',
        downloadProgress: { percent: 0, receivedBytes: 0, totalBytes: 0 },
        downloadError: undefined
      };
      this.notify();

      if (this.progressCleanup) {
        this.progressCleanup();
        this.progressCleanup = null;
      }

      if (typeof window.electronAPI.onDownloadProgress === 'function') {
        this.progressCleanup = window.electronAPI.onDownloadProgress((data) => {
          this.currentStatus = {
            ...this.currentStatus,
            downloadStatus: 'downloading',
            downloadProgress: data
          };
          this.notify();
        });
      }

      try {
        await window.electronAPI.downloadUpdate(installerUrl);
        this.currentStatus = {
          ...this.currentStatus,
          downloadStatus: 'downloaded',
          downloadProgress: { percent: 100, receivedBytes: 100, totalBytes: 100 }
        };
        this.notify();
      } catch (err: any) {
        console.error('Update download error:', err);
        this.currentStatus = {
          ...this.currentStatus,
          downloadStatus: 'error',
          downloadError: err?.message || 'Download was interrupted. Please check your connection and try again.'
        };
        this.notify();
      } finally {
        if (this.progressCleanup) {
          this.progressCleanup();
          this.progressCleanup = null;
        }
      }
    } else {
      // Fallback for browser previews: trigger download directly
      window.open(installerUrl, '_blank');
      this.currentStatus = {
        ...this.currentStatus,
        downloadStatus: 'downloaded'
      };
      this.notify();
    }
  }

  /**
   * Automatically executes the downloaded installer and cleanly restarts the app
   */
  public async installAndRestart(): Promise<void> {
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.installUpdate === 'function') {
      try {
        await window.electronAPI.installUpdate();
      } catch (err: any) {
        console.error('Failed to launch installer:', err);
        this.currentStatus = {
          ...this.currentStatus,
          downloadStatus: 'error',
          downloadError: err?.message || 'Failed to launch update installer.'
        };
        this.notify();
      }
    } else {
      // Browser fallback
      if (this.currentStatus.installerDownloadUrl) {
        window.open(this.currentStatus.installerDownloadUrl, '_blank');
      }
    }
  }

  /**
   * Cancels any active download in progress
   */
  public async cancelDownload(): Promise<void> {
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.cancelDownloadUpdate === 'function') {
      try {
        await window.electronAPI.cancelDownloadUpdate();
      } catch {}
    }
    if (this.progressCleanup) {
      this.progressCleanup();
      this.progressCleanup = null;
    }
    this.currentStatus = {
      ...this.currentStatus,
      downloadStatus: 'idle',
      downloadProgress: undefined,
      downloadError: undefined
    };
    this.notify();
  }
}

export const updateService = new UpdateService();
