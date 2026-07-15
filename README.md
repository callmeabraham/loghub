# LogHub — AI Intake Assistant

**Live demo:** [loghub-six.vercel.app](https://loghub-six.vercel.app/)
**Case:** CITO first-round case study — Vertical AI Hub for logistics/moving companies (LogHub)

LogHub is a customer-facing **AI Intake Assistant**, powered underneath by a grounded, source-cited knowledge layer. The product a customer sees is intake — a chat that qualifies a real move and drafts a structured request. The knowledge base is what makes that intake trustworthy: every answer is grounded in specific sources and never invented.

This repo is the thin, real slice of that product built for one vertical: a German moving/logistics company ("LogHub Spedition GmbH," a demo firm).

## What it does

- **Grounded Q&A** — answers customer questions using only its knowledge base, citing the specific source for every claim. Try: *"Can you move a piano from Hamburg to Berlin?"*
- **Intake capture** — recognizes when a customer is describing a real move, asks for whatever's missing (dates, volume, insurance, special items), and produces a structured **Draft Move Request** once it has enough. Try: *"I'm moving from Hamburg to Munich next month."*
- **Bilingual** — mirrors the customer's language (German or English) on every turn.

## Why intake, not just knowledge

A generic Q&A bot answers questions. What a moving company actually needs upstream of its dispatch software is a **qualified, structured job** — not just an answer. LogHub doesn't replace a TMS (e.g. Soloplan, Cargonet); it sits **upstream** of one: the TMS dispatches jobs, LogHub is what turns a raw inbound inquiry into a job worth dispatching. Knowledge grounding is what makes that intake trustworthy enough for a firm to actually rely on instead of a human always double-checking it.

## Knowledge base — two tiers

- **`lib/knowledge/company/`** (the primary layer, ~60% of the corpus) — the demo firm's own operational knowledge: pricing, services, insurance/special-item coverage, cancellation policy, parking permits, availability, crew sizing, international moves.
- **`lib/knowledge/regulatory/`** (the fallback layer) — real, cited German/EU logistics law and standards: the CMR Convention, ADR dangerous-goods basics, EU cabotage & customs rules, AMÖ standard moving terms, and HGB freight/moving-contract law.

The assistant prefers company sources and only reaches into regulatory sources when the company knowledge doesn't cover a question, or the question is explicitly legal (e.g. liability limits, cross-border rules).

## Architecture

- **Next.js (App Router) + TypeScript**, deployed on Vercel, Node.js runtime (not Edge — the knowledge base is read from local files at request time).
- **Retrieval** (`lib/retrieval.ts`): the markdown knowledge base is chunked by heading and indexed with a lexical/TF-IDF scorer (German-aware: diacritic normalization, a small EN/DE synonym bridge, compound-word prefix matching). No vector database, no second API key — the corpus is small enough that this is both simpler and fully sufficient.
- **API route** (`app/api/chat/route.ts`): retrieves the top matching chunks for each turn, builds a system prompt instructing the model to answer only from those chunks and cite them, streams the response via the Anthropic SDK (`claude-sonnet-5`), and returns the retrieval-derived source list in an `X-Sources` header — **citation badges are rendered from retrieval, not parsed from the model's own text**, so what's shown as "sources" is always accurate to what was actually retrieved.
- **Draft Move Request**: when the system prompt's intake instructions are satisfied, the model emits a fenced ` ```move-request ` block that the UI detects and renders as a structured card, separate from the conversational text.

## Run locally

```bash
npm install
cp .env.local.example .env.local   # then add your own ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

1. Import this repo into Vercel.
2. Set the `ANTHROPIC_API_KEY` environment variable in the Vercel project settings.
3. Deploy — no other configuration needed.

## What's next

This MVP covers two of the three blocks in the full "Vertical AI Hub" vision (see the in-app roadmap widget): **Intake** and **Knowledge**. Not built here: **Workflow** (turning a confirmed move into a scheduled job), **Quote generation** (an actual priced, sendable quote), **Dispatch integration** (pushing qualified jobs into a TMS), and **CRM sync**. See `memo/one-pager.md` for the proposed first 30 days.

## Related documents

- [`memo/investment-memo.md`](memo/investment-memo.md) — beachhead, market, ICP, wedge, moat, unit economics, Go/No-Go
- [`memo/one-pager.md`](memo/one-pager.md) — first product to build, first 30 days
