<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key differences:
- `middleware.ts` is now `proxy.ts` with `export function proxy()` (can be async)
- `params`, `searchParams` are Promises — must `await` or use `use()`
- Turbopack is default
- Node.js runtime for proxy (not Edge)
<!-- END:nextjs-agent-rules -->

# VAT & Compliance Assistant — Project Context

## Tech Stack
- Next.js 16, TypeScript, Tailwind CSS v4, Shadcn UI
- Supabase (Auth, PostgreSQL, Storage, Realtime)
- Zustand (client state), React Query (server state)
- Zod v4 (validation — `.issues` not `.errors`)
- Resend (email), Upstash Ratelimit + Vercel KV (rate limiting), @react-pdf/renderer (PDF)
- Recharts (charts), xlsx (Excel export)
- pnpm

## Apple-Inspired Design System
- **Colors**: Action Blue `#0066cc` (all interactive elements), Near-Black Ink `#1d1d1f` (text), Parchment `#f5f5f7` (background), Pure White (cards), Hairline `#e0e0e0` (borders)
- **Typography**: Inter font, 17px body, negative letter-spacing on headlines, weight 600 for display, weight 400 for body
- **Shapes**: `rounded-[9999px]` for pill CTAs/inputs/badges, `rounded-[18px]` for cards/dialogs, `rounded-[8px]` for utility buttons
- **Elevation**: Zero shadows on UI — hairline borders provide separation. One shadow reserved for product imagery.
- **Navigation**: 44px true-black top bar (AppleNav) + 52px frosted sub-nav with page title + 240px sidebar with grouped sections

## Key Patterns
- All pages use `"use client"` (MVP simplicity)
- Bangla is primary language (`language: "bn"` default in store); all UI text uses `language === "bn" ? "বাংলা" : "English"` pattern
- Supabase browser client from `@/lib/supabase/client`
- Language from `useLanguageStore` (Zustand + persist)
- Translations via `t("key", language)` from `@/lib/translations`
- All labels/buttons/errors in Bangla by default
- Toast notifications via `sonner` (Apple-styled)
- Excel export via `xlsx` (real `.xlsx` files)
- Security headers set in `proxy.ts`
- `transform: scale(0.95)` as active/press state on all buttons

## Important Files
- `proxy.ts` — Auth middleware + CSP/HSTS/Permissions-Policy headers
- `components/shared/apple-nav.tsx` — 44px black top nav bar with mobile hamburger + 52px frosted sub-nav
- `components/shared/sidebar.tsx` — Clean 240px left nav with grouped sections (Main/VAT/Management/Other)
- `components/ui/button.tsx` — 7 Apple variants: primary (blue pill), secondary-pill, dark-utility, pearl-capsule, ghost, outline, destructive, link
- `components/ui/card.tsx` — 18px radius, hairline border, 24px padding Apple-style cards
- `components/ui/badge.tsx` — Pill-shaped badges with success/warning/destructive/outline/neutral
- `components/ui/input.tsx` — 44px height pill inputs with blue focus ring
- `components/ui/select.tsx` — Pill-shaped selects matching input style
- `components/ui/table.tsx` — 18px radius container, parchment header, 15px body
- `components/ui/dialog.tsx` — 18px radius, backdrop blur, clean header/footer
- `components/ui/skeleton.tsx` — TableSkeleton, KPISkeleton
- `lib/supabase/client.ts` — Browser Supabase client
- `lib/supabase/proxy.ts` — Server client for proxy
- `lib/supabase/server.ts` — Server client for API routes
- `lib/translations/` — `bn.json`, `en.json`, `index.ts` (`t()` helper defaults to `"bn"`)
- `lib/vat-calculations.ts` — Rules 26-30, 35-36, 41; Mushak 9.1/9.2 payload generators
- `lib/evat-integration.ts` — Live NBR API client with retry, webhook handler, status sync, two-way submission tracking
- `lib/email.ts` — Resend (lazy-initialized to avoid build crash)
- `lib/mutations.ts` — `withToast()` wrapper
- `lib/validations.ts` — Zod v4 schemas
- `lib/audit.ts` — `logAudit()` utility
- `lib/rate-limit.ts` — Upstash sliding window
- `lib/realtime-collab.ts` — Supabase Realtime subscription helper
- `lib/utils.ts` — `cn()`, `formatCurrency()`, `formatDate()`, `generateInvoiceNumber()`, `calculateVAT()`
- `lib/forms/` — `schema.ts` (63 form schemas), `definitions.ts` (form metadata), `pdf-generator.tsx` (PDF generation), `auto-fill.ts` (register aggregation for 9.1)
- `store/use-auth.ts` — Auth/user store
- `store/use-language.ts` — i18n store (defaults to `"bn"`)
- `store/use-role.ts` — Role/permission store (admin, manager, accountant, viewer)
- `app/globals.css` — Apple theme tokens: action-blue, ink, canvas-parchment, hairline, pill/apple-card/apple-section utilities

