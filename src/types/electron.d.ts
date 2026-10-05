export interface DownloadProgressData {
  percent: number;
  receivedBytes: number;
  totalBytes: number;
}

export interface ElectronAPI {
  platform: string;
  version: string;
  isElectron?: boolean;
  print: () => void;
  downloadUpdate: (url: string) => Promise<{ success: boolean; path: string }>;
  installUpdate: () => Promise<{ success: boolean }>;
  cancelDownloadUpdate: () => Promise<{ success: boolean }>;
  onDownloadProgress: (callback: (data: DownloadProgressData) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
