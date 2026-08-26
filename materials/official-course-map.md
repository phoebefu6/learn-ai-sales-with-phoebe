# learn-ai-sales-with-phoebe - source map and coverage

Built 2026-08-26. Two tracks: leader (a1-a6, 6 x 45 min) and rep (b1-b10, 10 x 45 min).
Palette: warm charcoal `#2E2A27` + copper `#C0562A`. Simulator: `assets/sales-live.js`.

Fast-moving area - re-verify the Gartner figures and the benchmark reports before delivering
this course live, and re-check every compliance statement against current law with counsel.

---

## Verified facts (use these, do not invent numbers)

| Fact | Source | Where it is taught |
|---|---|---|
| Sellers who effectively partner with AI are **3.7x more likely to meet quota** (survey of 1,026 B2B sellers, Jan-Mar 2024) | Gartner press release, 2024-09-16 | b1 Part 1, a1, a2 |
| AI saves sellers **nearly 5 hours per week**, yet **72% of sales organisations fail to reinvest** that time in high-value activities | Gartner press release, 2026-05-19 | b1 Part 2, a1, a6 |
| Organisations providing **AI-enabled next best actions are 2.6x more likely** to achieve commercial growth; those emphasising **upskilling are 2.4x** more likely to see good revenue growth | Gartner press release, 2026-05-20 | a1, a4, a6 |
| Gartner predicts **AI agents will outnumber sellers 10 to 1 by 2028**, yet **fewer than 40% of sellers** will say agents improved productivity | Gartner press release, 2026-07-28 | a1, a6, b1 self-study |
| Gartner predicts that **by 2030, 75% of B2B buyers will prefer sales experiences that prioritise human interaction over AI** | Gartner press release, 2025-08-25 | b1 Part 2 (the trust line), a2, b6 |
| Platform-average B2B cold-email **reply rate about 3.43% in 2026, down from about 5.1% in 2024**; top-quartile senders 15-25% | 2025-2026 cold-email benchmark reports (Instantly, Lavender, The Digital Bloom) | b1, b3, a2 |
| **Timeline-based hooks outperform problem-based hooks by roughly 2.3x** in reply rate | 2025 cold-outbound benchmark analysis | b3 (the trigger lever weight), b2 |
| Best-performing cold emails are **under 80 words** | Hunter cold-email length analysis | b3 (the no-tells lever), b7 |
| Personalisation **depth** and small cohorts lift replies by multiples (~2.76x reported); advanced-personalisation campaigns report roughly double generic ones | 2025-2026 benchmark reports | b3 (and the token anti-lever's honest framing) |
| A **3-7-7 style cadence captures the large majority of replies by around day 10** | 2026 benchmark report | b7, b3 preview |

Benchmark caveat carried on the pages: vendor samples skew to their own users, so treat the
numbers as the shape of the curve, not gospel. The simulator states this on every render.

### Compliance regimes taught (orientation, not legal advice)

| Regime | Scope | The rule that bites | Taught in |
|---|---|---|---|
| PDPA + DNC (Singapore) | Personal data of individuals in SG; Do Not Call registry for phone/SMS | Consent or valid exception; check DNC before calling or texting | b3, a5 |
| CAN-SPAM (US) | Commercial email to US recipients | Accurate headers, no deceptive subject, physical postal address, working opt-out honoured promptly | b3, a5 |
| CASL (Canada) | Commercial electronic messages to Canadian recipients | Consent-first with limited implied-consent windows; burden of proof on sender | b3, a5 |
| GDPR (EU/UK) | Personal data of people in EU/UK | Lawful basis required; B2B legitimate interest must be documented, balanced, easy to object to | b3, a5 |
| Call-recording consent | Varies by jurisdiction and by one-party/all-party rules | Consent captured before the recording starts, not in a footer | b5, a4, a5 |

**Permanent suppression** is taught as a rail, not a preference: a prior opt-out scores zero
sends forever. It is the 8th row of the simulator sequence, capped at 0%.

---

## The simulator - `assets/sales-live.js`

Two modes on the `.salesbox` container:

- `data-mode="draft"` - one prospect (Mira Chen), the email text rewrites live as levers toggle,
  headline shows predicted reply rate + word count + levers on, plus an AI-tell count.
- `data-mode="score"` - the 8-prospect sequence with an aggregate reply rate and per-row verdicts.
- `data-levers="..."` sets which levers start ON. **An empty string is a legitimate value meaning
  all levers off** - the parser checks `=== null`, never `attr || default`.

Levers: `trigger` (x2.30) · `pain` (x1.50) · `proof` (x1.25) · `ask` (x1.20) · `human` (x1.35).
Anti-lever: `tokens` (x0.55) - never raises the rate at any rung, and fires a visible
broken-merge disaster on the Sarah Lim row. Base rate 2.2 before prospect receptivity.

### Canon numbers - VERIFIED IN-BROWSER 2026-08-26, do not restate differently

Draft mode (Mira Chen, receptivity 1.25):

| Rung | Rate | Words |
|---|---|---|
| no levers | 2.8% | 105 |
| + trigger | 6.3% | 82 |
| + pain | 9.5% | 77 |
| + proof | 11.9% | 99 |
| + ask | 14.2% | 97 |
| + no tells | **19.2%** | **71** |
| all five + ⚠ tokens | 10.6% | 114 |

Sequence mode (8 prospects, average):

| Rung | Average |
|---|---|
| no levers | 1.7% |
| + trigger | 3.6% |
| + pain | 5.2% |
| + proof | 6.4% |
| + ask | 7.6% |
| + no tells | **10.1%** |
| all five + ⚠ tokens | 5.7% |

Three rows are capped by targeting and never move: Jonas Weber (wrong seat, 1.8%),
Anna Kovac (under ICP floor, 1.2%), Marcus Hale (prior opt-out, 0.0%). The gap between
Mira's 19.2% and the sequence's 10.1% IS the lesson: reply rate is a targeting metric
wearing a copywriting costume.

---

## Per-session coverage

✓ = taught to the working core · ◐ = touched, deeper elsewhere

### Leader track

| Session | Covers | Bar |
|---|---|---|
| a1 What AI actually changes | Gartner adoption + 5-hours/72% + 3.7x + 2.6x/2.4x; the three places AI destroys trust; agent forecast | ✓ |
| a2 The evidence, in plain English | Benchmark decline 5.1 to 3.4; what lifts pipeline vs activity; 75%-by-2030 buyer prediction; how to read vendor claims | ✓ |
| a3 A forecast people believe | AI signals vs rep judgment, sandbagging, the override log, Goodhart trap on forecast accuracy | ✓ |
| a4 Enablement, coaching, ramp | Coaching from recorded calls, consent, ramp on a searchable record, upskilling 2.4x | ✓ |
| a5 The compliance rails | PDPA/DNC, CAN-SPAM, CASL, GDPR, recording consent, AI disclosure, suppression as policy | ✓ |
| a6 Rollout, adoption, comp | Stack choice, adoption without mandate, metrics that resist gaming, where the 5 hours go | ✓ |

### Rep track

| Session | Covers | Bar |
|---|---|---|
| b1 The rep's AI loop | Deal loop, trust line, five levers, both simulator modes, the productivity trap | ✓ |
| b2 Research and prospecting | ICP that excludes, trigger hunting in 6 minutes, account briefs, killing bad-fit rows | ✓ |
| b3 Outreach that lands | The full ladder, the eight tells, AI-finds-you-write split, token anti-lever, compliance rails | ✓ |
| b4 Call prep | 15-minute prep, question banks, the hypothesis you let them break | ✓ |
| b5 Live call and capture | Consent, note capture, recap within the hour, transcript vs understanding | ✓ |
| b6 Objections and positioning | Simulated-buyer rehearsal without learning to bluff, honest competitor comparison, missing stakeholder | ✓ |
| b7 Proposal, pricing, follow-up | What AI may never draft, cadence to day 10, the promise you sign | ✓ |
| b8 CRM hygiene | Fields that earn their place, auto-captured next steps, dedupe/decay, writing for your successor | ✓ |
| b9 Pipeline review | Stage definitions, killing zombie deals, honest commit, disagreeing with the model | ✓ |
| b10 Capstone | Northwind end to end, scored on every lever and rail | ✓ |

## Not covered by design

- Specific vendor certifications (Salesforce, HubSpot, Gong, Outreach, Apollo academies) - those
  stay with the vendors; this course teaches the working core that survives a tool swap.
- Building or fine-tuning models. Reps configure, they do not train.
- Legal advice. The compliance sessions are orientation and a checklist to take to counsel.
- Enterprise RevOps architecture and CPQ - adjacent, and out of scope for a 16-session course.
