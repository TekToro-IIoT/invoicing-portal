import jsPDF from 'jspdf';

export async function generateMasterInvoicePDF(masterData: any, company: any) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  console.log('Generating Master Invoice PDF with updated formatting');
  
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

    // Header - Company Info (Left Side) - Max width 100mm
    const maxCompanyWidth = 100;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(company?.name || 'TekToro Digital Solutions Inc', margin, currentY);
    currentY += 6;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${company?.address || '71 Fort Street PO Box 1569'}`, margin, currentY);
    currentY += 4;
    pdf.text(`${company?.city || 'George Town'}, ${company?.state || 'Grand Cayman'} ${company?.zipCode || 'KY1-1110'}`, margin, currentY);
    currentY += 4;
    pdf.text(`${company?.country || 'Cayman Islands'}`, margin, currentY);
    currentY += 4;
    pdf.text(`Phone: ${company?.phone || '18558358676'}`, margin, currentY);
    currentY += 4;
    pdf.text(`Email: ${company?.email || 'al.doucet@tektoro.com'}`, margin, currentY);
    currentY += 4;
    if (company?.website) {
      pdf.text(`Web: ${company.website}`, margin, currentY);
      currentY += 4;
    }

    // Invoice Title (Right Side) - Start at 120mm from left
    const invoiceX = 120;
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MASTER INVOICE', invoiceX, margin);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Period: ${monthNames[masterData.month - 1]} ${masterData.year}`, invoiceX, margin + 15);
    if (masterData.client) {
      pdf.text(`Client: ${masterData.client.name}`, invoiceX, margin + 20);
    } else {
      pdf.text('All Clients', invoiceX, margin + 20);
    }
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, invoiceX, margin + 25);

    // Client Information Section (if single client)
    if (masterData.client) {
      currentY += 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', margin, currentY);
      currentY += 6;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(masterData.client.name || 'Headington Energy Partners LLC', margin, currentY);
      currentY += 4;
      
      // Use Headington's known address if client address is not available
      const clientAddress = masterData.client.address || '500 N Shoreline Blvd, Suite 902';
      pdf.text(clientAddress, margin, currentY);
      currentY += 4;
      
      const clientCity = masterData.client.city || 'Corpus Christi';
      const clientState = masterData.client.state || 'TX';
      const clientZip = masterData.client.zipCode || '78401';
      const cityLine = `${clientCity}, ${clientState} ${clientZip}`;
      pdf.text(cityLine, margin, currentY);
      currentY += 4;
      
      if (masterData.client.email) {
        pdf.text(masterData.client.email, margin, currentY);
        currentY += 4;
      }
    }

    // Add line separator
    currentY += 15;
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 15;

    // Summary Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', margin, currentY);
    currentY += 10;

    // Summary table layout
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Invoices: ${masterData.invoices.length}`, margin, currentY);
    pdf.text(`Total Clients: ${Object.keys(masterData.subtotalsByClient).length}`, margin + 70, currentY);
    currentY += 6;
    pdf.text(`Period: ${monthNames[masterData.month - 1]} ${masterData.year}`, margin, currentY);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`Total Amount: $${masterData.totalAmount.toFixed(2)}`, margin + 70, currentY);
    currentY += 20;

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