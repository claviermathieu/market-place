# ADR-004 — Use MDX within Next.js over Docusaurus

**Status:** Accepted

## Context

The project needed documentation — architecture, API reference, app contracts, build logs,
and an AI interaction guide. We needed a documentation system that:
- Is accessible at `/docs` within the same app (not a separate site)
- Supports rich content: code blocks, callouts, interactive components
- Doesn't require a separate deployment or a second frontend container
- Can be extended with custom React components

Alternatives considered:
- **Docusaurus** — excellent documentation framework, but runs as a separate Node.js app on a different port. Adds a fourth Docker service. Documentation becomes a separate deployment concern.
- **Plain Markdown in Next.js** — simple, but no component support. Can't embed `<Callout>` or `<EndpointCard>` components inline.
- **Notion / Confluence / GitBook** — external services with different auth models. Can't be self-hosted alongside the app.
- **MDX via `@next/mdx`** — MDX pages integrate directly into the Next.js pages router. Documentation lives at `/docs/*` within the same app, same deployment, same container.

## Decision

Use `@next/mdx` with the Next.js pages router.

Each MDX file in `frontend/pages/docs/` becomes a route at `/docs/[filename]`.
Custom components (`DocsLayout`, `Callout`, `CodeBlock`, `EndpointCard`) are imported
in each MDX file's frontmatter using the layout export pattern:

```mdx
import DocsLayout from '../../../components/docs/DocsLayout'
import Callout from '../../../components/docs/Callout'

export default function Layout({ children }) {
  return <DocsLayout title="Page Title">{children}</DocsLayout>
}

# Page content here
```

## Consequences

**Easier:**
- Docs are in the same Git repo as the code — they change together
- No additional Docker service or port mapping needed
- Custom React components (callouts, endpoint cards, JSON trees) work inline
- The DocsLayout sidebar auto-generates prev/next navigation from a static nav array

**Harder:**
- MDX v2 parses JSX in prose text — bare `{...}` outside code blocks is interpreted as a JavaScript expression and causes build failures. Use `(...)` for math or wrap in backticks.
- Cannot use ESM-only rehype plugins (like `rehype-highlight`) in `next.config.js` because it's CommonJS. Syntax highlighting must be implemented via inline CSS classes.
- Sub-directory MDX pages (`pages/docs/build-log/*.mdx`) need `../../../` import paths to reach components — this is fragile if the directory structure changes.

## What we learned

**The `rehype-highlight` problem:** The first attempt used `rehypePlugins: [require('rehype-highlight')]`
in `next.config.js`. This caused a `unified` error: "Expected usable value but received an empty preset."
Root cause: `rehype-highlight` v7 is ESM-only; `require()` in a CJS module returns an empty object,
which `unified` can't use as a plugin. Solution: remove it entirely. Code block styling is now handled
via a `<style>` tag injected in DocsLayout's `<Head>`.

**The peer dependency problem:** `@next/mdx` requires `@mdx-js/loader` as an explicit peer dependency
that npm does not install automatically. Adding `@next/mdx` without also adding `@mdx-js/loader`
to `package.json` caused a build failure: "Cannot find module '@mdx-js/loader'".
