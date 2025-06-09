// Database schemas for TekToro Invoicing System
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// Invoice validation schema
export const invoiceSchema = z.object({
  clientId: z.number(),
  issueDate: z.string(),
  serviceDate: z.string(),
  dueDate: z.string(),
  taxRate: z.string().transform((val) => parseFloat(val)),
  notes: z.string().optional(),
  equipmentPurchasedDescription: z.string().optional(),
  items: z.array(z.object({
    jobCode: z.string().optional(),
    servicePoint: z.string().optional(),
    afeLoe: z.string().optional(),
    afeNumber: z.string().optional(),
    wellName: z.string().optional(),
    wellNumber: z.string().optional(),
    service: z.string().optional(),
    rate: z.number().min(0),
    hrs: z.number().min(0),
    qty: z.number().min(0),
  })).min(1),
});

// Invoice status update schema
export const invoiceStatusSchema = z.object({
  status: z.enum(["draft", "sent", "paid", "overdue"]),
});

// Client schema
export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default("United States"),
  contactPerson: z.string().optional(),
  companyId: z.number().optional(),
});

// Company schema
export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default("USA"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  taxId: z.string().optional(),
  logo: z.string().optional(),
});

// Form validation schemas
export const invoiceFormSchema = invoiceSchema.extend({
  taxRate: z.string().transform((val) => parseFloat(val) || 0),
});

export const clientFormSchema = clientSchema;
export const companyFormSchema = companySchema;

// Types for TypeScript
export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
export type ClientFormData = z.infer<typeof clientFormSchema>;
export type CompanyFormData = z.infer<typeof companyFormSchema>;
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>["status"];

// Database table schemas (Drizzle ORM compatible)
export const dbTableSchemas = `
// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username").unique(),
  password: varchar("password"),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("user"),
  regularRate: varchar("regular_rate").default("100"),
  overtimeRate: varchar("overtime_rate").default("150"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  country: varchar("country", { length: 100 }).default("United States"),
  contactPerson: varchar("contact_person", { length: 255 }),
  companyId: integer("company_id").references(() => companies.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  country: varchar("country").default("USA"),
  phone: varchar("phone"),
  email: varchar("email"),
  website: varchar("website"),
  taxId: varchar("tax_id"),
  logo: varchar("logo"),
  userId: varchar("user_id").notNull().references(() => users.id),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  issueDate: date("issue_date").notNull(),
  serviceDate: date("service_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  equipmentPurchasedDescription: text("equipment_purchased_description"),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice items table
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  jobCode: varchar("job_code"),
  servicePoint: varchar("service_point"),
  afeLoe: varchar("afe_loe"),
  afeNumber: varchar("afe_number"),
  wellName: varchar("well_name"),
  wellNumber: varchar("well_number"),
  service: text("service"),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  hrs: decimal("hrs", { precision: 10, scale: 2 }).default("0"),
  qty: decimal("qty", { precision: 10, scale: 2 }).default("0"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
`;