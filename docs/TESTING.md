# Sir Leo Site — Testing Guide

Test against the dev site: **https://dev--sirleo-site.netlify.app**  
Supabase dashboard: **https://supabase.com/dashboard/project/mwpscytkzjtkqjjqytqu/editor**  
Resend audience: **https://resend.com/audiences**

---

## 0. Landing Pages

### Core Landing Pages
Visit each on dev and verify form submits and analytics fire:

| Page | URL | panel_type | data.source_page |
|---|---|---|---|
| Group Events | /events | serve-organizers | events |
| Private Sessions | /sessions | serve-individuals | sessions |
| Education | /education | serve-learners | education |

**Verify for each:**
- Form submits → row in Supabase `submissions` with correct `panel_type` and `data.source_page`
- Thank-you state appears after submit (form hides, thanks message shows)
- Nav links render correctly
- Page is mobile-responsive
- Visiting `/training` 301 redirects to `/education`

### Email Sequences (followup.js)
The sequence is now 4-step per audience. To manually test a step:
1. Insert a test submission in Supabase with the desired `panel_type`/`data.source_page`, set `created_at` to a time that falls in the target window
2. Temporarily trigger the function via Netlify CLI: `netlify functions:invoke followup`
3. Verify email arrives with the correct audience-specific content
4. Verify `sequence_step` increments in the submissions row

---

## 1. Form Submissions

### Book a Session
1. Click **BOOK SIR LEO** or nav **BOOK** button
2. Walk through all 6 wizard steps — select options at each step
3. Fill name, phone, email on the final step → submit
4. **Verify:**
   - Row appears in Supabase `submissions` table with `panel_type = book`
   - Row appears in Supabase `contacts` table
   - Notification email arrives at sir.black.leo@gmail.com
   - Auto-reply email arrives at the address you entered
   - Google Voice receives SMS notification at (773) 234-8238
   - Contact appears in Resend General audience with `panel_type = book`

### Collab Panel
1. Click any **Collab** entry point
2. Fill out form → submit
3. **Verify:** Same as above with `panel_type = collab`

### Who I Serve Panels (4 types)
1. Click each card in the "Who I Serve" section: Individuals, Organizers, Artists, Learners
2. Submit each with a test email
3. **Verify:** `panel_type = serve-individuals` (etc.), `serve_type` set correctly in Resend
4. **Verify homepage routing:** Individuals → `/sessions?open`; Organizers/Artists → `/events?open`; Learners → `/education?open`

### Waitlist (AfterDark)
1. Click **Join the Waitlist** on the AfterDark section or via nav
2. Select GA vs VIP tier → submit
3. **Verify:**
   - Row in Supabase `waitlist` table with correct tier
   - Resend contact has `tier = ga` or `tier = vip`

### Contact Modal
1. Auto-popup fires after 15s + 50% scroll (or trigger manually in console: `window.SLHub.open('contact')`)
2. Submit with interests selected
3. **Verify:** Row in `submissions` with `panel_type = contact` and interests in `data` column

---

## 2. Attribution & Source Tracking

### UTM params
1. Visit `https://dev--sirleo-site.netlify.app?utm_source=instagram&utm_medium=bio`
2. Submit any form
3. **Verify:** `utm_source = instagram` on the submission row and Resend contact

### Referrer fallback (no UTM)
1. Open the site in a fresh tab with no UTM params
2. Check `sessionStorage.getItem('sl_source')` in browser console — should show `direct` or a parsed domain
3. Submit a form
4. **Verify:** `utm_source` on submission reflects the resolved source, not null

### Simulate Instagram referrer
1. In browser console: `sessionStorage.clear(); Object.defineProperty(document, 'referrer', { value: 'https://l.instagram.com/', configurable: true }); location.reload();`
2. Check `window.SL_SOURCE` after reload — should be `instagram`

---

## 3. Notifications

### Email (Resend)
- Notification email to sir.black.leo@gmail.com — check formatting, all fields present
- Auto-reply to lead — check tone, phone/IG links work

### SMS (Google Voice gateway)
- Submit a form → check (773) 234-8238 Google Voice inbox for SMS
- Message should read: `Sir Leo — New inquiry from [name] ([panel_type]). Phone: [phone]. Email: [email].`

