import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./customAuth";
import { 
  insertClientSchema,
  insertProjectSchema,
  insertTimeEntrySchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes - handled by customAuth.ts
  // No additional auth routes needed here as they're in customAuth.ts

  // Admin-only user management routes
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Error checking admin status" });
    }
  };

  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id/rates', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const { regularRate, overtimeRate } = req.body;
      
      if (!regularRate || !overtimeRate) {
        return res.status(400).json({ message: "Regular rate and overtime rate are required" });
      }

      const updatedUser = await storage.updateUserRates(userId, regularRate, overtimeRate);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user rates:", error);
      res.status(500).json({ message: "Failed to update user rates" });
    }
  });

  app.put('/api/admin/users/:id/role', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;
      
      if (!role || !['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: "Valid role is required (admin or user)" });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.put('/api/admin/users/:id/credentials', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const { username, email, password } = req.body;
      
      if (!username && !email && !password) {
        return res.status(400).json({ message: "Username, email, or password must be provided" });
      }

      const updatedUser = await storage.updateUserCredentials(userId, username, email, password);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user credentials:", error);
      res.status(500).json({ message: "Failed to update user credentials" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Company routes
  app.get('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companies = await storage.getCompanies(userId);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get('/api/companies/default', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const company = await storage.getDefaultCompany(userId);
      res.json(company);
    } catch (error) {
      console.error("Error fetching default company:", error);
      res.status(500).json({ message: "Failed to fetch default company" });
    }
  });

  app.post('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyData = { ...req.body, userId };
      
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.put('/api/companies/:id', isAuthenticated, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const company = await storage.updateCompany(companyId, req.body, userId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.delete('/api/companies/:id', isAuthenticated, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const success = await storage.deleteCompany(companyId, userId);
      if (!success) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  app.put('/api/companies/:id/default', isAuthenticated, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const company = await storage.setDefaultCompany(companyId, userId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Error setting default company:", error);
      res.status(500).json({ message: "Failed to set default company" });
    }
  });

  // Client routes
  app.get('/api/clients', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const clients = await storage.getClients(userId);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get('/api/clients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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



  // Invoice routes
  app.get('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const invoices = await storage.getInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get('/api/invoices/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const invoiceNumber = await storage.generateInvoiceNumber();
      
      // Get the company and find or create corresponding client
      const companyId = parseInt(req.body.clientId);
      const company = await storage.getCompany(companyId, userId);
      if (!company) {
        return res.status(400).json({ message: "Company not found" });
      }
      
      // Find existing client for this company or create one
      let client = await storage.getClientByName(company.name, userId);
      if (!client) {
        client = await storage.createClient({
          name: company.name,
          email: company.email,
          phone: company.phone,
          address: company.address,
          city: company.city,
          state: company.state,
          zipCode: company.zipCode,
          country: company.country,
          companyId: company.id,
          userId: userId
        });
      }
      
      const { items, ...invoiceFields } = req.body;
      console.log('Invoice fields received:', invoiceFields);
      console.log('Equipment purchased description:', invoiceFields.equipmentPurchasedDescription);
      
      const invoiceData = insertInvoiceSchema.parse({ 
        ...invoiceFields, 
        clientId: client.id,
        userId,
        invoiceNumber 
      });
      console.log('Parsed invoice data:', invoiceData);
      const invoice = await storage.createInvoice(invoiceData);
      
      // Create invoice items
      if (items && items.length > 0) {
        for (const item of items) {
          try {
            const itemData = {
              ...item,
              invoiceId: invoice.id,
              amount: parseFloat(item.rate || '0') * (parseFloat(item.hrs || '0') + parseFloat(item.qty || '0'))
            };
            console.log('Creating invoice item:', itemData);
            await storage.createInvoiceItem(itemData);
          } catch (itemError) {
            console.error('Error creating invoice item:', itemError, 'Item data:', item);
          }
        }
      }
      
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
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const { items, ...invoiceFields } = req.body;
      const invoiceData = insertInvoiceSchema.partial().parse(invoiceFields);
      const invoice = await storage.updateInvoice(id, invoiceData, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Delete existing items and create new ones
      const existingItems = await storage.getInvoiceItems(id);
      for (const item of existingItems) {
        await storage.deleteInvoiceItem(item.id);
      }
      
      // Create new items
      if (items && items.length > 0) {
        for (const item of items) {
          try {
            const itemData = {
              ...item,
              invoiceId: id,
              amount: parseFloat(item.rate || '0') * (parseFloat(item.hrs || '0') + parseFloat(item.qty || '0'))
            };
            console.log('Creating updated invoice item:', itemData);
            await storage.createInvoiceItem(itemData);
          } catch (itemError) {
            console.error('Error creating updated invoice item:', itemError, 'Item data:', item);
          }
        }
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
      const userId = req.user.claims.sub;
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

  // Invoice item routes
  app.post('/api/invoices/:invoiceId/items', isAuthenticated, async (req: any, res) => {
    try {
      const invoiceId = parseInt(req.params.invoiceId);
      const itemData = insertInvoiceItemSchema.parse({ ...req.body, invoiceId });
      const item = await storage.createInvoiceItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating invoice item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice item" });
    }
  });

  // Email invoice route (placeholder - would integrate with actual email service)
  app.post('/api/invoices/:id/email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const { recipientEmail } = req.body;
      
      const invoice = await storage.getInvoice(id, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Update invoice status to sent
      await storage.updateInvoice(id, { status: 'sent' }, userId);

      // TODO: Implement actual email sending with invoice PDF attachment
      console.log(`Sending invoice ${invoice.invoiceNumber} to ${recipientEmail}`);
      
      res.json({ message: "Invoice sent successfully" });
    } catch (error) {
      console.error("Error sending invoice:", error);
      res.status(500).json({ message: "Failed to send invoice" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