## Navigation Architecture
- **AppleNav** (always visible at top): 44px black bar with app name (left), language switcher + profile dropdown (right). On mobile (<768px), hamburger menu opens full-height overlay nav with all routes.
- **Frosted Sub-nav** (below AppleNav): 52px bar showing current page title in Apple tagline style (21px/600), with admin badge on right.
- **Sidebar** (hidden on mobile): 240px left panel with grouped nav: Main (Dashboard, Clients, Forms), VAT collapsible (Returns, Invoices, Purchases, Sales, Turnover Tax), Management (Refunds, Agents, ADR), Other (Compliance, Documents, Reports, Audit, Real-Time, Settings).

## Routes
All dashboard pages under `/dashboard/*`. Auth pages at `/login`, `/signup`.

Dashboard routes: clients, forms (63-form library with builder + 9.1 register auto-fill), vat/returns, vat/invoices, purchases, sales, turnover-tax, refunds, agents, adr, compliance, documents, reports, audit, real-time, settings.

## DB Tables (14+)
organizations, profiles, clients, vat_returns, invoices, compliance_tasks, documents, adjustments, register_entries, refund_requests, vat_agents, agent_assignments, adr_cases, audit_logs, filled_forms

## Migrations (in order)
1. `supabase/migrations/00001_initial_schema.sql` — Core 9 tables + RLS + Storage
2. `supabase/migrations/00002_phase2_schema.sql` — Surcharge, late fee, credit notes, turnover tax, notification fields
3. `supabase/migrations/00003_phase3_schema.sql` — Refunds, agents, ADR, audit_logs, e-VAT fields on vat_returns
4. `supabase/migrations/00004_forms_schema.sql` — filled_forms JSONB table + RLS

## Mushak Forms (63 total)
- Registration: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7
- Invoices/Registers: 6.1–6.9
- Returns: 9.1–9.4
- Refunds: 10.1, 10.2, 10.3
- Agents: 3.1, 3.3, 3.4
- ADR: 17.1, 17.2, 17.3
- Adjustments: 4.1, 4.2, 6.6, 7.1
- Enforcement: 12.1–12.13, 14.1–14.8, 16.1, 16.2, 12.7, 12.8
- Misc: 18.1–18.6

27 admin forms hidden from non-admin users via `role !== "admin"` check in forms list page.

## Auto-Fill from Registers (lib/forms/auto-fill.ts)
- `autoFillFromRegisters(clientId, orgId, periodMonth, periodYear)` — queries `register_entries` for given client/period, aggregates sales → total_sales/output_tax/vatable_sales, purchases → total_purchases/input_tax/vatable_purchases
- Auto-calculates net_vat (output - input) and amount_due
- Only available for mushak-9.1 form; shows month/year selectors + "রেজিস্টার থেকে পূরণ" button

## e-VAT Integration
- `submitVatReturn()` — simulation (default) or live NBR with retry (3 attempts, exponential backoff, auto token refresh)
- `checkSubmissionStatus()` — poll NBR and update DB (evat_status, paid_at, status)
- `syncPendingSubmissions()` — batch sync up to 50 pending returns
- `handleWebhook()` — HMAC-SHA256 signature verification, maps accepted/paid/rejected/pending
- Cron: `/api/cron/check-submissions` runs every 30min
- Env: `SIMULATION_MODE`, `NBR_EVAT_API_URL`, `NBR_CLIENT_ID/SECRET`, `NBR_WEBHOOK_SECRET`, `CRON_SECRET`

## Key Gotchas
- `profiles` RLS must avoid recursive subqueries — use `id = auth.uid()` only
- Resend client must be lazy-created inside functions, not at module level
- e-VAT defaults to simulation mode (`SIMULATION_MODE=true`)
- Button variants: use `primary` (blue pill), `secondary-pill` (ghost), `pearl-capsule` (light), `dark-utility` (ink bg), `ghost`, `outline`, `destructive`, `link`
- Badge variants: `success`, `warning`, `destructive`, `outline`, `secondary`, `neutral`
- Cards use `rounded-[18px]` with `border border-[var(--hairline)]` — no shadows
- Inputs/Selects use `rounded-[9999px]` pill shape, `h-[44px]`
- `@upstash/ratelimit` and `@vercel/kv` guard with try/catch — missing env vars skip rate limiting gracefully
- Turbopack requires `catch (_)` with binding (can't use bare `catch {}`)
- `Dialog` component accepts optional `className` prop for custom styling
- All UI text must follow `language === "bn" ? "বাংলা" : "English"` pattern — Bangla is primary
