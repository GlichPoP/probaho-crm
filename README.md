<div align="center">

<img src="src/assets/probaho-logo.svg" width="120" height="120" alt="PROBAHO CRM Solutions Logo" style="border-radius: 28px; box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);" />

# PROBAHO CRM Solutions
### Enterprise Business Operations & Showroom Management Suite

[![Release](https://img.shields.io/badge/Release-v1.0.0-emerald?style=for-the-badge&logo=windows)](https://github.com/GlichPoP/probaho-crm/releases)
[![Platform](https://img.shields.io/badge/Platform-Windows_x64-blue?style=for-the-badge&logo=electron)](https://github.com/GlichPoP/probaho-crm/releases)
[![Architecture](https://img.shields.io/badge/Architecture-Offline--First_SQLite-indigo?style=for-the-badge&logo=sqlite)](https://github.com/GlichPoP/probaho-crm)
[![License](https://img.shields.io/badge/License-Freeware-purple?style=for-the-badge)](https://github.com/GlichPoP/probaho-crm)

<p align="center">
  <b>A high-performance, offline-first enterprise management suite designed for retail showrooms, e-commerce distributors, and merchant operations.</b>
</p>

[Download Setup Installer (.exe)](https://github.com/GlichPoP/probaho-crm/releases) • [Download Portable (.exe)](https://github.com/GlichPoP/probaho-crm/releases) • [Report an Issue](https://github.com/GlichPoP/probaho-crm/issues)

</div>

---

## 🌟 Executive Overview

**PROBAHO CRM Solutions** is engineered to eliminate dependency on unstable internet connections while delivering high-speed showroom operations. Built with modern desktop technologies (**Electron**, **React 19**, **TypeScript**, and **SQLite via WebAssembly**), it combines enterprise relational data persistence with zero-latency desktop workflows.

Whether processing rapid Cash-on-Delivery (COD) retail orders, generating customer challan invoices, tracking multi-variant inventory stocks, or auditing staff transactions, PROBAHO operates completely locally with full privacy and speed.

---

## 🚀 Key Architectural Capabilities

### 1. Offline-First Relational Engine (SQLite + WebAssembly)
* **Zero Cloud Latency**: All product catalogs, inventory movements, customer transaction logs, and ledger entries persist locally inside a high-speed SQLite database (`sql.js`).
* **Privacy & Data Sovereignty**: Business transactions, profit margins, and customer data never leave your showroom hardware unless explicitly exported.
* **Instant Snapshot Backups**: One-click encrypted JSON and SQLite database export/import engine for automated offsite disaster recovery.

### 2. Multi-Region Localization & Delivery Engine
* **Global Customization**: Adaptive country selector supporting currencies (`USD`, `BDT`, `EUR`, `GBP`, `INR`), customizable tax models (Sales Tax, VAT, GST), and multi-lingual UI labels.
* **Pre-Configured Logistics Infrastructure**:
  * Native coverage of all 64 districts in Bangladesh with automatic standard delivery rates (Inside Dhaka vs. Outside Dhaka).
  * Direct courier profiles for **Pathao**, **Steadfast**, **RedX**, **Paperfly**, **Sundarban**, and **eCourier**.
  * Payment ledger tracking for **bKash Merchant**, **Nagad**, **Rocket**, **Bank Wire**, and **Cash on Delivery (COD)**.

### 3. Role-Based Access Control (RBAC) & Multi-User Profiles
* **Administrative Master vs. Operational Staff**: Fine-grained permissions preventing unauthorized edits to cost prices, profit margins, or historical ledger balances.
* **Audit Trails**: Every customer interaction, status update, order exchange, and stock adjustment is signed with the user profile identity (`created_by` / `last_modified_by`).

### 4. Seamless In-App Auto-Update & Distribution Engine
* **Zero-Hassle Background Updater**: Automated update checker backed by GitHub Releases CDN.
* **1-Click In-App Install**: In-app progress streaming and automatic installer launcher (`Restart & Install Now`) with zero manual file hunting.
* **Zero Data Loss Guarantee**: Updating the application binary preserves 100% of client databases, receipts, and settings.

### 5. Smart Customer CRM & RTO Loss Prevention
* **Automated Return Risk Flagging**: Customers with high returned order (RTO) frequencies are automatically flagged to alert shipping staff and avoid delivery charge losses.
* **Customer Segmentation**: Automatic RFM segmentation categorizing clients into *Champions*, *VIP*, *Regular*, *New*, and *At Risk*.

### 6. Professional Invoicing & Thermal Challan Generator
* **One-Click Invoice & Challan Printing**: Formatted layouts with barcode generation, brand logo watermark, custom terms, and delivery challan slips.
* **Product Exchanges & Adjustments**: Direct order exchange invoice workflows with automated stock reconciliation.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Desktop Runtime** | Electron 43 with context isolation, process sandboxing, and security hardening |
| **Frontend Framework** | React 19, TypeScript, Vite 8, Lucide Icons |
| **Database Engine** | SQLite 3 via WebAssembly (`sql.js`), LocalStorage caching |
| **Data Visualization** | Recharts (Financial analytics, delivery conversion funnels, daily KPI metrics) |
| **Packaging & Installer** | Electron Builder, NSIS (Nullsoft Scriptable Install System) |
| **Distribution Pipeline** | In-app background downloader, GitHub Releases CDN |

---

## 📦 Download & Installation

### Option A: Standard Setup Installer (Recommended)
1. Download **`PROBAHO CRM Solutions Setup 1.0.0.exe`** from the [Latest Releases](https://github.com/GlichPoP/probaho-crm/releases).
2. Run the installer. It will automatically install shortcuts on your Desktop and Start Menu.
3. Launch the application.

### Option B: Standalone Portable Version
* Download **`PROBAHO CRM Solutions-Portable.exe`**.
* Runs directly without installation—ideal for running directly from a USB flash drive across multiple showroom workstations.

---

## 💻 Developer Guide & Local Build

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (v9 or higher)

### Setup & Development Server
```bash
# Clone the repository
git clone https://github.com/GlichPoP/probaho-crm.git

# Navigate into project directory
cd probaho-crm

# Install dependencies
npm install

# Start local development server with Hot Module Replacement
npm run dev

# Run Electron desktop window
npm run start
```

### Production Compilation
```bash
# Verify TypeScript types
npx tsc -b

# Run linter
npm run lint

# Build production Windows Installer and Portable binaries
npm run electron:build
```
Compiled executables will be output directly to the `release/` directory.

---

## 👨‍💻 Author & Creator Attribution

Conceived, architected, and engineered by:

**Irfanur Rahman**  
* Creator & Product Architect | Product Builder  
* **LinkedIn**: [linkedin.com/in/irfanur-rahman123](https://www.linkedin.com/in/irfanur-rahman123/)  
* **GitHub**: [@GlichPoP](https://github.com/GlichPoP)  
* **Contact Email**: [irfanur6@gmail.com](mailto:irfanur6@gmail.com)

---

## 📄 License & Attribution

Copyright © 2026 **Irfanur Rahman**. All rights reserved.  
This software is provided as official freeware for showroom business management and commercial retail operations. Embedded author attribution and creator notices must remain preserved in all distributions.
