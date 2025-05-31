import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({ ...req.body, userId });
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Time entry routes
  app.get('/api/time-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const timeEntries = await storage.getTimeEntries(userId);
      res.json(timeEntries);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.get('/api/time-entries/running', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const runningEntry = await storage.getRunningTimeEntry(userId);
      res.json(runningEntry || null);
    } catch (error) {
      console.error("Error fetching running time entry:", error);
      res.status(500).json({ message: "Failed to fetch running time entry" });
    }
  });

  app.post('/api/time-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const timeEntryData = insertTimeEntrySchema.parse({ ...req.body, userId });
      const timeEntry = await storage.createTimeEntry(timeEntryData);
      res.status(201).json(timeEntry);
    } catch (error) {
      console.error("Error creating time entry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid time entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create time entry" });
    }
  });

  app.post('/api/time-entries/:id/stop', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const timeEntry = await storage.stopTimeEntry(id, userId);
      if (!timeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      res.json(timeEntry);
    } catch (error) {
      console.error("Error stopping time entry:", error);
      res.status(500).json({ message: "Failed to stop time entry" });
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
      const invoiceData = insertInvoiceSchema.parse({ 
        ...req.body, 
        userId,
        invoiceNumber 
      });
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
      const userId = req.user.claims.sub;
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

  // Time tickets routes
  app.get('/api/time-tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const timeTickets = await storage.getTimeTickets(userId);
      res.json(timeTickets);
    } catch (error) {
      console.error("Error fetching time tickets:", error);
      res.status(500).json({ message: "Failed to fetch time tickets" });
    }
  });

  app.get('/api/time-tickets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const timeTicket = await storage.getTimeTicket(ticketId, userId);
      if (!timeTicket) {
        return res.status(404).json({ message: "Time ticket not found" });
      }
      
      res.json(timeTicket);
    } catch (error) {
      console.error("Error fetching time ticket:", error);
      res.status(500).json({ message: "Failed to fetch time ticket" });
    }
  });

  app.post('/api/time-tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const timeTicketData = { ...req.body, userId };
      
      const timeTicket = await storage.createTimeTicket(timeTicketData);
      
      // Auto-generate invoice if time ticket is submitted and has billable hours
      if (timeTicket.status === 'submitted' && parseFloat(timeTicket.totalHours || '0') > 0) {
        try {
          // Check if client exists, create if not
          let client = await storage.getClientByName(timeTicket.client, userId);
          if (!client) {
            client = await storage.createClient({
              name: timeTicket.client,
              email: null,
              phone: null,
              address: null,
              city: null,
              state: null,
              zipCode: null,
              country: null,
              contactPerson: null,
              userId: userId
            });
          }

          // Generate invoice number
          const invoiceNumber = await storage.generateInvoiceNumber();
          
          // Get user's billing rates
          const currentUser = await storage.getUser(userId);
          const regularRate = parseFloat(currentUser?.regularRate || '100');
          const overtimeRate = parseFloat(currentUser?.overtimeRate || '150');
          const regularAmount = parseFloat(timeTicket.regularTimeHours || '0') * regularRate;
          const overtimeAmount = parseFloat(timeTicket.overtimeHours || '0') * overtimeRate;
          const subtotal = regularAmount + overtimeAmount;
          const taxRate = 0; // No tax by default
          const total = subtotal;

          // Create invoice
          const invoice = await storage.createInvoice({
            invoiceNumber,
            clientId: client.id,
            issueDate: timeTicket.serviceDate,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            subtotal: subtotal.toString(),
            taxRate: taxRate.toString(),
            taxAmount: '0',
            total: total.toString(),
            status: 'draft',
            notes: `Generated from time ticket for ${timeTicket.project} - ${timeTicket.detailedServiceDescription}`,
            userId: userId
          });

          // Add invoice items
          if (regularAmount > 0) {
            await storage.createInvoiceItem({
              invoiceId: invoice.id,
              description: `Regular Hours - ${timeTicket.project} (${timeTicket.detailedServiceDescription})`,
              quantity: timeTicket.regularTimeHours || '0',
              rate: regularRate.toString(),
              amount: regularAmount.toString()
            });
          }

          if (overtimeAmount > 0) {
            await storage.createInvoiceItem({
              invoiceId: invoice.id,
              description: `Overtime Hours - ${timeTicket.project} (${timeTicket.detailedServiceDescription})`,
              quantity: timeTicket.overtimeHours || '0',
              rate: overtimeRate.toString(),
              amount: overtimeAmount.toString()
            });
          }

          console.log(`Auto-generated invoice ${invoiceNumber} from time ticket ${timeTicket.id}`);
        } catch (invoiceError) {
          console.error("Error auto-generating invoice:", invoiceError);
          // Don't fail the time ticket creation if invoice generation fails
        }
      }
      
      res.status(201).json(timeTicket);
    } catch (error) {
      console.error("Error creating time ticket:", error);
      res.status(500).json({ message: "Failed to create time ticket" });
    }
  });

  app.put('/api/time-tickets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const timeTicket = await storage.updateTimeTicket(ticketId, req.body, userId);
      if (!timeTicket) {
        return res.status(404).json({ message: "Time ticket not found" });
      }
      
      res.json(timeTicket);
    } catch (error) {
      console.error("Error updating time ticket:", error);
      res.status(500).json({ message: "Failed to update time ticket" });
    }
  });

  app.delete('/api/time-tickets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const success = await storage.deleteTimeTicket(ticketId, userId);
      if (!success) {
        return res.status(404).json({ message: "Time ticket not found" });
      }
      
      res.json({ message: "Time ticket deleted successfully" });
    } catch (error) {
      console.error("Error deleting time ticket:", error);
      res.status(500).json({ message: "Failed to delete time ticket" });
    }
  });

  app.post('/api/time-tickets/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const timeTicket = await storage.submitTimeTicket(ticketId, userId);
      if (!timeTicket) {
        return res.status(404).json({ message: "Time ticket not found" });
      }

      // Auto-generate invoice if time ticket has billable hours
      if (parseFloat(timeTicket.totalHours || '0') > 0) {
        try {
          // Check if client exists, create if not
          let client = await storage.getClientByName(timeTicket.client, userId);
          if (!client) {
            client = await storage.createClient({
              name: timeTicket.client,
              email: null,
              phone: null,
              address: null,
              city: null,
              state: null,
              zipCode: null,
              country: null,
              contactPerson: null,
              userId: userId
            });
          }

          // Generate invoice number
          const invoiceNumber = await storage.generateInvoiceNumber();
          
          // Get user's billing rates
          const currentUser = await storage.getUser(userId);
          const regularRate = parseFloat(currentUser?.regularRate || '100');
          const overtimeRate = parseFloat(currentUser?.overtimeRate || '150');
          const regularAmount = parseFloat(timeTicket.regularTimeHours || '0') * regularRate;
          const overtimeAmount = parseFloat(timeTicket.overtimeHours || '0') * overtimeRate;
          const subtotal = regularAmount + overtimeAmount;
          const taxRate = 0; // No tax by default
          const total = subtotal;

          // Create invoice
          const invoice = await storage.createInvoice({
            invoiceNumber,
            clientId: client.id,
            issueDate: timeTicket.serviceDate,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            subtotal: subtotal.toString(),
            taxRate: taxRate.toString(),
            taxAmount: '0',
            total: total.toString(),
            status: 'draft',
            notes: `Generated from time ticket for ${timeTicket.project} - ${timeTicket.detailedServiceDescription}`,
            userId: userId
          });

          // Add invoice items
          if (regularAmount > 0) {
            await storage.createInvoiceItem({
              invoiceId: invoice.id,
              description: `Regular Hours - ${timeTicket.project} (${timeTicket.detailedServiceDescription})`,
              quantity: timeTicket.regularTimeHours || '0',
              rate: regularRate.toString(),
              amount: regularAmount.toString()
            });
          }

          if (overtimeAmount > 0) {
            await storage.createInvoiceItem({
              invoiceId: invoice.id,
              description: `Overtime Hours - ${timeTicket.project} (${timeTicket.detailedServiceDescription})`,
              quantity: timeTicket.overtimeHours || '0',
              rate: overtimeRate.toString(),
              amount: overtimeAmount.toString()
            });
          }

          console.log(`Auto-generated invoice ${invoiceNumber} from time ticket ${timeTicket.id}`);
        } catch (invoiceError) {
          console.error("Error auto-generating invoice:", invoiceError);
          // Don't fail the time ticket submission if invoice generation fails
        }
      }
      
      res.json(timeTicket);
    } catch (error) {
      console.error("Error submitting time ticket:", error);
      res.status(500).json({ message: "Failed to submit time ticket" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
