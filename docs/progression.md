# Player progression

The existing game and learning modes now share a badge ladder, a visible rewards bar, and a rewards screen at `/rewards`.

## Rules

- Bronze I–III, Silver I–III, Gold I–III, Platinum I–III, Diamond I–III, Master I–III, then MASTERPIECE at 30,000 XP. Thresholds and colours live in `lib/ranks.ts`.
- Registration and the first successful sign-in on each UTC day award 30 XP. Reloading, signing out, or logging in again cannot repeat it.
- One free wheel spin per UTC day. The server chooses one of six equally likely outcomes: 25, 50, 75 or 100 XP, or 10 or 20 Aether Shards. Prizes have no cash value. The database saves the outcome before animation; retrying returns the saved prize.
- A failed code challenge costs 20% of its configured XP, rounded up, once per challenge per UTC day. Legacy 25-XP questions cost 5 XP. Further retries that day are free. First-solve rewards remain claimable.
- After 48 hours without a valid recorded participation, deduct up to 200 XP once for that inactive period. Settle overdue deductions on the next database-backed platform request before returning profiles and standings. There is no external scheduled job. Answering again starts a fresh 48-hour window.
- Participation means a submitted code/arcade challenge answer, legacy question answer, practice answer, bot battle answer, live arena answer, or submitted NPC-duel progress. Browsing, login and spins do not reset activity.
- XP is floored at zero. Penalties may lower a badge, but do not remove shard balances or lab unlocks. Existing accounts begin with a fresh activity window when migration 0017 is first applied.

## Data and verification

Generated migration 0016 adds `progression_events` and `player_activity`. Custom migration 0017 atomically applies rewards, keeps ranks and levels synchronized, and records participation and failed-attempt penalties through triggers. Unique account/source keys prevent duplicate awards and deductions. Do not regenerate migration 0017 after deployment; subsequent changes need a new migration.

The current challenge engine still grades write-code tasks using browser-reported test counts, as before this change; server-graded bug/audit challenges do not share that limitation. This progression system does not make the existing browser-reported grading authoritative.

`node --test tests/progression.test.mjs tests/laboratory.test.mjs` validates rank boundaries, daily idempotency, outcome persistence, shard spending, penalties, zero floor, and activity resets against the actual SQLite migration rules.

`node tests/progression-http.mjs http://localhost:3000` verifies authentication, concurrent spins, challenge penalties and rendered routes. It only accepts a localhost origin, and creates a clearly named local QA account with retained test history.
