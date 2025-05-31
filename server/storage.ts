import {
  users,
  clients,
  projects,
  timeEntries,
  invoices,
  invoiceItems,
  timeTickets,
  type User,
  type UpsertUser,
  type Client,
  type InsertClient,
  type Project,
  type InsertProject,
  type TimeEntry,
  type InsertTimeEntry,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type TimeTicket,
  type InsertTimeTicket,
  type ClientWithUser,
  type ProjectWithClient,
  type TimeEntryWithProject,
  type InvoiceWithClient,
  type InvoiceWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Client operations
  getClients(userId: string): Promise<Client[]>;
  getClient(id: number, userId: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>, userId: string): Promise<Client | undefined>;
  deleteClient(id: number, userId: string): Promise<boolean>;

  // Project operations
  getProjects(userId: string): Promise<ProjectWithClient[]>;
  getProject(id: number, userId: string): Promise<ProjectWithClient | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>, userId: string): Promise<Project | undefined>;
  deleteProject(id: number, userId: string): Promise<boolean>;

  // Time entry operations
  getTimeEntries(userId: string): Promise<TimeEntryWithProject[]>;
  getTimeEntry(id: number, userId: string): Promise<TimeEntryWithProject | undefined>;
  getRunningTimeEntry(userId: string): Promise<TimeEntryWithProject | undefined>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>, userId: string): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: number, userId: string): Promise<boolean>;
  stopTimeEntry(id: number, userId: string): Promise<TimeEntry | undefined>;

  // Invoice operations
  getInvoices(userId: string): Promise<InvoiceWithClient[]>;
  getInvoice(id: number, userId: string): Promise<InvoiceWithDetails | undefined>;
  getInvoiceByNumber(invoiceNumber: string, userId: string): Promise<InvoiceWithDetails | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>, userId: string): Promise<Invoice | undefined>;
  deleteInvoice(id: number, userId: string): Promise<boolean>;
  generateInvoiceNumber(): Promise<string>;

  // Invoice item operations
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: number, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: number): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(userId: string): Promise<{
    totalRevenue: number;
    activeInvoices: number;
    hoursTracked: number;
    totalClients: number;
  }>;

  // Time ticket operations
  getTimeTickets(userId: string): Promise<TimeTicket[]>;
  getTimeTicket(id: number, userId: string): Promise<TimeTicket | undefined>;
  createTimeTicket(timeTicket: InsertTimeTicket): Promise<TimeTicket>;
  updateTimeTicket(id: number, timeTicket: Partial<InsertTimeTicket>, userId: string): Promise<TimeTicket | undefined>;
  deleteTimeTicket(id: number, userId: string): Promise<boolean>;
  submitTimeTicket(id: number, userId: string): Promise<TimeTicket | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Client operations
  async getClients(userId: string): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(asc(clients.name));
  }

  async getClient(id: number, userId: string): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>, userId: string): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));
    return result.rowCount > 0;
  }

  // Project operations
  async getProjects(userId: string): Promise<ProjectWithClient[]> {
    return await db
      .select()
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: number, userId: string): Promise<ProjectWithClient | undefined> {
    const [result] = await db
      .select()
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));
    
    if (!result) return undefined;
    return {
      ...result.projects,
      client: result.clients!,
    };
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>, userId: string): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));
    return result.rowCount > 0;
  }

  // Time entry operations
  async getTimeEntries(userId: string): Promise<TimeEntryWithProject[]> {
    const results = await db
      .select()
      .from(timeEntries)
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(eq(timeEntries.userId, userId))
      .orderBy(desc(timeEntries.startTime));

    return results.map(result => ({
      ...result.time_entries,
      project: {
        ...result.projects!,
        client: result.clients!,
      },
    }));
  }

  async getTimeEntry(id: number, userId: string): Promise<TimeEntryWithProject | undefined> {
    const [result] = await db
      .select()
      .from(timeEntries)
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId)));
    
    if (!result) return undefined;
    return {
      ...result.time_entries,
      project: {
        ...result.projects!,
        client: result.clients!,
      },
    };
  }

  async getRunningTimeEntry(userId: string): Promise<TimeEntryWithProject | undefined> {
    const [result] = await db
      .select()
      .from(timeEntries)
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(and(eq(timeEntries.userId, userId), eq(timeEntries.isRunning, true)));
    
    if (!result) return undefined;
    return {
      ...result.time_entries,
      project: {
        ...result.projects!,
        client: result.clients!,
      },
    };
  }

  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const [newTimeEntry] = await db.insert(timeEntries).values(timeEntry).returning();
    return newTimeEntry;
  }

  async updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>, userId: string): Promise<TimeEntry | undefined> {
    const [updatedTimeEntry] = await db
      .update(timeEntries)
      .set({ ...timeEntry, updatedAt: new Date() })
      .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId)))
      .returning();
    return updatedTimeEntry;
  }

  async deleteTimeEntry(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(timeEntries)
      .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId)));
    return result.rowCount > 0;
  }

  async stopTimeEntry(id: number, userId: string): Promise<TimeEntry | undefined> {
    const now = new Date();
    const [timeEntry] = await db
      .select()
      .from(timeEntries)
      .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId)));
    
    if (!timeEntry) return undefined;

    const durationMinutes = Math.floor((now.getTime() - timeEntry.startTime.getTime()) / (1000 * 60));
    
    const [updatedTimeEntry] = await db
      .update(timeEntries)
      .set({
        endTime: now,
        duration: durationMinutes,
        isRunning: false,
        updatedAt: now,
      })
      .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId)))
      .returning();
    
    return updatedTimeEntry;
  }

  // Invoice operations
  async getInvoices(userId: string): Promise<InvoiceWithClient[]> {
    const results = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(invoiceItems, eq(invoices.id, invoiceItems.invoiceId))
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));

    const invoiceMap = new Map<number, InvoiceWithClient>();
    
    results.forEach(result => {
      const invoice = result.invoices;
      if (!invoiceMap.has(invoice.id)) {
        invoiceMap.set(invoice.id, {
          ...invoice,
          client: result.clients!,
          items: [],
        });
      }
      
      if (result.invoice_items) {
        invoiceMap.get(invoice.id)!.items.push(result.invoice_items);
      }
    });

    return Array.from(invoiceMap.values());
  }

  async getInvoice(id: number, userId: string): Promise<InvoiceWithDetails | undefined> {
    const results = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(invoiceItems, eq(invoices.id, invoiceItems.invoiceId))
      .leftJoin(timeEntries, eq(invoiceItems.timeEntryId, timeEntries.id))
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

    if (results.length === 0) return undefined;

    const invoice = results[0].invoices;
    const client = results[0].clients!;
    const items = results
      .filter(r => r.invoice_items)
      .map(r => ({
        ...r.invoice_items!,
        timeEntry: r.time_entries || undefined,
      }));

    return {
      ...invoice,
      client,
      items,
    };
  }

  async getInvoiceByNumber(invoiceNumber: string, userId: string): Promise<InvoiceWithDetails | undefined> {
    const results = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(invoiceItems, eq(invoices.id, invoiceItems.invoiceId))
      .leftJoin(timeEntries, eq(invoiceItems.timeEntryId, timeEntries.id))
      .where(and(eq(invoices.invoiceNumber, invoiceNumber), eq(invoices.userId, userId)));

    if (results.length === 0) return undefined;

    const invoice = results[0].invoices;
    const client = results[0].clients!;
    const items = results
      .filter(r => r.invoice_items)
      .map(r => ({
        ...r.invoice_items!,
        timeEntry: r.time_entries || undefined,
      }));

    return {
      ...invoice,
      client,
      items,
    };
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>, userId: string): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .returning();
    return updatedInvoice;
  }

  async deleteInvoice(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
    return result.rowCount > 0;
  }

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceNumber, `INV-${year}-001`));
    
    // Find the highest invoice number for this year
    const yearPrefix = `INV-${year}-`;
    const existingInvoices = await db
      .select({ invoiceNumber: invoices.invoiceNumber })
      .from(invoices)
      .where(eq(invoices.invoiceNumber, yearPrefix));
    
    let maxNumber = 0;
    existingInvoices.forEach(inv => {
      const numberPart = inv.invoiceNumber.replace(yearPrefix, '');
      const num = parseInt(numberPart, 10);
      if (num > maxNumber) {
        maxNumber = num;
      }
    });

    const nextNumber = maxNumber + 1;
    return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  // Invoice item operations
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const [newItem] = await db.insert(invoiceItems).values(item).returning();
    return newItem;
  }

  async updateInvoiceItem(id: number, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    const [updatedItem] = await db
      .update(invoiceItems)
      .set(item)
      .where(eq(invoiceItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteInvoiceItem(id: number): Promise<boolean> {
    const result = await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
    return result.rowCount > 0;
  }

  // Dashboard stats
  async getDashboardStats(userId: string): Promise<{
    totalRevenue: number;
    activeInvoices: number;
    hoursTracked: number;
    totalClients: number;
  }> {
    // Get total revenue from paid invoices
    const revenueResult = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.userId, userId), eq(invoices.status, 'paid')));
    
    const totalRevenue = revenueResult.reduce((sum, invoice) => sum + parseFloat(invoice.total || '0'), 0);

    // Get active invoices count
    const activeInvoicesResult = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.userId, userId), eq(invoices.status, 'sent')));
    
    const activeInvoices = activeInvoicesResult.length;

    // Get total hours tracked
    const timeEntriesResult = await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.userId, userId));
    
    const totalMinutes = timeEntriesResult.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const hoursTracked = Math.round((totalMinutes / 60) * 10) / 10;

    // Get total clients count
    const clientsResult = await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId));
    
    const totalClients = clientsResult.length;

    return {
      totalRevenue,
      activeInvoices,
      hoursTracked,
      totalClients,
    };
  }

  // Time ticket operations
  async getTimeTickets(userId: string): Promise<TimeTicket[]> {
    const tickets = await db
      .select()
      .from(timeTickets)
      .where(eq(timeTickets.userId, userId))
      .orderBy(desc(timeTickets.createdAt));
    
    return tickets;
  }

  async getTimeTicket(id: number, userId: string): Promise<TimeTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(timeTickets)
      .where(and(eq(timeTickets.id, id), eq(timeTickets.userId, userId)));
    
    return ticket;
  }

  async createTimeTicket(timeTicket: InsertTimeTicket): Promise<TimeTicket> {
    const [ticket] = await db
      .insert(timeTickets)
      .values(timeTicket)
      .returning();
    
    return ticket;
  }

  async updateTimeTicket(id: number, timeTicket: Partial<InsertTimeTicket>, userId: string): Promise<TimeTicket | undefined> {
    const [updatedTicket] = await db
      .update(timeTickets)
      .set({
        ...timeTicket,
        updatedAt: new Date(),
      })
      .where(and(eq(timeTickets.id, id), eq(timeTickets.userId, userId)))
      .returning();
    
    return updatedTicket;
  }

  async deleteTimeTicket(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(timeTickets)
      .where(and(eq(timeTickets.id, id), eq(timeTickets.userId, userId)));
    
    return (result.rowCount ?? 0) > 0;
  }

  async submitTimeTicket(id: number, userId: string): Promise<TimeTicket | undefined> {
    const [submittedTicket] = await db
      .update(timeTickets)
      .set({
        status: "submitted",
        updatedAt: new Date(),
      })
      .where(and(eq(timeTickets.id, id), eq(timeTickets.userId, userId)))
      .returning();
    
    return submittedTicket;
  }
}

export const storage = new DatabaseStorage();
