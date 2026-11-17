# @venture-studio/api

Unified Production Modular Monolith for the Autonomous Venture Studio.

## Architecture

All backend capabilities are encapsulated as first-class domain feature modules located inside:
`apps/api/src/modules/`

Inside each module, features are developed independently with their own routes and services:

```
apps/api/src/modules/
├── ads/                 # Meta Marketing ad copy, dynamic carousels, target audiences
├── agent-runtime/       # 8-Agent Swarm build coordinator (Architect -> Deployer)
├── analytics/           # Studio telemetry, venture metrics, and MRR aggregates
├── api-admin/           # Admin console operations, credit grants, system stats
├── api-user/            # User studio controller, venture list, dashboard
├── assistant/           # Ember Copilot conversational refiner and code assistant
├── audit/               # Compliance audit trail and security event logs
├── auth/                # Session management, authentication, and RBAC
├── billing/             # Token-backed plans (Starter, Founder, Syndicate) & credits
├── company-payments/    # Stripe Connect onboarding & merchant payment rails
├── deployer/            # Edge deployments and custom subdomain allocation
├── documents/           # PRD generation, OpenAPI export, and terms drafting
├── email/               # Transactional email dispatcher and SPF/DKIM verification
├── health/              # /health & /ready probes
├── ideation/            # Workflow A ("Surprise Me") & Workflow B (Clarifier & Validator)
├── media/               # Dynamic SVG vector badges and social preview generation
├── model-gateway/       # Multi-tier LLM gateway (Fast, Reasoner, Coder, Writer, Vision)
├── moderation/          # Ethical, safety, and restricted keyword scanning
├── notifications/       # User notification center and real-time alerts
├── platform-config/     # Feature flags, credit costs, and engine configuration
├── realtime/            # Server-Sent Events broker (/api/stream)
├── research/            # Reddit & Hacker News pain point harvesters & search router
├── sandbox/             # Safe filesystem hydration & isolated code execution
├── social/              # X/Twitter launch threads & build-in-public devlogs
├── tasks/               # Background asynchronous processing queue
└── workflow/            # Run lifecycle state machine & stage orchestrator
```

## Running the Server

```powershell
# Development mode with hot-reloading
pnpm --filter @venture-studio/api dev

# Production build & start
pnpm --filter @venture-studio/api build
pnpm --filter @venture-studio/api start
```

## Verifying All Modules

```powershell
npx tsx scripts/test-apps-api.ts
```
