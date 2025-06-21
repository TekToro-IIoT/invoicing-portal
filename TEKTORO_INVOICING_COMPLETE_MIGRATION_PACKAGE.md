# TekToro Invoicing System - Complete Migration Package

## Overview
This package contains everything needed to replicate the TekToro invoicing system in another application. The system includes invoice management, PDF generation, master invoice functionality, client management, and comprehensive authentication.

## Package Contents

### 1. Database Schema (`shared/schema.ts`)
Complete PostgreSQL database schema with Drizzle ORM including:
- Users table with role-based access
- Clients and companies management
- Invoice and invoice items tables
- Time tracking and time tickets
- Session management
- All relations and type definitions

### 2. Backend API (`server/`)
Complete Express.js server implementation:
- **routes.ts** - All API endpoints for invoices, clients, companies, dashboard stats
- **storage.ts** - Database operations with comprehensive CRUD methods
- **customAuth.ts** - Authentication system with bcrypt password hashing
- **db.ts** - Database connection and Drizzle ORM setup

### 3. Frontend Components (`client/src/`)
Complete React application with TypeScript:
- **Dashboard** - Invoice statistics, recent invoices, quick actions
- **Invoice Management** - Create, edit, delete, view invoices
- **Invoice Components** - Table, form, and modal components
- **PDF Generation** - Professional invoice PDF generation
- **Master Invoice** - Monthly invoice aggregation
- **Authentication** - Login/logout with session management

### 4. Styling and Theme
- **TekToro Dark Theme** - Professional dark navy/charcoal theme
- **Responsive Design** - Mobile-first approach
- **Print Styles** - Optimized for PDF generation
- **SCADA-inspired** - Industrial/professional interface elements

## Installation Instructions

### 1. Database Setup
```sql
-- Run the schema creation script
-- All tables will be created with proper relations and indexes
```

### 2. Backend Dependencies
```json
{
  "@neondatabase/serverless": "^0.9.0",
  "drizzle-orm": "^0.28.0",
  "drizzle-kit": "^0.19.0",
  "express": "^4.18.0",
  "express-session": "^1.17.0",
  "connect-pg-simple": "^9.0.0",
  "bcrypt": "^5.1.0",
  "zod": "^3.22.0"
}
```

### 3. Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "@tanstack/react-query": "^4.35.0",
  "wouter": "^2.11.0",
  "tailwindcss": "^3.3.0",
  "@radix-ui/react-*": "^1.0.0",
  "zod": "^3.22.0"
}
```

### 4. Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-session-secret-key
```

## Features Included

### Invoice Management
- Create, edit, delete invoices
- Line item management with oil & gas industry fields
- Status tracking (draft, sent, paid, overdue)
- Professional PDF generation with company branding
- Invoice number auto-generation
- Equipment purchase description field

### Client Management
- Client information storage
- Company associations
- Contact and billing address management
- Client selection for invoices

### Master Invoice System
- Monthly invoice aggregation
- Client-specific master invoices
- PDF generation for master invoices
- Comprehensive reporting

### Authentication
- Custom username/password authentication
- Session-based authentication with PostgreSQL storage
- Role-based access control (admin/user)
- Password hashing with bcrypt

### Dashboard Analytics
- Invoice statistics (active, outstanding, paid)
- Client count tracking
- Recent invoice display
- Quick action buttons

## Technical Specifications

### Database Schema
- **Users**: Authentication, roles, billing rates
- **Clients**: Customer information, company associations
- **Companies**: Company details, default company settings
- **Invoices**: Invoice headers with dates, totals, status
- **Invoice Items**: Line items with oil & gas specific fields
- **Time Tickets**: Time tracking with detailed service information
- **Sessions**: PostgreSQL-backed session storage

### API Endpoints
- **Authentication**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/user`
- **Invoices**: CRUD operations, status updates, PDF generation
- **Clients**: CRUD operations, company associations
- **Companies**: CRUD operations, default company management
- **Dashboard**: Statistics and recent data
- **Master Invoices**: Monthly aggregation, client-specific reports

### Frontend Architecture
- **React 18** with TypeScript
- **TanStack Query** for server state management
- **Wouter** for routing
- **Tailwind CSS** with custom TekToro design system
- **Radix UI** for accessible components
- **Zod** for form validation

## Authentication Flow
1. User submits credentials
2. Server validates against PostgreSQL
3. Session created and stored in database
4. User state managed by React Query
5. Protected routes require authentication

## PDF Generation
- HTML-to-PDF conversion using browser print API
- Professional invoice templates
- Company logo and branding
- Line item details with oil & gas fields
- Master invoice aggregation

## Styling Theme
- **Primary**: Green (#22C55E) - TekToro brand color
- **Background**: Dark navy (#1E293B) - Professional dark theme
- **Cards**: Charcoal (#2D3748) - Content areas
- **Text**: Light (#F8FAFC) - High contrast readability
- **Borders**: Gray (#4A5568) - Subtle separation

## Migration Steps

### 1. Database Migration
```bash
# Create database schema
npm run db:push

# Or use the provided SQL schema
psql -d your_database -f schema.sql
```

### 2. Backend Setup
```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start server
npm run dev
```

### 3. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Build for production
npm run build

# Start development server
npm run dev
```

### 4. Initial Data
```bash
# Create admin user
npm run seed:admin

# Import sample data (optional)
npm run seed:sample
```

## File Structure
```
project/
├── shared/
│   └── schema.ts                 # Database schema and types
├── server/
│   ├── db.ts                     # Database connection
│   ├── storage.ts                # Database operations
│   ├── routes.ts                 # API endpoints
│   ├── customAuth.ts             # Authentication
│   └── index.ts                  # Server entry point
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── invoices/         # Invoice components
│   │   ├── pages/
│   │   │   ├── dashboard.tsx     # Dashboard page
│   │   │   └── invoices.tsx      # Invoice management
│   │   ├── lib/
│   │   │   ├── queryClient.ts    # API client
│   │   │   └── pdf.ts            # PDF generation
│   │   └── hooks/
│   │       └── useAuth.ts        # Authentication hook
│   └── index.css                 # TekToro styling
└── package.json                  # Dependencies
```

## Oil & Gas Industry Features
- **AFE Numbers**: Authorization for Expenditure tracking
- **Well Information**: Well names and numbers
- **Service Points**: Location-specific service tracking
- **Job Codes**: Internal and client job coding
- **Equipment Descriptions**: Detailed equipment tracking
- **Service Descriptions**: Comprehensive service documentation

## Customization Options
- Company branding and logos
- Invoice templates and layouts
- Color scheme and styling
- Field configurations
- Workflow customization

## Security Features
- Password hashing with bcrypt
- Session-based authentication
- Role-based access control
- SQL injection prevention
- XSS protection
- CSRF protection

## Performance Optimizations
- Database query optimization
- React Query caching
- Lazy loading components
- Optimized PDF generation
- Responsive design

## Support and Maintenance
- Comprehensive error handling
- Logging and monitoring
- Database backup strategies
- Version control best practices
- Testing recommendations

---

This migration package provides everything needed to replicate the TekToro invoicing system with full functionality, professional styling, and industry-specific features for oil & gas operations.