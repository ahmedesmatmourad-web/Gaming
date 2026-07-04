# Game #1 Design — Pharaoh's Empire (Working Title)

Date: 2026-07-02
Status: Draft, pending review
Related: [Company Strategy](2026-07-02-company-strategy-design.md), [Market Research](../research/2026-07-02-mobile-gaming-landscape-research.md)

## Context

Per the company strategy, game #1 is an **idle/incremental** title, differentiated via a **hybrid sub-genre** (idle + merge) rather than a pure clicker, built solo with AI-assisted tools, monetized ads-only at launch (IAP layered in later), and validated on HTML5/web before a mobile (iOS/Android) launch. This document specs that first game.

## 1. Concept

**Genre:** Idle + Merge hybrid.
**Theme:** Ancient Egypt — build and grow a Pharaoh's empire along the Nile. Chosen deliberately to avoid the cozy-cottage/farm aesthetic that dominates nearly every top merge and idle title in our research — a genuine differentiation angle, not just a reskin.
**Core fantasy:** The player is a young ruler inheriting a small strip of land along the Nile, growing it into a full empire through two parallel efforts: raising monuments that define the skyline, and amassing a treasury of artifacts and riches.

## 2. Core Loop

1. **Idle resource generation**: gold and building materials accrue passively over time (and while offline, up to a cap — see §4).
2. **Merge boards**: resources and items are merged (combine two identical items → next-tier item) on two parallel boards:
   - **Monuments track**: raw materials (sand → bricks → limestone blocks → obelisks/temples/pyramids) that directly construct visible empire monuments.
   - **Treasury track**: artifact fragments (pottery shards → vases → golden relics) that build a growing treasure collection.
3. **Spend & expand**: completed monuments and treasury milestones unlock new merge-board tiers, new resource types, and progress toward the region's completion goal.
4. **Region completion → prestige**: once a region's goals are met, the player "expands" into a new region (see §3) rather than resetting.

## 3. Prestige: Region Expansion

Prestige uses the **region expansion pattern** proven in top merge titles (Family Island, Travel Town, EverMerge), not a hard reset:

- Completing a region unlocks a new province (e.g., Nile Delta → Valley of the Kings → Thebes) with a fresh, higher-tier merge board on both tracks.
- The prior region's board remains visible and keeps passively generating resources at a reduced rate — nothing the player built is ever lost.
- Expanding grants a permanent **Legacy multiplier**, boosting idle generation and/or unlocking higher merge-chain tiers in the new region.

## 4. Offline Progress & Ads

- **Base offline cap**: resources accrue passively while away, up to a cap (e.g., 4 hours worth) — standard genre pattern.
- **Two separate rewarded-ad options on return**, giving two distinct reasons to engage with ads rather than one:
  1. **Double earnings**: watch a rewarded ad to double the resources accrued during the offline period just ended.
  2. **Extend cap**: watch a rewarded ad to extend the offline cap for the *next* period away (e.g., 4 hours → 8 hours), repeatable.
- Both are opt-in rewarded video only — no forced/interstitial ads gating core progress, consistent with the "ads-only-at-launch, but non-punishing" monetization posture from the company strategy.

## 5. Art Style

**Painterly / soft illustrated** (references: AFK Arena, Disney Dreamlight Valley) — gradients, glow, soft shadows, atmospheric depth, fitting the "epic empire" fantasy better than a flat/cartoon style.

**Risk & mitigation**: this style is materially harder to keep visually consistent across the many AI-generated assets a merge game needs (two tracks × many item tiers × monument/relic art) than a flat-vector style would be. Primary mitigation: generate assets with **Gemini's image model** (the founder has an active account), which is specifically strong at maintaining subject/style consistency across multiple generations and edits — use a fixed "style guide" prompt (locked phrasing for palette, lighting, and rendering style) reused for every asset to maximize consistency. Round out the free toolkit with **Photopea** or **GIMP** (compositing, cropping, transparent-background prep) and **TexturePacker** free tier (sprite sheet/atlas packing for the game engine). A small **freelance illustrator consistency-pass budget** is kept as a fallback contingency, not the default plan, given Gemini's consistency strength.

## 6. UI Layout

**Split-screen dual board**: both the Monuments board and Treasury board are visible simultaneously (smaller, side-by-side), rather than a single full-size board switched via tabs. This keeps both tracks constantly present and encourages working both at once.

**Risk & mitigation**: smaller merge cells are harder to tap accurately on a phone screen than on desktop/web — a direct instance of the "web-to-mobile signal mismatch" risk already flagged in the company strategy. Mitigations:
- Test tap-target sizing on an actual phone screen (not just desktop browser) early in the web-validation phase, not only after the mobile port begins.
- Consider a "tap to expand" affordance that temporarily enlarges one board to full-screen for precise merging on small screens, collapsing back to split view otherwise.

