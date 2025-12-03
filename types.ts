
export interface FirmDetails {
  name: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  gstin: string;
  stateCode: string; // 21 for Odisha
  contact: string;
  bankName?: string;
  accountNo?: string;
  ifsc?: string;
}

export interface UserCredential {
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  gstin: string;
  billingAddress: string;
  shippingAddress: string;
  state: string;
  stateCode: string;
  phone: string;
  email?: string;
}

export interface Supplier {
  id: string;
  name: string;
  gstin: string;
  address: string;
  state: string;
  phone: string;
  email?: string;
}

export interface Product {
  id: string;
  name: string;
  hsnCode: string;
  unit: string;
  taxRate: number; // 5, 12, 18, 28
  stock: number;
  // New Price Structure
  purchasePrice: number;
  salePrice1: number;
  salePrice2: number;
  salePrice3: number;
  price?: number; // Legacy fallback
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number; // Percentage
  taxableValue: number;
  taxRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerGstin: string;
  billingAddress: string;
  shippingAddress: string;
  placeOfSupply: string;
  items: InvoiceItem[];
  subTotal: number;
  freightCharges: number;
  loadingCharges: number;
  roundOff: number;
  grandTotal: number;
  totalInWords: string;
  status: 'Draft' | 'Generated' | 'Paid';
  isInterState: boolean;
  stockAdjusted?: boolean;
}

export interface PurchaseInvoice {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNo: string; // Supplier's Invoice No
  date: string;
  items: InvoiceItem[];
  totalAmount: number;
  stockAdjusted?: boolean;
}

export interface EWayBill {
  id: string;
  invoiceId?: string;
  transactionType: 'Supply' | 'Export' | 'Job Work' | 'Own Use';
  documentType: 'Invoice' | 'Bill' | 'Challan';
  documentNo: string;
  documentDate: string;
  fromGstin: string;
  toGstin: string;
  transporterId: string;
  transporterName: string;
  mode: 'Road' | 'Rail' | 'Air' | 'Ship';
  vehicleNo: string;
  approxDistance: number;
  totalValue: number;
  status: 'Active' | 'Cancelled';
}

// Augment window for jsPDF
declare global {
  interface Window {
    jspdf: any;
  }
}