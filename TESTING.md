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
