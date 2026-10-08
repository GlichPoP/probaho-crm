import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PROBAHO CRM Solutions — Complete User Guide</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: "Page " counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #94a3b8;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1e293b;
      line-height: 1.55;
      font-size: 10pt;
      background: #ffffff;
    }

    .header-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }

    .brand-title {
      font-size: 20pt;
      font-weight: 800;
      color: #4338ca;
      letter-spacing: -0.5px;
      margin-bottom: 2px;
    }

    .brand-subtitle {
      font-size: 10pt;
      color: #64748b;
      font-weight: 500;
    }

    .badge-pill {
      display: inline-block;
      background: #e0e7ff;
      color: #4338ca;
      font-weight: 700;
      font-size: 8pt;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 22px;
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      color: #475569;
    }

    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 18px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 5px;
    }

    h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #334155;
      margin-top: 12px;
      margin-bottom: 6px;
    }

    p {
      margin-bottom: 8px;
      color: #334155;
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 10px;
    }

    li {
      margin-bottom: 4px;
      color: #334155;
    }

    .tip-card {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      border-radius: 0 6px 6px 0;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 9pt;
      color: #1e40af;
    }

    .warning-card {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      border-radius: 0 6px 6px 0;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 9pt;
      color: #991b1b;
    }

    .success-card {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      border-radius: 0 6px 6px 0;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 9pt;
      color: #166534;
    }

    .step-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      background: #4338ca;
      color: #ffffff;
      border-radius: 50%;
      font-size: 8.5pt;
      font-weight: 700;
      margin-right: 6px;
    }

    .module-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 12px 0;
    }

    .module-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .module-card-title {
      font-weight: 700;
      font-size: 10pt;
      color: #1e293b;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .module-card p {
      font-size: 8.5pt;
      color: #64748b;
      margin: 0;
      line-height: 1.45;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 8.5pt;
      color: #0f172a;
    }

    .code-block {
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8pt;
      line-height: 1.4;
      margin: 8px 0;
      overflow-x: hidden;
    }

    .page-break {
      page-break-before: always;
    }

    .no-break {
      page-break-inside: avoid;
    }

    .footer {
      margin-top: 24px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      text-align: center;
      font-size: 8pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <!-- Header Banner -->
  <div class="header-banner">
    <div>
      <div class="brand-title">PROBAHO CRM Solutions</div>
      <div class="brand-subtitle">Enterprise Business Operations & Showroom Management Suite</div>
    </div>
    <div>
      <span class="badge-pill">Official User Manual v1.0</span>
    </div>
  </div>

  <!-- Meta Information -->
  <div class="meta-box">
    <div><strong>Author & Creator:</strong> Irfanur Rahman</div>
    <div><strong>Architecture:</strong> Offline-First SQLite (WASM) + Electron</div>
    <div><strong>Download:</strong> github.com/GlichPoP/probaho-crm</div>
  </div>

  <!-- Section 1 -->
  <div class="no-break">
    <h2><span class="step-badge">1</span> First-Time Launch & Master Account Setup</h2>
    <p>
      When you open PROBAHO CRM for the very first time, the system will prompt you to initialize your 
      <strong>Master Administrator Account</strong>. This account has master ownership over your business data, 
      financial profits, and employee management.
    </p>

    <ol>
      <li><strong>Username:</strong> Enter an administrator username (default is <code>admin</code>).</li>
      <li><strong>Full Name:</strong> Enter the business owner or general manager's name.</li>
      <li><strong>Showroom / Business Name:</strong> Enter your brand or store name (e.g., <em>Urban Threads</em>).</li>
      <li><strong>Master Password:</strong> Create a strong password and confirm it.</li>
      <li>Click <strong>"Initialize Master Setup"</strong> to launch into the dashboard.</li>
    </ol>

    <div class="tip-card">
      <strong>Important Security Tip:</strong> Keep your Master Password in a safe place. You will need it to view confidential profit margins, change financial settings, and manage staff accounts.
    </div>
  </div>

  <!-- Section 2 -->
  <div class="no-break" style="margin-top: 16px;">
    <h2><span class="step-badge">2</span> Adding Employees & Setting Permissions</h2>
    <p>
      PROBAHO lets you add sales associates, warehouse staff, and delivery managers while ensuring they only access the features they need.
    </p>

    <ol>
      <li>From the left sidebar menu, click <strong>Settings & Backup</strong> (or click your profile icon in the top bar).</li>
      <li>Click on the <strong>Staff Management</strong> tab.</li>
      <li>Click the <strong>"+ Add Staff Member"</strong> button.</li>
      <li>Fill in the employee details:
        <ul>
          <li><strong>Full Name & Role:</strong> (e.g., <em>Rahim Ahmed — Sales Associate</em>).</li>
          <li><strong>Login ID & Password / PIN:</strong> Assign an easy-to-remember login ID and initial password (e.g., <code>1234</code>).</li>
          <li><strong>Permissions Checklist:</strong> Choose exactly what they can see:
            <br/>• <strong>Orders & POS:</strong> Allows punching in customer sales.
            <br/>• <strong>Invoices:</strong> Allows viewing and printing receipt slips.
            <br/>• <strong>Customers:</strong> Allows accessing customer addresses and phone numbers.
            <br/><em>(Leave "Payments" and "Settings" unchecked so employees cannot see supplier costs or owner profits.)</em>
          </li>
        </ul>
      </li>
      <li>Click <strong>"Save Staff Member"</strong>.</li>
      <li><strong>Share Access:</strong> Click the <strong>WhatsApp / Share</strong> icon next to their name to instantly copy a formatted message containing their login ID and instructions!</li>
    </ol>
  </div>

  <div class="page-break"></div>

  <!-- Section 3 -->
  <h2><span class="step-badge">3</span> Feature Tour — What Each Module Does</h2>
  <p>Here is a breakdown of every module inside PROBAHO CRM and how to use it day-to-day:</p>

  <div class="module-grid">
    <div class="module-card">
      <div class="module-card-title">📊 1. Executive Command Center</div>
      <p>
        <strong>Your real-time business overview.</strong> Shows today's gross sales, estimated net profit, 
        active orders in delivery, and courier COD cash currently due. Also graphs daily sales trends and sales channel breakdown (Messenger, WhatsApp, Store).
      </p>
    </div>

    <div class="module-card">
      <div class="module-card-title">🛍️ 2. Orders Management & POS</div>
      <p>
        <strong>Punch sales & print receipts.</strong> Click <em>+ New Order</em> to create a sale, select items, and pick payment methods. Print thermal delivery challans or standard invoices with barcodes with one click.
      </p>
    </div>

    <div class="module-card">
      <div class="module-card-title">📦 3. Inventory & Variant Catalog</div>
      <p>
        <strong>Stock & multi-variant tracking.</strong> Add items with size variations (S, M, L, XL), fits, and colors. The system automatically calculates cost valuation, profit margins, and flags low stock in red.
      </p>
    </div>

    <div class="module-card">
      <div class="module-card-title">👥 4. Customer CRM & RTO Loss Shield</div>
      <p>
        <strong>Smart customer directory.</strong> Segments clients into tiers (Champions, VIP, Regular). Features an <em>Automated Return Risk Warning</em> that flags habitual order rejectors before you ship.
      </p>
    </div>

    <div class="module-card">
      <div class="module-card-title">💰 5. Payments & Financial Ledger</div>
      <p>
        <strong>Complete cash flow tracking.</strong> Logs inflows across Cash, bKash Merchant, Nagad, and Bank. Reconciles bulk courier payouts (Pathao, Steadfast) and records vendor costs and overhead expenses.
      </p>
    </div>

    <div class="module-card">
      <div class="module-card-title">🚚 6. Couriers & Delivery Partners</div>
      <p>
        <strong>Pre-configured logistics.</strong> Integrated presets for Pathao, Steadfast, RedX, Paperfly, Sundarban, and eCourier across all 64 districts in Bangladesh with standard Dhaka / Outside Dhaka rates.
      </p>
    </div>
  </div>

  <!-- Section 4 -->
  <div class="no-break" style="margin-top: 18px;">
    <h2><span class="step-badge">4</span> How to Connect Google Firebase (Online Sync)</h2>
    <p>
      By default, PROBAHO runs <strong>100% offline</strong> on your local computer for lightning-fast speed. If you want to sync multiple computers or access data online, connect your free Google Firebase account:
    </p>

    <ol>
      <li>Go to the free <strong>Firebase Console</strong> (<code>console.firebase.google.com</code>) and click <strong>"Add Project"</strong>.</li>
      <li>Click <strong>Firestore Database</strong> &rarr; <strong>Create Database</strong> (choose <em>Start in test mode</em>).</li>
      <li>Click the <strong>Project Settings (gear icon ⚙️)</strong> &rarr; Scroll to <strong>"Your apps"</strong> &rarr; Click the <strong>Web icon (<code>&lt;/&gt;</code>)</strong>.</li>
      <li>Copy the web configuration snippet:</li>
    </ol>

    <div class="code-block">
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "my-showroom.firebaseapp.com",
  projectId: "my-showroom",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
    </div>

    <ol start="5">
      <li>In PROBAHO CRM, open <strong>Settings & Backup</strong> &rarr; <strong>Cloud Sync</strong> tab.</li>
      <li>Enter a <strong>Company Workspace Code</strong> (e.g. <code>URBAN-101</code>), paste the code block into the box, and click <strong>"Test & Save Cloud Sync"</strong>.</li>
    </ol>

    <div class="success-card">
      <strong>You are now synced!</strong> Any computer using the same Workspace Code and configuration will automatically stay in sync in real time. If your internet ever cuts out, PROBAHO continues running offline seamlessly without losing any data.
    </div>
  </div>

  <!-- Section 5 -->
  <div class="no-break" style="margin-top: 16px;">
    <h2><span class="step-badge">5</span> Backups & Complete Privacy</h2>
    <ul>
      <li><strong>1-Click Local Backup:</strong> Under <em>Settings & Backup</em>, click <strong>"Export Database Backup"</strong> at any time to save an instant snapshot of your entire business database to your hard drive or a USB stick.</li>
      <li><strong>100% Private:</strong> Your customer phone numbers, orders, and profit numbers are never sent to any third-party servers. All data belongs strictly to you.</li>
    </ul>
  </div>

  <div class="footer">
    PROBAHO CRM Solutions &bull; Built with pride by <strong>Irfanur Rahman</strong> &bull; Free to use for retail & showroom merchants.
  </div>

</body>
</html>
`;

async function generatePDF() {
  console.log('Generating PDF using Chrome headless...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const outputPdfPath = path.join(projectRoot, 'PROBAHO-CRM-User-Guide.pdf');
  const artifactDir = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\fe641888-33ec-4f25-9bcc-1e21e195b8d3';
  const artifactPdfPath = path.join(artifactDir, 'PROBAHO-CRM-User-Guide.pdf');

  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '14mm',
      bottom: '14mm',
      left: '14mm',
      right: '14mm'
    }
  });

  console.log(`PDF created at: ${outputPdfPath}`);

  // Copy to artifact directory
  fs.copyFileSync(outputPdfPath, artifactPdfPath);
  console.log(`PDF copied to artifact directory at: ${artifactPdfPath}`);

  await browser.close();
  console.log('Done!');
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