## 7. MVP Scope (Web Validation Build)

Per the founder's explicit choice, the MVP ships with full scope on both fronts rather than a reduced slice:

- **1 region + first prestige/expansion** (2 regions total playable), so testers experience the region-expansion loop, not just moment-to-moment merging.
- **Both merge tracks** (Monuments and Treasury) live from the first playable build, not sequenced as a fast-follow.
- Offline earnings with the capped + double/extend-ad mechanic (§4).
- Ads-only monetization (rewarded video for the offline mechanics above); no IAP in the MVP.

**Scope note**: this is a deliberately larger MVP than the company strategy's default "minimal" recommendation. It extends web-validation build time somewhat but remains within the overall 4–6 month mobile-launch target set at the company level.

## 8. Platform & Tech

Per company strategy: build in a web-portable engine (Phaser, Construct, or Godot with web export) for a single AI-assisted codebase that validates on an HTML5 portal (e.g., Poki, CrazyGames) first, then wraps for iOS/Android (e.g., via Capacitor) once the web validation gate is cleared.

## 9. Monetization

Ads-only at launch (rewarded video for offline double/extend, per §4). IAP (currency packs, board-space expansion, cosmetic monument skins) is layered in only after D1/D7 retention clears the company-level web validation gate — not built into the MVP.

## 10. IAP-Readiness Design Principles

IAP is deliberately deferred to after launch (§9), but the game's *architecture and economy* must be designed for it now — retrofitting IAP into a system that wasn't built to accommodate it is a common source of costly economy rework in idle/merge games. These principles cost little to build into the ads-only MVP but mean IAP becomes a matter of enabling flows, not redesigning systems:

- **Dual-currency from day 1**: a premium currency ("Ankh Gems," working name) exists alongside soft currency (Gold/Materials) in the MVP itself — earned only through gameplay/rewarded ads for now, with the purchase flow simply hidden until IAP launches.
- **Board-space expansion as a built-in system**: merge boards are expandable from the start (earned for free in the MVP), so charging for extra space later means enabling a button, not building a new mechanic.
- **Speed-ups as a designed lever**: construction/merge timers support a "speed up" action from day one (via ads in the MVP), so IAP instant-speed-ups later reuse the same system.
- **Cosmetic skin slots**: monuments/relics have a base functional tier plus a separate cosmetic layer, so selling monument skins later doesn't require re-architecting assets.
- **Analytics from day 1**: progression funnels and friction points (where players wait or get blocked) are tracked starting in the ads-only MVP, so IAP placement later is based on real data, not guesswork.
- **Soft gates only, always**: nothing is ever fully blocked without a free path (time or ads) — IAP means convenience/acceleration only, never unlocking otherwise-inaccessible content. Preserves trust with players who joined during the ads-only phase.
- **Live-ops event system built in from day 1**: a time-boxed "event slot" exists in the content/economy system (special merge chains, bonus multipliers, exclusive cosmetic monument skins) that can run driven by ads/engagement in the ads-only MVP. Battle passes/LTOs drive ~20–22% of IAP revenue in top casual/merge titles per our research — this is a real revenue lever to build toward, not a nice-to-have.
- **Cultural/regional theming via the same event system**: rather than one global content calendar, events can carry region-relevant flavor (e.g., MENA-specific holidays/motifs, localized narrative beats) for different launch markets — ties to the localization white space flagged across multiple segments in the market research.

## 11. Naming

No final name has been chosen yet; this document uses **"Pharaoh's Empire"** as a working title. Branding/naming will be finalized separately (e.g., closer to the web-validation launch, potentially informed by lightweight ASO keyword research), and does not block MVP development.

## 12. Risks & Mitigations

- **Art consistency risk** (painterly style, AI-assisted solo production) — mitigated primarily by using Gemini's image model with a locked style-guide prompt, with a small freelance consistency-pass budget as fallback (§5).
- **Mobile tap-target risk** (split-screen dual board) — mitigated by early touch-sizing tests and a possible "tap to expand" affordance (§6).
- **Scope risk** (dual-track, 2-region MVP vs. a leaner slice) — accepted deliberately by the founder; tracked as extending build time modestly, not blocking the overall timeline. If the AI-assisted build proves slower than expected, the fallback is to cut the Treasury track's second-region content (not the Monuments track, and not the region-expansion mechanic itself) to protect the launch timeline.
- **Web-to-mobile input mismatch** (general) — already flagged at the company level; this game's split-board layout is the first concrete place it applies.

## Next Steps

With this design approved, the next step is to invoke the **writing-plans** skill to produce a detailed implementation plan for the web-validation MVP build.
