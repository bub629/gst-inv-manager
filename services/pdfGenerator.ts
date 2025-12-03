

import { Invoice, FirmDetails, EWayBill, PurchaseInvoice, LedgerEntry } from '../types';
import { storage } from './storage'; // Import storage to get dynamic data

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount).replace('₹', 'Rs. '); // Replace symbol for better PDF compatibility
};

const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const generateInvoicePDF = (invoice: Invoice) => {
  if (!window.jspdf) {
    alert("PDF library not loaded yet. Please try again.");
    return;
  }

  // CRITICAL FIX: Fetch latest details from storage
  const firmDetails = storage.getFirmDetailsOrDefaults();

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Colors
  const primaryColor = [22, 163, 74]; // Green-600
  const textColor = [30, 41, 59]; // Slate-800

  // Helper to center text
  const centerText = (text: string, y: number, size: number = 10, font: string = 'helvetica', style: string = 'normal') => {
    doc.setFontSize(size);
    doc.setFont(font, style);
    const textWidth = doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
  };

  // HEADER
  doc.setTextColor(...primaryColor);
  centerText("TAX INVOICE", 15, 16, 'helvetica', 'bold');
  
  doc.setTextColor(...textColor);
  centerText(firmDetails.name, 25, 14, 'helvetica', 'bold');
  centerText(firmDetails.address, 31, 10);
  centerText(`${firmDetails.city}, ${firmDetails.state} - ${firmDetails.pincode}`, 36, 10);
  centerText(`GSTIN: ${firmDetails.gstin} | Contact: ${firmDetails.contact}`, 41, 10);

  // Line
  doc.setDrawColor(200, 200, 200);
  doc.line(10, 45, pageWidth - 10, 45);

  // INVOICE DETAILS & BILLING
  doc.setFontSize(10);
  
  // Left Side (Bill To)
  doc.setFont('helvetica', 'bold');
  doc.text("Bill To:", 14, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerName, 14, 58);
  doc.text(invoice.billingAddress.substring(0, 35) + "...", 14, 64);
  doc.text(`GSTIN: ${invoice.customerGstin}`, 14, 70);
  doc.text(`State: ${invoice.placeOfSupply}`, 14, 76);

  // Right Side (Invoice Info)
  const rightColX = pageWidth - 70;
  doc.setFont('helvetica', 'bold');
  doc.text("Invoice Details:", rightColX, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${invoice.invoiceNo}`, rightColX, 58);
  doc.text(`Date: ${invoice.date}`, rightColX, 64);
  doc.text(`Place of Supply: ${invoice.placeOfSupply}`, rightColX, 70);

  // TABLE
  const tableColumn = ["#", "Item", "HSN", "Qty", "Rate", "Disc %", "Taxable", "Tax Amt", "Total"];
  const tableRows = [];

  invoice.items.forEach((item, index) => {
    const taxAmt = item.cgstAmount + item.sgstAmount + item.igstAmount;
    const rowData = [
      index + 1,
      item.productName,
      item.hsnCode,
      `${item.quantity} ${item.unit}`,
      item.rate.toFixed(2),
      item.discount > 0 ? `${item.discount}%` : '-',
      item.taxableValue.toFixed(2),
      taxAmt.toFixed(2),
      item.totalAmount.toFixed(2)
    ];
    tableRows.push(rowData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 85,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 'auto' }, // Item name
      8: { halign: 'right' }
    }
  });

  let finalY = (doc as any).lastAutoTable.finalY + 10;

  // SUMMARY - Fixed Layout Strategy
  const valueEndX = pageWidth - 14;
  const labelEndX = pageWidth - 55;

  const addSummaryRow = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    
    // Draw Value (Right Aligned to Margin)
    doc.text(value, valueEndX, finalY, { align: 'right' });
    
    // Draw Label (Right Aligned to Fixed Column)
    doc.text(label, labelEndX, finalY, { align: 'right' });
    
    finalY += 6;
  };

  addSummaryRow("Sub Total:", formatCurrency(invoice.subTotal));
  
  if (invoice.freightCharges > 0) {
      const freightTaxText = invoice.freightTaxRate && invoice.freightTaxRate > 0 
        ? ` (Tax @ ${invoice.freightTaxRate}%)` 
        : '';
      addSummaryRow(`Freight Charges${freightTaxText}:`, formatCurrency(invoice.freightCharges));
  }
  
  if (invoice.loadingCharges > 0) addSummaryRow("Loading Charges:", formatCurrency(invoice.loadingCharges));
  
  // Tax Breakup (Include Freight Tax)
  const freightTaxAmt = invoice.freightCharges * ((invoice.freightTaxRate || 0) / 100);

  if (invoice.isInterState) {
    const igstTotal = invoice.items.reduce((acc, item) => acc + item.igstAmount, 0) + freightTaxAmt;
    addSummaryRow("IGST Total:", formatCurrency(igstTotal));
  } else {
    const cgstTotal = invoice.items.reduce((acc, item) => acc + item.cgstAmount, 0) + (freightTaxAmt / 2);
    const sgstTotal = invoice.items.reduce((acc, item) => acc + item.sgstAmount, 0) + (freightTaxAmt / 2);
    addSummaryRow("CGST Total:", formatCurrency(cgstTotal));
    addSummaryRow("SGST Total:", formatCurrency(sgstTotal));
  }

  addSummaryRow("Round Off:", formatCurrency(invoice.roundOff));
  
  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth - 80, finalY - 4, pageWidth - 10, finalY - 4);
  
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  
  // GRAND TOTAL - No 'Rs' prefix, just number
  addSummaryRow("Grand Total:", formatNumber(invoice.grandTotal), true);
  
  doc.setTextColor(...textColor);

  // Amount in Words
  doc.setFontSize(10);
  doc.text("Amount in Words:", 14, finalY + 5);
  doc.setFont('helvetica', 'italic');
  doc.text(invoice.totalInWords, 14, finalY + 11, { maxWidth: 100 });

  // Bank Details
  const bankY = finalY + 25;
  doc.setFont('helvetica', 'bold');
  doc.text("Bank Details:", 14, bankY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Bank Name: ${firmDetails.bankName || '-'}`, 14, bankY + 5);
  doc.text(`A/C No: ${firmDetails.accountNo || '-'}`, 14, bankY + 10);
  doc.text(`IFSC: ${firmDetails.ifsc || '-'}`, 14, bankY + 15);

  // Signature
  doc.text(`For ${firmDetails.name}`, pageWidth - 14, bankY, { align: 'right' });
  doc.text("Authorized Signatory", pageWidth - 14, bankY + 25, { align: 'right' });

  doc.save(`Invoice_${invoice.invoiceNo}.pdf`);
};

