# Kollokvie.no - Architecture Documentation

## Package Diagram

```mermaid
graph TB
    subgraph "Frontend - Next.js App"
        subgraph "Pages Layer"
            Dashboard[📊 Dashboard<br/>User's emner overview]
            Profile[👤 Profile<br/>User settings & deletion]
            EmnerList[📚 Emner List<br/>All subjects]
            EmneDetail[📝 Emne Dashboard<br/>Subject details]
            Settings[⚙️ Emne Settings<br/>Deletion & config]
            Meetings[📅 Meetings<br/>Scheduling & notes]
        end
        
        subgraph "Component Library"
            Navigation[Navigation<br/>GlobalNav & EmneNav]
            EmnerComponents[Emner Components<br/>Deletion, etc.]
            MeetingComponents[Meeting Components<br/>Agenda, Notes, Leaders]
            UserComponents[User Components<br/>Deletion, etc.]
            AIComponents[AI Components<br/>Document Generator]
        end
        
        subgraph "Services Layer"
            SupabaseClient[Supabase Client<br/>Browser-side DB]
            SupabaseServer[Supabase Server<br/>Server-side DB]
            AIService[AI Service<br/>Document generation]
        end
    end
    
    subgraph "Backend - Supabase"
        subgraph "Database Tables"
            EmneTable[(emne<br/>Subjects)]
            EmneMembersTable[(emne_members<br/>Memberships)]
            MeetingsTable[(meetings)]
            TasksTable[(tasks)]
            ContributionsTable[(contributions)]
        end
        
        subgraph "Database Functions"
            CreateEmne[create_emne_with_membership<br/>Creates emne + membership]
            DeleteEmne[delete_emne<br/>Deletes emne + cascades]
        end
        
        AuthService[Supabase Auth<br/>User authentication]
    end
    
    subgraph "External Services"
        BankID[BankID<br/>Norwegian authentication]
    end
    
    %% User Interactions
    Dashboard --> EmneList
    Dashboard --> Profile
    EmneList --> EmneDetail
    EmneDetail --> Settings
    EmneDetail --> Meetings
    
    %% Component Usage
    Dashboard --> Navigation
    EmneDetail --> Navigation
    Settings --> EmneComponents
    Meetings --> MeetingComponents
    Profile --> UserComponents
    EmneDetail --> AIComponents
    
    %% Data Access
    Dashboard --> SupabaseServer
    EmneList --> SupabaseServer
    Settings --> SupabaseServer
    Meetings --> SupabaseServer
    
    %% Function Calls
    EmneDetail --> CreateEmne
    Settings --> DeleteEmne
    
    %% Backend
    SupabaseServer --> EmneTable
    SupabaseServer --> EmneMembersTable
    SupabaseServer --> MeetingsTable
    SupabaseServer --> TasksTable
    SupabaseServer --> ContributionsTable
    
    %% Auth Flow
    SupabaseClient --> AuthService
    SupabaseServer --> AuthService
    AuthService --> BankID
    
    %% Styling
    classDef pageStyle fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef componentStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef serviceStyle fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef dbStyle fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    
    class Dashboard,Profile,EmnerList,EmneDetail,Settings,Meetings pageStyle
    class Navigation,EmnerComponents,MeetingComponents,UserComponents,AIComponents componentStyle
    class SupabaseClient,SupabaseServer,AIService serviceStyle
    class EmneTable,EmneMembersTable,MeetingsTable,TasksTable,ContributionsTable dbStyle
```

## System Layers

```mermaid
graph TB
    subgraph "Layer 1: Presentation Layer"
        P1[Next.js App Router<br/>page.tsx files]
        P2[React Components<br/>Reusable UI]
    end
    
    subgraph "Layer 2: Application Layer"
        A1[Business Logic<br/>Services & Utils]
        A2[Type Definitions<br/>TypeScript types]
    end
    
    subgraph "Layer 3: Infrastructure Layer"
        I1[(Supabase Database)]
        I2[Supabase Auth]
        I3[External APIs]
    end
    
    P1 --> P2
    P2 --> A1
    A1 --> A2
    A1 --> I1
    A1 --> I2
    I2 --> I3
    
    classDef layer1 fill:#e3f2fd,stroke:#0277bd,stroke-width:3px
    classDef layer2 fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    classDef layer3 fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    
    class P1,P2 layer1
    class A1,A2 layer2
    class I1,I2,I3 layer3
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant EmneDetail
    participant Supabase
    participant Database
    
    User->>Dashboard: Login
    Dashboard->>Supabase: Authenticate
    Supabase-->>Dashboard: Session
    Dashboard->>Database: Fetch emner
    Database-->>Dashboard: Emner list
    Dashboard-->>User: Display emner
    
    User->>EmneDetail: Click on emne
    EmneDetail->>Database: Fetch emne data
    Database-->>EmneDetail: Emne details
    EmneDetail->>Database: Fetch meetings
    Database-->>EmneDetail: Meetings list
    EmneDetail-->>User: Display emne dashboard
    
    User->>EmneDetail: Create meeting
    EmneDetail->>Database: Insert meeting
    Database-->>EmneDetail: Meeting created
    EmneDetail-->>User: Display new meeting
```

## Key Features by Module

- **Authentication**: Supabase Auth + BankID integration
- **Dashboard**: User overview and navigation
- **Emner**: Subject-based collaborative learning
- **Meetings**: Schedule, agenda, rotating leadership
- **Knowledge Base**: AI-powered document generation
- **Tasks**: Task management per emne
- **User Management**: Profile, deletion, settings

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + BankID
- **AI**: Mock AI service (extensible)


