import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const screenshotsDir = path.join(projectRoot, 'docs', 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Starting preview server on port 4173...');
  const previewProcess = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    cwd: projectRoot,
    shell: true,
    stdio: 'pipe'
  });

  previewProcess.stdout.on('data', data => {
    // console.log(`[Preview]: ${data}`);
  });
  previewProcess.stderr.on('data', data => {
    // console.error(`[Preview Error]: ${data}`);
  });

  // Wait for server to start
  await wait(3000);

  console.log('Launching Google Chrome headless...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();

  try {
    console.log('1. Navigating to Login Screen...');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.removeItem('PROBAHO_AUTH_SESSION');
      localStorage.setItem('PROBAHO_KEEP_LOGGED_IN', 'false');
      localStorage.setItem('vastra_theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await wait(1200);

    console.log('   📸 Capturing: 05-login-auth-terminal.png');
    await page.screenshot({
      path: path.join(screenshotsDir, '05-login-auth-terminal.png')
    });

    console.log('2. Seeding enterprise demo dataset and initializing session...');
    await page.evaluate(() => {
      if (window.dbService) {
        window.dbService.loadDemoData();
        const store = window.dbService.getDataStore();
        store.is_onboarded = true;
        store.is_master_configured = true;
        window.dbService.saveToStorage(store);
        const master = (window.dbService.getUserAccounts() || []).find(u => u.role === 'master');
        if (master) {
          localStorage.setItem('PROBAHO_AUTH_SESSION', master.id);
          localStorage.setItem('VASTRA_CRM_ACTIVE_USER_ID', master.id);
        }
      }
      localStorage.setItem('PROBAHO_KEEP_LOGGED_IN', 'true');
      localStorage.setItem('vastra_theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    });

    console.log('   Reloading into Dashboard View...');
    await page.reload({ waitUntil: 'networkidle0' });
    await wait(2000);

    console.log('   📸 Capturing: 01-dashboard-light.png');
    await page.screenshot({
      path: path.join(screenshotsDir, '01-dashboard-light.png')
    });

    console.log('3. Navigating to Orders & Billing POS in Dark Mode...');
    await page.evaluate(() => {
      localStorage.setItem('vastra_theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await page.waitForSelector('[data-testid="nav-item-orders"]', { timeout: 5000 });
    await page.click('[data-testid="nav-item-orders"]');
    await wait(1500);

    console.log('   📸 Capturing: 02-pos-orders-dark.png');
    await page.screenshot({
      path: path.join(screenshotsDir, '02-pos-orders-dark.png')
    });

    console.log('4. Navigating to Inventory & Warehouse in Light Mode...');
    await page.evaluate(() => {
      localStorage.setItem('vastra_theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.waitForSelector('[data-testid="nav-item-inventory"]', { timeout: 5000 });
    await page.click('[data-testid="nav-item-inventory"]');
    await wait(1500);

    console.log('   📸 Capturing: 03-inventory-warehouse-light.png');
    await page.screenshot({
      path: path.join(screenshotsDir, '03-inventory-warehouse-light.png')
    });

    console.log('5. Navigating to Finance & Accounts Ledger in Dark Mode...');
    await page.evaluate(() => {
      localStorage.setItem('vastra_theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await page.waitForSelector('[data-testid="nav-item-finance"]', { timeout: 5000 });
    await page.click('[data-testid="nav-item-finance"]');
    await wait(1500);

    console.log('   📸 Capturing: 04-financial-accounting-dark.png');
    await page.screenshot({
      path: path.join(screenshotsDir, '04-financial-accounting-dark.png')
    });

    console.log('✨ All 5 application screenshots captured successfully with high retina fidelity!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
    previewProcess.kill();
    process.exit(0);
  }
}

main();
