# venture-studio
Autonomous SaaS venture studio: idea (Surprise me / your own) -> validation -> approval -> agent swarm build -> live deploy.

## Quick start
    pnpm install
    cp .env.example .env        # fill INFERENCE_* with your open-model provider
    pnpm infra:up               # postgres, redis, minio, litellm, searxng
    pnpm dev

## Layout
apps/ (web = user client, admin = admin console)  services/ (microservices)  packages/ (shared libs + template)
evals/  infra/  scripts/  docs/

## Rules
1. Services never read each other's tables or import each other's code (only packages/*).
2. Contracts first: change packages/contracts, then services.
3. Code asks for a model TIER, never a model name.
4. Anything that spends money or contacts people goes through approval + budget limits.
5. Admin and user never share a token audience, signing key or BFF.
