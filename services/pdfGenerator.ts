import { Invoice, FirmDetails, EWayBill, PurchaseInvoice } from '../types';
import { FIRM_DETAILS } from '../constants';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const generateInvoicePDF = (invoice: Invoice) => {
  if (!window.jspdf) {
    alert("PDF library not loaded yet. Please try again.");
    return;
  }

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
  centerText(FIRM_DETAILS.name, 25, 14, 'helvetica', 'bold');
  centerText(FIRM_DETAILS.address, 31, 10);
  centerText(`${FIRM_DETAILS.city}, ${FIRM_DETAILS.state} - ${FIRM_DETAILS.pincode}`, 36, 10);
  centerText(`GSTIN: ${FIRM_DETAILS.gstin} | Contact: ${FIRM_DETAILS.contact}`, 41, 10);

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

  // SUMMARY
  const summaryX = pageWidth - 90;
  const valX = pageWidth - 14;

  const addSummaryRow = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(label, summaryX, finalY);
    doc.text(value, valX, finalY, { align: 'right' });
    finalY += 6;
  };

  addSummaryRow("Sub Total:", formatCurrency(invoice.subTotal));
  if (invoice.freightCharges > 0) addSummaryRow("Freight Charges:", formatCurrency(invoice.freightCharges));
  if (invoice.loadingCharges > 0) addSummaryRow("Loading Charges:", formatCurrency(invoice.loadingCharges));
  
  // Tax Breakup
  if (invoice.isInterState) {
    const igstTotal = invoice.items.reduce((acc, item) => acc + item.igstAmount, 0);
    addSummaryRow("IGST Total:", formatCurrency(igstTotal));
  } else {
    const cgstTotal = invoice.items.reduce((acc, item) => acc + item.cgstAmount, 0);
    const sgstTotal = invoice.items.reduce((acc, item) => acc + item.sgstAmount, 0);
    addSummaryRow("CGST Total:", formatCurrency(cgstTotal));
    addSummaryRow("SGST Total:", formatCurrency(sgstTotal));
  }

  addSummaryRow("Round Off:", formatCurrency(invoice.roundOff));
  
  doc.setDrawColor(200, 200, 200);
  doc.line(summaryX - 5, finalY - 4, pageWidth - 10, finalY - 4);
  
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  addSummaryRow("Grand Total:", formatCurrency(invoice.grandTotal), true);
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
  doc.text(`Bank Name: ${FIRM_DETAILS.bankName}`, 14, bankY + 5);
  doc.text(`A/C No: ${FIRM_DETAILS.accountNo}`, 14, bankY + 10);
  doc.text(`IFSC: ${FIRM_DETAILS.ifsc}`, 14, bankY + 15);

  // Signature
  doc.text(`For ${FIRM_DETAILS.name}`, pageWidth - 14, bankY, { align: 'right' });
  doc.text("Authorized Signatory", pageWidth - 14, bankY + 25, { align: 'right' });

  doc.save(`Invoice_${invoice.invoiceNo}.pdf`);
};

export const generateEWayBillPDF = (bill: EWayBill, firmDetails: FirmDetails) => {
     if (!window.jspdf) return;
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
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`DAILY REGISTER - ${date}`, pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(FIRM_DETAILS.name, pageWidth / 2, 22, { align: 'center' });

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
