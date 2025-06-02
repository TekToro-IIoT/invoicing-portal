import jsPDF from 'jspdf';

export async function generateMasterInvoicePDF(masterData: any, company: any) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  try {
    // Create PDF directly without html2canvas
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    let currentY = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize = 10) => {
      pdf.setFontSize(fontSize);
      if (maxWidth) {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * fontSize * 0.352778); // Convert pt to mm
      } else {
        pdf.text(text, x, y);
        return y + (fontSize * 0.352778);
      }
    };

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(company?.name || 'TekToro Digital Solutions Inc', margin, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    currentY = addText(`${company?.address || '123 Main Street'}`, margin, currentY);
    currentY = addText(`${company?.city || 'Calgary'}, ${company?.state || 'AB'} ${company?.zipCode || 'T2P 0A8'}`, margin, currentY);
    currentY = addText(`Phone: ${company?.phone || '(403) 123-4567'}`, margin, currentY);
    currentY = addText(`Email: ${company?.email || 'billing@tektoro.com'}`, margin, currentY);

    // Invoice Title (right side)
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MASTER INVOICE', pageWidth - margin - 80, margin + 5);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Period: ${monthNames[masterData.month - 1]} ${masterData.year}`, pageWidth - margin - 80, margin + 20);
    if (masterData.client) {
      pdf.text(`Client: ${masterData.client.name}`, pageWidth - margin - 80, margin + 25);
    } else {
      pdf.text('All Clients', pageWidth - margin - 80, margin + 25);
    }
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin - 80, margin + 30);

    currentY += 20;

    // Summary Section
    currentY += 10;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', margin, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Invoices: ${masterData.invoices.length}`, margin, currentY);
    pdf.text(`Total Clients: ${Object.keys(masterData.subtotalsByClient).length}`, margin + 50, currentY);
    currentY += 5;
    pdf.text(`Period: ${monthNames[masterData.month - 1]} ${masterData.year}`, margin, currentY);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total Amount: $${masterData.totalAmount.toFixed(2)}`, margin + 50, currentY);
    currentY += 15;

    // Client Breakdown
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Client Breakdown', margin, currentY);
    currentY += 10;

    // Table headers
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Client', margin, currentY);
    pdf.text('Invoices', margin + 80, currentY);
    pdf.text('Amount', margin + 120, currentY);
    currentY += 5;

    // Draw line under headers
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;

    // Client data
    pdf.setFont('helvetica', 'normal');
    Object.values(masterData.subtotalsByClient).forEach((clientData: any) => {
      if (currentY > pageHeight - 30) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.text(clientData.client.name, margin, currentY);
      pdf.text(clientData.invoices.length.toString(), margin + 80, currentY);
      pdf.text(`$${clientData.total.toFixed(2)}`, margin + 120, currentY);
      currentY += 7;

      // Individual invoice details
      clientData.invoices.forEach((invoice: any) => {
        if (currentY > pageHeight - 20) {
          pdf.addPage();
          currentY = margin;
        }
        
        pdf.setFontSize(8);
        pdf.text(`  ${invoice.invoiceNumber} - ${new Date(invoice.serviceDate + 'T00:00:00').toLocaleDateString('en-GB')}`, margin + 5, currentY);
        pdf.text(`$${parseFloat(invoice.total).toFixed(2)}`, margin + 120, currentY);
        currentY += 4;
      });
      
      pdf.setFontSize(10);
      currentY += 3;
    });

    // Grand Total
    currentY += 10;
    pdf.line(margin + 100, currentY, pageWidth - margin, currentY);
    currentY += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('GRAND TOTAL:', margin + 100, currentY);
    pdf.text(`$${masterData.totalAmount.toFixed(2)}`, margin + 140, currentY);

    // Generate filename
    const clientName = masterData.client ? `_${masterData.client.name.replace(/[^a-zA-Z0-9]/g, '_')}` : '_AllClients';
    const filename = `Master_Invoice_${masterData.year}_${masterData.month.toString().padStart(2, '0')}${clientName}.pdf`;

    // Download PDF
    pdf.save(filename);

  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}