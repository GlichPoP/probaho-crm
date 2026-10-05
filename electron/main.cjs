const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const child_process = require('child_process');

let mainWindow = null;
let downloadedInstallerPath = null;
let activeDownloadRequest = null;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1024,
      minHeight: 700,
      title: 'PROBAHO CRM Solutions - Enterprise Business Operations Platform',
      icon: path.join(__dirname, '../build/icon.png'),
      backgroundColor: '#f8fafc',
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.cjs'),
        sandbox: false,
        spellcheck: false,
        devTools: !app.isPackaged
      }
    });

    // Remove default menu for clean app appearance
    Menu.setApplicationMenu(null);

    // Anti-Tampering: Prevent runtime DevTools inspection in production builds
    if (app.isPackaged) {
      mainWindow.webContents.on('devtools-opened', () => {
        mainWindow.webContents.closeDevTools();
      });

      mainWindow.webContents.on('before-input-event', (event, input) => {
        if (
          input.key === 'F12' ||
          (input.control && input.shift && ['I', 'i', 'J', 'j', 'C', 'c'].includes(input.key)) ||
          (input.control && ['U', 'u'].includes(input.key))
        ) {
          event.preventDefault();
        }
      });
    }

    // Load built index.html
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath);

    // Open external links in user's default browser or mail client
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('mailto:')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
      return { action: 'allow' };
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  /**
   * Downloads a remote file to disk following HTTP redirects (required for GitHub Releases CDN)
   */
  function downloadFileWithRedirects(downloadUrl, targetPath, onProgress) {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(targetPath)) {
        try { fs.unlinkSync(targetPath); } catch {}
      }

      const fileStream = fs.createWriteStream(targetPath);

      function follow(currentUrl, maxRedirects = 8) {
        if (maxRedirects <= 0) {
          fileStream.close();
          return reject(new Error('Exceeded maximum redirect limit while downloading update.'));
        }

        const client = currentUrl.startsWith('https:') ? https : http;

        const req = client.get(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PROBAHO-CRM-Desktop'
          }
        }, (res) => {
          // Follow HTTP redirects (301, 302, 303, 307, 308)
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume();
            return follow(res.headers.location, maxRedirects - 1);
          }

          if (res.statusCode !== 200) {
            fileStream.close();
            try { fs.unlinkSync(targetPath); } catch {}
            return reject(new Error(`Download failed with server status ${res.statusCode}: ${res.statusMessage}`));
          }

          const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
          let receivedBytes = 0;

          res.on('data', (chunk) => {
            receivedBytes += chunk.length;
            if (onProgress) {
              const percent = totalBytes > 0 ? Math.round((receivedBytes / totalBytes) * 100) : 0;
              onProgress({ percent, receivedBytes, totalBytes });
            }
          });

          res.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close(() => {
              resolve(targetPath);
            });
          });

          fileStream.on('error', (err) => {
            try { fs.unlinkSync(targetPath); } catch {}
            reject(err);
          });
        });

        activeDownloadRequest = req;

        req.on('error', (err) => {
          fileStream.close();
          try { fs.unlinkSync(targetPath); } catch {}
          reject(err);
        });
      }

      follow(downloadUrl);
    });
  }

  // Auto-Update IPC Handlers
  ipcMain.handle('download-update', async (_event, url) => {
    if (!url) throw new Error('No download URL provided');

    const tempDir = app.getPath('temp');
    downloadedInstallerPath = path.join(tempDir, 'probaho-crm-update-setup.exe');

    try {
      await downloadFileWithRedirects(url, downloadedInstallerPath, (progress) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('download-progress', progress);
        }
      });
      return { success: true, path: downloadedInstallerPath };
    } catch (error) {
      downloadedInstallerPath = null;
      throw error;
    } finally {
      activeDownloadRequest = null;
    }
  });

  ipcMain.handle('cancel-download-update', () => {
    if (activeDownloadRequest) {
      activeDownloadRequest.destroy();
      activeDownloadRequest = null;
    }
    if (downloadedInstallerPath && fs.existsSync(downloadedInstallerPath)) {
      try { fs.unlinkSync(downloadedInstallerPath); } catch {}
    }
    downloadedInstallerPath = null;
    return { success: true };
  });

  ipcMain.handle('install-update', async () => {
    if (!downloadedInstallerPath || !fs.existsSync(downloadedInstallerPath)) {
      throw new Error('Downloaded update installer not found. Please try downloading again.');
    }

    // Launch the downloaded installer detached
    const child = child_process.spawn(downloadedInstallerPath, [], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    // Cleanly quit app after a brief pause so file locks are released
    setTimeout(() => {
      app.quit();
    }, 450);

    return { success: true };
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
