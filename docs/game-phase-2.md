# System Breach — Phase 2 player

## Delivered

`/play/breach` now launches a third-person movement preview in Archive Zero. It includes an original procedural debugger character, camera-relative movement, mouse orbit, sprint, jump, dodge, collision, locomotion poses, pause/resume and fall recovery. No combat, health, enemies, weapons, account rewards or backend changes are included.

The existing Phase 1 scene, lazy-loaded engine and cleanup architecture remain in place. The homepage, navigation outside this game, Bug Hunter, Unity preview, authentication, backend and package dependencies are unchanged.

## Controls

| Input | Action |
| --- | --- |
| WASD | Camera-relative movement |
| Mouse | Orbit independently of character facing |
| Shift | Sprint |
| Space | Jump |
| C | Dodge in the movement direction; use character facing while stationary |
| Escape | Pause and release mouse capture |
| Tab / focus loss | Pause and clear held game input |

Launch, then click inside the arena to capture the mouse. Capture is requested only from that click, not from asynchronous initialization. If mouse capture is unavailable or denied, hold the left mouse button and drag to orbit; keyboard movement continues while the canvas is focused. Resume requires another canvas click to capture again.

Dodge uses C instead of the tentative Ctrl binding in the Phase 0 plan, avoiding combinations such as Ctrl+W while moving. Future ability bindings will need to keep C reserved for dodge. The UI and accessible canvas instructions use the actual binding.

The pause overlay includes **Reset position & resume**. Falling below the recovery threshold returns the player to the entrance without rewards or a combat death event. The preview requires keyboard and mouse; touch/gamepad controls are not implemented in this phase.

## Modules and behavior

- `PlayerInput`: canvas-scoped keyboard handling, one-shot jump/dodge presses, mouse capture, drag fallback and listener ownership. Input does not consume typing outside the focused game. Pause clears held keys and buffered actions. Disposal releases only this canvas's pointer lock; a late pointer-lock promise releases a stale capture.
- `PlayerController`: 1.8-unit-high capsule with .36-unit radius, acceleration/deceleration, normalized diagonal movement, airborne steering, 24-unit gravity and capped fall speed. Ground speed is 5.2 units/s; sprint is 8.5. Jump impulse is 8.6, with a 120 ms input buffer and 100 ms grace period after leaving an edge. Dodge is a committed 15-unit/s burst lasting .24 seconds with a .95-second cooldown. No invulnerability is implied before combat exists.
- `CollisionWorld`: Three.js Octree built from the arena's actual solid meshes. Decorative strips/core rings are excluded. Capsule motion is checked in increments no longer than 35% of its radius, preventing high-speed dodge/fall tunneling. Contacts support wall sliding, ceilings, 45-degree maximum walkable slopes and steps up to .28 units. Ground adhesion changes height only, so it does not add horizontal speed downhill.
- `ThirdPersonCamera`: independent yaw, clamped pitch, a 5.5-unit follow distance, interpolation and smoothed outward recovery. The pivot stays inside the player capsule. A camera-sized sphere is swept toward the desired viewpoint and checked again during interpolation to prevent cover/near-plane clipping. The avatar is hidden when obstructions force the camera too close to its body.
- `PlayerAvatar`: original box-based armor and an articulated limb rig. Idle, run, sprint, airborne and dodge states drive limb swings, poses and lean. It owns/disposes its shared materials and geometry.
- `GameEngine`: composes the modules in the existing fixed simulation loop. React receives movement state and dodge cooldown about ten times per second, plus discrete capture/pause events. React does not render the scene each frame.

The static arena exposes a `solids` group used by both rendering and collision construction. No separate hand-maintained ramp coordinates or collider-only floor are used. The original server galleries, ramps and visible obstacles remain the source of collision geometry.

