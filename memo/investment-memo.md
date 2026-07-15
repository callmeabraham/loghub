# LogHub — Investment & Strategy Memo

**Vertical AI Hub — beachhead: German logistics & moving companies**
CITO case study — Founders' Associate / EIR round 1

## 1. Recommendation

**Go — conditional.** Build LogHub on the "AI Intake Assistant powered by grounded company knowledge" wedge, targeting German household-moving and freight-forwarding SMEs. The condition: the first 90 days of paid pilots must explicitly test the moat hypothesis (§8) and real pricing willingness, not just prove the demo works. Details below.

## 2. Why logistics/moving, not TaxHub

CITO's own instinct was TaxHub (Steuerberater). We're deliberately picking a different beachhead:

| | TaxHub (Steuerberater) | LogHub (moving/logistics) |
|---|---|---|
| Dominant incumbent | DATEV — near-total lock-in via mandatory tax-filing infrastructure | None. No single system of record dominates intake or dispatch |
| Regulatory friction | High — individually licensed professionals, strict liability/confidentiality rules around tax advice | Low for intake/knowledge — no professional-license gate on answering "what does my move cost" |
| Integration required to matter | Must eventually touch DATEV-adjacent workflows to be more than a toy | Can win entirely upstream of any TMS, no incumbent integration required to prove value |
| Current state of the art | Still phone/email/paper for intake, but AI advice carries liability exposure | Still phone/WhatsApp/Excel for intake, advisory answers carry low liability exposure |

DATEV-style lock-in is exactly the kind of incumbent moat a thin AI wedge cannot beat head-on in a 2-hour case or a first 12-month startup. Moving/logistics has no equivalent chokepoint — which makes it a faster, lower-risk beachhead to land, even though the eventual market is smaller than tax. jupus.de's own proof point (AI secretary + intake for law firms) also transfers more directly to a services business that lives on inbound requests and dispatch than to a filing-driven tax practice.

## 3. Beachhead definition

German road-freight moving/relocation companies (Umzugsunternehmen / Möbelspeditionen) — specifically small-to-mid owner-operated firms (5–50 employees) that field inbound requests by phone/WhatsApp/email, run dispatch manually or with basic TMS software, and have no AI layer anywhere in that chain today.

## 4. Market size & structure

| Metric | Value | Source |
|---|---|---|
| German moving services market | $5.86B (2024) → $9.37B by 2033, 5.36% CAGR | DeepMarketInsights |
| Forwarding companies (Speditionen) in Germany | ~14,185 (2023) | DSLV / Statista |
| Companies in commercial road freight transport | ~46,902 (2020) | Destatis via Verkehrsrundschau |
| Broader German logistics industry | ~€300B revenue, 3M+ employees — Germany's 3rd-largest industry | Industry aggregates |
| Forwarding/logistics service providers | €123.1B turnover, 592,622 employees (2023) | DSLV |

- **TAM**: all German logistics/freight-forwarding SMEs needing intake/dispatch tooling — tens of thousands of companies.
- **SAM**: household + SME-freight movers currently running informal, unstructured intake (phone/WhatsApp/Excel) — low thousands of firms, disproportionately reachable via AMÖ (the trade association) and its several hundred organized member firms as an initial credibility/distribution channel.
- **SOM (18–24mo)**: 50–150 paying firms in the AMÖ-adjacent segment via association channel + direct outbound.

## 5. ICP

5–50 employees, one or two locations. Owner or office manager personally fields calls and qualifies leads — their time is the immediate ROI target. May already run a TMS for dispatch/routing (e.g. Soloplan, Cargonet) but has no AI layer upstream of it. AMÖ membership (or aspiration to it) is a useful proxy for process maturity and openness to structured tooling.

## 6. Willingness to pay

jupus.de is the direct proof point that professional-services SMEs will pay recurring SaaS fees for an AI secretary/intake layer. For moving companies specifically: a single missed call or slow quote turnaround typically costs a booked job (indicative German household move: roughly €500–€2,500+ depending on size/distance, per our own demo pricing model). Recovering even one or two extra bookings a month from faster, always-on intake covers a meaningful SaaS subscription many times over — a materially stronger ROI story than most vertical SaaS pitches, and one that compares favorably against the cost of hiring additional front-desk staff.

