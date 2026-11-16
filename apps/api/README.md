# @venture-studio/api

Unified Production Backend Application for the Autonomous Venture Studio.

## Architecture
Consolidates all domain modules into a single, high-performance Modular Monolith:
* **Ideation**: Workflow A ("Surprise Me"), Workflow B ("Clarifier" & "Validator"), Trend Scout & Caching.
* **Research**: Grounded Reddit, Hacker News Algolia, and multi-engine Search Harvester.
* **Agent Runtime**: 8-Agent Swarm (Architect, Backend, UI, Content, Integrator, QA, Reviewer, Deployer).
* **Workflow**: Run state machine & DAG stage coordinator.
* **Realtime**: Server-Sent Events (SSE) `/api/stream` for live agent logs and visual QA snapshots.
* **Health**: `/health` & `/ready` endpoints.

## Local Development
```bash
pnpm api:dev
```

## Production Build & Run
```bash
pnpm api:build
pnpm api:start
```

