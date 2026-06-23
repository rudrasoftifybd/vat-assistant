# ভ্যাট ও কমপ্লায়েন্স সহায়ক | VAT & Compliance Assistant

A full-stack VAT compliance SaaS for Bangladeshi businesses built with Next.js 16 + Supabase. Supports 63 official Mushak forms, NBR-form VAT returns, invoicing, refunds, ADR, agent management, compliance tracking, live e-VAT integration, and enterprise security.

## Features

- **Authentication** — Email/password login & signup with org creation + demo login
- **Client Management** — CRUD with BIN, TIN, business type, turnover tracking
- **Mushak Forms Library** — 63 official forms with dynamic form builder, auto-fill from client data, auto-fill from registers (9.1), validation, draft/submit/archive status, PDF download, admin form restrictions
- **VAT Returns (Mushak 9.1)** — Monthly returns with auto-calculation, surcharge, late fees, status tracking, NBR JSON payload generation
- **Turnover Tax (Mushak 9.2)** — 3% on gross turnover for < BDT 50L businesses
- **Tax Invoices (Mushak 6.3)** — Sequential invoice numbers, line items, auto-VAT, credit/debit adjustment reconciliation
- **Purchase Register (Mushak 6.1)** — Record purchases with Excel export
- **Sales Register (Mushak 6.2)** — Record sales with Excel export
- **VAT Refunds (Mushak 10.1/10.2)** — Diplomatic & tourist refund request management with status workflow
- **VAT Agents (Mushak 3)** — Agent registry with license tracking, assignment
- **ADR Cases** — Appeal, mediation & arbitration case management with resolution workflow
- **Compliance Calendar** — Deadline tracking, mark-complete, overdue alerts
- **Document Management** — Upload/download per client with Supabase Storage
- **Reports & Analytics** — KPI dashboard with chart trends, Excel export
- **Audit Log** — Full mutation trail with user/resource/action tracking
- **Real-Time** — Live Supabase Realtime event stream
- **e-VAT Integration** — Live NBR gateway with retry logic, token management, webhook HMAC verification, status polling, two-way sync
- **Email Notifications** — Resend-powered deadline reminders (Edge Function + Vercel cron)
- **i18n** — Bangla (primary) + English with Zustand-persisted language store
- **PWA** — Offline caching service worker, install prompt
- **Apple-Inspired UI** — Clean typographic design with Action Blue accent, pill-shaped buttons, frosted navigation, hairline borders, card-based layout
- **Security** — CSP/HSTS headers in proxy.ts, Upstash rate limiting on API routes, RLS on all tables, role-based form access (admin/viewer)

## Tech Stack

