# Architecture Decision Records

An ADR (Architecture Decision Record) documents a significant technical decision:
what was decided, why, and what the consequences are.

## Why we write ADRs

In a project built with AI assistance, decisions can feel arbitrary — the AI proposed X,
we went with it, and now we don't know why. ADRs make those decisions legible:
- For future-you, when you've forgotten why something works the way it does
- For Claude, so it can make consistent decisions in the same spirit
- As a learning resource showing how real technical trade-offs are made

## Format

Each ADR follows this structure:
- **Status:** Accepted / Superseded by ADR-XXX / Deprecated
- **Context:** What problem we were solving and what the alternatives were
- **Decision:** What we chose and why
- **Consequences:** What got easier, what got harder, what we had to give up
- **What we learned:** Practical gotchas discovered during implementation

## Records

| ADR | Decision |
|-----|----------|
| [ADR-001](ADR-001-async-fastapi.md) | Use async FastAPI over sync |
| [ADR-002](ADR-002-jsonb-inputs.md) | Store inputs and results as JSONB |
| [ADR-003](ADR-003-websocket-polling.md) | Use WebSocket for job status |
| [ADR-004](ADR-004-mdx-docs.md) | Use MDX over Docusaurus for documentation |
| [ADR-005](ADR-005-dynamic-import.md) | Use importlib for app dispatch |
