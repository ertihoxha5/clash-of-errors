# Clash of Errors — Game Implementation Plan

## Phase 0 only — 2026-09-15

This document analyzes the existing working tree and proposes an additive Three.js game. No game code, dependencies, routes, authentication, database schema, navigation, or website styling are changed in this phase. Stop after this plan; each subsequent phase requires the developer's instruction to continue.

## 1. Repository findings

Analysis covers the application routes and components, shared libraries, database schema and migrations, build and hosting configuration, tests, scripts, supplied assets, and the existing Unity integration. Generated dependency/build caches and Unity binaries are not application source. The working tree already contains substantial tracked edits and untracked laboratory, progression, rewards, and visual work; these are the baseline and must be preserved. No repository AGENTS.md was found in the file inventory.

| Area | Existing implementation | Integration consequence |
| --- | --- | --- |
| Frontend | React 19.2.6, TypeScript 5.9.3; `app/layout.tsx` and client components | Keep React for website and game menus; isolate simulation from React. |
| Framework / routing | Vinext 1.0.0-beta.2 on Vite 8.0.13, with Next-compatible App Router imports; `app/**/page.tsx`, dynamic segments, `app/api/**/route.ts` | Add a nested route using the existing conventions. Do not replace the router or convert to a separate SPA. |
| Backend | Cloudflare Worker in `worker/index.ts`, delegating to Vinext; existing request handlers | No new backend framework, game server, WebSocket service, or multiplayer implementation. |
| Persistence | Cloudflare D1 `DB`, Drizzle ORM 0.45.2; `db/index.ts`, `db/schema.ts`, SQL migrations through `0017` | Reuse existing identity/profile/reward storage. Any necessary future match tables use additive migrations. |
| Authentication | `app/auth.ts`, `app/api/account/route.ts`: local username/password accounts, PBKDF2-SHA256, server-side sessions, HttpOnly `coe_session`; `getPlayer` and `requirePlayer` | Preserve authentication. Identity for persistence comes from the server session, never a game-supplied user ID. |
| Current Play | `/play` renders `app/play/BugHunter.tsx`: Canvas 2D arcade with tasks, movement, combat, pauses and results | Preserve Bug Hunter and its API contracts. It is not a Three.js controller to retrofit. |
| Other game preview | `/play/unity`, `UnityHost.tsx`, `unity/ClashOfErrors`, WebGL template/build scripts and host tests | Retain the independent Unity foundation. Three.js must not load its runtime or replace its assets. |
| UI | `PlatformShell`, `PlatformNav`, `Avatar`, `RankBadge`, `ProgressionBar`; `BugSnippet`, `CodeEditor`, `AuditViewer` for coding modes | Reuse shell/menu/status conventions where suitable; coding widgets remain in their existing modes. |
| Styling | Global CSS plus route CSS modules; Tailwind 4 import; Oxanium and Space Mono; realm overrides | Scope new game CSS. Use current dark navy, cyan, mauve, purple and gold tokens; preserve the existing realm theme. |
| Assets | Runtime assets in `public/assets`; source logos/mockups/icon sheet in `Clash_Of_Errors_Assets`; generated Unity player path ignored by Git | Add game-only public assets later; do not serve mockup screenshots as functional UI or assume Unity assets are browser-ready models. |
| Tooling | npm + `package-lock.json`; `dev`, `build`, `start` use Vinext; strict TS with `@/*` alias | Install only required Three.js packages in Phase 1 and retain existing tooling. Three.js is not currently declared. |
| Hosting | `.openai/hosting.json` declares D1 `DB`, no R2; Sites and Cloudflare Vite plugins | Preserve configuration and deploy workflow. This analysis does not publish anything. |

### Existing route families to preserve

- `/`: homepage; `/login`, `/register`, `/logout`: accounts.
- `/dashboard`, `/profile`, `/laboratory`, `/rewards`, `/leaderboards`, `/teams`, `/history`: platform/account features.
- `/challenges`, `/battles`, `/duel/[code]`: code challenges and NPC duels.
- `/practice`, `/practice/session/[id]`, `/practice/results/[id]`: coding practice.
- `/bots`, `/bots/battle/[id]`, `/bots/results/[id]`: coding bot battles.
- `/arena`, `/room/[code]`, `/battle/[code]`: existing coding multiplayer.
- `/instructor/questions`: question management.
- `/play` and `/play/unity`: existing arcade and Unity preview.

