# Project Architecture: AI Navigator

## Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenRouter API

## Key Components
- `src/lib/openrouter.ts`: Handles communication with OpenRouter API and prompt engineering.
- `src/app/api/recommend/route.ts`: Endpoint that processes user use-cases.
- `src/components/search/UseCaseSearchBox.tsx`: The primary user interface for tool discovery.
- `src/components/tools/ToolCard.tsx`: Renders tool recommendations with citations and voting UI.

## Database Schema
- `tools`: Metadata about AI tools.
- `categories`: Tool classifications (Coding, Writing, etc.).
- `tool_use_case_rankings`: Mapping between tools and specific use cases with rankings and votes.
