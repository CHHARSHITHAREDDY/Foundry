.PHONY: setup up down dev test evals
setup: ; pnpm install
up:    ; pnpm infra:up
down:  ; pnpm infra:down
dev:   ; pnpm dev
test:  ; pnpm test
evals: ; pnpm evals
