# PROBAHO CRM Solutions — Complete User Guide & Quick-Start Manual

Welcome to **PROBAHO CRM Solutions**! This guide is written in plain, simple terms so you can set up and start running your showroom, retail shop, or e-commerce business in minutes.

---

## ⚡ Step 1: First-Time Launch & Master Admin Setup

When you open PROBAHO CRM for the very first time, the system will prompt you to create your **Master Administrator Account**. This account has full control over all business data, profits, and settings.

### How to set it up:
1. **Username:** Enter an admin username (default is `admin`).
2. **Full Name:** Enter the business owner or manager's name.
3. **Showroom / Business Name:** Enter your brand name (e.g., *Urban Threads*).
4. **Master Password:** Choose a strong password and confirm it.
5. Click **"Initialize Master Setup"**.

> 💡 **Tip:** Keep this Master password safe! It is required to view confidential profit margins, change financial settings, and manage staff accounts.

---

## 👥 Step 2: Adding Employees & Setting Permissions

You can add staff members (sales assistants, packaging team, delivery coordinators) and control exactly what they can see and do.

### How to add an employee:
1. From the left sidebar, click **Settings & Backup** (or the top profile menu).
2. Open the **Staff Management** tab.
3. Click the **"+ Add Staff Member"** button.
4. Fill in the simple details:
   * **Full Name & Role:** (e.g., *Rahim Ahmed — Sales Associate*).
   * **Login ID & Password / PIN:** Create a simple login ID and initial password (e.g., `1234`).
   * **Allowed Modules (Permissions):** Check the boxes for what they should access:
     * ✅ *Orders & POS* (to take sales)
     * ✅ *Invoices* (to print receipts)
     * ✅ *Customers* (to check customer details)
     * ❌ *Leave "Payments" and "Settings" unchecked if you don't want staff viewing sensitive supplier costs or profits.*
5. Click **"Save Staff Member"**.
6. **Share Login Info:** Click the **Share / WhatsApp** button next to their name to instantly copy a ready-made message with their login details!

---

## 🧭 Step 3: Feature Tour — What Each Module Does

### 1. 📊 Executive Command Center (Dashboard & KPI)
* **What it does:** Your birds-eye view of how the business is performing today.
* **Key Numbers:** Shows total revenue, estimated net profit, pending COD money owed by couriers, and your daily profit trend graph.
* **RTO Rate:** Displays the return rate of courier parcels so you can monitor delivery success.

### 2. 🛍️ Orders & POS Terminal
* **What it does:** Where you punch in sales, print invoices, and track shipments.
* **Creating an Order:** Click **"+ New Order"**, choose products, select payment method (Cash, bKash, COD), and enter the customer’s phone/address.
* **Courier Dispatch:** Assign couriers like **Pathao, Steadfast, or RedX** and paste the tracking code.
* **Printing Invoices:** Click the invoice icon on any order to print thermal slips or standard A4/A5 receipts with barcodes.

### 3. 📦 Inventory & Multi-Variant Catalog
* **What it does:** Manages all your products, sizes, fits, and stock levels.
* **Adding Products:** Click **"+ Add Product"**, enter product name (e.g., *Egyptian Cotton Panjabi*), choose category, set buying cost and retail selling price.
* **Size & Color Variants:** Add individual stock quantities per size (S, M, L, XL).
* **Low Stock Alerts:** Any item running out of stock gets flagged automatically in red so you know when to reorder.

### 4. 👥 Customer CRM & Return Loss Prevention
* **What it does:** Stores your complete customer list, total purchase history, and loyalty tiers (*Champions, VIP, Regular, At Risk*).
* **Return Risk Warning:** If a customer frequently returns courier packages, the system displays a **"High Return Risk"** badge next to their name, protecting you from losing delivery fees.

### 5. 💰 Payments & Cash Flow Ledger
* **What it does:** Keeps an automatic record of all money moving in and out of the business.
* **Customer Receipts:** Logs payments from Cash, bKash Merchant, Nagad, Rocket, and Bank.
* **Courier COD Settlements:** Reconcile bulk cash received from delivery partners (Pathao, Steadfast) with 1 click.
* **Vendor & Expense Outflows:** Record supplier fabric costs, shop rent, or ad spend so your net profit calculation is always accurate.

---

## ☁️ Step 4: Connecting to Firebase (Multi-Device & Online Sync)

By default, PROBAHO works **100% offline** on your computer. If you have multiple showroom computers or want to access data anywhere, you can connect it to your free **Google Firebase** account.

### Quick 4-Step Setup:
1. Go to the free [Firebase Console](https://console.firebase.google.com/) and click **"Add Project"**.
2. Inside your project, create a **Firestore Database** (choose *Start in test mode*).
3. Go to **Project Settings** (gear icon) -> Scroll down to **"Your apps"** -> Click the **Web (</>) icon** -> Register app.
4. Copy the code snippet that looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "my-brand.firebaseapp.com",
     projectId: "my-brand",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
5. In PROBAHO CRM, go to **Settings & Backup** -> **Cloud Sync**.
6. Enter a **Workspace Code** (e.g., `MY-SHOP-101`) and paste the snippet into the box.
7. Click **"Test & Save Cloud Sync"**.

✅ **Done!** Any other computer using the same Workspace Code and config will now automatically stay in sync. If the internet goes down, PROBAHO keeps working offline without skipping a beat!

---

## 🔒 Step 5: Data Safety & Backups

* **1-Click Backup:** Under **Settings & Backup**, click **"Export Database Backup"** to save a snapshot file to your computer or USB drive.
* **Data Privacy:** Your customer list and sales numbers never get shared with third parties—everything is stored strictly on your own hardware and private Firebase account.