The new action game's PRACTICE and BOTS modes must not take over `/practice` or `/bots`. Existing coding multiplayer is unrelated to the new solo action game.

### Progression and character data

`laboratories.character` stores a character slug, currently defaulting to `nullknight`; `lib/npcs.ts` supplies character presentation. Laboratory unlocks are decorations, not action-game weapons. Reuse the selected character identity with an explicit game-rendering mapping, without inventing loadout ownership from these unlocks.

`/api/game` accepts Bug Hunter score/wave reports and awards capped daily milestones through `platform_rewards`. `lib/platform.ts`, `lib/ranks.ts`, `lib/progression.ts`, `lib/progression-sql.ts` and migrations also govern shared ranks, rewards, activity and penalties. Current arcade milestones total at most 175 XP per UTC day. Do not silently reuse their source keys or alter their semantics for System Breach.

Local D1 initialization applies migrations on database access; `getDb` also settles inactivity. Local smoke checks can therefore initialize local data. Preserve deployed migration history, especially custom progression triggers. README starter text claiming an empty schema and optional ChatGPT helpers does not describe the actual application authentication/schema.

## 2. Additive integration

**Proposed entry:** keep `/play` operational and add a modest System Breach link within its existing Play surface. Add `/play/breach` for the game lobby and match host. Retain the site's navigation, homepage, and existing links. The game remains on the same origin.

Flow: existing Play → System Breach lobby → SOLO or PRACTICE → character → implemented loadout → launch → loading → match → results → confirmed account rewards, if signed in → lobby.

- SOLO becomes playable as its phased systems are implemented. Foundation previews must be labeled accurately.
- PRACTICE uses the same engine with a training director, safe respawn and repeatable drills; no permanent reward farming.
- BOTS is visibly disabled with a short explanation until implemented; no clickable fake launch.
- Preserve anonymous access consistent with existing Play. Guest match progress is temporary; signed-in persistence uses the existing account system.
- Lobby selection/settings belong to the website. Engine receives an immutable validated match configuration, without session tokens or database imports.
- Only mount/load the renderer when entering the preview or launching a match. Loading has progress, retry, cancellation and an honest unsupported-WebGL error.
- Initially use existing character identity and original procedural geometry. Add only usable character/loadout choices, not advertised nonfunctional options.

## 3. Proposed module boundaries

These are future files, not empty scaffolding to create now. Add modules in the phase that implements them; keep all existing directories intact.

```text
app/play/breach/
  page.tsx                    route and existing-site framing
  BreachHost.tsx              client lifecycle, UI state and engine bridge
  GameLobby.tsx               modes, character and loadout selection
  GameHud.tsx                 bounded-rate match snapshot display
  MatchResults.tsx            outcome and server-confirmed rewards
  breach.module.css          scoped game UI
lib/game/
  GameEngine.ts              composition, lifecycle and loop
  types.ts                   config, events, snapshots and states
  core/                      input, clock, disposal, pools, audio
  world/                     arena, collisions, hazards, interactables
  player/                    controller, follow camera, animation states
  combat/                    weapons, projectiles, hits and damage
  enemies/                   shared agent plus separate archetypes
  systems/                   GameDirector, CorruptionManager, XP, drops
  abilities/                 rollback, overclock, debug vision, firewall
  boss/                      RootExe controller, phase patterns, attacks
public/game/breach/           optimized models/audio/textures when needed
tests/                       focused simulation and lifecycle tests
```

`GameEngine` composes systems; it must not become another giant gameplay file. Framework imports stay out of engine modules. Dynamically import the browser engine inside the client lifecycle so WebGL, browser globals and audio never execute during server rendering. Keep game code out of homepage and other route bundles; verify the built graph.

Suggested bridge: initialize/start/pause/resume/dispose commands, throttled immutable HUD snapshots, and discrete loaded/error/outcome events. Use refs for the engine instance. Send HUD updates around 10 Hz and immediate significant state events; simulation and camera run independently. No React updates per animation frame.

## 4. Simulation and lifecycle