export const generateEWayBillPDF = (bill: EWayBill, passedFirmDetails?: FirmDetails) => {
     if (!window.jspdf) return;
    
    // Fetch latest details if not passed
    const firmDetails = passedFirmDetails || storage.getFirmDetailsOrDefaults();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("E-WAY BILL", 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Part A`, 14, 25);
    
    const startY = 30;
    const lineHeight = 7;
    let currentY = startY;

    const addLine = (label: string, value: string) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 14, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 60, currentY);
        currentY += lineHeight;
    }

    addLine("E-Way Bill No:", "Not Generated (Mock)");
    addLine("Generated By:", firmDetails.gstin);
    addLine("Valid From:", new Date().toLocaleDateString());
    addLine("Valid Until:", new Date(Date.now() + 86400000).toLocaleDateString());
    
    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text("1. Supply Details", 14, currentY);
    currentY += lineHeight;
    addLine("Transaction Type:", bill.transactionType);
    addLine("Document Type:", bill.documentType);
    addLine("Document No:", bill.documentNo);
    addLine("Document Date:", bill.documentDate);
    
    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text("2. From (Supplier)", 14, currentY);
    doc.text("3. To (Recipient)", 110, currentY);
    currentY += lineHeight;
    
    doc.setFontSize(9);
    doc.text(`GSTIN: ${bill.fromGstin}`, 14, currentY);
    doc.text(`GSTIN: ${bill.toGstin}`, 110, currentY);
    currentY += lineHeight;
    doc.text(`Address: ${firmDetails.address}`, 14, currentY);
    currentY += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Part B - Transporter Details", 14, currentY);
    currentY += lineHeight;
    addLine("Mode:", bill.mode);
    addLine("Transporter Name:", bill.transporterName);
    addLine("Transporter ID:", bill.transporterId);
    addLine("Vehicle No:", bill.vehicleNo);
    addLine("Distance:", `${bill.approxDistance} km`);

    doc.save(`EWayBill_${bill.documentNo}.pdf`);
}

export const generateDailyRegisterPDF = (date: string, invoices: Invoice[], purchases: PurchaseInvoice[]) => {
    if (!window.jspdf) return;
    
    const firmDetails = storage.getFirmDetailsOrDefaults();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`DAILY REGISTER - ${date}`, pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(firmDetails.name, pageWidth / 2, 22, { align: 'center' });

    let finalY = 30;

    // --- SALES SECTION ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74); // Green
    doc.text("SALES REGISTER", 14, finalY);
    finalY += 5;

    const salesRows = invoices.map((inv, index) => [
        index + 1,
        inv.invoiceNo,
        inv.customerName,
        inv.customerGstin || 'Unregistered',
        formatCurrency(inv.grandTotal)
    ]);

    doc.autoTable({
        head: [['#', 'Inv No', 'Customer', 'GSTIN', 'Amount']],
        body: salesRows,
        startY: finalY,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] },
    });

    finalY = (doc as any).lastAutoTable.finalY + 5;
    const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Sales Value: ${formatCurrency(totalSales)}`, pageWidth - 14, finalY, { align: 'right' });
    
    finalY += 15;

    // --- PURCHASE SECTION ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // Blue
    doc.text("PURCHASE REGISTER", 14, finalY);
    finalY += 5;

    const purchaseRows = purchases.map((pur, index) => [
        index + 1,
        pur.invoiceNo,
        pur.supplierName,
        formatCurrency(pur.totalAmount)
    ]);

    doc.autoTable({
        head: [['#', 'Ref No', 'Supplier', 'Amount']],
        body: purchaseRows,
        startY: finalY,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
    });

    finalY = (doc as any).lastAutoTable.finalY + 5;
    const totalPurchase = purchases.reduce((sum, pur) => sum + pur.totalAmount, 0);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Purchase Value: ${formatCurrency(totalPurchase)}`, pageWidth - 14, finalY, { align: 'right' });

    doc.save(`Daily_Register_${date}.pdf`);
}

export const generateLedgerPDF = (partyName: string, partyType: string, entries: LedgerEntry[]) => {
    if (!window.jspdf) return;
    const firmDetails = storage.getFirmDetailsOrDefaults();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Ledger Statement: ${partyName}`, 14, 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(firmDetails.name, 14, 22);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 14, 15, { align: 'right' });

    const rows = entries.map(e => [
        e.date,
        e.refNo,
        e.type,
        e.debit > 0 ? formatNumber(e.debit) : '-',
        e.credit > 0 ? formatNumber(e.credit) : '-',
        formatNumber(Math.abs(e.balance)) + (e.balance < 0 ? ' (Cr)' : ' (Dr)')
    ]);

    doc.autoTable({
        head: [['Date', 'Ref No', 'Type', 'Debit', 'Credit', 'Balance']],
        body: rows,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [60, 60, 60] },
        columnStyles: {
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right', fontStyle: 'bold' }
        }
    });

    // Final Balance Logic
    const finalBalance = entries.length > 0 ? entries[entries.length - 1].balance : 0;
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFont('helvetica', 'bold');
    const balanceText = `Closing Balance: ${formatCurrency(Math.abs(finalBalance))} ${finalBalance < 0 ? '(Cr)' : '(Dr)'}`;
    doc.text(balanceText, pageWidth - 14, finalY, { align: 'right' });

    doc.save(`Ledger_${partyName}.pdf`);
};
