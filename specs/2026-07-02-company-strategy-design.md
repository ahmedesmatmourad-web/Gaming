# Company-Level Strategy — Mobile Gaming Portfolio

Date: 2026-07-02
Status: Draft, pending review
Related: [Mobile Gaming Landscape Research](../research/2026-07-02-mobile-gaming-landscape-research.md)

## Context

The founder is building a mobile gaming company targeting three distinct audiences over time: kids (educational), young professionals (casual/entertainment), and idle/incremental players, monetizing via IAP and ads, launching on iOS App Store, Google Play, and HTML5/web. The founder is a **solo, non-technical, full-time** operator with an unlocked/bootstrapped budget, planning to use AI-assisted development tools rather than hiring or contracting a team upfront.

This document defines the company-level strategy: portfolio approach, sequencing, monetization philosophy, platform/tech strategy, production approach, brand structure, and success gates. Individual game specs (starting with game #1, an idle/incremental title) will be brainstormed separately once this strategy is approved.

## 1. Vision & Portfolio Approach

The company builds a portfolio of games across three audience segments using a **prove-then-invest** philosophy: rather than building all three simultaneously, each new segment/game is only funded once the prior one demonstrates real, measured traction. Games are developed and monetized independently — separate brands, separate performance tracking — but share reusable infrastructure over time (analytics setup, ad-mediation configuration, common tooling/workflows) as the studio matures. Long-term, "the company" is the operating entity and capital allocator behind the portfolio; it is not itself a consumer-facing brand.

## 2. Segment & Game Sequencing

Based on market research (see linked doc), games are built in this order, each gated on the prior game's success:

1. **Idle/incremental** — cheapest and fastest to build, ads+IAP-native monetization, strong retention characteristics, and well-suited to an AI-assisted solo build. Differentiate via a hybrid sub-genre (e.g., idle+merge or idle+RPG+social) rather than the saturated pure-clicker lane.
2. **Word/trivia** — shares idle's low-cost, cheap-UA profile (lowest CPI of all six researched segments); most viable wedge is localization into underserved languages, an area where most top incumbents (Wordscapes, Trivia Crack) are English-only.
3. **Merge** — a proven, IAP-led sub-genre of casual with real white space in non-cozy themes and merge+idle hybrids; a lower-risk entry into "casual" than competing head-on in the broader match-3 space.
4. **Casual/entertainment (broad)** — the largest market but also the most consolidated (top 1% of publishers capture ~92.5% of IAP revenue) and expensive to acquire users in; enter via a differentiated niche (e.g., underserved demographic or region) rather than a direct Royal Match/Candy Crush competitor.
5. **Life-sim/decor/cooking-sim** — attractive, distinct (largely female-skewing) audience with real HTML5 white space, but the top of the category demands years of content investment; enter via a hybrid mechanic or underserved niche once there's content capacity beyond a solo build.
6. **Educational kids** — last, since it carries the heaviest regulatory burden (COPPA amendments enforced April 2026, GDPR-K) and needs a fundamentally different, subscription-led monetization posture (ads are a weak lever here) — best tackled once there's capital, legal/compliance capacity, and brand trust built from the prior games.

## 3. Monetization Philosophy

Each game's monetization mix follows its segment's proven pattern rather than a single company-wide rule:

- **Idle, word/trivia, merge, casual** lead with a **hybrid ads+IAP model** — rewarded video as the primary ad format (highest eCPM, opt-in, least disruptive to session), with light IAP (currency, boosts, cosmetics) layered in once core retention is validated.
- **Educational kids** is a deliberate exception: **subscription-led**, with ads used only as a minor, kid-safe-network-mediated stream (e.g., SuperAwesome, Kidoz), reflecting COPPA/GDPR-K constraints on ad targeting for children found in the research.
- **Game #1 specifically** ships **ads-only at first** (simplest to implement, no payment infrastructure required), with IAP layered in only after D1/D7 retention is validated on the web build — avoiding investment in monetization infrastructure before there's evidence the core loop is worth monetizing.

## 4. Platform & Tech Strategy

Each game validates on **HTML5 first** (self-published or via an instant-play portal such as Poki or CrazyGames) before investing in iOS/Google Play builds. This is a deliberate two-stage split between *validation* and *monetization*:

- **Web = validation.** Market data confirms web engagement is a legitimate proxy for core-loop stickiness: HTML5 session lengths (Poki ~15:44, CrazyGames ~14:56) are comparable to mobile's ~17-minute average, and portals reach genuinely large audiences (Poki 100M MAU, CrazyGames 50M+ MAU) — enough scale to get a real signal cheaply and fast.
- **Mobile = monetization.** Web ARPDAU/ARPU runs roughly 3–4x lower than mobile, mainly due to infrastructure gaps (no native IAP billing, weaker ad optimization, no push notifications) rather than audience quality — so real revenue requires the mobile launch. Rewarded video alone clears $15–40 eCPM in Tier-1 markets on mobile.

Given the non-technical, AI-assisted build approach, the tech stack should favor a framework with strong web-to-mobile portability — a JS/web-based engine (e.g., Phaser, Construct) or a cross-platform engine with a solid web export (e.g., Godot) — wrapped for iOS/Android (e.g., via Capacitor) once validated, rather than maintaining separate native codebases per platform. This keeps a single AI-assisted codebase carrying each game from web validation through to mobile launch.

## 5. Production & Build Approach

Game #1 is built **solo, using AI-assisted development tools** (e.g., Claude Code or similar) rather than hiring a team or contracting a studio upfront — keeping cash spend near-zero during the validation phase. A small budget is reserved for the specific things AI tooling can't replace:

- Developer account fees (Apple ~$99/year, Google $25 one-time)
- A freelance QA/submission pass before each store launch, to catch platform-specific issues an AI-assisted non-technical founder may miss
- Specialized asset work (art/audio) beyond what AI tools can generate, if needed for polish

In parallel — without blocking game #1's timeline — the founder will informally network for a **technical co-founder**, to bring on once the portfolio approach is validated and ready to scale beyond solo capacity. This is not a blocking dependency for game #1 or #2.

**Target timeline:** 4–6 months to first mobile launch (web validation phase should be materially faster, on the order of weeks, given no store review process).

## 6. Brand Structure

Each game launches under its **own standalone brand/name**, with no visible parent-studio branding to players — standard industry practice, since kids, young professionals, and idle-game players are distinct audiences who don't need to know they share a publisher. "The company" remains a backend operating/legal entity, not a marketed brand, at least through the early portfolio-building phase.

## 7. Success Gates

Progression between games is gated by concrete, evidence-based checkpoints rather than gut feel or sunk-cost momentum:

- **Web validation gate** (before investing in the mobile build): median session length ≥ 8 minutes and Day-1 return rate ≥ 25–30%, observed across a few thousand plays on a portal.
- **Mobile launch gate** (before starting game #2): D1 retention ≥ 35–40% and D7 retention ≥ 15–18% (idle-genre benchmarks from research), plus blended ARPDAU ≥ $0.15, sustained over at least ~90 days post-launch with at least 1,000 organic/low-cost installs (enough to make the retention/ARPDAU figures statistically meaningful without requiring paid UA spend to hit the gate).

If a game misses its gate, the default response is to **iterate on that game**, not to abandon it or rush the next one prematurely. The portfolio only expands once there's real evidence a given segment/game works — capital and attention stay concentrated on one bet at a time rather than spreading thin across multiple unproven titles.

## 8. Risks & Mitigations

- **Non-technical solo founder risk**: AI-assisted development may hit limits on platform-specific complexity (store submission, performance tuning, security). Mitigated by reserving budget for a freelance QA/submission pass rather than attempting every step solo, and by pursuing a technical co-founder in parallel.
- **Web-to-mobile signal mismatch**: web validation is a proxy, not a guarantee — some mechanics that work in a browser (e.g., mouse-driven interactions) may not translate cleanly to touch. Mitigated by choosing a tech stack (Phaser/Construct/Godot) with strong mobile-input support from the start, and by treating the web build as a genuine playable prototype of the mobile game, not a separate product.
- **Segment sequencing lock-in**: market conditions in 2026 may shift by the time later segments (e.g., educational kids, launching potentially 12+ months out) are reached. Mitigated by re-running targeted market research before starting each new segment, rather than relying solely on this document's snapshot.
- **Regulatory risk in educational kids segment**: COPPA/GDPR-K compliance is non-trivial and mistakes are costly (reputational and legal). Mitigated by sequencing this segment last, after capital and experience are built up, and by budgeting for legal review specifically before that segment begins.

## Next Steps

With this strategy approved, the next step is to brainstorm the **game #1 design spec** (the idle/incremental title) — core mechanic, differentiation angle (idle+merge or idle+RPG+social hybrid), theme, and MVP scope for the web validation build.