- Fixed simulation step with a bounded accumulator and interpolation; cap catch-up after stalls. Use the game clock for cooldowns, waves and effects so pause freezes them consistently.
- Input belongs to the focused canvas. Pointer lock requires a click; losing lock/focus or hiding the document pauses and clears held keys. Do not intercept typing/navigation outside gameplay.
- Use acceleration/deceleration, camera-relative movement, a grounded collider, gravity, slope/step handling, jump and dodge collision sweeps. Dodge cannot tunnel through walls.
- Camera orbit is independent of character facing, with smoothing, constrained pitch and obstruction checks. Aiming narrows the shoulder camera and follows the reticle ray.
- Centralize arena collision data. Use simple collision shapes and spatial queries first; add a physics dependency only if a demonstrated need warrants it.
- Explicit states: LOBBY → LOADING → PLAYING ↔ PAUSED → VICTORY/DEFEAT → LOBBY. Loading cancellation returns to lobby. Load failure is recoverable UI state, never a false PLAYING state.
- Defeat terminates a solo run; retry creates a fresh run. Practice supports reset/respawn. Emit terminal outcomes once and prohibit damage/rewards after termination.
- Every mount owns its loop, listeners, observers, pointer lock, loaders, pools, textures, geometries, materials and audio. Dispose on leaving/restarting, including navigation during loading and development double mounting.
- Cancel the animation frame, abort supported fetches, reject late load completions, disconnect observers, remove listeners, stop/disconnect sounds, dispose GPU resources exactly once, release engine references and remove the canvas. Shared resources need clear ownership. Do not dispose resources belonging to another runtime.
- Handle context loss with pause and a clear restart path. Repeated enter/exit must not multiply contexts, sounds, memory use, or input handlers.

## 5. Gameplay system design

### Combat and player

Data-driven weapon definitions include damage, cadence, capacity, reload time, spread, range/speed, recoil, effects and audio references. Implement Patch Blaster first, then Exception Blade melee, Memory Cannon heavy fire and Firewall Launcher area denial. Use pooled projectiles; resolve aim from camera to target and muzzle to target to prevent shooting through cover. Damage handles shield absorption, health, hit feedback, death and bounded invulnerability.

Proposed controls: WASD move, mouse orbit, Shift sprint, Space jump, Ctrl dodge, right mouse aim, left mouse fire, R reload, F melee, 1–4 weapon selection, Q/E/C/V abilities, Escape pause. Display controls and resolve conflicts before shipping. Add idle/run/sprint/airborne/dodge/aim/attack/hit/death animation states, initially driven by procedural poses and later compatible with authored clips.

### Enemies

Use shared health, target detection, steering, hit/death/drop logic and explicit acquire/chase/windup/attack/recover/stagger/dead states. Keep archetype decisions separate:

- Null Walker: direct pursuit, readable melee windup and recovery.
- Memory Leak: slow pressure and telegraphed resource drain with range/line-of-sight limits.
- Runtime Hunter: flanking/tracking and committed burst attacks with recovery windows.

Stagger expensive decisions across ticks, cap populations and query nearby colliders. Enemies must navigate the arena's ramps/routes rather than move through walls. Death grants drops and XP once.

### Director and corruption

`GameDirector` owns match time, objectives, phase transitions, wave budgets, difficulty, boss entry and outcomes. Practice supplies a different policy using the same combat systems. `CorruptionManager` owns a clamped 0–100 value and emits threshold changes once per crossing:

| Level | Planned consequence |
| --- | --- |
| 0% | Stable arena and initial encounter. |
| 25% | Minor material/lighting glitches and additional spawn pressure. |
| 50% | Telegraphed hazard zones and enemy mutation modifiers. |
| 75% | Temporary platform changes and stronger waves, with safe routes retained. |
| 100% | Critical phase and ROOT.EXE encounter; no unexplained instant defeat. |

Define corruption pacing as tunable match data, not frame-dependent randomness. Corruption affects rendering, gameplay and later audio. Never remove the player's ground without warning and an escape route. Geometry/collision changes are applied together.

Match XP levels trigger real upgrades. Drops restore resources or offer implemented upgrades, with caps and explicit collection behavior. Separate run XP from account XP in names and HUD copy.

### Abilities

