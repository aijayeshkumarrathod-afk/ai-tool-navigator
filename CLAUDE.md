# Project: AI Navigator — Find the Best AI Tool for Any Use Case

A use-case-first AI tool discovery platform. Users describe what they want to do, and the platform recommends the best AI tool(s) with reasoning, live web-grounded context, and cited sources.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API routes (serverless)
- **Database**: Supabase (PostgreSQL) — tools, use cases, votes, categories
- **AI Layer**: OpenRouter API
- **Deployment**: Vercel

## Commands

- `npm run dev` — Start dev server (port 3000)
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run db:migrate` — Run Supabase migrations
- `npm run db:seed` — Seed initial tools + use-case mapping data

## Architecture

```
/app
  /page.tsx                 → Homepage with use-case search input
  /tool/[slug]/page.tsx     → Individual tool detail page
  /compare/page.tsx         → Side-by-side tool comparison
  /api/recommend/route.ts   → Perplexity Sonar API use-case → tool mapping
  /api/vote/route.ts        → Community upvote/downvote endpoint
/components
  /ui                       → Reusable shadcn/ui components
  /tools                    → ToolCard, ToolList, CompareTable
  /search                   → UseCaseSearchBox, ResultsPanel
  /citations                → CitationBadge (render Perplexity source citations)
/lib
  /supabase.ts              → DB client
  /openrouter.ts            → OpenRouter API client + prompt templates
  /tools-data.ts            → Static seed data for tools
/supabase
  /migrations               → SQL migration files
  /seed.sql                 → Initial tool + use-case data
```

## OpenRouter API Integration

**Base URL**: `https://openrouter.ai/api/v1`
**Model**: `nousresearch/nous-hermes-2-mixtral-8x7b-sft` (or a similar free model you choose)
**Auth**: Bearer token via `OPENROUTER_API_KEY` in `.env.local`
**SDK**: OpenAI-compatible — use `openai` npm package pointed to OpenRouter endpoint

### `/lib/openrouter.ts` must handle:
- Initialize OpenAI client with `baseURL: "https://openrouter.ai/api/v1"` and `apiKey: process.env.OPENROUTER_API_KEY`
- Send use-case classification prompt to a selected free model
- Parse `choices[0].message.content` for tool recommendations
- Export a single `getToolRecommendations(useCase: string)` async function

### System Prompt Template (in `/lib/openrouter.ts`):
```
You are an AI tool recommendation expert. 
Given a user's use case, return the top 3 AI tools that best accomplish it.
For each tool return: name, why it's the best fit, output quality note, and official URL.
Be concise. Format as JSON array: [{name, reason, quality_note, url}]
Base your answer on current, real-world tool capabilities.
```


## Database Schema (Key Tables)

- `tools` — id, name, slug, description, url, logo_url, category, pricing_type
- `use_cases` — id, label, description, category
- `tool_use_case_rankings` — tool_id, use_case_id, rank, reason, votes
- `categories` — id, name, slug (Presentations, Coding, Social Media, Writing, Image Gen, Video, Research, Automation)

## Core User Flow

1. User types a use case in plain English (e.g., "make a pitch deck")
2. `/api/recommend` sends query to OpenRouter API → returns top tools
3. Frontend displays ranked tool cards with reasoning, quality note
4. User can upvote/downvote recommendations to improve community rankings over time

## Environment Variables

```
OPENROUTER_API_KEY=          # From OpenRouter
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Code Style

- TypeScript strict mode — no `any` types
- Named exports only, no default exports
- Tailwind utility classes — no custom CSS files
- Components: functional only, no class components
- API responses: always return `{ data, error }` shape

## Iteration Philosophy

**Phase 1 (Current)**: Supabase tool database + OpenRouter-powered use-case matching + basic voting
**Phase 2**: Output sample previews per tool; `sonar-deep-research` for in-depth tool analysis pages
**Phase 3**: User accounts, saved tools, personalized recommendations
**Phase 4**: API access for developers, affiliate integrations, tool submission portal

Only build what's needed for the current phase. Do NOT over-engineer ahead.

## Important Rules

- NEVER hardcode `OPENROUTER_API_KEY` — `.env.local` only, never committed
- All OpenRouter prompts live in `/lib/openrouter.ts` — never scattered in route handlers
- `/api/recommend` must always return at least 2 tool options, never just 1
- All new tools must have a corresponding `tool_use_case_rankings` seed entry
- Do NOT call Perplexity API on every keystroke — only on form submit or debounced (500ms min)

## Phase 1 MVP Checklist (Status: In Progress)

- [x] Homepage with use-case search input (`src/app/page.tsx`)
- [x] `/lib/openrouter.ts` — OpenRouter API client with `getToolRecommendations()`
- [x] `/api/recommend/route.ts` — API route calling OpenRouter + returning tools
- [x] Supabase schema + seed with 30 tools across 8 categories (`supabase/migrations/0001_initial_schema.sql`)
- [x] Tool result cards with citations (`src/components/tools/ToolCard.tsx`)
- [x] Category browse section (fallback) (`src/app/page.tsx`)
- [ ] Basic upvote on tool recommendations (UI built, API `/api/vote` pending)

## Current Implementation Details

- **Search**: `UseCaseSearchBox` handles the input and calls `/api/recommend`. It includes debouncing and loading states.
- **AI Integration**: `getToolRecommendations` in `/lib/openrouter.ts` uses OpenRouter to return a JSON array of tools.
- **Data Flow**: `page.tsx` maintains the search results state and maps them to `ToolCard` components.
- **Database**: Supabase is initialized in `/lib/supabase.ts`. Migration `0001` sets up `tools`, `categories`, and `tool_use_case_rankings`.

## Reference Docs

- Supabase docs: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com

## Final Rule

This is an MVP to verify the workflow.

Always prioritize:
- simplicity
- end-to-end execution
- visible outputs
- low complexity
- fast iteration

Do not overengineer.
