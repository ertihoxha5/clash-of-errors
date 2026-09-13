# vinext-starter

## Clash of Errors

A competitive debugging platform. One design language across every page, one account system, and
one bank of challenges feeding three modes.

### Accounts

Registration is first name, surname, username and password — no third-party sign-in. Passwords are
salted and stretched with PBKDF2-SHA256 (150k iterations) through WebCrypto, since the Workers
runtime has no bcrypt; digests are compared in constant time, and a login attempt for an unknown
username still performs a hash so both answers cost the same. A session is a random 256-bit token in
an http-only cookie backed by a `sessions` row, so signing out revokes it server-side.
See `app/auth.ts` and `app/api/account/route.ts`.

### Three modes

- **Challenges** (`/challenges`) — practice in three shapes:
  - *Find the bug*: a short snippet with one faulty line. Pick the line, pick the fix. The answer
    never leaves the server.
  - *Write the code*: implement the function until every test passes. Tests run in a Web Worker
    sandbox (`lib/sandbox.ts`) that is terminated on timeout, so an endless loop cannot hang the
    page. Ctrl+Enter runs them.
  - *Code audit*: a complete 250–400 line module with one planted defect, a reported symptom and a
    region to search. The viewer (`app/components/AuditViewer.tsx`) is a reading tool: search for a
    symbol, filter to matching lines, jump to a line number, then commit to one.
- **Battles** (`/battles` → `/duel/:code`) — a 1v1 race against an NPC rival (`lib/npcs.ts`).
  Both sides get the same task and one clock. The rival's run is scheduled when the room opens, so
  polling cannot change it, and its solution reveals line by line as its tests pass.
- **Play it as Game** (`/play`) — *Bug Hunter*. Fly a character through a sector of broken code;
  each terminal holds a real find-the-bug task, and roaming bugs chase you while you read.

### Fields

JavaScript, Python, Data Structures & Algorithms, Debugging & Errors, Cybersecurity, SQL &
Databases, and Web & Browser. The landing page counts the bank live rather than advertising numbers
that could drift.

### Content

- `drizzle/0008_seed_content.sql` — the multiple-choice bank behind practice, bot battles and live rooms.
- `drizzle/0010_code_task_content.sql` — find-the-bug and write-the-code tasks with tests and reference solutions.
- `drizzle/0013_fields_and_audits.sql` — cybersecurity, SQL and web fields, plus the three audit modules.
- `drizzle/0014_python_tasks.sql` — Python code tasks.

Audit modules are authored clean and the defect is planted by an exact line swap at build time, so
the stored `buggy_line` can never drift from the code.

### Design

`app/PlatformShell.tsx` frames every signed-in page with the landing page's topbar, kicker rhythm,
angled panels and footer; `app/platform.module.css` holds the shared component styles and
`app/home.module.css` only the marketing sections.

### Grading and trust

Find-the-bug, audit and duel outcomes are decided entirely on the server. Write-the-code results are
reported by the browser that ran them — code cannot be executed inside the Workers runtime — so XP
there is capped per task, and arcade XP is capped per day through the reward ledger.

The Unity Web rendering foundation lives at `/play/unity` as a preview. Unity source is in
`unity/ClashOfErrors`; see [Phase 0 setup, build workflow, and validation](docs/unity-phase-0.md).

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

This starter does not use `wrangler.jsonc`.

## Included Shape

- edit site code under `app/`
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Email and name are intended for display or contact purposes.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm test`: build the starter and verify its rendered loading skeleton
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