- **Frontend:** Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4 + Shadcn UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State:** Zustand (client) + React Query (server)
- **Forms:** Dynamic form builder with 63 JSON-defined schemas
- **PDF:** @react-pdf/renderer
- **Validation:** Zod v4
- **Email:** Resend
- **Charts:** Recharts
- **Excel:** xlsx
- **Rate Limiting:** Upstash Ratelimit + Vercel KV
- **Package Manager:** pnpm
- **Design:** Apple-inspired design system (Inter font, Action Blue #0066cc, pill CTAs, parchment canvas, frosted nav bar)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Supabase project

### Setup

```bash
pnpm install
cp .env.example .env.local
# Edit .env.local with Supabase URL, anon key, and optional:
#   RESEND_API_KEY               - for email notifications
#   NBR_EVAT_API_URL             - live NBR gateway (default: simulation)
#   NBR_CLIENT_ID / SECRET       - NBR API credentials
#   NBR_WEBHOOK_SECRET           - webhook signature verification
#   UPSTASH_REDIS_REST_URL/TOKEN - for rate limiting
#   CRON_SECRET                  - protect cron endpoints

# Run ALL migrations in order:
# supabase/migrations/00001_initial_schema.sql
# supabase/migrations/00002_phase2_schema.sql
# supabase/migrations/00003_phase3_schema.sql
# supabase/migrations/00004_forms_schema.sql

pnpm dev
```

### Demo Login

| Email | Password |
|---|---|
| `admin@taxflow.com` | `Admin@123` |

Click "ডেমো লগইন (admin / admin)" on the login page.

## Project Structure

```
app/
├── (auth)/                 # Login & signup
├── (dashboard)/
│   └── dashboard/          # All dashboard pages
│       ├── clients/        # Client CRUD
│       ├── forms/          # Mushak Forms Library (63 forms + form builder)
│       ├── vat/returns/    # Mushak 9.1
│       ├── vat/invoices/   # Mushak 6.3
│       ├── purchases/      # Mushak 6.1
│       ├── sales/          # Mushak 6.2
│       ├── turnover-tax/   # Mushak 9.2
│       ├── refunds/        # Mushak 10.1/10.2
│       ├── agents/         # Mushak 3
│       ├── adr/            # Appeal/mediation/arbitration
│       ├── compliance/     # Calendar
│       ├── documents/      # File manager
│       ├── reports/        # KPI + Excel export
│       ├── audit/          # Audit trail
│       ├── real-time/      # Live events
│       └── settings/       # Language & profile
├── api/
│   ├── submit-vat/         # VAT submission API (rate-limited, live NBR)
│   ├── cron/
│   │   ├── check-deadlines/    # Daily deadline reminder cron
│   │   └── check-submissions/  # Every 30min NBR status sync
│   └── webhooks/evat/      # e-VAT NBR webhook receiver (HMAC verified)
├── components/
│   ├── forms/              # FormBuilder, FormField (dynamic form renderer)
│   ├── shared/             # AppleNav, Sidebar, Providers, ErrorBoundary, PWAPrompt
│   └── ui/                 # Apple-styled atoms (pill buttons, 18px cards, frosted dialog)
├── lib/
│   ├── forms/              # schema.ts (63 form schemas), definitions.ts, pdf-generator.tsx, auto-fill.ts
│   ├── supabase/           # client.ts, server.ts, proxy.ts
│   ├── translations/       # bn.json, en.json, index.ts
│   ├── vat-calculations.ts # Rules 26-30, 35-36, 41, payload generator
│   ├── evat-integration.ts # Live NBR API client + retry + webhook + status sync
│   ├── validations.ts      # Zod v4 schemas
│   ├── mutations.ts        # withToast() wrapper
│   ├── email.ts            # Resend service
│   ├── audit.ts            # logAudit() utility
│   ├── rate-limit.ts       # Upstash sliding window
│   ├── realtime-collab.ts  # Supabase Realtime subscription helper
│   └── utils.ts            # cn(), formatCurrency(), formatDate()
├── store/
│   ├── use-auth.ts         # Auth/user store
│   ├── use-language.ts     # i18n store (default: bn)
│   └── use-role.ts         # Role/permission store (admin/manager/accountant/viewer)
├── types/database.ts       # All TS interfaces (14+ tables)
├── supabase/
│   ├── migrations/         # 4 migration files
│   ├── functions/          # Edge Function (deadline reminders)
│   └── seed.sql            # Demo data
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker
└── proxy.ts                # Next.js 16 middleware (auth guard + security headers)
```

## Routes

| Route | Module |
|---|---|
| `/dashboard` | KPI dashboard with chart trend & quick actions |
| `/dashboard/clients` | Client list |
| `/dashboard/clients/new` | Add client |
| `/dashboard/clients/[id]` | Edit client |
| `/dashboard/forms` | Mushak Forms Library (63 forms, categorized) |
| `/dashboard/forms/[formId]` | Form builder & filler (with register auto-fill for 9.1) |
| `/dashboard/vat/returns` | VAT returns (9.1) |
| `/dashboard/vat/invoices` | Invoices (6.3) |
| `/dashboard/purchases` | Purchase register (6.1) |
| `/dashboard/sales` | Sales register (6.2) |
| `/dashboard/turnover-tax` | Turnover tax (9.2) |
| `/dashboard/refunds` | Refund requests (10.1/10.2) |
| `/dashboard/agents` | VAT agents (3) |
| `/dashboard/adr` | ADR cases |
| `/dashboard/compliance` | Compliance calendar |
| `/dashboard/documents` | Document management |
| `/dashboard/reports` | Reports & analytics |
| `/dashboard/audit` | Audit log |
| `/dashboard/real-time` | Real-time events |
| `/dashboard/settings` | Language & profile |

## Database

Four migrations in `supabase/migrations/`:

| Migration | Tables Added |
|---|---|
| `00001_initial_schema.sql` | organizations, profiles, clients, vat_returns, invoices, adjustments, register_entries, compliance_tasks, documents |
| `00002_phase2_schema.sql` | surcharge/late fee/credit note fields, turnover tax flag, notification tracking |
| `00003_phase3_schema.sql` | refund_requests, vat_agents, agent_assignments, adr_cases, audit_logs, e-VAT fields on vat_returns |
| `00004_forms_schema.sql` | filled_forms (JSONB form data storage) |

RLS enabled on all tables with org-level isolation (no recursive profile policies).

## Design System

Apple-inspired design language:

| Token | Value | Usage |
|---|---|---|
| Action Blue | `#0066cc` | All buttons, links, focus rings |
| Near-Black Ink | `#1d1d1f` | Body text, headings |
| Parchment Canvas | `#f5f5f7` | Page background, alternating sections |
| Pure White | `#ffffff` | Cards, inputs |
| Hairline | `#e0e0e0` | Borders, dividers |
| Font | Inter, 17px body | Typography with negative letter-spacing |
| Card Radius | 18px | Utility cards, dialogs |
| Pill Radius | 9999px | Primary CTAs, inputs, badges |
| Nav Height | 44px black bar + 52px frosted sub-nav | Persistent top navigation |
| Elevation | No shadows | Border-only separation |

## Mushak Forms Coverage

**63 forms** across 9 categories:

| Category | Count | Examples |
|---|---|---|
| Registration | 6 | 2.1, 2.2, 2.4, 2.5, 2.6, 2.7 |
| Invoices & Registers | 9 | 6.1–6.9 |
| Returns | 4 | 9.1–9.4 |
| Refunds | 3 | 10.1, 10.2, 10.3 |
| Agents | 3 | 3.1, 3.3, 3.4 |
| ADR | 3 | 17.1, 17.2, 17.3 |
| Adjustments | 4 | 4.1, 4.2, 6.6, 7.1 |
| Enforcement & Investigation | 22 | 12.1–12.13, 14.1–14.8, 16.1 |
| Miscellaneous | 9 | 18.1–18.6, 12.7, 12.8, 16.2 |

Admin-restricted forms (27) hidden from non-admin users.

## e-VAT Integration

- **Simulation mode** (default) — logs payload, no external call
- **Live mode** — set `NBR_EVAT_API_URL` + credentials for real NBR gateway
- **Retry** — 3 attempts with exponential backoff, auto token refresh on 401
- **Webhook** — HMAC-SHA256 signature verification, status mapping (accepted/paid/rejected/pending)
- **Two-way sync** — `/api/cron/check-submissions` polls every 30min, updates `evat_status`, `paid_at`, `status`

## Auto-Fill from Registers (Mushak 9.1)

When filling a 9.1 VAT return form:
1. Select a client
2. Choose the return period (month/year)
3. Click "রেজিস্টার থেকে পূরণ"
4. System aggregates all sales register entries → fills `total_sales`, `output_tax`, `vatable_sales`
5. Aggregates purchase register entries → fills `total_purchases`, `input_tax`, `vatable_purchases`
6. Auto-calculates `net_vat` and `amount_due`

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `RESEND_API_KEY` | No | Email notifications |
| `NBR_EVAT_API_URL` | No | Live NBR gateway (default: simulation) |
| `NBR_CLIENT_ID` | No | NBR API client ID |
| `NBR_CLIENT_SECRET` | No | NBR API client secret |
| `NBR_WEBHOOK_SECRET` | No | Webhook signature verification |
| `UPSTASH_REDIS_REST_URL` | No | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Rate limiting |
| `CRON_SECRET` | No | Protect cron endpoints |
| `SIMULATION_MODE` | No | e-VAT simulation (default: true) |

## Deployment

```bash
pnpm build
vercel --prod
```
