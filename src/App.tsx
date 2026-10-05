import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandBar } from './components/layout/CommandBar';
import { ProfileSwitcherModal } from './components/layout/ProfileSwitcherModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { OrdersView } from './components/orders/OrdersView';
import { NewOrderModal } from './components/orders/NewOrderModal';
import { ExchangeModal } from './components/orders/ExchangeModal';
import { ChallanView } from './components/orders/ChallanView';
import { ChallanInvoicesView } from './components/orders/ChallanInvoicesView';
import { InventoryView } from './components/inventory/InventoryView';
import { StockAdjustModal } from './components/inventory/StockAdjustModal';
import { CustomersView } from './components/customers/CustomersView';
import { CustomerProfileModal } from './components/customers/CustomerProfileModal';
import { PaymentsView } from './components/finance/PaymentsView';
import { VendorsView } from './components/vendors/VendorsView';
import { PartnersView } from './components/partners/PartnersView';
import { SettingsView, type ThemeMode, type SettingsSubTab } from './components/settings/SettingsView';
import { OnboardingWizardModal } from './components/onboarding/OnboardingWizardModal';
import { AuthModal } from './components/auth/AuthModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { AboutModal } from './components/layout/AboutModal';
import { UpdateNotificationToast } from './components/layout/UpdateNotificationToast';

import { dbService } from './database/db';
import type { Order, Product, Customer, PaymentLedgerEntry, Vendor, DeliveryStatus, OrderItem, UserAccount } from './types/crm';

