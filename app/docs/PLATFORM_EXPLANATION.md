# How Kollokvie.no Works

## 🎯 What is Kollokvie.no?

**Kollokvie.no** is an AI-powered collaborative learning platform designed for Norwegian study groups (kollokviegrupper). It helps students organize, structure, and optimize their group study sessions.

**Core Purpose**: Transform unstructured study groups into organized, efficient learning communities with AI assistance.

---

## 🏗️ Core Concepts

### **Emne (Subject/Course)**
- The primary organizational unit
- Represents a subject or course (e.g., "MAT121 - Linear Algebra")
- Contains all group activities: meetings, tasks, notes, documents
- Each emne has:
  - Title, code, description
  - Learning goals
  - Members with roles (admin, member, leader)
  - AI settings for customization

### **Membership & Roles**
- Users join emner as members
- **Roles**:
  - `admin`: Can manage emne settings, add/remove members
  - `member`: Can participate in meetings, add contributions
  - `leader`: Rotating meeting leadership (assigned per meeting)

### **Contributions**
- All user-generated content within an emne:
  - **Notes**: Meeting notes, study notes
  - **Questions**: Discussion questions
  - **Insights**: Key learnings and realizations
  - **Summaries**: Meeting summaries

### **Master Documents**
- AI-generated knowledge base documents
- Synthesizes all contributions into structured documents
- Types:
  - Master documents (comprehensive synthesis)
  - Discussion questions
  - Knowledge gap analysis

---

## 🔄 How It Works: User Flow

### 1. **Authentication**
```
User → Login Page → Supabase Auth → Session Created → Dashboard
```
- Users log in with email/password
- Future: BankID integration for Norwegian users
- Session managed by Supabase Auth

### 2. **Dashboard Overview**
```
User → Dashboard → See:
  - Active emner (study groups)
  - Upcoming meetings
  - Recent contributions
  - Quick stats
```
- Central hub showing all user's study groups
- Quick access to recent activity

### 3. **Creating/Joining an Emne**
```
User → "New Emne" → Fill form → Create → Auto-joined as admin
```
- User creates emne with title, code, description, goals
- Creator automatically becomes admin
- Can invite others by email

### 4. **Emne Dashboard**
```
User → Select Emne → Emne Dashboard → See:
  - Quick stats (members, tasks, meetings, contributions)
  - Next meeting
  - Recent tasks
  - Recent contributions
  - Knowledge base link
```
- Overview of all emne activity
- Quick navigation to sub-sections

### 5. **Meetings**
```
User → Meetings → Create Meeting → Set:
  - Title, date, duration
  - Agenda items
  - Rotating leader (optional)
  
During Meeting:
  - Live note-taking
  - Track agenda progress
  - Assign tasks
```
- **Rotating Leadership**: Each meeting can have a different leader
- **Agenda Management**: Structured agenda items with time estimates
- **Live Notes**: Real-time collaborative note-taking

### 6. **Knowledge Base (Kunnskapsbank)**
```
User → Kunnskapsbank → See:
  - AI Document Generator
  - Existing master documents
  - Recent contributions
```
- **AI Generation**: 
  - Synthesize notes → Master document
  - Generate discussion questions
  - Analyze knowledge gaps
- **Document Storage**: All AI-generated documents stored and searchable

### 7. **Tasks**
```
User → Tasks → Create Task → Set:
  - Title, description
  - Priority (low/medium/high)
  - Due date
  - Personal or shared
```
- Task management per emne
- Personal tasks vs. shared group tasks
- Status tracking (todo, in_progress, completed)

---

## 🗄️ Data Model

### **Core Tables**

```
emne (Subjects)
├── id, title, code, description
├── created_by (user_id)
├── goals, syllabus_url
└── ai_settings (JSON)

emne_members (Memberships)
├── emne_id, user_id
├── role (admin/member/leader)
└── preferences (JSON)

meetings
├── emne_id, title, scheduled_at
├── duration_minutes, status
├── meeting_leader (user_id)
└── notes, agenda

agenda_items
├── meeting_id, title, description
├── order_index, estimated_minutes
└── status (pending/in_progress/completed)

tasks
├── emne_id, user_id (nullable for shared)
├── title, description, status, priority
└── due_date, completed_at

contributions
├── emne_id, meeting_id (optional)
├── user_id, title, content
├── type (note/question/insight/summary)
└── tags (JSON)

master_documents
├── emne_id, title, content
├── version, generated_at
├── ai_prompt, source_contributions
└── created_at, updated_at
```

### **Relationships**
- One emne → Many members
- One emne → Many meetings
- One meeting → Many agenda items
- One emne → Many tasks
- One emne → Many contributions
- One emne → Many master documents

---

## 🤖 AI Integration

### **How AI Works**

1. **User triggers generation**:
   - Selects type (synthesize/questions/analysis)
   - Optionally adds custom prompt
   - Clicks "Generer med AI"

2. **Backend processing**:
   ```
   API Route → Fetch contributions → Build context → 
   Call OpenAI API → Parse response → Save to database
   ```

3. **AI Prompts**:
   - **System Prompt**: Defines AI role and guidelines (Norwegian language)
   - **User Prompt**: Contains all contributions and context
   - **Custom Prompt**: User's specific instructions