- ROLLBACK: ring buffer of recent player poses; return to a valid historical location several seconds earlier. Validate destination against changed geometry; do not duplicate drops or rewind rewards.
- OVERCLOCK: temporary movement and attack cadence multipliers; bounded stacking and clean expiry.
- DEBUG VISION: highlight detected enemies, boss weak points, corruption objects and pickups for a limited duration.
- FIREWALL: temporary blocking barrier with lifetime/health and clear collision/team filtering.

Each ability has resource-independent cooldown state, HUD readiness/countdown, a gameplay effect and visible activation/expiry feedback. Pause freezes durations. Restart resets them.

### ROOT.EXE and world

One original digital-civilization arena: server towers, layered walkways connected by ramps, broken structures, data streams, portals and readable cover. Provide visible landmarks, safe spawn points, camera clearance and recovery from falling. No copied characters, branding, sounds or map layouts.

ROOT.EXE uses health-gated phases, with thresholds tuned during testing:

1. Corrupt/disable marked floor sectors, summon adds and expose a weak point after attacks.
2. Teleport and create distinguishable fake copies; combine glitch zones with temporary geometry changes.
3. Telegraph gravity distortion and more intense patterns while retaining dodgeable paths and damage windows.

The boss shares damage/targeting interfaces but owns separate pattern/arena-effect modules. Temporary edits restore on phase end, defeat and disposal. Avoid overlapping unavoidable attacks, uncapped adds or copies that award boss rewards.

## 6. HUD, results and persistence

Use a compact overlay: health/shield, reticle, current weapon/ammo/reload, abilities/cooldowns, run XP, objective, corruption, enemy count and boss health when applicable. Reuse theme variables and typography, not giant website dashboard cards. No emojis. Include keyboard focus, readable contrast, pause/settings, mute and reduced-flash options; decorative effects must not obscure threats.

Results show outcome, duration, kills, corruption, upgrades and run XP. An account reward remains pending until the server confirms it; offline/API failures keep the result and offer a safe retry.

In Phase 5, add a narrowly scoped System Breach match/reward endpoint under the existing API architecture if persistent rewards are enabled. Use server-issued run IDs bound to the signed-in player, mode/config validation, bounded rewards and unique per-run ledger keys. Reject duplicate completion, impossible ordering and practice rewards. Concurrent retries must not pay twice. Use existing reward helpers/triggers and reconcile responses with persisted awards.

Client-only combat is inherently untrusted. A run token and timing checks do not prove kills or victory. Treat these as capped arcade rewards, not competitive authoritative scores; no new trusted leaderboard claim. Review interaction with current inactivity participation rules explicitly instead of changing triggers incidentally. Add only necessary match metadata and migrations after this contract is defined; no backend rewrite or new authentication.

## 7. Assets and performance

- Phase 1 uses original primitive geometry and shared materials, with no dependency on external asset downloads.
- Later assets: optimized GLB where appropriate, compressed textures after measuring loader/tooling compatibility, modest texture sizes and explicit provenance. Existing PNG references are not a rigged character library.
- Pool projectiles, particles and frequent pickups. Cap enemies, particles, lights and transient effects; reuse vectors/materials and avoid hot-loop allocations.
- Instance repeated architecture where useful; retain frustum culling and use spatial broad-phase queries. Limit shadow casters and resolution.
- Set a device-pixel-ratio cap and quality presets; resize from the host bounds. Keep simulation deterministic across render rates.
- Target 60 fps on the developer's agreed desktop baseline, with reduced quality for weaker hardware; measure CPU/GPU frame time before claiming performance. Verify long-session allocation stability and bounded resource counts across repeated restarts.

## 8. Phase delivery and acceptance gates