export function App() {
  const [activeTab, setActiveTab] = useState<any>('dashboard');
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => !dbService.isOnboarded());
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => dbService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if keep-me-logged-in session is active
    const keepLoggedIn = localStorage.getItem('PROBAHO_KEEP_LOGGED_IN') === 'true';
    const savedUserId = localStorage.getItem('PROBAHO_AUTH_SESSION');
    if (keepLoggedIn && savedUserId) {
      const accounts = dbService.getUserAccounts();
      const exists = accounts.find(a => a.id === savedUserId && a.is_active !== false);
      if (exists) return true;
    }
    return false;
  });
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.has('code') || params.has('company') || params.has('user');
    }
    return false;
  });
  const [initialSettingsSubTab, setInitialSettingsSubTab] = useState<SettingsSubTab>('appearance');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('vastra_theme') as ThemeMode) || 'light';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('vastra_sidebar_collapsed') === 'true';
  });
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('vastra_sidebar_width');
    const num = saved ? parseInt(saved, 10) : 256;
    return isNaN(num) || num < 165 ? 256 : Math.min(Math.max(num, 165), 420);
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vastra_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('vastra_sidebar_collapsed', String(isSidebarCollapsed));
    localStorage.setItem('vastra_sidebar_width', String(sidebarWidth));
  }, [isSidebarCollapsed, sidebarWidth]);

  const handleToggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'gray';
      if (prev === 'gray') return 'notion-light';
      if (prev === 'notion-light') return 'notion-dark';
      if (prev === 'notion-dark') return 'notion-gray';
      if (prev === 'notion-gray') return 'light';
      return 'light';
    });
  };

  const handleSwitchProfile = (userId: string) => {
    dbService.setCurrentUser(userId);
    const updated = dbService.getCurrentUser();
    setCurrentUser(updated);
    setIsProfileSwitcherOpen(false);

    if (updated.role === 'employee') {
      const allowed = updated.allowed_tabs || [];
      if (allowed.length > 0 && !allowed.includes(activeTab)) {
        setActiveTab(allowed[0]);
      }
    }
  };

  // Enforce access boundaries whenever activeTab or currentUser updates
  useEffect(() => {
    if (currentUser && currentUser.role === 'employee') {
      const allowed = currentUser.allowed_tabs || [];
      if (allowed.length > 0 && !allowed.includes(activeTab)) {
        setActiveTab(allowed[0]);
      }
    }
  }, [activeTab, currentUser]);

  // State slices
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [ledger, setLedger] = useState<PaymentLedgerEntry[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Modal controls
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [exchangeOrder, setExchangeOrder] = useState<Order | null>(null);
  const [challanOrder, setChallanOrder] = useState<Order | null>(null);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | undefined>(undefined);
  const [isStockAdjustOpen, setIsStockAdjustOpen] = useState(false);
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState<Customer | null>(null);

  // Load state from dbService on mount
  const refreshData = () => {
    setOrders(dbService.getOrders());
    setProducts(dbService.getProducts());
    setCustomers(dbService.getCustomers());
    setLedger(dbService.getPaymentsLedger());
    setVendors(dbService.getVendors());
    setCurrentUser(dbService.getCurrentUser());
  };

  useEffect(() => {
    refreshData();
    const unsubDb = dbService.onDataChange(() => {
      refreshData();
    });

    // Keyboard shortcut Ctrl+K / Cmd+K & Ctrl+B / Cmd+B for sidebar
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unsubDb();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenCloudSettings = () => {
    setInitialSettingsSubTab('cloud');
    setActiveTab('settings');
  };

  const handleOpenBrandSettings = () => {
    setInitialSettingsSubTab('company');
    setActiveTab('settings');
  };

  // Handlers with staff attribution
  const handleUpdateOrderStatus = (orderId: string, status: DeliveryStatus) => {
    dbService.updateOrderStatus(orderId, status, currentUser?.name || 'Staff');
    refreshData();
  };

  const handleUpdateOrderTracking = (orderId: string, trackingId: string) => {
    dbService.updateOrderTracking(orderId, trackingId, currentUser?.name || 'Staff');
    refreshData();
  };

  const handleCreateOrder = (order: Order) => {
    const creator = currentUser?.name || 'Staff';
    order.created_by = order.created_by || creator;
    order.last_modified_by = creator;
    dbService.addOrder(order, creator);
    refreshData();
  };

  const handleCheckBlacklist = (phone: string) => {
    return dbService.checkRTOBlacklist(phone);
  };

  const handleConfirmExchange = (originalOrderId: string, newItem: OrderItem) => {
    const origOrder = orders.find(o => o.id === originalOrderId);
    if (!origOrder) return;

    const deliveryCharge = origOrder.delivery_charge_bdt ?? 0;
    // Create zero cost exchange invoice
    const exchangeInvoice: Order = {
      ...origOrder,
      id: `ord-exc-${Date.now()}`,
      invoice_no: `EXC-${origOrder.invoice_no.replace('INV-', '')}`,
      order_date: new Date().toISOString(),
      delivery_status: 'Order Placed',
      items: [newItem],
      subtotal_bdt: 0,
      delivery_charge_bdt: deliveryCharge,
      discount_bdt: 0,
      total_amount_bdt: deliveryCharge,
      advance_paid_bdt: 0,
      payment_status: 'COD Pending',
      notes: `1-Click Size Exchange replacement against invoice ${origOrder.invoice_no}.`
    };

    dbService.addOrder(exchangeInvoice, currentUser?.name || 'Staff');
    refreshData();
  };

  const handleDeleteOrder = (orderId: string) => {
    dbService.deleteOrder(orderId, currentUser?.name || 'Staff');
    refreshData();
  };

  const handleAdjustStock = (productId: string, delta: number, reason: string, performedBy: string) => {
    dbService.adjustProductStock(productId, delta, reason, performedBy);
    refreshData();
  };

  const handleSaveCustomerNotes = (customer: Customer, newNotes: string) => {
    const updated = { ...customer, notes: newNotes };
    dbService.updateCustomer(updated);
    refreshData();
  };

  const handleAddPaymentEntry = (entry: Omit<PaymentLedgerEntry, 'id'>) => {
    dbService.addPaymentLedgerEntry({
      ...entry,
      id: `pay-man-${Date.now()}`,
      transaction_date: entry.transaction_date || entry.date || new Date().toISOString(),
      type: entry.type || 'Expense',
      category: entry.category || 'General'
    } as PaymentLedgerEntry);
    refreshData();
  };

  const handleReconcileBatch = (courierName: string, settlementRef: string) => {
    dbService.reconcileCourierCodBatch(courierName, settlementRef);
    refreshData();
  };

  const handleLogVendorPayment = (vendorId: string, amount: number, method: string, notes: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      const currentBalance = vendor.outstanding_balance_bdt || vendor.balance_due_bdt || 0;
      dbService.updateVendor({
        ...vendor,
        outstanding_balance_bdt: Math.max(0, currentBalance - amount),
        balance_due_bdt: Math.max(0, currentBalance - amount)
      });
      dbService.addPaymentLedgerEntry({
        id: `pay-vend-${Date.now()}`,
        transaction_date: new Date().toISOString(),
        date: new Date().toISOString(),
        type: 'Vendor Payout',
        category: 'Vendor Settlement',
        description: `Vendor Payout to ${vendor.name || vendor.vendor_name}: ${notes}`,
        amount_bdt: amount,
        payment_method: method as any,
        method,
        reference_id: `VEND-PAY-${Date.now().toString().slice(-4)}`,
        direction: 'outflow',
        party_name: vendor.name || vendor.vendor_name
      });
      refreshData();
    }
  };

  const handleCommandNavigate = (route: string, itemId?: string) => {
    setActiveTab(route);
    if (route === 'orders' && itemId) {
      const ord = orders.find(o => o.id === itemId);
      if (ord) setChallanOrder(ord);
    } else if (route === 'customers' && itemId) {
      const cust = customers.find(c => c.id === itemId || c.phone === itemId);
      if (cust) setSelectedCustomerProfile(cust);
    } else if (route === 'inventory' && itemId) {
      const prod = products.find(p => p.id === itemId || p.sku === itemId);
      if (prod) {
        setStockAdjustProduct(prod);
        setIsStockAdjustOpen(true);
      }
    }
  };

  const handleLoginSuccess = (user: UserAccount, keepLoggedIn: boolean) => {
    dbService.setCurrentUser(user.id);
    setCurrentUser(user);
    localStorage.setItem('PROBAHO_AUTH_SESSION', user.id);
    localStorage.setItem('PROBAHO_KEEP_LOGGED_IN', String(keepLoggedIn));
    setIsAuthenticated(true);
    refreshData();
  };

  const handleLockSession = () => {
    localStorage.removeItem('PROBAHO_AUTH_SESSION');
    localStorage.setItem('PROBAHO_KEEP_LOGGED_IN', 'false');
    setIsAuthenticated(false);
    setIsProfileSwitcherOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', overflow: 'hidden' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        width={sidebarWidth}
        onWidthChange={w => {
          setSidebarWidth(w);
          if (isSidebarCollapsed) setIsSidebarCollapsed(false);
        }}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenBrandSettings={handleOpenBrandSettings}
      />

      {/* Main Container */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Header
          onOpenCommandBar={() => setIsCommandOpen(true)}
          onOpenNewOrder={() => setIsNewOrderOpen(true)}
          onOpenStockAdjust={() => {
            setStockAdjustProduct(undefined);
            setIsStockAdjustOpen(true);
          }}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          totalCashBdt={ledger.reduce((acc, p) => acc + (p.direction === 'outflow' ? -p.amount_bdt : p.amount_bdt), 0)}
          codDueBdt={orders.filter(o => o.payment_status === 'COD Pending' && o.delivery_status === 'Delivered').reduce((sum, o) => sum + (o.total_amount_bdt - o.advance_paid_bdt), 0)}
          currentUser={currentUser}
          onOpenProfileSwitcher={() => setIsProfileSwitcherOpen(true)}
          onOpenCloudSettings={handleOpenCloudSettings}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          onLockSession={handleLockSession}
        />

        {/* Dynamic View Route */}
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          {activeTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              products={products}
              customers={customers}
              ledger={ledger}
              onNavigateToTab={setActiveTab}
              onOpenNewOrder={() => setIsNewOrderOpen(true)}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              products={products}
              customers={customers}
              onUpdateStatus={handleUpdateOrderStatus}
              onOpenNewOrder={() => setIsNewOrderOpen(true)}
              onOpenExchange={o => setExchangeOrder(o)}
              onViewChallan={o => setChallanOrder(o)}
              onUpdateOrder={updatedOrd => {
                dbService.updateOrderDetails(updatedOrd);
                refreshData();
              }}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeTab === 'challan' && (
            <ChallanInvoicesView
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
              onViewChallan={o => setChallanOrder(o)}
              onUpdateTracking={handleUpdateOrderTracking}
              onRefreshOrders={refreshData}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              onOpenStockAdjust={p => {
                setStockAdjustProduct(p);
                setIsStockAdjustOpen(true);
              }}
              onOpenNewProduct={() => {}}
              onAddProduct={prod => {
                dbService.saveProduct(prod);
                refreshData();
              }}
              onUpdateProduct={prod => {
                dbService.saveProduct(prod);
                refreshData();
              }}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              orders={orders}
              onSelectCustomer={c => setSelectedCustomerProfile(c)}
              onAddCustomer={cust => {
                dbService.saveCustomer(cust);
                refreshData();
              }}
            />
          )}

          {activeTab === 'finance' && (
            <PaymentsView
              ledger={ledger}
              orders={orders}
              vendors={vendors}
              onAddPaymentEntry={handleAddPaymentEntry}
              onReconcileBatch={handleReconcileBatch}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorsView
              vendors={vendors}
              onOpenNewVendor={() => {}}
              onLogVendorPayment={handleLogVendorPayment}
              onAddVendor={vendor => {
                dbService.saveVendor(vendor);
                refreshData();
              }}
              onUpdateVendor={vendor => {
                dbService.updateVendor(vendor);
                refreshData();
              }}
            />
          )}

          {activeTab === 'partners' && (
            <PartnersView currentUser={currentUser} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currentTheme={theme}
              onSelectTheme={t => setTheme(t)}
              onRefreshAll={refreshData}
              currentUser={currentUser}
              onSwitchProfile={handleSwitchProfile}
              initialSubTab={initialSettingsSubTab}
            />
          )}
        </main>
      </div>

      {/* Modals & Command Bar */}
      <CommandBar
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        orders={orders}
        products={products}
        customers={customers}
        onNavigate={handleCommandNavigate}
      />

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        products={products}
        customers={customers}
        onSaveOrder={handleCreateOrder}
        onCheckBlacklist={handleCheckBlacklist}
      />

      <ExchangeModal
        isOpen={!!exchangeOrder}
        onClose={() => setExchangeOrder(null)}
        order={exchangeOrder}
        products={products}
        onConfirmExchange={handleConfirmExchange}
      />

      <ChallanView
        isOpen={!!challanOrder}
        onClose={() => setChallanOrder(null)}
        order={challanOrder}
        onOrderUpdated={updated => {
          setChallanOrder(updated);
          refreshData();
        }}
      />

      <StockAdjustModal
        isOpen={isStockAdjustOpen}
        onClose={() => {
          setIsStockAdjustOpen(false);
          setStockAdjustProduct(undefined);
        }}
        product={stockAdjustProduct}
        products={products}
        onAdjustStock={handleAdjustStock}
      />

      <CustomerProfileModal
        isOpen={!!selectedCustomerProfile}
        onClose={() => setSelectedCustomerProfile(null)}
        customer={selectedCustomerProfile}
        orders={orders}
        onSaveCustomerNotes={handleSaveCustomerNotes}
      />

      {isProfileSwitcherOpen && (
        <ProfileSwitcherModal
          currentUser={currentUser}
          onClose={() => setIsProfileSwitcherOpen(false)}
          onSelectUser={handleSwitchProfile}
          onOpenStaffSettings={() => {
            setInitialSettingsSubTab('staff');
            setActiveTab('settings');
          }}
          onOpenAuthModal={() => setIsAuthOpen(true)}
          onLockSession={handleLockSession}
        />
      )}

      {/* Universal Sign In / Company Workspace Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          refreshData();
        }}
      />

      {/* First-Time Business Profile Setup & Onboarding Wizard */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onComplete={() => {
          setIsOnboardingOpen(false);
          refreshData();
        }}
      />

      {/* Software Creator & About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenSettingsUpdates={() => {
          setIsAboutOpen(false);
          setInitialSettingsSubTab('about');
          setActiveTab('settings');
        }}
      />

      {/* In-App Automated Update Alert Toast */}
      <UpdateNotificationToast
        onOpenSettingsUpdates={() => {
          setInitialSettingsSubTab('about');
          setActiveTab('settings');
        }}
      />
    </div>
  );
}
export default App;
