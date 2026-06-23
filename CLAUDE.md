@AGENTS.md

## Commands
- Dev: `pnpm dev`
- Build: `pnpm build` (also serves as typecheck)
- Lint: `pnpm lint`

## Supabase Setup
1. Create project, copy URL + anon key to `.env.local`
2. Run migrations in order:
   - `supabase/migrations/00001_initial_schema.sql`
   - `supabase/migrations/00002_phase2_schema.sql`
   - `supabase/migrations/00003_phase3_schema.sql`
   - `supabase/migrations/00004_forms_schema.sql`
3. Create `documents` Storage bucket (public)
4. Create auth user `admin@taxflow.com` / `Admin@123`
5. Run `supabase/seed.sql` to insert org + profile

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

## Key Files
- `lib/evat-integration.ts` — Live NBR API (retry, webhook, status sync)
- `lib/forms/schema.ts` — All 63 form JSON schemas
- `lib/forms/definitions.ts` — Form metadata + admin restrictions
- `lib/forms/pdf-generator.tsx` — @react-pdf/renderer PDF generation
- `components/forms/FormBuilder.tsx` — Dynamic form renderer
- `app/dashboard/forms/[formId]/page.tsx` — Form filler with auto-fill