| Phase | Implementation boundary | Required acceptance |
| --- | --- | --- |
| 0 — Analysis | This plan and baseline checks only. | Record findings and limitations; no game implementation. STOP. |
| 1 — Foundation | Add Three.js/types and lockfile change, isolated route/client host, renderer/camera/loop, basic arena, loading/retry and cleanup; minimal entry link in Play. | SSR does not touch WebGL; other pages do not load engine; resize, unavailable WebGL, loading cancellation, repeated mount/unmount work. No playable-combat claim. STOP. |
| 2 — Player | Camera-relative movement, acceleration, collision/grounding, follow/orbit camera, sprint/jump/dodge, basic movement animation states. | Test diagonal speed, stairs/ramps, walls, ledges, camera obstruction, focus loss, pause and frame-rate independence. STOP. |
| 3 — Combat | Patch Blaster, aim/shoot/reload, pooled projectiles, hit resolution, health/shield/damage/death, compact HUD. Use damageable targets before AI. | Verify cadence/ammo/reload, cover obstruction, damage once, pause freeze, defeat/retry. STOP. |
| 4 — Enemies | Shared architecture and three archetypes, spawn budgets, targeting, attacks, hit reactions and death/drop hooks. | Distinct readable attacks, valid spawn positions, navigation/cover, population bounds and no post-death attacks. STOP. |
| 5 — Core systems | Director, corruption thresholds, all four abilities, XP/upgrades/drops/objectives; complete Exception Blade, Memory Cannon and Firewall Launcher; functional loadouts and practice policy; bounded account reward contract. | Test threshold effects, cooldowns, rollback safety, geometry consistency, resource drain, upgrade effects, reward limits/replay, practice respawn. STOP. |
| 6 — Boss | ROOT.EXE phases, arena manipulation, adds, copies, teleportation and gravity/glitch patterns; boss victory outcome. | Full solo run from spawn to victory/defeat; all attacks avoidable; safe geometry restoration; only one terminal result. STOP. |
| 7 — Polish | Original VFX/audio, impacts, camera feedback, improved animations/world, completed lobby/settings/results experience and progression refresh. | Full requested flow, usable selections, disabled BOTS, performance and lifecycle soak checks, accessibility and regression pass. STOP. |

Phase 3 may use minimal hit cues; full audiovisual polish is Phase 7. Lobby/result scaffolding appears only when necessary for actual lifecycle transitions; finished menus arrive in Phase 7. This schedule explicitly includes weapons/melee/practice that the brief's shorter phase list did not assign.

At every gate: run the project; run strict TypeScript and production build; run relevant existing and new behavioral tests; inspect browser console; test affected gameplay and existing pages; fix introduced issues; report files added/modified, results, limitations and a suggested Git commit. Then stop for the developer. Never advance automatically.

Regression coverage should include homepage, authentication and protected-route redirects, dashboard, challenges, coding battles/practice/bots, laboratory/rewards/profile, Bug Hunter and Unity host. Exercise authenticated scenarios with a designated local QA account; do not invent access to a real user's session. Gameplay is not available to test in Phase 0.

## 9. Phase 0 validation record

- `npx tsc --noEmit --incremental false`: passed; avoids modifying the existing incremental build file.
- `npm run build`: passed all five Vinext build stages. Informational plugin-timing and route-classification notices appeared; no build errors.
- `node --test tests/rendered-html.test.mjs tests/progression.test.mjs tests/laboratory.test.mjs tests/unity-host.test.mjs`: 26 passed, 0 failed. These include SSR/source contract tests and actual SQLite progression rules; they are not substitutes for browser gameplay checks.
- Development server started at `http://localhost:3000/`; homepage returned HTTP 200. The sandbox initially blocked development/test child processes with `spawn EPERM`; rerunning with permitted escalation succeeded.
- Browser/console and interactive gameplay inspection: blocked because the browser tool returned `No browser is available`. Do not interpret HTTP or test success as visual/interactive verification. New Three.js gameplay: not implemented, by instruction.
- HTTP smoke: `/`, `/login`, `/register`, `/play`, `/play/unity` and `/api/tasks?run=1&count=2` returned 200. Dashboard, challenges, battles, practice, bots, arena, leaderboards, teams, profile, laboratory, rewards, history and instructor questions returned 307 to their corresponding sign-in return paths. `/api/progression` returned 401 anonymously, as expected. No authenticated browser session or dynamic match instance was exercised.

## 10. Change boundary and handoff

Added: `GAME_IMPLEMENTATION_PLAN.md` only. Existing application source files modified by this phase: none. Build/dev tooling may refresh ignored generated output/local database state. Previously present edits remain owned by the developer; do not stage, revert or commit them as part of this plan.

Suggested commit: `docs: plan isolated System Breach game integration`

**Phase 0 ends here. Await an explicit instruction to begin Phase 1.**
