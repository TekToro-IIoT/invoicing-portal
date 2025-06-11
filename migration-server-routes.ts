import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth"; // Your auth implementation
import { 
  insertClientSchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerInvoicingRoutes(app: Express): Promise<void> {
  // Dashboard Stats API
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const invoices = await storage.getInvoices(userId);
      
      const activeInvoices = invoices.filter(inv => inv.status === 'sent').length;
      const outstandingInvoices = invoices.filter(inv => inv.status === 'draft').length;
      const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
      const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
      
      const clients = await storage.getClients(userId);
      const totalClients = clients.length;
      
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
        
      const pendingRevenue = invoices
        .filter(inv => inv.status === 'sent')
        .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

      res.json({
        activeInvoices,
        outstandingInvoices,
        paidInvoices,
        overdueInvoices,
        totalClients,
        totalRevenue,
        pendingRevenue,
        totalInvoices: invoices.length
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Invoice Routes
  app.get('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const invoices = await storage.getInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get('/api/invoices/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const invoiceData = insertInvoiceSchema.parse({ ...req.body, userId });
      
      // Generate invoice number if not provided
      if (!invoiceData.invoiceNumber) {
        const prefix = 'INV-TDS';
        const year = new Date().getFullYear();
        const existingInvoices = await storage.getInvoices(userId);
        const invoiceCount = existingInvoices.length + 1;
        invoiceData.invoiceNumber = `${prefix}-${year}-${invoiceCount.toString().padStart(3, '0')}`;
      }
      
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put('/api/invoices/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const invoiceData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, invoiceData, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete('/api/invoices/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const success = await storage.deleteInvoice(id, userId);
      if (!success) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  app.patch('/api/invoices/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['draft', 'sent', 'paid', 'overdue'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const invoice = await storage.updateInvoiceStatus(id, status, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      res.status(500).json({ message: "Failed to update invoice status" });
    }
  });

  // Master Invoice Routes
  app.get("/api/invoices/master/:year/:month", isAuthenticated, async (req: any, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const userId = req.user.id;
      
      const masterData = await storage.getMasterInvoiceData(userId, year, month);
      res.json(masterData);
    } catch (error) {
      console.error("Error fetching master invoice data:", error);
      res.status(500).json({ message: "Failed to fetch master invoice data" });
    }
  });

  app.get("/api/invoices/master/:year/:month/client/:clientId", isAuthenticated, async (req: any, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const clientId = parseInt(req.params.clientId);
      const userId = req.user.id;
      
      const clientMasterData = await storage.getClientMasterInvoiceData(userId, clientId, year, month);
      res.json(clientMasterData);
    } catch (error) {
      console.error("Error fetching client master invoice data:", error);
      res.status(500).json({ message: "Failed to fetch client master invoice data" });
    }
  });

  // Client Routes
  app.get('/api/clients', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const clients = await storage.getClients(userId);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get('/api/clients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id, userId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const clientData = insertClientSchema.parse({ ...req.body, userId });
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData, userId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const success = await storage.deleteClient(id, userId);
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Invoice Items Routes
  app.post('/api/invoices/:invoiceId/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const invoiceId = parseInt(req.params.invoiceId);
      const itemData = insertInvoiceItemSchema.parse({ ...req.body, invoiceId });
      
      // Verify invoice belongs to user
      const invoice = await storage.getInvoice(invoiceId, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const item = await storage.createInvoiceItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating invoice item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice item" });
    }
  });

  // Email Invoice Route (placeholder - implement with your email service)
  app.post('/api/invoices/:id/email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const { recipient, subject, message } = req.body;
      
      const invoice = await storage.getInvoice(id, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Implement email sending logic here
      // This is a placeholder response
      res.json({ message: "Invoice email sent successfully" });
    } catch (error) {
      console.error("Error sending invoice email:", error);
      res.status(500).json({ message: "Failed to send invoice email" });
    }
  });
}