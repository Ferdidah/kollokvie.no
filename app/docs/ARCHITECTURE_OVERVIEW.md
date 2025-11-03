# Kollokvie.no - High-Level Architecture

## Overview

Kollokvie.no is a **Next.js 15** web application using the **App Router** architecture, with **Supabase** as the backend-as-a-service platform for authentication and database management.

## Architecture Stack

```
┌─────────────────────────────────────────────────┐
│           Browser (Client-Side)                   │
│  ┌──────────────────────────────────────────┐   │
│  │  Next.js 15 App Router                   │   │
│  │  - React Server Components (RSC)         │   │
│  │  - Client Components (Interactive UI)    │   │
│  │  - Server Actions                         │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                      │
                      │ HTTP/HTTPS
                      │ API Calls
                      ▼
┌─────────────────────────────────────────────────┐
│           Supabase Backend Platform              │
│  ┌──────────────────────────────────────────┐   │
│  │  Supabase Auth                           │   │
│  │  - Email/Password                        │   │
│  │  - BankID Integration (Future)           │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │  PostgreSQL Database                     │   │
│  │  - Row Level Security (RLS)              │   │
│  │  - Database Functions (RPC)              │   │
│  │  - Real-time Subscriptions               │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Frontend Architecture

### **Next.js 15 App Router**
- **Framework**: Next.js 15 with App Router (file-based routing)
- **Rendering**: Hybrid rendering
  - Server Components: Default, data fetching on server
  - Client Components: Interactive UI with `'use client'`
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### **Key Frontend Layers**

1. **Pages Layer** (`app/`)
   - Route handlers (page.tsx files)
   - Server-side data fetching
   - Authentication checks
   - Redirects and navigation

2. **Components Layer** (`components/`)
   - Reusable UI components
   - Client components for interactivity
   - Navigation components (GlobalNav, EmneNav)
   - Feature components (meetings, AI, user management)

3. **Services Layer** (`utils/`, `lib/`)
   - Supabase client utilities (client.ts, server.ts)
   - AI service layer (ai-service.ts)
   - Type definitions (database.ts)

## Backend Architecture

### **Supabase Platform**

**Database Layer**
- PostgreSQL database with tables:
  - `emne` - Subjects/courses
  - `emne_members` - User memberships
  - `meetings` - Scheduled meetings
  - `agenda_items` - Meeting agenda
  - `tasks` - Task management
  - `contributions` - User contributions
  - `master_documents` - Knowledge base docs

**Security Layer**
- Row Level Security (RLS) policies
- User authentication via Supabase Auth
- Secure function execution (SECURITY DEFINER)

**Database Functions (RPC)**
- `create_emne_with_membership()` - Creates emne + adds creator as admin
- `delete_emne()` - Safely deletes emne with cascade

### **Authentication**
- Supabase Auth (email/password)
- Session management via cookies
- Server-side and client-side auth checks
- BankID integration planned for Norwegian market

## Data Flow

```
User Request
    │
    ▼
Next.js Page (Server Component)
    │
    ├─► Server-Side Supabase Client
    │       │
    │       └─► Supabase API
    │               │
    │               └─► PostgreSQL (with RLS)
    │
    └─► Render Page with Data
            │
            └─► Client Components (if needed)
                    │
                    └─► Client-Side Supabase Client
                            │
                            └─► Real-time Updates
```

## Key Architectural Patterns

### **1. Server-First Architecture**
- Default to Server Components
- Data fetching on server (better security, SEO)
- Client Components only when needed (forms, interactivity)

### **2. Supabase Integration Pattern**
- **Server-side**: `createClient()` from `@/utils/supabase/server`
  - Uses cookies for authentication
  - Runs on server, secure
- **Client-side**: `createClient()` from `@/utils/supabase/client`
  - Browser-side operations
  - Real-time subscriptions

### **3. Route Protection Pattern**
```typescript
// Server Component
const user = await supabase.auth.getUser()
if (!user) redirect('/login')
```

### **4. Database Access Pattern**
```typescript
// Server Component
const { data } = await supabase
  .from('emne')
  .select('*')
  .eq('user_id', user.id)
```

## Module Structure

### **Core Modules**

**Dashboard Module** (`/dashboard`)
- User overview
- Navigation hub
- Profile management

**Emner Module** (`/emner`)
- Subject-based organization
- Main collaborative learning space
- Nested routing for emne-specific features

**Meetings Module** (`/emner/[emneId]/mote`)
- Meeting scheduling
- Agenda management
- Rotating leadership system

**Knowledge Base Module** (`/emner/[emneId]/kunnskapsbank`)
- Document storage
- AI-powered document generation
- Document viewing

### **Shared Modules**

**Navigation**
- Global navigation (all pages)
- Emne-specific navigation (within emne context)

**User Management**
- Profile settings
- Account deletion
- User preferences

**AI Services**
- Document generation (mock service, extensible)
- Future: AI workflow automation

## Security Architecture

### **Multi-Layer Security**

1. **Authentication Layer**
   - Supabase Auth handles all authentication
   - JWT tokens stored in HTTP-only cookies
   - Server-side session validation

2. **Authorization Layer (RLS)**
   - Database-level security via Row Level Security
   - Policies enforce access control
   - Prevents unauthorized data access

3. **Application Layer**
   - Server Components validate auth before rendering
   - Client Components make authenticated API calls
   - Input validation and sanitization

## Deployment Architecture

```
┌─────────────────────┐
│   CDN/Vercel Edge   │
│   (Static Assets)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Vercel/Next.js     │
│  (Server Runtime)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Supabase Platform  │
│  (Database + Auth)  │
└─────────────────────┘
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Next.js 15 | React framework with App Router |
| **UI Library** | React | Component library |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Language** | TypeScript | Type-safe JavaScript |
| **Backend** | Supabase | BaaS (Database + Auth) |
| **Database** | PostgreSQL | Relational database (via Supabase) |
| **Authentication** | Supabase Auth | User authentication |
| **Hosting** | Vercel | Next.js deployment platform |

## Design Principles

1. **Server-First**: Maximize Server Components for performance and security
2. **Type Safety**: TypeScript throughout, typed database schemas
3. **Security by Default**: RLS policies, server-side validation
4. **Modular Design**: Clear separation of concerns, reusable components
5. **Scalable Architecture**: Ready for growth with Supabase infrastructure

## Future Considerations

- **BankID Integration**: Norwegian national ID authentication
- **Real-time Features**: Supabase real-time subscriptions for live updates
- **AI Enhancement**: Replace mock AI service with production AI
- **File Storage**: Supabase Storage for document attachments
- **Analytics**: User behavior tracking and analytics