Reference APIs: [Three.js Octree](https://threejs.org/docs/pages/Octree.html), [Capsule](https://threejs.org/docs/pages/Capsule.html), and [browser mouse-capture requirements](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestPointerLock).

## Validation

Commands:

```powershell
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm run build
node --test tests/breach-player.test.mjs tests/breach-foundation.test.mjs tests/rendered-html.test.mjs tests/progression.test.mjs tests/laboratory.test.mjs tests/unity-host.test.mjs
node node_modules/eslint/bin/eslint.js app/play/breach lib/game tests/breach-player.test.mjs tests/breach-foundation.test.mjs tests/helpers/game-harness.mjs
node tests/progression-http.mjs http://localhost:3000
```

Results:

- Strict TypeScript: passed.
- Production build: passed. The engine remains dynamically loaded only by the game host. Vite retains its large-chunk advisory; the engine is approximately 565 KB minified / 141 KB gzip.
- 53 tests passed: 15 new player/input/camera tests, 12 updated foundation tests and 26 existing platform/Unity tests.
- Physics tests use actual Three.js meshes and Octree collision queries. They cover acceleration/release, sprint, normalized diagonal movement, camera-relative direction, jump/landing, ceilings, no double jump, buffered/grace-period jumps, thin-wall dodge, cooldowns, wall sliding, low/high steps, actual arena ramps in both directions, steep slopes, fall recovery and matching movement at 30/60/144 Hz rendering.
- Camera tests exercise orbit/pitch limits and geometric obstruction. Input tests use controlled DOM events for focus isolation, edge-triggered actions, capture loss, drag fallback, disposal and late lock completion. Foundation tests retain repeated enter/exit, partial initialization, context-loss, shared-resource disposal, resize, pause and SSR coverage.
- Focused lint: no errors; the pre-existing logo markup produces one `no-img-element` warning.
- Live HTTP: homepage, login/register, Bug Hunter, System Breach, Unity preview and arcade tasks returned 200. Protected platform routes returned their expected sign-in redirects; anonymous progression returned 401.
- Authenticated HTTP suite: passed registration/login, concurrent reward claims, shard balance, failed-challenge penalties, retry caps, activity reset and rewards/dashboard/leaderboards/teams/profile rendering. Its designated local QA account is `qa1789508975728`; test history is retained by the existing script.
- An existing project development server was already running at `http://localhost:3000`; it was reused and left running. No unrelated process was stopped.

**Browser automation still reports no available browser.** Actual rendered appearance, browser console, mouse capture/fullscreen interactions, perceived movement feel, animation quality and GPU performance remain unverified. Geometry tests and HTTP checks do not replace hands-on browser acceptance.

### Manual acceptance still required

1. Open `/play/breach`, launch and click the arena. Check mouse orbit while standing and moving.
2. Sprint diagonally, release movement, jump onto cover and ascend/descend both gallery ramps.
3. Dodge against walls/corners and verify collision and cooldown feedback. Jump beneath the raised bridge to check ceilings.
4. Circle server structures and inspect camera retraction/recovery; check that the camera avoids looking inside the avatar.
5. Escape, switch tabs, resume and reset position. No held keys or camera movement should carry over from the pause UI.
6. Fall off the arena, verify safe entrance recovery, then exit/relaunch repeatedly. Confirm no duplicate listeners or continuing loops.
7. Exercise denied mouse capture, drag fallback, fullscreen, resizing and the existing website pages; inspect browser console and frame performance.

## File inventory

Added:

- `lib/game/player/PlayerInput.ts`
- `lib/game/player/PlayerController.ts`
- `lib/game/player/PlayerAvatar.ts`
- `lib/game/player/ThirdPersonCamera.ts`
- `lib/game/world/CollisionWorld.ts`
- `tests/breach-player.test.mjs`
- `tests/helpers/game-harness.mjs`
- `docs/game-phase-2.md`

Modified:

- `lib/game/GameEngine.ts`
- `lib/game/types.ts`
- `lib/game/world/BreachArena.ts`
- `app/play/breach/BreachHost.tsx`
- `app/play/breach/breach.module.css`
- `tests/breach-foundation.test.mjs`

Suggested commit: `feat(game): add third-person movement and collision controller`

**Stop after Phase 2. Await the developer before Phase 3 combat. No deployment or Git commit was performed.**
