# Clash of Errors — Unity Web foundation

Phase 0 adds a Unity rendering foundation to the existing website. It does not add movement, shooting, enemies, inventory, terminals, abilities, waves, or bosses. The website remains the navigation experience. Existing practice, bot battles, multiplayer battle/lobby work, authentication, database migrations, and branding are preserved.

## Locations and integration

- Website: repository root, React 19.2.6, TypeScript, vinext 1.0.0-beta.2 / Vite 8.0.13 with Next App Router conventions; npm and `package-lock.json`.
- Routes: `app/`; existing global styling in `app/globals.css`. `/play` adds a scoped CSS module and reuses branding/button styles. The homepage's existing **Try Demo** button now enters `/play`; other navigation is unchanged.
- Unity: `unity/ClashOfErrors/`, created from the installed `com.unity.template.urp-blank` template. Existing template assets are retained. The similarly named Unity project outside this repository was inspected but was not modified or copied.
- Game source: `Assets/_ClashOfErrors/`, including Core scripts, Editor tools, scenes, settings, prefab, material palette, and folders reserved for future modules.
- Unity template: `Assets/WebGLTemplates/ClashHost/index.html`. Unity substitutes real generated loader/data/framework/Wasm filenames during the build. This is a host template, not a fabricated Unity loader.
- Staging: `artifacts/unity/<timestamp>/`; successful build pointer: `artifacts/unity/latest-build.txt`.
- Website static files: `public/unity/clash-of-errors/`; all generated player files are ignored by Git.

The host performs no Unity network requests until **Launch Unity demo** is clicked. It checks for a generated build page, then creates an iframe whose document owns the runtime. The parent accepts progress/ready/error messages only from that iframe's window and expected origin. Progress comes directly from Unity's callback. Startup errors and a three-minute startup timeout remove the frame and offer retry. Retry creates a new browsing context. Route unmount removes the frame, and pagehide attempts `Quit()`; a late resolving instance is also quit. This isolates the runtime under React development Strict Mode and keeps Unity keyboard handling out of the website document. Browser-dependent work is inside client effects.

`UnityHost` accepts a `buildBase` prop (default `/unity/clash-of-errors`); set it in `app/play/page.tsx` for a different asset location and update the corresponding static header paths in `public/_headers` and `vite.config.ts`. All build-internal asset references are relative. A different origin requires CORS for the host's build-page check and a frame policy allowing the website; prefer same-origin assets. No localhost URL is embedded in production source.

## Tooling observed on September 13, 2026

- Unity **6000.6.0f1**, revision **f7f8ed4d1e24**, with **WebGLSupport** installed. Keep the exact version in `ProjectSettings/ProjectVersion.txt`.
- Microsoft Unity extension `visualstudiotoolsforunity.vstuc` **1.3.1**, C# Dev Kit **3.20.207**, C# **2.140.9**, .NET Install Tool **3.1.0** were installed.
- Resolved project dependencies: URP **17.6.0**, Input System **1.20.0**, Cinemachine **6.6.0**, AI Navigation **2.0.14**, Unity UI (including TextMeshPro) **2.6.0**, Visual Studio Editor **2.0.26**.
- Unity's initial template import/migration resolved newer compatible versions than the template archive and added legacy/default packages. Those Editor-generated changes are retained in `Packages/manifest.json` and `packages-lock.json`; the Phase 0 package installer only added missing Cinemachine. No manifest was hand-edited, and no gameplay/service integration was added for the other template dependencies.
- No connected Pipeline automation instance was found. Batch Editor `-executeMethod` is used; the VS Code extension is not scene automation.
- The initial external script editor preference was Visual Studio 2022. The `Code` command successfully selected installed VS Code and regenerated the solution during this session. This preference belongs to this machine, not Git.

Microsoft's [Unity setup documentation](https://code.visualstudio.com/docs/other/unity) requires Visual Studio Editor 2.0.20 or newer and selecting VS Code in External Tools. Do not install the obsolete Unity Visual Studio Code Editor package.

## Open, configure, and prepare

Close this repository's Unity Editor before running batch commands. Leave unrelated Unity projects alone. In Unity Hub, **Projects > Add > Add project from disk**, select `unity/ClashOfErrors`, and open with the exact installed Editor version. In Hub **Installs > Manage > Add modules**, Web Build Support must be present.

From the repository root in PowerShell:

