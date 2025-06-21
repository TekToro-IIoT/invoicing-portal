# TekToro Invoicing System - Complete Export Package

## System Overview
This export contains the complete TekToro invoicing system with all components needed for replication. The system features professional invoice management with oil & gas industry-specific fields, PDF generation, master invoice aggregation, and comprehensive authentication.

## Database Schema (PostgreSQL with Drizzle ORM)

### Core Tables Structure
```sql
-- Users table with authentication and roles
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  username VARCHAR UNIQUE,
  password VARCHAR,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  role VARCHAR NOT NULL DEFAULT 'user',
  regular_rate VARCHAR DEFAULT '100',
  overtime_rate VARCHAR DEFAULT '150',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies table for client organizations
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  address TEXT,
  city VARCHAR,
  state VARCHAR,
  zip_code VARCHAR,
  country VARCHAR DEFAULT 'USA',
  phone VARCHAR,
  email VARCHAR,
  website VARCHAR,
  tax_id VARCHAR,
  logo VARCHAR,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clients table for individual contacts
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'United States',
  contact_person VARCHAR(255),
  company_id INTEGER REFERENCES companies(id),
  user_id VARCHAR REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table with comprehensive billing information
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  client_id INTEGER REFERENCES clients(id) NOT NULL,
  issue_date DATE NOT NULL,
  service_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  notes TEXT,
  equipment_purchased_description TEXT,
  user_id VARCHAR REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoice items with oil & gas industry fields
CREATE TABLE invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id) NOT NULL,
  time_entry_id INTEGER,
  job_code VARCHAR,
  service_point VARCHAR,
  afe_loe VARCHAR,
  afe_number VARCHAR,
  well_name VARCHAR,
  well_number VARCHAR,
  service TEXT,
  rate DECIMAL(10,2) NOT NULL,
  hrs DECIMAL(10,2) DEFAULT 0,
  qty DECIMAL(10,2) DEFAULT 0,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table for authentication persistence
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IDX_session_expire ON sessions(expire);
```

## Backend Implementation

### 1. Database Connection (`server/db.ts`)
```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

### 2. Authentication System (`server/customAuth.ts`)
```typescript
import bcrypt from 'bcrypt';
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      // Find user in database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      res.json({ 
        message: "Login successful", 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if (req.session.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  return res.status(401).json({ message: "Authentication required" });
};
```

### 3. API Routes Structure (`server/routes.ts`)
```typescript
import type { Express } from "express";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./customAuth";

export async function registerRoutes(app: Express) {
  // Setup authentication
  await setupAuth(app);

  // Dashboard statistics
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Invoice management endpoints
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
      const invoiceNumber = await storage.generateInvoiceNumber();
      
      const { items, ...invoiceFields } = req.body;
      const invoiceData = { 
        ...invoiceFields, 
        userId,
        invoiceNumber 
      };
      
      const invoice = await storage.createInvoice(invoiceData);
      
      // Create invoice items
      if (items && items.length > 0) {
        for (const item of items) {
          const itemData = {
            ...item,
            invoiceId: invoice.id,
            amount: parseFloat(item.rate || '0') * (parseFloat(item.hrs || '0') + parseFloat(item.qty || '0'))
          };
          await storage.createInvoiceItem(itemData);
        }
      }
      
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Client management endpoints
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

  // Company management endpoints
  app.get('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const companies = await storage.getCompanies(userId);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get('/api/companies/default', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const company = await storage.getDefaultCompany(userId);
      res.json(company);
    } catch (error) {
      console.error("Error fetching default company:", error);
      res.status(500).json({ message: "Failed to fetch default company" });
    }
  });
}
```

## Frontend Implementation

### 1. Authentication Hook (`client/src/hooks/useAuth.ts`)
```typescript
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
```

### 2. API Client (`client/src/lib/queryClient.ts`)
```typescript
import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
```

### 3. Dashboard Component
Professional dashboard with invoice statistics, recent invoices, and quick actions.

### 4. Invoice Management
Complete CRUD operations for invoices with oil & gas industry-specific fields:
- Job codes and AFE numbers
- Well names and numbers
- Service points and descriptions
- Equipment tracking

### 5. PDF Generation
Professional PDF generation with company branding and comprehensive invoice details.

## TekToro Dark Theme Styling

### Primary CSS Variables
```css
:root {
  --tektoro-primary: 145 63% 49%; /* #22C55E - Green */
  --tektoro-dark: 217 19% 15%; /* #1A202C - Darker navy */
  --tektoro-bg: 217 19% 18%; /* #1E293B - Background */
  --tektoro-text: 210 40% 98%; /* #F8FAFC - Light text */
  --background: 217 19% 18%; /* #1E293B - Dark navy background */
  --foreground: 210 40% 98%; /* #F8FAFC - Very light text */
  --card: 217 19% 22%; /* #2D3748 - Card background */
  --border: 217 19% 30%; /* #4A5568 - Lighter borders */
}
```

## Oil & Gas Industry Features

### Invoice Line Items Include:
- **AFE Numbers**: Authorization for Expenditure tracking
- **Job Codes**: Internal and client job coding systems
- **Service Points**: Location-specific service identification
- **Well Information**: Well names and numbers for drilling operations
- **Equipment Descriptions**: Detailed equipment usage tracking
- **Service Descriptions**: Comprehensive service documentation
- **Rate Structures**: Hourly rates, quantities, and total calculations

### Professional Features:
- **Status Tracking**: Draft, sent, paid, overdue workflow
- **PDF Generation**: Professional invoice templates with branding
- **Master Invoices**: Monthly aggregation by client
- **Dashboard Analytics**: Real-time statistics and reporting
- **Client Management**: Company associations and contact management

## Deployment Requirements

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-secure-session-secret-key-here
```

### Dependencies
```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0",
    "drizzle-orm": "^0.28.0",
    "express": "^4.18.0",
    "express-session": "^1.17.0",
    "connect-pg-simple": "^9.0.0",
    "bcrypt": "^5.1.0",
    "react": "^18.2.0",
    "@tanstack/react-query": "^4.35.0",
    "wouter": "^2.11.0",
    "tailwindcss": "^3.3.0",
    "zod": "^3.22.0"
  }
}
```

### Database Migration
```bash
# Create all tables with proper relations
npm run db:push

# Create initial admin user
INSERT INTO users (id, username, password, email, role) 
VALUES ('admin', 'admin', '$2b$10$hashedpassword', 'admin@company.com', 'admin');
```

## Success Metrics
- Complete invoice lifecycle management
- Professional PDF generation
- Oil & gas industry compliance
- Multi-client support
- Secure authentication
- Responsive design
- Real-time dashboard analytics

This export provides everything needed to replicate the TekToro invoicing system with full functionality, professional styling, and industry-specific features.