# TekToro Invoice Management System

## Overview

This is a comprehensive invoice management system built with React, Express.js, and PostgreSQL. The application provides a professional billing solution with SCADA-inspired design elements, featuring dark theme UI optimized for industrial/professional environments.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom TekToro design system
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Custom session-based auth with bcrypt password hashing
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful API with comprehensive error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Store**: PostgreSQL table for persistent session management
- **Schema Management**: Drizzle Kit for migrations and schema changes

## Key Components

### Authentication System
- Custom username/password authentication
- Session-based authentication with persistent storage
- Role-based access control (admin/user roles)
- Password hashing with bcrypt
- Automatic session cleanup and management

### Invoice Management
- Complete CRUD operations for invoices
- PDF generation and printing capabilities
- Status tracking (draft, sent, paid, overdue)
- Line item management with automatic calculations
- Master invoice aggregation by month/client
- Professional invoice templates with company branding

### Client Management
- Client information storage and management
- Company associations and hierarchical organization
- Contact information and billing address management

### User Management
- Admin-only user profile management
- **New user creation** with comprehensive form (username, email, password, rates, role)
- **User deletion** with confirmation dialog and self-deletion protection
- Billing rate configuration per user
- Role assignment and permissions
- Credential management (username, email, password updates)
- Profile self-management for authenticated users

### Time Tracking (Prepared)
- Database schema ready for time ticket entries
- Oil & gas industry specific fields (AFE numbers, well names, etc.)
- Integration-ready with existing invoice system

## Data Flow

1. **Authentication Flow**: 
   - User submits credentials → Express validates against PostgreSQL → Session created → User state managed by React Query

2. **Invoice Creation Flow**:
   - Form submission → Validation with Zod schemas → Database persistence → PDF generation → Status tracking

3. **Dashboard Analytics**:
   - Real-time stats aggregation → PostgreSQL queries → Cached results → React Query state management

4. **PDF Generation**:
   - Invoice data → HTML template generation → Browser print API → Professional PDF output

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database operations
- **bcrypt**: Password hashing and verification
- **express-session**: Session management
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight React router

### Development Tools
- **typescript**: Type safety and development experience
- **vite**: Fast build tool and development server
- **drizzle-kit**: Database schema management

## Deployment Strategy

### Environment Configuration
- **Development**: Local PostgreSQL or Neon database
- **Production**: Neon serverless PostgreSQL
- **Session Secret**: Environment variable for session security
- **Database URL**: Connection string configuration

### Build Process
1. Frontend build with Vite (static assets)
2. Backend build with esbuild (Node.js bundle)
3. Database migrations with Drizzle Kit
4. Static file serving from Express

### Replit Deployment
- **Modules**: nodejs-20, web, postgresql-16
- **Runtime**: npm run dev for development
- **Production**: npm run build && npm run start
- **Auto-scaling**: Configured for autoscale deployment target

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **November 2, 2025**: Added complete user management (create & delete)
  - Implemented "Add New User" button on User Profiles page
  - Created comprehensive user registration form with all required fields
  - Added backend API endpoint (POST /api/admin/users) for user creation
  - Implemented storage method with bcrypt password hashing
  - Added "Delete User" functionality with confirmation dialog
  - Implemented self-deletion protection (users cannot delete their own account)
  - Backend endpoint (DELETE /api/admin/users/:id) validates and prevents self-deletion
  - Tested successfully: users can be created and deleted with proper safeguards
  
- **June 29, 2025**: Updated invoice numbering system and verified data integrity
  - Changed invoice numbering to start from INV-TDS-2025-025 instead of 002
  - Modified generation logic to continue sequence from 027 for new invoices
  - Verified 4 invoices (025-028) are correctly displayed in application
  - All invoices show authentic Headington Energy Partners LLC client data
  - PDF system maintains professional branding with real company information

## Changelog

Changelog:
- June 21, 2025. Initial setup