```powershell
powershell -NoProfile -File scripts/unity-web.ps1 -Action Packages
powershell -NoProfile -File scripts/unity-web.ps1 -Action Setup
powershell -NoProfile -File scripts/unity-web.ps1 -Action Validate
```

The script discovers the matching installed Editor through Unity CLI. Alternatively pass `-EditorPath` with your local Unity executable, or set `UNITY_EDITOR_PATH`; do not commit that path. Package installation stays alive until the asynchronous UPM operation completes, with a ten-minute request timeout. Other operations use `-quit`. Logs are under `unity/ClashOfErrors/Logs/` and failures return nonzero.

Editor alternatives:

1. **Clash of Errors > Phase 0 > 1. Verify Packages**. Wait for the Console success message and package compilation to finish.
2. **Clash of Errors > Phase 0 > 2. Prepare Foundation**.
3. **Clash of Errors > Phase 0 > Validate Foundation**.
4. Open `Assets/_ClashOfErrors/Scenes/Bootstrap.unity` and press Play. It asynchronously loads `PrototypeArena` with the fixed camera, light, navy ground, cyan capsule, red cube, magenta sphere, and green cylinder.

For a repeatable Editor rendering check, use **Clash of Errors > Phase 0 > Render Smoke Frame** or `powershell -NoProfile -File scripts/unity-web.ps1 -Action Smoke`. It renders the real scene camera through URP into `artifacts/unity/editor-smoke.png`; inspect the resulting image. This does not replace browser acceptance.

Setup creates assets only when missing, preserves existing scene/material/input/catalog/prefab assets, and reports invalid asset types or missing bootstrap references. It uses unused layer slots 8–31 and preserves built-in and existing layer indices. Bootstrap is first in build settings; existing other scenes are retained there. The Web build explicitly includes the four Phase 0 scenes only. Never rerun setup expecting it to reset developed content.

For VS Code, install the recommendations in `.vscode/extensions.json`, then **Edit > Preferences > External Tools > External Script Editor > Visual Studio Code > Regenerate project files**. Alternatively:

```powershell
$env:CLASH_VSCODE_PATH = 'YOUR LOCAL PATH TO Code.exe'
powershell -NoProfile -File scripts/unity-web.ps1 -Action Code
```

This uses Unity's CodeEditor API and regenerates the solution. `.vscode/launch.json` provides **Attach to Unity**; use **Attach Unity Debugger** in VS Code to select the Editor. Generated `.sln`/`.csproj` files are ignored. This is Editor C# debugging, not a claim of browser player debugging.

## Build, serve, and package

```powershell
npm run unity:build
npm run dev
```

Use the Local HTTP URL printed by vinext, open the homepage, click **Try Demo**, then **Launch Unity demo**. Do not open generated HTML via `file://`.

Run `node scripts/check-unity-http.mjs <website-origin>` against that running server to check route responses, generated asset URLs, MIME/encoding and decompressed Wasm magic bytes. An optional second argument overrides the Unity build base. This checks delivery, not browser execution.

The build method checks Web support and scene/prefab references, uses Bootstrap first, targets WebGL with WebGL 2 graphics and no threads, uses the custom template, and checks `BuildReport`. It writes a success marker only after a successful build. The PowerShell script checks both process exit and that marker. The publisher validates generated HTML and nonempty `.loader.js`, `.framework.js.unityweb`, `.data.unityweb`, and `.wasm.unityweb` files before copying assets; HTML is copied last. Timestamped build names give distinct asset filenames, avoiding replacement of assets used by an earlier page. Old build assets remain instead of being deleted, so periodically review disk usage. No unrelated static files are deleted.

Phase 0 uses **Unity gzip compression with decompression fallback enabled**. The generated loader decompresses `.unityweb` files itself; serve these as `application/octet-stream` without a `Content-Encoding` override. Serve the plain `.loader.js` as JavaScript and HTML as `text/html`. No raw `.wasm` URL is requested with this configuration; if switching to uncompressed builds later, serve `.wasm` as `application/wasm`. Normal server-negotiated HTTP compression is acceptable if headers match the transmitted bytes. Threading is disabled, so cross-origin isolation headers are not required. If disabling fallback later, configure proper gzip/Brotli response headers and MIME types and test them in the same change.

