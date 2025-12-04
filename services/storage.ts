

import { Invoice, Customer, Product, EWayBill, Supplier, PurchaseInvoice, FirmDetails, UserCredential, Voucher, LedgerEntry, Quotation } from '../types';
import { FIRM_DETAILS as DEFAULT_FIRM_DETAILS } from '../constants';

const KEYS = {
  INVOICES: 'sahu_invoices',
  QUOTATIONS: 'sahu_quotations',
  CUSTOMERS: 'sahu_customers',
  PRODUCTS: 'sahu_products',
  SUPPLIERS: 'sahu_suppliers',
  PURCHASES: 'sahu_purchases',
  VOUCHERS: 'sahu_vouchers',
  FIRM_DETAILS: 'sahu_firm_details',
  AUTH_SESSION: 'sahu_auth_session',
  USERS: 'sahu_users'
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
    const customers = get(KEYS.CUSTOMERS).filter((c: Customer) => String(c.id) !== String(id));
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
    const suppliers = get(KEYS.SUPPLIERS).filter((s: Supplier) => String(s.id) !== String(id));
    set(KEYS.SUPPLIERS, suppliers);
  },

  // --- PRODUCTS & INVENTORY ---
  getProducts: (): Product[] => get(KEYS.PRODUCTS),
  saveProduct: (product: Product) => {
    const products = get(KEYS.PRODUCTS);
    const index = products.findIndex((p: Product) => p.id === product.id);
    if (index >= 0) {
        const existingStock = products[index].stock;
        products[index] = { ...product, stock: product.stock !== undefined ? product.stock : existingStock };
    } else {
        products.push(product);
    }
    set(KEYS.PRODUCTS, products);
  },
  deleteProduct: (id: string) => {
    const products = get(KEYS.PRODUCTS).filter((p: Product) => String(p.id) !== String(id));
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
    const invoiceToDelete = invoices.find((i: Invoice) => String(i.id) === String(id));
    
    if (invoiceToDelete && invoiceToDelete.stockAdjusted) {
        invoiceToDelete.items.forEach((item: any) => {
            if (item.productId) {
                storage.updateProductStock(item.productId, Number(item.quantity));
            }
        });
    }

    const newInvoices = invoices.filter((i: Invoice) => String(i.id) !== String(id));
    set(KEYS.INVOICES, newInvoices);
  },

  // --- QUOTATIONS ---
  getNextQuotationNumber: () => {
    const quotations = get(KEYS.QUOTATIONS);
    return `QTN-${new Date().getFullYear()}-${(quotations.length + 1).toString().padStart(4, '0')}`;
  },
  getQuotations: (): Quotation[] => get(KEYS.QUOTATIONS).sort((a: Quotation, b: Quotation) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  saveQuotation: (quotation: Quotation) => {
    const quotations = get(KEYS.QUOTATIONS);
    const index = quotations.findIndex((q: Quotation) => q.id === quotation.id);
    if (index >= 0) quotations[index] = quotation;
    else quotations.push(quotation);
    set(KEYS.QUOTATIONS, quotations);
  },
  deleteQuotation: (id: string) => {
    const quotations = get(KEYS.QUOTATIONS).filter((q: Quotation) => String(q.id) !== String(id));
    set(KEYS.QUOTATIONS, quotations);
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
      const purchaseToDelete = purchases.find((p: PurchaseInvoice) => String(p.id) === String(id));

      if(purchaseToDelete && purchaseToDelete.stockAdjusted) {
          purchaseToDelete.items.forEach((item: any) => {
              if(item.productId) {
                  storage.updateProductStock(item.productId, -Number(item.quantity));
              }
          });
      }

      const newPurchases = purchases.filter((p: PurchaseInvoice) => String(p.id) !== String(id));
      set(KEYS.PURCHASES, newPurchases);
  },

  // --- VOUCHERS (ACCOUNTS) ---
  getVouchers: (): Voucher[] => get(KEYS.VOUCHERS).sort((a: Voucher, b: Voucher) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  saveVoucher: (voucher: Voucher) => {
      const vouchers = get(KEYS.VOUCHERS);
      const index = vouchers.findIndex((v: Voucher) => v.id === voucher.id);
      if(index >= 0) vouchers[index] = voucher;
      else vouchers.push(voucher);
      set(KEYS.VOUCHERS, vouchers);
  },
  deleteVoucher: (id: string) => {
      const vouchers = get(KEYS.VOUCHERS).filter((v: Voucher) => String(v.id) !== String(id));
      set(KEYS.VOUCHERS, vouchers);
  },

  // --- LEDGER LOGIC ---
  getPartyLedger: (partyId: string, partyType: 'Customer' | 'Supplier'): LedgerEntry[] => {
      const entries: LedgerEntry[] = [];
      
      // 1. Get Transactions
      if (partyType === 'Customer') {
          // Debits: Sales Invoices
          const invoices = get(KEYS.INVOICES).filter((i: Invoice) => i.customerId === partyId);
          invoices.forEach((inv: Invoice) => {
              entries.push({
                  date: inv.date,
                  refNo: inv.invoiceNo,
                  type: 'Sales Invoice',
                  description: `Sales to ${inv.customerName}`,
                  debit: inv.grandTotal,
                  credit: 0,
                  balance: 0
              });
          });
      } else {
          // Credits: Purchases (Liability increases)
          const purchases = get(KEYS.PURCHASES).filter((p: PurchaseInvoice) => p.supplierId === partyId);
          purchases.forEach((pur: PurchaseInvoice) => {
              entries.push({
                  date: pur.date,
                  refNo: pur.invoiceNo,
                  type: 'Purchase Bill',
                  description: `Purchase from ${pur.supplierName}`,
                  debit: 0,
                  credit: pur.totalAmount,
                  balance: 0
              });
          });
      }

      // 2. Get Vouchers (Receipts/Payments)
      const vouchers = get(KEYS.VOUCHERS).filter((v: Voucher) => v.partyId === partyId);
      vouchers.forEach((v: Voucher) => {
          if (v.type === 'Receipt') {
              // Customer pays us -> Credit for Customer (Reduces Debt)
              entries.push({
                  date: v.date,
                  refNo: 'RCPT',
                  type: 'Receipt',
                  description: `Payment Received (${v.mode}) ${v.notes || ''}`,
                  debit: 0,
                  credit: v.amount,
                  balance: 0
              });
          } else {
              // We pay Supplier -> Debit for Supplier (Reduces Liability)
              entries.push({
                  date: v.date,
                  refNo: 'PMT',
                  type: 'Payment',
                  description: `Paid to Supplier (${v.mode}) ${v.notes || ''}`,
                  debit: v.amount,
                  credit: 0,
                  balance: 0
              });
          }
      });

      // 3. Sort Chronologically
      entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // 4. Calculate Running Balance
      let runningBalance = 0;
      for (let entry of entries) {
          if (partyType === 'Customer') {
              // Asset: Debit increases (+), Credit decreases (-)
              runningBalance += (entry.debit - entry.credit);
          } else {
              // Liability: Credit increases (+), Debit decreases (-)
              runningBalance += (entry.credit - entry.debit);
          }
          entry.balance = runningBalance;
      }

      return entries;
  },

  // --- BACKUP & RESTORE ---
  backupData: () => {
      const data = {
          invoices: get(KEYS.INVOICES),
          quotations: get(KEYS.QUOTATIONS),
          customers: get(KEYS.CUSTOMERS),
          products: get(KEYS.PRODUCTS),
          suppliers: get(KEYS.SUPPLIERS),
          purchases: get(KEYS.PURCHASES),
          vouchers: get(KEYS.VOUCHERS), 
          users: get(KEYS.USERS),
          firmDetails: localStorage.getItem(KEYS.FIRM_DETAILS) ? JSON.parse(localStorage.getItem(KEYS.FIRM_DETAILS)!) : null
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GST_Manager_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
  },
  restoreData: (file: File) => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
              try {
                  const data = JSON.parse(e.target?.result as string);
                  if(data.invoices) set(KEYS.INVOICES, data.invoices);
                  if(data.quotations) set(KEYS.QUOTATIONS, data.quotations);
                  if(data.customers) set(KEYS.CUSTOMERS, data.customers);
                  if(data.products) set(KEYS.PRODUCTS, data.products);
                  if(data.suppliers) set(KEYS.SUPPLIERS, data.suppliers);
                  if(data.purchases) set(KEYS.PURCHASES, data.purchases);
                  if(data.vouchers) set(KEYS.VOUCHERS, data.vouchers);
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
      return localStorage.getItem(KEYS.AUTH_SESSION) !== null;
  },

  registerUser: (username: string, password: string): boolean => {
      const users = get(KEYS.USERS);
      if (users.find((u: UserCredential) => u.username.toLowerCase() === username.toLowerCase())) {
          return false;
      }
      const newUser: UserCredential = {
          username,
          password,
          role: users.length === 0 ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          termsAccepted: false // Default false
      };
      users.push(newUser);
      set(KEYS.USERS, users);
      localStorage.setItem(KEYS.AUTH_SESSION, username);
      return true;
  },

  login: (u: string, p: string) => {
      const users = get(KEYS.USERS);
      const targetUser = users.find((user: UserCredential) => user.username.toLowerCase() === u.toLowerCase());
      if (!targetUser) return false;
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

  // --- TERMS & CONDITIONS LOGIC ---
  hasAcceptedTerms: (username: string): boolean => {
      const users = get(KEYS.USERS);
      const user = users.find((u: UserCredential) => u.username.toLowerCase() === username.toLowerCase());
      // If user exists and flag is true, return true. Otherwise false.
      return user && user.termsAccepted === true;
  },

  acceptTerms: (username: string) => {
      const users = get(KEYS.USERS);
      const index = users.findIndex((u: UserCredential) => u.username.toLowerCase() === username.toLowerCase());
      if (index >= 0) {
          users[index].termsAccepted = true;
          set(KEYS.USERS, users);
      }
  },

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