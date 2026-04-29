# Sir Leo Site — Testing Guide

Test against the dev site: **https://dev--sirleo-site.netlify.app**  
Supabase dashboard: **https://supabase.com/dashboard/project/mwpscytkzjtkqjjqytqu/editor**  
Resend audience: **https://resend.com/audiences**

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
3. Go to Segments → create a test segment filtering by `panel_type = book` → verify contact appears

---

## 8. Admin Dashboard (Full)

1. Go to **/admin** → enter password `SirLeo2024!`
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
2. Enter password: `SirLeo2024!` (change via `netlify env:set ADMIN_PASSWORD yourpassword`)
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

## 9. Day 2 Follow-up

### Manual trigger test
```bash
curl -X POST https://dev--sirleo-site.netlify.app/.netlify/functions/followup
```
Should return `{ sent: N, total: N }`.

### End-to-end test
1. Submit a form with a real email
2. In Supabase editor, manually set `created_at` on that row to 48 hours ago
3. Trigger the function manually (curl above)
4. **Verify:**
   - Follow-up email arrives at the submitted address
   - `follow_up_sent` flips to `true` on the row in Supabase
   - Running the function again does NOT re-send (idempotent)

---

## 10. Pricing Page (`/pricing`)

1. Go to **/pricing**
2. **Default state (Single)**
   - Initiate shows $150 / per session
   - Devotee shows `—` (membership only, no single price)
   - Consecrated shows `—`
3. **Toggle Monthly**
   - Initiate → $120, Devotee → $320 / "2 sessions included", Consecrated → $600 / "4 sessions included"
4. **Toggle Annual**
   - Initiate → $100, Devotee → $256 / "billed $3,072/yr", Consecrated → $480 / "billed $5,760/yr"
5. **Featured card** — Devotee has "Most Popular" banner, filled CTA button
6. **CTAs** — all three "Apply" buttons navigate to `/book.html`
7. **Theme** — dark/light persists, text readable in both modes
8. **Mobile** — cards stack to single column on < 768px

---

## 11. Session Builder (`/build`)

### Basic flow
1. Go to **/build** — verify heading reads "Build your *session.*"
2. Go to **/build?client=Jordan** — heading should read "Jordan's *session.*"

### Duration selection
3. Default: Initiation (90min, $150) card is selected (crimson border, tinted background)
4. Click Immersion → summary bar updates to $250
5. Click Extended Rite → summary bar updates to $400
6. Only one card selected at a time

### Add-ons
7. Check Fire Play (+$75) → total increases by $75
8. Check Rope Bondage (+$75) → total increases by another $75
9. Uncheck Fire Play → total decreases by $75
10. Check multiple add-ons → total = base + all checked add-ons
11. Checked add-on row gets crimson border highlight

### Summary bar
12. Items line (top) reflects selected duration name + checked add-on names separated by ` · `
13. Total price updates instantly on any change
14. Deposit note: "Deposit: $X due today — remainder at session" (50% of total)

### Pay in full toggle
15. Check "Pay in full" → note changes to "Full payment due today", deposit note disappears
16. Uncheck → reverts to deposit note

### Pay button (pre-Stripe)
17. Click "Secure Session →" → alert fires explaining Stripe not yet connected
18. No network request, no crash

### Notes textarea
19. Type in the notes field — no JS errors, content persists while on page

### Theme
20. Dark/light theme applies via localStorage (same as rest of site)

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