## 7. Incumbents and the gap — "upstream of TMS," not a TMS replacement

TMS/dispatch software (Soloplan, Cargonet, and similar) operates **downstream** of intake: it schedules and routes jobs that already exist as structured bookings. Nothing in the current stack owns the step before that — turning a raw inbound inquiry into a qualified, structured job. Firms do this by hand today: a person on the phone, typing into Excel or a TMS booking form.

**LogHub does not replace a TMS. It sits upstream of one.** The TMS dispatches jobs; LogHub creates the qualified job that feeds into dispatch. This is a much smaller, faster, lower-risk integration surface than displacing an incumbent system of record — which is the failure mode of most vertical-SaaS attempts against entrenched TMS/ERP-style software. jupus.de validates this pattern in an adjacent vertical: it won by owning the secretary/intake layer around an existing legal-practice stack, not by replacing practice-management software.

## 8. The wedge: intake first, knowledge underneath

The customer-facing product is the **AI Intake Assistant** — the value an owner immediately understands ("it answers calls and messages and books jobs so I don't have to"). Grounded knowledge is the engine that makes the intake assistant trustworthy enough to actually run without a human double-checking every answer — but it is not sold as a separate product. A standalone "ask our documents" Q&A tool is a much harder, more abstract sell to an SME owner than "stop missing bookings." Communication Hub (calls/WhatsApp channels) and Workflow (quote generation, dispatch integration) are the natural next blocks once intake + knowledge prove out (see one-pager).

## 9. Moat — a hypothesis, not a claimed advantage

**There is no moat today.** Model capability commoditizes quickly, and a competitor can stand up a similar RAG-based intake bot in a comparable timeframe.

**The thesis to validate**: every intake conversation accumulates firm-specific data — what customers ask, what they book, what edge cases the model had to be corrected on — that a general-purpose chatbot, or a competitor starting from zero with the same firm, cannot replicate without that same history. If true, this "compounding company memory" becomes a switching-cost and quality moat over time, the way an experienced dispatcher outperforms a new hire. This is **unproven**. It requires confirming (a) firm-specific data measurably improves answer quality or conversion, and (b) firms perceive and value that improvement enough to resist a cheaper generic alternative. Both should be tested explicitly in the first paid pilots, not assumed.

## 10. Business model & rough unit economics

- **Pricing**: per-location monthly subscription, indicatively €300–600/month, positioned well below the cost of part-time front-desk hire.
- **COGS**: primarily LLM inference cost. A grounded conversation (retrieval + prompt + response) costs a few cents at current Claude pricing; even at high volume (hundreds of conversations/month per location), inference stays a small fraction of subscription price — gross margin should comfortably clear 75–80% at moderate scale.
- **CAC**: initial motion via AMÖ/trade-association channel partnerships plus direct outbound to owner-operators, in a fragmented market with no efficient existing paid-acquisition channel — plausibly low-thousands-of-euros blended CAC per logo, payback under 12 months if retention holds.
- **LTV**: hinges directly on the moat hypothesis in §9. If firm-specific compounding is real, this is a sticky, services-labor-replacement purchase with strong retention/expansion. If not, LTV compresses toward a commodity SaaS tool with real churn risk.

## 11. Key risks

- Moat hypothesis unproven (§9) — the single biggest risk to long-term defensibility.
- Fragmented market means a high-touch, slow sales motion per logo — no single distribution chokepoint like DATEV to exploit.
- Owner-operators may be wary of AI handling customer-facing communication unsupervised — real onboarding/trust cost.
- No material regulatory gate on intake/knowledge (unlike tax advice), but liability/insurance figures still require careful accuracy guarantees given real money is at stake for customers.

## 12. Go / No-Go

**Go**, specifically: LogHub, wedge = AI Intake Assistant powered by grounded company knowledge, initial channel = AMÖ-adjacent SME movers. Condition: design the first 90 days of paid pilots explicitly to test the moat hypothesis and real conversion from free trial to €300–600/month — not merely to prove the demo works. If both hold, proceed to Workflow/Quote-generation as the second block. If the moat hypothesis fails, this is still a good business, but not a venture-scale one — worth learning cheaply and early rather than over-investing in defensibility that isn't there.