`vite.config.ts` supplies the fallback MIME type in development. `public/_headers` provides the matching [Cloudflare static asset header rules](https://developers.cloudflare.com/workers/static-assets/headers/) and prevents stale build HTML from being cached without revalidation. The Unity source watcher exclusion is scoped to the repository's `unity/` directory so newly generated files under `public/unity/` remain discoverable.

The initial raw build produced a roughly 48 MB Wasm file and failed in Bee with “Backend has requested a buildprogram run 6 times.” This matches Unity's [Name Files As Hashes issue](https://issuetracker.unity.com/issues/1245/build-fails-when-name-files-as-hashes-is-enabled). Hash naming is therefore disabled without upgrading the installed Editor. Failed outputs are never copied into `public/`.

Before a future deployment, run the Unity build/publish command **before** `npm run build`; vinext copies `public/` assets into `dist/client/`. A clean CI checkout must build with a licensed matching Unity Editor plus Web Build Support, or download an externally stored successful Unity build artifact and put it through the same publisher. Git alone deliberately does not contain the generated player. Verify files are present in `dist/client/unity/clash-of-errors/`, check provider per-file size limits and response MIME/encoding, then package the existing website normally. `.openai/hosting.json` and deployment architecture are unchanged. Nothing is deployed during Phase 0.

## Validation and checkpoint

Before changes, `npm test` passed all eight tests and `npm run lint` had zero errors with 12 existing warnings. Existing uncommitted battle/lobby/database/test changes were present and remain unstaged.

Source checks:

```powershell
npm test
npm run test:unity
npm run lint
npx tsc --noEmit --incremental false
```

The focused tests cover SSR without a running canvas/iframe/loader, genuine progress forwarding, late-instance cleanup after navigation, and loader/initialization failures. They use test-only doubles and do not constitute proof of Unity rendering. Browser automation reported no available browser in this session.

Pending visual acceptance, using browser developer tools:

1. Browse homepage alone: no Unity loader, data, or Wasm requests; appearance and existing navigation unchanged.
2. Enter `/play`: no runtime download until launch. Launch and confirm the actual colored Unity primitives render without Console errors.
3. Resize the browser and use Fullscreen; Escape returns to the normal page. Focus website links/inputs outside the game and confirm they remain usable.
4. Block a build request, reload, launch, and confirm a useful error with Retry. Unblock and retry successfully. With no generated build present, verify the honest unavailable message.
5. Leave during loading and after initialization; return and launch again. Confirm only one iframe/runtime remains, no stale callbacks change the new host state, and no continuing abandoned instance.

The Editor import and Phase 0 source compilation succeeded. Setup generated all four scenes, the prefab, palette, layers and Input Actions; all source assets have `.meta` files. VS Code configuration and solution generation succeeded. The eight existing tests, three focused tests, and TypeScript checking passed. Full lint passed with zero errors and 13 warnings (12 pre-existing plus the same image warning on the new branded header). Homepage and `/play` returned HTTP 200 from the local server. Until visual acceptance passes, status is **PHASE 0 SOURCE PREPARED — UNITY VERIFICATION PENDING**. The final implementation report records the Web build result.

Final Unity results in this session:

- Web build **succeeded** after disabling hash naming. The publisher copied only a successful build into website assets.
- Scene and prefab reference validation **passed**. A repeat Setup run produced **zero changes** to the scene files, verified by SHA-256 hashes.
- Actual URP Editor rendering **passed visual inspection** of `artifacts/unity/editor-smoke.png`. The final palette uses URP Unlit materials to make the diagnostic colors independent of lighting initialization. Camera, light and original 3D primitives are present. `Palette` is a guarded one-time repair action for this session's initial Lit palette; normal setup preserves existing materials.
- Final HTTP asset checks **passed**: loader 48,779 bytes, framework 78,638 bytes, data 5,166,426 bytes, Wasm 12,532,274 bytes. Fallback files were served as `application/octet-stream`, without an artificial encoding header, and gzip decompression yielded the correct Wasm magic bytes.
- Website packaging included the Unity player under `dist/client/unity/clash-of-errors/`.
- Browser automation returned an empty browser inventory. Actual in-website WebGL execution, visual homepage comparison, resize/fullscreen, focused input, and repeated browser navigation remain **pending**, even though unit lifecycle checks and Editor rendering passed.

Phase 1 remains unimplemented and requires the explicit instruction **CONTINUE TO PHASE 1**. No staging, commit, push, or deployment is performed automatically. Suggested future commit: `chore: prepare Unity Web foundation and integrate game host`.
