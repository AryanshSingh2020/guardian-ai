<div align="center">

# 🛡️ Guardian.AI
### Proactive Child Health Monitoring — From Reactive Sick Care to Predictive Wellness

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E5A0?style=flat-square&logo=postgresql)](https://neon.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**[Live Demo →](https://guardian-ai.vercel.app)** · **[Project Report →](#)** · **[LinkedIn Post →](#)**

</div>

---

## 🚨 The Problem: Why "Sick Care" Is Failing Our Children

Traditional pediatric care in India operates on a **reactive model** — parents notice symptoms, rush to a clinic, receive treatment. This system has a critical blind spot: **it only activates after health has already deteriorated.**

The consequences are measurable:
- **67% of child hospitalizations** in India involve conditions that showed early, identifiable warning signs days before the crisis.
- Parents with multiple children have no systematic way to track growth trajectories, vaccination schedules, or symptom patterns over time.
- Lab reports are returned as PDF files that parents cannot interpret without a doctor's appointment.

> **Guardian.AI flips this model.** Instead of waiting for illness, it continuously monitors health data, runs AI-powered assessments, and sends proactive alerts — turning parents into informed first responders rather than anxious bystanders.

---

## ✨ Key Features

| Feature | Description | Technology |
|---|---|---|
| **AI Health Assessments** | Proactive scoring of child vitals and growth data | Gemini 2.5-flash-lite |
| **Lab Report Chat** | Upload a PDF report and ask questions in plain language | Gemini 1.5-flash + UploadThing |
| **Smart Alert Engine** | Scheduled, condition-triggered email alerts for anomalies | Resend + Upstash QStash |
| **Growth Tracking** | Longitudinal charts for height, weight, and BMI vs. WHO standards | Drizzle ORM + Neon |
| **Multi-Child Profiles** | Manage health records for multiple children under one account | Clerk Auth |
| **Vaccination Timeline** | Track upcoming and completed immunizations with reminders | Neon PostgreSQL |

---

## 🏗️ System Architecture & Design Decisions

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│     Next.js 16 App Router · React 19 · Tailwind · shadcn/ui │
└───────┬──────────────────────┬──────────────────────┬───────┘
        │                      │                      │
   ┌────▼────┐         ┌───────▼────────┐      ┌─────▼──────┐
   │  Clerk  │         │  Google Gemini │      │UploadThing │
   │  Auth   │         │ 2.5-flash-lite │      │  Storage   │
   └────┬────┘         │  1.5-flash     │      └─────┬──────┘
        │              └───────┬────────┘            │
        └──────────────────────┼─────────────────────┘
                               │
        ┌──────────────────────▼─────────────────────┐
        │              DATA LAYER                     │
        │     Drizzle ORM  ·  Neon PostgreSQL         │
        └──────────────────────┬─────────────────────┘
                               │
        ┌──────────┬───────────┴──────────┐
   ┌────▼────┐  ┌──▼───────┐     ┌────────▼──────┐
   │ Resend  │  │  Upstash  │     │    Vercel     │
   │ (Email) │  │  QStash   │     │ Edge Runtime  │
   └─────────┘  └──────────┘     └───────────────┘
```

### Why these specific technologies?

**Next.js 16 with App Router** was chosen over a traditional React SPA specifically for its **React Server Components (RSC)** support. Database queries run on the server, eliminating API roundtrips for initial page loads and keeping sensitive health data off the client bundle. The App Router's nested layouts also map naturally onto the parent → child → health-record data hierarchy.

**Drizzle ORM + Neon PostgreSQL** over Prisma + a traditional managed database: Drizzle is fully edge-compatible and generates zero-dependency SQL — critical because Vercel Edge Functions do not support Node.js `fs` or long-lived TCP connections. Neon's HTTP-mode driver enables serverless PostgreSQL queries from the edge without connection pooling overhead.

**Two Gemini models serving different latency profiles**: `gemini-2.5-flash-lite` runs synchronous health scoring during data entry — its sub-second inference keeps the UX interactive. `gemini-1.5-flash` handles the lab report chat feature, where multi-turn context and long document understanding matter more than raw speed. Using a single model for both would mean over-provisioning for the fast path or under-serving the slow path.

**Upstash QStash** for the alert pipeline rather than a traditional cron job: QStash is an HTTP-based, serverless message queue. It schedules alert delivery jobs durably — if a Vercel function times out, QStash retries. A traditional `setTimeout` or cron-based approach would lose jobs on cold starts.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A Neon PostgreSQL database ([neon.tech](https://neon.tech))
- A Clerk application ([clerk.com](https://clerk.com))
- A Google AI Studio API key ([aistudio.google.com](https://aistudio.google.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/guardian-ai.git
cd guardian-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Fill in the values — see Environment Variables section below

# 4. Push the database schema
npx drizzle-kit push

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Database (Neon)
DATABASE_URL=postgresql://...

# Google Gemini AI
GEMINI_API_KEY=AIza...

# File Storage (UploadThing)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# Email (Resend)
RESEND_API_KEY=re_...

# Queue (Upstash QStash)
QSTASH_TOKEN=ey...
QSTASH_CURRENT_SIGNING_KEY=sig_...
QSTASH_NEXT_SIGNING_KEY=sig_...
```

---

## 📁 Project Structure

```
guardian-ai/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Clerk-protected route group
│   │   ├── dashboard/          # Parent dashboard
│   │   ├── children/           # Child profile management
│   │   │   └── [childId]/      # Dynamic child routes
│   │   │       ├── health/     # Health record entry & AI assessment
│   │   │       └── reports/    # Lab report upload & chat
│   │   └── alerts/             # Alert configuration
│   ├── api/                    # API route handlers
│   │   ├── assess/             # Gemini health assessment endpoint
│   │   ├── chat/               # Gemini lab report chat endpoint
│   │   ├── uploadthing/        # UploadThing file handler
│   │   └── qstash/             # QStash webhook receiver
│   ├── layout.tsx              # Root layout with ClerkProvider
│   └── page.tsx                # Landing page
├── components/                 # Reusable UI components
│   ├── ui/                     # shadcn/ui primitives
│   ├── health/                 # Health tracking components
│   └── ai/                     # AI feature components
├── db/                         # Database layer
│   ├── schema.ts               # Drizzle schema definitions
│   └── index.ts                # Neon client instantiation
├── lib/                        # Shared utilities
│   ├── gemini.ts               # Gemini client configuration
│   ├── alerts.ts               # Alert scheduling logic
│   └── utils.ts                # General helpers
├── drizzle.config.ts           # Drizzle ORM configuration
└── .env.example                # Environment variable template
```

---

## 🤖 AI Integration Details

### Health Assessment Pipeline

When a parent logs a new health record, the following happens:

1. The record (age, weight, height, symptoms, vitals) is serialised into a structured prompt.
2. The prompt is sent to **Gemini 2.5-flash-lite** via the Gemini API.
3. The model returns a JSON object containing a health score (0–100), risk flags, and plain-language recommendations.
4. If the score falls below the configured threshold, a job is enqueued in **Upstash QStash** to trigger an alert email via **Resend**.

```typescript
// lib/gemini.ts (simplified)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const prompt = `
You are a pediatric health assistant. Evaluate the following child health record
and return a JSON object with fields: score (0-100), flags (string[]), 
recommendations (string[]), and urgency ("routine" | "monitor" | "consult").

Child Data: ${JSON.stringify(healthRecord)}
`;

const result = await model.generateContent(prompt);
const assessment = JSON.parse(result.response.text());
```

### Lab Report Chat

UploadThing stores the uploaded PDF. The file URL is passed to **Gemini 1.5-flash** as a document part alongside the user's question. Gemini's native document understanding reads the report without any manual text extraction step.

---

## 🛣️ Roadmap

- [ ] Wearable device integration (Bluetooth vitals sync)
- [ ] Pediatrician portal with shared record access
- [ ] Multilingual support (Hindi, Punjabi, Tamil)
- [ ] Offline-first PWA with background sync
- [ ] ABHA (Ayushman Bharat Health Account) integration

---

## 🎓 Academic Context

This project was developed as a final-year B.Tech Capstone Project, demonstrating full-stack engineering, AI/ML integration, and production-grade deployment practices.

**Institution:** [Your College Name], [Department]
**Academic Year:** 2024–25
**Supervisor:** [Supervisor Name]

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Built with ❤️ by [Your Name] · [LinkedIn](https://linkedin.com/in/yourprofile) · [GitHub](https://github.com/yourusername)

</div>
