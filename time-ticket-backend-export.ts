// Time Ticket Backend Export Package
// Database Schema and API Routes for Time Ticket System

import { pgTable, serial, varchar, text, decimal, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Database Schema
export const timeTickets = pgTable("time_tickets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  todaysDate: timestamp("todays_date").notNull(),
  serviceDate: timestamp("service_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  submittedBy: varchar("submitted_by", { length: 255 }).notNull(),
  client: varchar("client", { length: 255 }).notNull(),
  project: varchar("project", { length: 255 }).notNull(),
  area: varchar("area", { length: 255 }),
  milestoneAchieved: varchar("milestone_achieved", { length: 255 }),
  internalJobNumber: varchar("internal_job_number", { length: 100 }),
  clientJobCode: varchar("client_job_code", { length: 100 }),
  regularTimeHours: decimal("regular_time_hours", { precision: 5, scale: 2 }).notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).notNull(),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }).notNull(),
  servicePoint: varchar("service_point", { length: 255 }),
  afeType: varchar("afe_type", { length: 50 }).default("AFE"),
  afeNumber: varchar("afe_number", { length: 100 }),
  wellName: varchar("well_name", { length: 255 }),
  wellNumber: varchar("well_number", { length: 100 }),
  detailedServiceDescription: text("detailed_service_description"),
  equipmentDescription: text("equipment_description"),
  status: varchar("status", { length: 20 }).default("draft"), // draft, submitted, approved, invoiced
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod Schemas
export const insertTimeTicketSchema = createInsertSchema(timeTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const timeTicketStatusSchema = z.object({
  status: z.enum(["draft", "submitted", "approved", "invoiced"]),
});

// Types
export type TimeTicket = typeof timeTickets.$inferSelect;
export type InsertTimeTicket = z.infer<typeof insertTimeTicketSchema>;
export type TimeTicketStatus = z.infer<typeof timeTicketStatusSchema>["status"];

// API Routes for Express.js
export const timeTicketRoutes = `
// Time Ticket API Routes
app.get('/api/time-tickets', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const tickets = await storage.getTimeTickets(userId);
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching time tickets:", error);
    res.status(500).json({ message: "Failed to fetch time tickets" });
  }
});

app.get('/api/time-tickets/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    const ticket = await storage.getTimeTicket(id, userId);
    if (!ticket) {
      return res.status(404).json({ message: "Time ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    console.error("Error fetching time ticket:", error);
    res.status(500).json({ message: "Failed to fetch time ticket" });
  }
});

app.post('/api/time-tickets', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const ticketData = insertTimeTicketSchema.parse({ ...req.body, userId });
    const ticket = await storage.createTimeTicket(ticketData);
    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating time ticket:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid time ticket data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create time ticket" });
  }
});

app.put('/api/time-tickets/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    const ticketData = insertTimeTicketSchema.partial().parse(req.body);
    const ticket = await storage.updateTimeTicket(id, ticketData, userId);
    if (!ticket) {
      return res.status(404).json({ message: "Time ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    console.error("Error updating time ticket:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid time ticket data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update time ticket" });
  }
});

app.delete('/api/time-tickets/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    const success = await storage.deleteTimeTicket(id, userId);
    if (!success) {
      return res.status(404).json({ message: "Time ticket not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting time ticket:", error);
    res.status(500).json({ message: "Failed to delete time ticket" });
  }
});

app.patch('/api/time-tickets/:id/status', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    const { status } = timeTicketStatusSchema.parse(req.body);
    
    const ticket = await storage.updateTimeTicketStatus(id, status, userId);
    if (!ticket) {
      return res.status(404).json({ message: "Time ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    console.error("Error updating time ticket status:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid status", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update time ticket status" });
  }
});
`;

// Storage Interface
export const timeTicketStorageMethods = `
// Storage Interface Methods for Time Tickets

interface ITimeTicketStorage {
  // Time Ticket operations
  getTimeTickets(userId: string): Promise<TimeTicket[]>;
  getTimeTicket(id: number, userId: string): Promise<TimeTicket | undefined>;
  createTimeTicket(ticket: InsertTimeTicket): Promise<TimeTicket>;
  updateTimeTicket(id: number, ticket: Partial<InsertTimeTicket>, userId: string): Promise<TimeTicket | undefined>;
  deleteTimeTicket(id: number, userId: string): Promise<boolean>;
  updateTimeTicketStatus(id: number, status: TimeTicketStatus, userId: string): Promise<TimeTicket | undefined>;
}

export class DatabaseTimeTicketStorage implements ITimeTicketStorage {
  async getTimeTickets(userId: string): Promise<TimeTicket[]> {
    return await db
      .select()
      .from(timeTickets)
      .where(eq(timeTickets.userId, userId))
      .orderBy(desc(timeTickets.createdAt));
  }

  async getTimeTicket(id: number, userId: string): Promise<TimeTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(timeTickets)
      .where(and(eq(timeTickets.id, id), eq(timeTickets.userId, userId)));
    return ticket;
  }

  async createTimeTicket(ticketData: InsertTimeTicket): Promise<TimeTicket> {
    const [ticket] = await db.insert(timeTickets).values(ticketData).returning();
    return ticket;
  }

  async updateTimeTicket(id: number, ticketData: Partial<InsertTimeTicket>, userId: string): Promise<TimeTicket | undefined> {
    const [ticket] = await db
      .update(timeTickets)
      .set({ ...ticketData, updatedAt: new Date() })
      .where(and(eq(timeTickets.id, id), eq(timeTickets.userId, userId)))
      .returning();
    return ticket;
  }

  async deleteTimeTicket(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(timeTickets)
      .where(and(eq(timeTickets.id, id), eq(timeTickets.userId, userId)));
    return result.rowCount > 0;
  }

  async updateTimeTicketStatus(id: number, status: TimeTicketStatus, userId: string): Promise<TimeTicket | undefined> {
    const [ticket] = await db
      .update(timeTickets)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(timeTickets.id, id), eq(timeTickets.userId, userId)))
      .returning();
    return ticket;
  }
}
`;

// Migration SQL
export const timeTicketMigrationSQL = `
-- Time Tickets Migration SQL
CREATE TABLE time_tickets (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  todays_date TIMESTAMP NOT NULL,
  service_date TIMESTAMP NOT NULL,
  due_date TIMESTAMP NOT NULL,
  submitted_by VARCHAR(255) NOT NULL,
  client VARCHAR(255) NOT NULL,
  project VARCHAR(255) NOT NULL,
  area VARCHAR(255),
  milestone_achieved VARCHAR(255),
  internal_job_number VARCHAR(100),
  client_job_code VARCHAR(100),
  regular_time_hours DECIMAL(5,2) NOT NULL,
  overtime_hours DECIMAL(5,2) NOT NULL,
  total_hours DECIMAL(5,2) NOT NULL,
  service_point VARCHAR(255),
  afe_type VARCHAR(50) DEFAULT 'AFE',
  afe_number VARCHAR(100),
  well_name VARCHAR(255),
  well_number VARCHAR(100),
  detailed_service_description TEXT,
  equipment_description TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_time_tickets_user_id ON time_tickets(user_id);
CREATE INDEX idx_time_tickets_status ON time_tickets(status);
CREATE INDEX idx_time_tickets_service_date ON time_tickets(service_date);
CREATE INDEX idx_time_tickets_created_at ON time_tickets(created_at);
`;