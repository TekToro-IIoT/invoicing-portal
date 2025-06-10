# How to Clone TekToro Invoice Application

Since the fork button isn't available, here's how to manually recreate this application:

## Method 1: Create New Repl and Copy Files

### Step 1: Create New Repl
1. Go to your Replit dashboard
2. Click "Create Repl"
3. Choose "Node.js" template
4. Name it "TekToro-Invoice-Clone" or similar

### Step 2: Set Up Database
1. In your new Repl, go to Tools → Database
2. Select "PostgreSQL" to add a database
3. This will add DATABASE_URL to your environment

### Step 3: Copy Package Configuration
Copy this content into your new `package.json`:

```json
{
  "name": "tektoro-invoice-clone",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@neondatabase/serverless": "^0.9.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-query": "^5.0.0",
    "@types/bcrypt": "^5.0.2",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.17.10",
    "@types/memoizee": "^0.4.11",
    "@types/node": "^20.0.0",
    "@types/nodemailer": "^6.4.14",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/ws": "^8.5.10",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "bcrypt": "^5.1.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "cmdk": "^0.2.0",
    "connect-pg-simple": "^9.0.1",
    "date-fns": "^3.0.0",
    "drizzle-kit": "^0.20.0",
    "drizzle-orm": "^0.29.0",
    "drizzle-zod": "^0.5.1",
    "embla-carousel-react": "^8.0.0",
    "esbuild": "^0.19.0",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "express-session": "^1.17.3",
    "framer-motion": "^10.16.0",
    "html2canvas": "^1.4.1",
    "input-otp": "^1.2.4",
    "jspdf": "^2.5.1",
    "lucide-react": "^0.344.0",
    "memoizee": "^0.4.15",
    "memorystore": "^1.6.7",
    "next-themes": "^0.2.1",
    "nodemailer": "^6.9.8",
    "openid-client": "^5.6.4",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "postcss": "^8.4.32",
    "react": "^18.2.0",
    "react-day-picker": "^8.10.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.0",
    "react-icons": "^4.12.0",
    "react-resizable-panels": "^0.0.55",
    "recharts": "^2.9.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^4.6.0",
    "tw-animate-css": "^0.2.1",
    "typescript": "^5.3.0",
    "vaul": "^0.9.0",
    "vite": "^5.0.0",
    "winston": "^3.11.0",
    "wouter": "^3.0.0",
    "ws": "^8.16.0",
    "zod": "^3.22.0",
    "zod-validation-error": "^2.1.0"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.10"
  }
}
```

### Step 4: Create Folder Structure
Create these folders in your new Repl:
- `client/`
- `client/src/`
- `client/src/components/`
- `client/src/pages/`
- `client/src/lib/`
- `client/src/hooks/`
- `server/`
- `shared/`

### Step 5: Copy Files
You'll need to copy the content of each file from this Repl. Key files to copy:

**Root files:**
- `vite.config.ts`
- `tailwind.config.ts` 
- `drizzle.config.ts`
- `tsconfig.json`
- `postcss.config.js`
- `components.json`

**Client files:** (copy all files from client/src/)
**Server files:** (copy all files from server/)
**Shared files:** (copy all files from shared/)

### Step 6: Set Up Workflows
Create `.replit` file with:
```
run = "npm run dev"

[deployment]
run = ["sh", "-c", "npm run build"]
```

## Method 2: Use Migration Package

Instead of copying everything, you can use the migration package I created:

1. Create new Node.js Repl
2. Set up basic React + Express structure
3. Copy components from `migration-components.tsx`
4. Copy API functions from `migration-api.ts` 
5. Copy schemas from `migration-schemas.ts`
6. Copy utilities from `migration-utils.ts`
7. Apply styling from `tektoro-styles-package.md`

This method gives you the core functionality without needing to copy every single file.

## Method 3: Manual Recreation Guide

If you want to build it step by step:

1. **Set up basic full-stack app** (React + Express + PostgreSQL)
2. **Add authentication system** using the auth setup
3. **Create database schema** from shared/schema.ts
4. **Build invoice components** using the migration files
5. **Add PDF generation** using the utilities
6. **Apply TekToro styling** using the style package

Would you like me to help you with any of these methods?