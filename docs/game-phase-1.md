# System Breach — Phase 1 foundation

## Delivered

The existing `/play` page now links to `/play/breach`. Bug Hunter and the Unity preview retain their own routes and runtimes. No authentication, backend, database, global styles, homepage or application architecture changes were made.

The new route is explicitly an **arena preview**, with no movement, combat, matches or rewards yet. Launch renders Archive Zero: a tiled foundation over a digital void, raised server galleries, connecting ramps, a rear gate, cover blocks, distant server silhouettes and an animated central core. All geometry is created locally in Three.js; there are no external model, texture or audio requests.

Available actions: launch, cancel loading, pause/resume, fullscreen toggle, exit to the preview lobby and retry on failure. The fixed camera is an overview camera; the third-person controller is Phase 2. Blur/hidden-tab pauses rendering, and Escape pauses when the canvas has focus. Reduced-motion preferences stop the decorative core animation.

## Architecture

- React owns low-frequency preview state, loading feedback and buttons. The engine is imported dynamically only after launch; the initial server render has no WebGL canvas or engine preload.
- `GameEngine` owns a scene, perspective camera, WebGL 2 renderer, lighting, arena, fixed-step loop and browser listeners.
- `FrameLoop` uses bounded 60 Hz updates with interpolated rendering. Pause cancels its animation frame and clears accumulated time.
- `ResourceScope` releases resources in reverse creation order, including partially initialized sessions, and tolerates individual cleanup failures without skipping remaining resources.
- `BreachArena` shares geometry/materials, uses one shadow-casting directional light supplied by the engine, and explicitly disposes shared GPU resources once.
- Each host effect owns its session. Cancel/navigation/timeout prevents a late import or scheduled startup from creating a renderer. Disposal removes the canvas, disconnects observers/listeners, stops the loop, releases scene resources and renderer, and releases the WebGL context.
- Context loss is a recoverable error requiring a fresh renderer. Rendering failures stop the loop. Resize follows the host bounds, guards zero dimensions and caps pixel ratio at 1.5.
- No audio, gameplay input listeners, physics, networking or asset-loader timers exist in this phase.

Dependency versions are pinned: `three@0.186.0` and `@types/three@0.186.0`. Resource ownership follows the official [Three.js cleanup guidance](https://threejs.org/manual/en/cleanup.html); renderer lifecycle APIs are documented in [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html).

## Validation

Run from the existing project root:

```powershell
npm run dev -- --host 127.0.0.1
npx tsc --noEmit --incremental false
npm run build
node --test tests/breach-foundation.test.mjs tests/rendered-html.test.mjs tests/progression.test.mjs tests/laboratory.test.mjs tests/unity-host.test.mjs
node node_modules/eslint/bin/eslint.js app/play/breach lib/game tests/breach-foundation.test.mjs
```

Open `http://localhost:3000/play/breach` after starting the development server. Launch the arena preview. Exit/relaunch and pause/resume are intended to work without navigating away.

Recorded checks:

- Strict TypeScript: passed.
- Production build: passed. The new engine is a separate dynamic chunk referenced by `BreachHost`; the engine chunk is approximately 543 KB minified / 135 KB gzip. Vite reports its 500 KB chunk-size advisory. No global chunking or warning-threshold configuration was changed to hide it.
- Existing regression suites: 26 passed. New foundation suite: 12 passed.
- Foundation tests execute real engine/arena/loop code with a controlled renderer/DOM boundary, and real host effect code with controlled hooks. They cover shared-resource disposal, five repeated sessions, partial initialization failures, unsupported WebGL, context loss, zero-size resize, hidden startup, bounded catch-up, pause/resume, late import cancellation, timeout and unmount. SSR tests verify the inert lobby and independent arcade.
- Live HTTP smoke: `/`, `/login`, `/register`, `/play`, `/play/breach`, `/play/unity`, and the arcade tasks endpoint returned 200. Existing protected pages redirected to login with their return paths. Anonymous progression access returned 401.
- Existing authenticated HTTP suite (`node tests/progression-http.mjs http://localhost:3000`): passed registration/login, concurrent reward claims, laboratory balance, challenge penalties/retry limits, activity reset, and rewards/dashboard/leaderboards/teams/profile rendering. It created the local-only QA account `qa1789499310734` and retained its test history, as the existing test script specifies.
- Browser automation reported no available apps/browsers. **Actual WebGL rendering, visuals, browser console, fullscreen, focus behavior, mobile layout and real GPU memory/frame-time testing remain unverified.** Mocked lifecycle tests do not substitute for these checks. No gameplay was claimed or tested beyond this foundation.
- Focused lint: no errors; one existing-style `no-img-element` warning for the shared logo markup reused on the new route.

### Browser acceptance checklist for this phase

1. Open homepage and Bug Hunter; verify their appearance and interactions remain intact.
2. Enter System Breach, launch, and inspect the fixed-camera arena and animation. Confirm no browser console errors.
3. Pause/resume, change tabs, return, and resize, including narrow widths and fullscreen.
4. Exit/relaunch at least ten times. Verify one canvas/loop, bounded GPU resources and no abandoned listeners.
5. Cancel loading under a throttled connection and navigate away during startup. No late canvas should appear.
6. Disable WebGL or simulate context loss in browser developer tools. Check the error, retry and return-to-lobby paths.
7. Check keyboard focus and reduced-motion behavior. Actual player controls are not part of this phase.

## File inventory

Added:

- `app/play/breach/page.tsx`
- `app/play/breach/BreachHost.tsx`
- `app/play/breach/breach.module.css`
- `lib/game/GameEngine.ts`
- `lib/game/types.ts`
- `lib/game/core/FrameLoop.ts`
- `lib/game/core/ResourceScope.ts`
- `lib/game/world/BreachArena.ts`
- `tests/breach-foundation.test.mjs`
- `docs/game-phase-1.md`

Modified:

- `app/play/page.tsx` — additive preview link.
- `package.json` and `package-lock.json` — Three.js and matching development types.

Suggested commit: `feat(game): add isolated System Breach rendering foundation`

**Stop at Phase 1. Await the developer before implementing the player/controller. This phase has not been deployed.**