4. **Output**:
   - Structured markdown document
   - Saved to `master_documents` table
   - Linked to source contributions
   - Displayed in knowledge base

### **AI Features**
- **Synthesize Notes**: Creates comprehensive master documents
- **Generate Questions**: Creates 10-15 discussion questions
- **Analyze Gaps**: Identifies knowledge gaps and learning needs

---

## 🔐 Security & Access Control

### **Row Level Security (RLS)**
- Supabase RLS policies control data access
- Users can only see:
  - Emner they created OR are members of
  - Their own contributions
  - Meetings in their emner
  - Tasks assigned to them or shared in their emner

### **Authentication Flow**
```
1. User logs in → Supabase Auth
2. Session token stored in cookies
3. Server-side: Verify token on each request
4. Client-side: Use token for API calls
```

### **Authorization**
- **Emne Access**: Must be a member to view/edit
- **Admin Actions**: Only admins can:
  - Delete emne
  - Add/remove members
  - Change emne settings
- **Meeting Leadership**: Assigned per meeting (rotating)

---

## 🎨 Technical Architecture

### **Frontend Stack**
- **Next.js 15** with App Router
- **React Server Components** (default)
- **Client Components** (for interactivity)
- **TypeScript** for type safety
- **Tailwind CSS** for styling

### **Backend Stack**
- **Supabase**:
  - PostgreSQL database
  - Authentication service
  - Row Level Security (RLS)
  - Real-time subscriptions (future)

### **AI Stack**
- **OpenAI SDK** (GPT-4-turbo or GPT-3.5-turbo)
- **API Routes** for secure server-side calls
- **Environment variables** for API keys

### **File Structure**
```
app/src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main dashboard
│   ├── emner/              # Emne management
│   └── api/                # API routes
│       └── ai/             # AI generation endpoint
├── components/             # React components
│   ├── ai/                 # AI components
│   ├── meetings/           # Meeting components
│   └── navigation/         # Navigation components
├── lib/                    # Business logic
│   └── ai-service.ts       # AI service (legacy)
├── types/                  # TypeScript types
│   └── database.ts         # Database types
└── utils/                  # Utilities
    └── supabase/           # Supabase clients
```

---

## 🔄 Data Flow Example

### **Creating a Master Document**

```
1. User Action:
   User → Kunnskapsbank → Select "Synteser notater" → Click "Generer"

2. Frontend:
   DocumentGenerator → POST /api/ai/generate
   {
     type: "synthesize_notes",
     emneId: "uuid",
     prompt: "Fokuser på derivasjon"
   }

3. API Route:
   - Authenticate user (Supabase)
   - Verify emne membership
   - Fetch contributions from database
   - Fetch emne info (title, goals)
   - Build AI prompts
   - Call OpenAI API
   - Save result to master_documents
   - Return document ID

4. Response:
   {
     success: true,
     documentId: "uuid",
     document: {...}
   }

5. Frontend:
   - Refresh page
   - Show new document in list
   - User can click to view full document
```

---

## 🎯 Key Features Summary

### **Organization**
- ✅ Emne-based structure (one per study group)
- ✅ Member management with roles
- ✅ Task management (personal + shared)
- ✅ Meeting scheduling with agendas

### **Collaboration**
- ✅ Shared contributions (notes, questions, insights)
- ✅ Rotating meeting leadership
- ✅ Live note-taking during meetings
- ✅ Group task assignment

### **AI-Powered**
- ✅ Master document synthesis
- ✅ Discussion question generation
- ✅ Knowledge gap analysis
- ✅ Norwegian language support

### **User Experience**
- ✅ Clean, modern UI (Tailwind CSS)
- ✅ Responsive design
- ✅ Real-time updates
- ✅ Intuitive navigation

---

## 🚀 Getting Started (For Users)

1. **Sign Up/Login**: Create account or log in
2. **Create Emne**: Start a new study group
3. **Invite Members**: Add classmates by email
4. **Schedule Meeting**: Plan your first study session
5. **Take Notes**: Add contributions during/after meetings
6. **Generate Documents**: Use AI to synthesize knowledge
7. **Track Progress**: Monitor tasks and goals

---

## 🔧 For Developers

### **Setup**
```bash
# Install dependencies
npm install

# Set environment variables
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Run development server
npm run dev
```

### **Key Files**
- `app/src/app/api/ai/generate/route.ts` - AI generation endpoint
- `app/src/components/ai/DocumentGenerator.tsx` - AI UI component
- `app/src/types/database.ts` - Database type definitions
- `app/supabase/` - Database migrations and setup

### **Architecture Principles**
- **Clean Architecture**: Separation of concerns
- **Server Components First**: Default to RSC, use client components only when needed
- **Type Safety**: Full TypeScript coverage
- **Security**: RLS policies, server-side API keys

---

## 📊 Platform Statistics

- **Primary Use Case**: Norwegian university study groups
- **Target Users**: University students
- **Language**: Norwegian (Bokmål)
- **AI Model**: OpenAI GPT-4-turbo (configurable)
- **Database**: PostgreSQL (via Supabase)
- **Hosting**: Vercel (recommended)

---

**This platform transforms the way study groups collaborate, making learning more organized, efficient, and AI-enhanced!** 🎓✨

