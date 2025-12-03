
import { Invoice, Customer, Product, EWayBill, Supplier, PurchaseInvoice, FirmDetails, UserCredential } from '../types';
import { FIRM_DETAILS as DEFAULT_FIRM_DETAILS } from '../constants';

const KEYS = {
  INVOICES: 'sahu_invoices',
  CUSTOMERS: 'sahu_customers',
  PRODUCTS: 'sahu_products',
  SUPPLIERS: 'sahu_suppliers',
  PURCHASES: 'sahu_purchases',
  FIRM_DETAILS: 'sahu_firm_details',
  AUTH_SESSION: 'sahu_auth_session',
  USERS: 'sahu_users' // New key for array of users
};

// Hardcoded Master Credentials
const MASTER_PASSWORD = 'Sahu@2025';

const get = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const set = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const storage = {
  // --- FIRM DETAILS ---
  getFirmDetails: (): FirmDetails | null => {
      const data = localStorage.getItem(KEYS.FIRM_DETAILS);
      return data ? JSON.parse(data) : null;
  },
  getFirmDetailsOrDefaults: (): FirmDetails => {
      const data = localStorage.getItem(KEYS.FIRM_DETAILS);
      return data ? JSON.parse(data) : DEFAULT_FIRM_DETAILS;
  },
  saveFirmDetails: (details: FirmDetails) => {
      localStorage.setItem(KEYS.FIRM_DETAILS, JSON.stringify(details));
  },

  // --- CUSTOMERS ---
  getCustomers: (): Customer[] => get(KEYS.CUSTOMERS),
  saveCustomer: (customer: Customer) => {
    const customers = get(KEYS.CUSTOMERS);
    const index = customers.findIndex((c: Customer) => c.id === customer.id);
    if (index >= 0) customers[index] = customer;
    else customers.push(customer);
    set(KEYS.CUSTOMERS, customers);
  },
  deleteCustomer: (id: string) => {
    const customers = get(KEYS.CUSTOMERS).filter((c: Customer) => c.id !== id);
    set(KEYS.CUSTOMERS, customers);
  },

  // --- SUPPLIERS ---
  getSuppliers: (): Supplier[] => get(KEYS.SUPPLIERS),
  saveSupplier: (supplier: Supplier) => {
    const suppliers = get(KEYS.SUPPLIERS);
    const index = suppliers.findIndex((s: Supplier) => s.id === supplier.id);
    if (index >= 0) suppliers[index] = supplier;
    else suppliers.push(supplier);
    set(KEYS.SUPPLIERS, suppliers);
  },
  deleteSupplier: (id: string) => {
    const suppliers = get(KEYS.SUPPLIERS).filter((s: Supplier) => s.id !== id);
    set(KEYS.SUPPLIERS, suppliers);
  },

  // --- PRODUCTS & INVENTORY ---
  getProducts: (): Product[] => get(KEYS.PRODUCTS),
  saveProduct: (product: Product) => {
    const products = get(KEYS.PRODUCTS);
    const index = products.findIndex((p: Product) => p.id === product.id);
    if (index >= 0) {
        // Preserve stock if editing details, unless explicitly set in form (which usually isn't for edit)
        const existingStock = products[index].stock;
        products[index] = { ...product, stock: product.stock !== undefined ? product.stock : existingStock };
    } else {
        products.push(product); // New product
    }
    set(KEYS.PRODUCTS, products);
  },
  deleteProduct: (id: string) => {
    const products = get(KEYS.PRODUCTS).filter((p: Product) => p.id !== id);
    set(KEYS.PRODUCTS, products);
  },
  updateProductStock: (productId: string, quantityChange: number) => {
      const products = get(KEYS.PRODUCTS);
      const index = products.findIndex((p: Product) => p.id === productId);
      if(index >= 0) {
          const currentStock = Number(products[index].stock || 0);
          products[index].stock = currentStock + Number(quantityChange);
          set(KEYS.PRODUCTS, products);
      }
  },

  // --- INVOICES ---
  getNextInvoiceNumber: () => {
    const invoices = get(KEYS.INVOICES);
    return `INV-${new Date().getFullYear()}-${(invoices.length + 1).toString().padStart(4, '0')}`;
  },
  getInvoices: (): Invoice[] => get(KEYS.INVOICES).sort((a: Invoice, b: Invoice) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  saveInvoice: (invoice: Invoice) => {
    const invoices = get(KEYS.INVOICES);
    const index = invoices.findIndex((i: Invoice) => i.id === invoice.id);
    if (index >= 0) invoices[index] = invoice;
    else invoices.push(invoice);
    set(KEYS.INVOICES, invoices);
  },
  deleteInvoice: (id: string) => {
    const invoices = get(KEYS.INVOICES);
    const invoiceToDelete = invoices.find((i: Invoice) => i.id === id);
    
    // Reverse Stock Deduction if invoice was generated (Inventory was reduced)
    if (invoiceToDelete && invoiceToDelete.stockAdjusted) {
        invoiceToDelete.items.forEach((item: any) => {
            if (item.productId) {
                storage.updateProductStock(item.productId, Number(item.quantity)); // Add back
            }
        });
    }

    const newInvoices = invoices.filter((i: Invoice) => i.id !== id);
    set(KEYS.INVOICES, newInvoices);
  },

  // --- PURCHASES ---
  getPurchases: (): PurchaseInvoice[] => get(KEYS.PURCHASES).sort((a: PurchaseInvoice, b: PurchaseInvoice) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  savePurchase: (purchase: PurchaseInvoice) => {
    const purchases = get(KEYS.PURCHASES);
    const index = purchases.findIndex((p: PurchaseInvoice) => p.id === purchase.id);
    if (index >= 0) purchases[index] = purchase;
    else purchases.push(purchase);
    set(KEYS.PURCHASES, purchases);
  },
  deletePurchase: (id: string) => {
      const purchases = get(KEYS.PURCHASES);
      const purchaseToDelete = purchases.find((p: PurchaseInvoice) => p.id === id);

      // Reverse Stock Addition (Inventory was increased, so we decrease it)
      if(purchaseToDelete && purchaseToDelete.stockAdjusted) {
          purchaseToDelete.items.forEach((item: any) => {
              if(item.productId) {
                  storage.updateProductStock(item.productId, -Number(item.quantity)); // Deduct
              }
          });
      }

      const newPurchases = purchases.filter((p: PurchaseInvoice) => p.id !== id);
      set(KEYS.PURCHASES, newPurchases);
  },

  // --- BACKUP & RESTORE ---
  backupData: () => {
      const data = {
          invoices: get(KEYS.INVOICES),
          customers: get(KEYS.CUSTOMERS),
          products: get(KEYS.PRODUCTS),
          suppliers: get(KEYS.SUPPLIERS),
          purchases: get(KEYS.PURCHASES),
          users: get(KEYS.USERS),
          firmDetails: localStorage.getItem(KEYS.FIRM_DETAILS) ? JSON.parse(localStorage.getItem(KEYS.FIRM_DETAILS)!) : null
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SahuBiofuels_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
  },
  restoreData: (file: File) => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
              try {
                  const data = JSON.parse(e.target?.result as string);
                  if(data.invoices) set(KEYS.INVOICES, data.invoices);
                  if(data.customers) set(KEYS.CUSTOMERS, data.customers);
                  if(data.products) set(KEYS.PRODUCTS, data.products);
                  if(data.suppliers) set(KEYS.SUPPLIERS, data.suppliers);
                  if(data.purchases) set(KEYS.PURCHASES, data.purchases);
                  if(data.users) set(KEYS.USERS, data.users);
                  if(data.firmDetails) localStorage.setItem(KEYS.FIRM_DETAILS, JSON.stringify(data.firmDetails));
                  resolve(true);
              } catch (err) {
                  reject(err);
              }
          };
          reader.readAsText(file);
      });
  },

  // --- AUTHENTICATION (MULTI-USER) ---
  hasUsers: () => {
      const users = get(KEYS.USERS);
      return users.length > 0;
  },

  isAuthenticated: () => {
      // Check if session exists (stores the username now)
      return localStorage.getItem(KEYS.AUTH_SESSION) !== null;
  },

  registerUser: (username: string, password: string): boolean => {
      const users = get(KEYS.USERS);
      
      // Check for duplicate username
      if (users.find((u: UserCredential) => u.username.toLowerCase() === username.toLowerCase())) {
          return false; // User already exists
      }

      const newUser: UserCredential = {
          username,
          password,
          role: users.length === 0 ? 'admin' : 'user', // First user is always admin
          createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      set(KEYS.USERS, users);
      
      // Auto login after register
      localStorage.setItem(KEYS.AUTH_SESSION, username);
      return true;
  },

  login: (u: string, p: string) => {
      const users = get(KEYS.USERS);
      const targetUser = users.find((user: UserCredential) => user.username.toLowerCase() === u.toLowerCase());

      if (!targetUser) return false;

      // Check User Password OR Master Password
      if (targetUser.password === p || p === MASTER_PASSWORD) {
          localStorage.setItem(KEYS.AUTH_SESSION, targetUser.username);
          return true;
      }
      
      return false;
  },

  logout: () => {
      localStorage.removeItem(KEYS.AUTH_SESSION);
  },

  getCurrentUsername: () => {
      return localStorage.getItem(KEYS.AUTH_SESSION) || 'Guest';
  },

  // Only allow updating own password via Settings
  updateCurrentUserPassword: (newPassword: string) => {
      const currentUsername = localStorage.getItem(KEYS.AUTH_SESSION);
      if(!currentUsername) return false;

      const users = get(KEYS.USERS);
      const index = users.findIndex((u: UserCredential) => u.username === currentUsername);
      
      if(index >= 0) {
          users[index].password = newPassword;
          set(KEYS.USERS, users);
          return true;
      }
      return false;
  }
};
