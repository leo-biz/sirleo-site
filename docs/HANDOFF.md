# Sir Leo Site Handoff

## Current State

- Repo: `/Users/sir/Workspaces/sirleo-site`
- Branch: `dev`
- Latest pushed commit before this doc: `7f5fac6 v2.47 — centralize nav rendering`
- Current version after this doc: `v2.48`
- Worktree at handoff creation: pending `docs/HANDOFF.md`, `CHANGELOG.md`, and `version.js` commit

## Last Worked On

Centralized navbar rendering.

- Added `src/js/site-nav.js`.
- Replaced duplicated nav markup on `index.html`, `sessions.html`, `events.html`, `education.html`, `pricing.html`, `build.html`, and `pay-success.html`.
- Shared nav now owns logo, nav links, theme toggle, and configurable CTA.
- `main.js` still preloads theme and handles global behavior; theme toggle behavior moved to `site-nav.js`.

## Recent Funnel Decisions

- Homepage `Who I Serve` is now two true audiences:
  - `Individuals & Couples`
  - `Organizers & Groups`
- Collaboration is not an audience. It has a dedicated homepage section after KINK AfterDark and opens the existing `collab` hub panel.
- Education is an offering available to both audiences, not a standalone audience.

## Current Modal Behavior

- Homepage audience cards open:
  - `audience-individuals`
  - `audience-organizers`
- I/C modal:
  - `Who is this for?` is prefilled from the clicked card.
  - `What are you hoping to explore?` checkboxes: `Just curious`, `Session`, `Education`.
  - Then availability and `Tell me anything`.
- Group modal:
  - `Who is this for?` is prefilled from the clicked card.
  - Uses `What are you planning?`, not "Path".
  - Final prompt: `Tell me more about the event/group.`
- Popup behavior:
  - No popup if `localStorage.sl_submitted` exists.
  - No repeat popup in the same tab if `sessionStorage.sl_popup_seen` exists.
  - Otherwise opens after actual 20% scroll once `window.SLHub` is ready.

## Important Files

- `index.html` — homepage audience funnel and collaboration section.
- `hub.js` — hub modal panels and form questions.
- `main.js` — global behavior, popup, hub triggers, theme preload.
- `src/js/site-nav.js` — shared navbar renderer.
- `src/data/session-catalog.js` — shared session package/add-on/deposit catalog.
- `netlify/functions/notify.js` — submission notification, Resend sync, draft session offer creation.
- `netlify/functions/followup.js` — follow-up sequence audience routing.
- `CHANGELOG.md` and `version.js` — update for every meaningful versioned change.

## Workflow Expectations

- Keep changes small and versioned.
- For meaningful changes:
  - add a top changelog entry,
  - bump `version.js`,
  - commit to `dev`,
  - push `origin dev`.
- Push often needs escalated network permission.

## Validation Commands

```sh
node --check main.js
node --check src/js/site-nav.js
node --check src/data/session-catalog.js
find netlify/functions -name '*.js' -maxdepth 3 -print -exec node --check {} \;
node scripts/version.js
git diff --check
git status --short
```

## Likely Next Cleanup

- Centralize footer rendering next, similar to nav.
- Render `pricing.html` package/add-on content from `src/data/session-catalog.js`; it is still static duplicate content.
- Consider aligning dedicated modal forms (`serve-individuals`, `serve-organizers`, `edu-person`, `edu-group`) with the newer homepage audience triage language.