---

## 4. Analytics

Open browser console → Network tab, filter by `supabase` requests, then:

1. **Pageview** — fires ~800ms after load, check `analytics` table for row with `event = pageview`
2. **Scroll depth** — scroll to 25%, 50%, 75%, 100% — check for `scroll_depth` events
3. **Click tracking** — click buttons, offering cards, social links — check `click` events
4. **Panel open/abandon** — open a panel, close without submitting → `panel_abandon` event
5. **Panel open + submit** — submit a form → `panel_open` event only (no abandon)
6. **Time on page** — switch tabs or minimize → `time_on_page` event should fire

---

## 5. UI & Theme

- [ ] Dark/light toggle persists on refresh (localStorage)
- [ ] Custom cursor shows on desktop, hidden on mobile/touch
- [ ] Scroll reveal animations fire on all sections
- [ ] Nav "scrolled" state triggers after 60px scroll
- [ ] Hero buttons: BOOK wires to hub, EXPLORE smooth-scrolls to Philosophy
- [ ] Offering cards click → open book panel at correct step
- [ ] Who I Serve cards click → open correct panel
- [ ] Footer version badge shows build version (not blank)

---

## 6. Mobile (480px)

- [ ] Modals go full-screen
- [ ] Hero CTAs stack vertically
- [ ] Nav theme toggle hidden
- [ ] AfterDark background text hidden
- [ ] Custom cursor hidden
- [ ] Text remains readable, no horizontal scroll

---

## 7. Resend Audience

After test submissions:
1. Go to resend.com → Audience → Contacts
2. Verify contact exists with correct:
   - `first_name`, `last_name`, `email`
   - `panel_type`, `utm_source`, `tier`, `serve_type`
3. On local/dev submissions, verify the contact lands in the test audience configured by `RESEND_TEST_AUDIENCE_ID`
4. On production submissions, verify the contact lands in the production audience configured by `RESEND_AUDIENCE_ID`

---

## 8. Admin Dashboard (Full)

1. Go to **/admin** → enter your admin password (set via `ADMIN_PASSWORD` env var)
2. **Overview** — verify stats cards populate, recent leads show, bar charts render
3. **Leads page:**
   - Search by name/email/phone — results narrow in real time
   - Filter buttons (book, collab, waitlist, etc.) — verify each narrows correctly
   - Click a row → detail drawer opens
   - Drawer: phone/email links work, copy buttons copy to clipboard
   - Select a pipeline status → click Save → reopen drawer → status persists
   - Add notes → Save → notes persist in Supabase
4. **Contacts page:**
   - Pipeline view shows 5 columns with contact cards
   - Table view shows all columns
   - Click card/row → opens lead drawer
5. **Waitlist page** — VIP and GA tables render separately
6. **Analytics page** — event type bars, source bars, city bars render (empty if no data)
7. **Refresh button** in sidebar reloads all data
8. **Security:** Open Network tab → confirm `admin-leads` returns 401 with wrong password

### Send Links (lead drawer)
9. Open any lead drawer → verify "Send Links" section appears below Quick Actions
10. URL displayed: should read `https://<domain>/build?client=<FirstName>` (first word of lead name)
11. Click "Session Builder" button → clipboard contains the URL, "✓ Copied" appears
12. Paste URL in a new tab → build.html loads with personalized heading ("Jordan's *session.*")
13. Lead with no name → URL ends with `/build` (no `?client=` param)
14. "Payment Link" button is disabled/greyed out — no click action



1. Go to **https://dev--sirleo-site.netlify.app/admin**
2. Enter your admin password (change via `netlify env:set ADMIN_PASSWORD yourpassword`)
3. **Verify:**
   - Login works, wrong password shows error
   - Stats row shows correct counts
   - Submissions table shows all leads with name, phone, email, type, source
   - Filter buttons narrow table correctly (Book, Collab, Waitlist, etc.)
   - Phone links open SMS app, email links open mail client
   - Waitlist table shows tier badges (GA / VIP)
   - Refresh button reloads data without re-login

### Security check
- Open Network tab → verify `/.netlify/functions/admin-leads` returns 401 with wrong/no password
- Verify service key is NOT present anywhere in page source or JS

