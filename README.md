# Kollokvie.no

**AI-drevet plattform som strukturerer, effektiviserer og fasiliterer kollokviegrupper.**

## 🎯 Hva vi løser

Kollokviegrupper har stort potensial, men sliter ofte med:
- **Organisering**: Uklart hvem som gjør hva og når
- **Struktur**: Møter blir uformelle, ustrukturerte, ineffektive og uten tydelig agenda 
- **Kunnskapsdeling**: Notater og kunnskap forblir fragmentert og privat
- **Engasjement**: Ulik deltakelse og frafall

> Resultatet er at mye tid brukes uten at gruppen reelt bygger felles forståelse.

## 💡 Vår løsning
Kollokvie.no organiserer hele kollokviesyklusen med AI som fasilitator:
- **Delegasjonsfase**: Oppgaver og fokusområder fordeles slik at alle bidrar.
- **Forberedelsesfase**: Medlemmer laster opp notater, spørsmål og innsikter gjennom platformen.
- **Møtefase** AI genererer agenda, spørsmål og diskusjonsrunder, leder møter og sikrer struktur.
- **Etterarbeid**: Kunnskapsbank (masterdokument) oppdateres og arkiveres, sammendrag lages og neste møte planlegges.


## 🚀 Kjerne-egenskaper

- 📋 **Felles semesterplan** med oppgaver og individuelle gjøremål / fokusområder
- 🤖 **AI-spørsmålsgenerator** basert på pensum og notater
- 📚 **Masterdokument / kunnskapsbase** som samler gruppens kollektive kunnskap og innsikt
- 🔄 **Roterende lederrolle** for demokratisk arbeidsfordeling
- 📊 **Progresjonsoversikt** som viser kunnskapshull og styrker
- 💬 **Møtesammendrag** som identifiserer neste steg

## Verdien for brukerne

**Effektivitet**: Tiden i møtene brukes på diskusjon og læring – ikke organisering.

**Kollektiv læring**: AI samler individuelle bidrag til en felles kunnskapsbase som alle lærer av.

**Engasjement**: Strukturerte roller og oppgaver sikrer at alle deltar aktivt.

**Resultater**: Bedre faglig utbytte, sterkere repetisjon, og en levende masterdokumentasjon som støtter eksamensforberedelser.

**Kort fortalt:** 
Kollokvie.no gjør kollokviegrupper til en syklisk, AI-støttet læringsprosess som gir struktur, engasjement og målbare resultater – langt utover tradisjonelle, uformelle kollokviemøter.

---


### 2.2 Technology Stack with Purpose

#### **Frontend: Next.js 14 + TypeScript**
- **Purpose:** Modern React framework with server-side rendering and API routes
- **Why:** Built-in routing, API endpoints, excellent TypeScript support, Vercel optimization
- **Role in MVP:** Handles all user interfaces, server-side rendering for SEO, API layer

#### **UI Framework: shadcn/ui + Tailwind CSS**
- **Purpose:** Professional, accessible component library with consistent design
- **Why:** Pre-built components reduce development time, excellent Norwegian localization support
- **Role in MVP:** All user interface components, responsive design, dark/light mode support

#### **Authentication: Clerk**
- **Purpose:** Complete user authentication and management system
- **Why:** Social login, session management, user profiles, Norwegian localization
- **Role in MVP:** User registration, login, profile management, group membership authorization

#### **Database: Supabase (PostgreSQL + Real-time)**
- **Purpose:** Backend-as-a-Service with PostgreSQL database and real-time subscriptions
- **Why:** Managed PostgreSQL, real-time updates, row-level security, easy API generation
- **Role in MVP:** Data storage, user management sync with Clerk, real-time updates for group activities

#### **AI Integration: Vercel AI SDK + OpenAI GPT-4**
- **Purpose:** Streamlined AI model integration with streaming responses
- **Why:** Built for Next.js, handles streaming, error handling, Norwegian language support
- **Role in MVP:** Agenda generation, meeting summaries, Norwegian academic prompt processing

#### **State Management: Zustand**
- **Purpose:** Lightweight client-side state management
- **Why:** Simple API, TypeScript support, less complexity than Redux
- **Role in MVP:** Group state, user preferences, meeting cycle status

#### **Data Fetching: TanStack Query (React Query)**
- **Purpose:** Server state management with caching and synchronization
- **Why:** Automatic background refetching, optimistic updates, excellent developer experience
- **Role in MVP:** API data fetching, caching, real-time synchronization with Supabase

#### **Deployment: Vercel**
- **Purpose:** Serverless deployment with global CDN
- **Why:** Built for Next.js, automatic deployments, edge functions, Norwegian CDN nodes
- **Role in MVP:** Frontend hosting, API endpoints, continuous deployment from Git