---

## 9. Multi-Step Follow-up

### Manual trigger test
```bash
curl -X POST https://dev--sirleo-site.netlify.app/.netlify/functions/followup
```
Should return `{ sent: N, errors: N }`.

### End-to-end test
1. Submit a form with a real email
2. In Supabase editor, manually set `created_at` on that row to a target window and set `sequence_step` to the previous step:
   - Step 1: 44–52 hours old, `sequence_step = 0`
   - Step 2: 116–124 hours old, `sequence_step = 1`
   - Step 3: 236–244 hours old, `sequence_step = 2`
   - Step 4: 500–516 hours old, `sequence_step = 3`
3. Trigger the function manually (curl above)
4. **Verify:**
   - Follow-up email arrives at the submitted address
   - `sequence_step` increments on the row in Supabase
   - Running the function again does NOT re-send (idempotent)

---

## 10. Pricing Page (`/pricing`)

1. Go to **/pricing**
2. Verify the three session packages show:
   - Sensual Surrender — $200
   - Mr. Naughty & Nasty — $300
   - The Sadistic Devil — $400
3. Verify add-ons match the session builder: Fire Play, Rope Bondage, Sensory Deprivation, Session Photography, Extended Aftercare, Time Extension, Orgasmic Edition
4. Verify membership appears as a secondary returning-client callout, not the primary pricing model
5. **CTAs** — session/package CTAs route to the current booking/session flow
6. **Theme** — dark/light persists, text readable in both modes
7. **Mobile** — cards stack cleanly on narrow screens

---

## 11. Session Builder (`/build`)

### Basic flow
1. Go to **/build** — verify heading reads "Build your *session.*"
2. Go to **/build?client=Jordan** — heading should read "Jordan's *session.*"

### Duration selection
3. Default: Sensual Surrender (1 hour, $200) card is selected (crimson border, tinted background)
4. Click Mr. Naughty & Nasty → summary bar updates to $300
5. Click The Sadistic Devil → summary bar updates to $400
6. Only one card selected at a time

### Add-ons
7. Check Fire Play (+$100) → total increases by $100
8. Check Rope Bondage (+$75) → total increases by another $75
9. Uncheck Fire Play → total decreases by $100
10. Check multiple add-ons → total = base + all checked add-ons
11. Checked add-on row gets crimson border highlight

### Summary bar
12. Items line (top) reflects selected duration name + checked add-on names separated by ` · `
13. Total price updates instantly on any change
14. Pay in full is checked by default
15. Deposit note appears when deposit mode is selected: "Deposit: $X due today — remainder at session" (50% of total)

### Pay in full toggle
16. Check "Pay in full" → note changes to "Full payment due today", deposit note disappears
17. Uncheck → reverts to deposit note

### Pay button
18. Click "Secure Session →" with `STRIPE_PUBLISHABLE_KEY` configured → creates a Stripe Checkout session and redirects to Stripe
19. With no Stripe publishable key configured → button alerts that payment is not configured and does not crash

### Notes textarea
20. Type in the notes field — no JS errors, content persists while on page

### Theme
21. Dark/light theme applies via localStorage (same as rest of site)

---

## 12. Light Mode

- [ ] Main site: toggle to light → all nav links, hero text, section content readable
- [ ] Footer version badge visible in both modes
- [ ] Admin: toggle to light → login input has visible border, password field readable
- [ ] Admin: tag pills (book, collab, waitlist, etc.) have dark text, not washed-out light colors
- [ ] Admin: pipeline status dots are dark and visible in light mode
- [ ] Pricing page: card borders visible in light mode (not white-on-white)
- [ ] Build page: summary bar has correct background and readable text in light mode

---

## Quick Console Shortcuts

```js
// Open any panel manually
window.SLHub.open('book')
window.SLHub.open('waitlist')
window.SLHub.open('contact')
window.SLHub.open('serve-individuals')

// Check session data
sessionStorage.getItem('sl_source')   // resolved traffic source
sessionStorage.getItem('sl_utm')      // UTM params if present
sessionStorage.getItem('sl_sid')      // session ID
window.SL_VERSION                     // deployed version
```
