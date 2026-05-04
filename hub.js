// Sir Leo — Hub (action cards, booking wizard, collab, contact modal, FAQ)
// Mounts to #hub-root and exposes window.SLHub = { open, close }

const { useState, useRef, useEffect, useCallback } = React;

// ── Supabase helpers ──
function collectFields(el) {
  if (!el) return {};
  const out = {};
  el.querySelectorAll('.hub-field').forEach(f => {
    const label = f.querySelector('.hub-label')?.textContent?.trim();
    const checked = f.querySelectorAll('input[type="checkbox"]:checked');
    if (checked.length) {
      out[label] = Array.from(checked).map(cb => cb.value).join(', ');
    } else {
      const inp = f.querySelector('input:not([type="checkbox"]), select, textarea');
      if (label && inp?.value?.trim() && !['Name','Phone','Email'].includes(label))
        out[label] = inp.value.trim();
    }
  });
  return out;
}

function saveToSupabase(panelType, name, phone, email, data) {
  window.SLSubmissions?.save({ panelType, name, phone, email, data });
}

// ── Wizard step transition style ──
function stepStyle(id, current) {
  const active = id === current;
  return {
    width: '100%',
    transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease',
    ...(active
      ? { transform: 'translateX(0)', opacity: 1 }
      : { transform: 'translateX(100%)', opacity: 0, position: 'absolute', top: 0, pointerEvents: 'none' })
  };
}

// ── Book Panel ──
function BookPanel({ onClose, initialStep = 'type', initialSels = [] }) {
  const [step, setStep] = useState(initialStep);
  const [prev, setPrev] = useState('type');
  const [sels, setSels] = useState(initialSels);
  const nameRef = useRef(); const phoneRef = useRef(); const emailRef = useRef();
  const panelRef = useRef();

  function go(toStep, label) {
    if (label) setSels(s => [...s, label]);
    setPrev(step); setStep(toStep);
  }
  function back(toStep) { setStep(toStep || prev); }

  useEffect(() => {
    if (step === 'contact') {
      const n = localStorage.getItem('sl_name'); const e = localStorage.getItem('sl_email');
      if (nameRef.current && n) nameRef.current.value = n;
      if (emailRef.current && e) emailRef.current.value = e;
    }
  }, [step]);

  function submit() {
    if (!phoneRef.current?.value?.trim()) {
      phoneRef.current.style.borderColor = 'rgba(155,32,32,0.8)';
      setTimeout(() => { if (phoneRef.current) phoneRef.current.style.borderColor = ''; }, 2000);
      return;
    }
    if (nameRef.current?.value)  localStorage.setItem('sl_name',  nameRef.current.value);
    if (emailRef.current?.value) localStorage.setItem('sl_email', emailRef.current.value);
    saveToSupabase('book', nameRef.current?.value, phoneRef.current?.value, emailRef.current?.value,
      { selections: sels, ...collectFields(panelRef.current) });
    setStep('confirm');
    localStorage.setItem('sl_submitted', '1');
    setTimeout(() => { onClose(true); setTimeout(() => { setStep('type'); setSels([]); }, 500); }, 3200);
  }

  const eyebrow = sels.join(' · ') || 'Book Sir Leo';
  const S = id => stepStyle(id, step);

  return (
    <div ref={panelRef} style={{ position: 'relative', minHeight: '320px', overflow: 'hidden' }}>

      {/* type */}
      <div style={S('type')}>
        <p className="hub-eyebrow">Enter the Rite</p>
        <p className="hub-dialog-title">How can Sir Leo<br />serve you?</p>
        <div className="hub-panel-options">
          {[
            ['Private Session',       '1-on-1 or couple · Apply to be considered',   'private-format'],
            ['Group Experience',      'Performance or interactive immersion',          'group-format'],
            ['Performance Booking',   'Fire · Impact artistry · Events & clubs',      'perf-q'],
            ['Workshop / Education',  'Conscious kink · Chicago & virtual',           'workshop-q'],
            ['Attend an Event',       'KINK AfterDark — join the waitlist',            null],
          ].map(([label, sub, toStep]) => (
            <button key={label} className="hub-panel-option"
              onClick={() => toStep ? go(toStep, label) : window.open('https://kinkafterdark.short.gy/casting','_blank')}>
              <div>
                <div className="hub-card-label">{label}</div>
                <div className="hub-card-sub">{sub}</div>
              </div>
              <span className="hub-arrow">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* private-format */}
      <div style={S('private-format')}>
        <button className="hub-back" onClick={() => back('type')}>← Back</button>
        <p className="hub-eyebrow">Private Session</p>
        <p className="hub-dialog-title">Who is this<br />session for?</p>
        <div className="hub-panel-options">
          {[['1-on-1','Just you and Sir Leo'],['Couple','You and your partner']].map(([l,s]) => (
            <button key={l} className="hub-panel-option" onClick={() => go('private-tier', l)}>
              <div><div className="hub-card-label">{l}</div><div className="hub-card-sub">{s}</div></div>
              <span className="hub-arrow">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* private-tier */}
      <div style={S('private-tier')}>
        <button className="hub-back" onClick={() => back('private-format')}>← Back</button>
        <p className="hub-eyebrow">Choose Your Rite</p>
        <p className="hub-dialog-title">How deep do you<br />want to go?</p>
        <div className="hub-panel-options">
          {[
            ['Sensual Surrender',   'Massage, touch, restrained control'],
            ['The Naughty Ritual',  'Moderate impact, erotic aggression'],
            ['Rite of Dark Ruin',   'Heavy impact, full ritual domination'],
          ].map(([l,s]) => (
            <button key={l} className="hub-panel-option" onClick={() => go('private-q', l)}>
              <div><div className="hub-card-label">{l}</div><div className="hub-card-sub">{s}</div></div>
              <span className="hub-arrow">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* private-q */}
      <div style={S('private-q')}>
        <button className="hub-back" onClick={() => back('private-tier')}>← Back</button>
        <p className="hub-eyebrow">{eyebrow}</p>
        <p className="hub-dialog-title">A few things<br />Sir Leo needs to know.</p>
        <div className="hub-form">
          <div className="hub-field"><label className="hub-label">Experience Level</label>
            <select className="hub-select"><option value="" disabled selected>Select your level</option>
              {['Never — this would be my first time','Curious beginner','Some experience','Experienced'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">Any hard limits Sir Leo should know?</label>
            <input className="hub-input" type="text" placeholder="Optional" /></div>
          <div className="hub-field"><label className="hub-label">Best days & times for a consultation call</label>
            <input className="hub-input" type="text" placeholder="e.g. Weekday evenings, Saturday mornings" /></div>
          <div className="hub-field"><label className="hub-label">Anything else?</label>
            <textarea className="hub-textarea" placeholder="Open space — say whatever feels right"></textarea></div>
          <button className="hub-submit" onClick={() => go('contact', null)}>Continue</button>
        </div>
      </div>

      {/* group-format */}
      <div style={S('group-format')}>
        <button className="hub-back" onClick={() => back('type')}>← Back</button>
        <p className="hub-eyebrow">Group Experience</p>
        <p className="hub-dialog-title">How do you want<br />to experience this?</p>
        <div className="hub-panel-options">
          {[['Performance','Watch Sir Leo perform — no participation','group-q'],
            ['Interactive','Watch and participate — choose your depth','group-level']].map(([l,s,t]) => (
            <button key={l} className="hub-panel-option" onClick={() => go(t, l)}>
              <div><div className="hub-card-label">{l}</div><div className="hub-card-sub">{s}</div></div>
              <span className="hub-arrow">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* group-level */}
      <div style={S('group-level')}>
        <button className="hub-back" onClick={() => back('group-format')}>← Back</button>
        <p className="hub-eyebrow">Interactive Experience</p>
        <p className="hub-dialog-title">How deep do you<br />want to go?</p>
        <div className="hub-panel-options">
          {[['Taste','A brief, introductory touch'],['Semi-Immersive',"Deeper participation — you're in it"],['Full Immersion','As deep and wild as you desire']].map(([l,s]) => (
            <button key={l} className="hub-panel-option" onClick={() => go('group-q', l)}>
              <div><div className="hub-card-label">{l}</div><div className="hub-card-sub">{s}</div></div>
              <span className="hub-arrow">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* group-q */}
      <div style={S('group-q')}>
        <button className="hub-back" onClick={() => back('group-format')}>← Back</button>
        <p className="hub-eyebrow">{eyebrow}</p>
        <p className="hub-dialog-title">A few things<br />Sir Leo needs to know.</p>
        <div className="hub-form">
          <div className="hub-field"><label className="hub-label">Experience Level</label>
            <select className="hub-select"><option value="" disabled selected>Select</option>
              {['Never — this would be my first time','Curious beginner','Some experience','Experienced'].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">Availability</label>
            <input className="hub-input" type="text" placeholder="e.g. Weekends, Friday evenings" /></div>
          <div className="hub-field"><label className="hub-label">Anything else?</label>
            <textarea className="hub-textarea" placeholder="Open space"></textarea></div>
          <button className="hub-submit" onClick={() => go('contact', null)}>Continue</button>
        </div>
      </div>

      {/* perf-q */}
      <div style={S('perf-q')}>
        <button className="hub-back" onClick={() => back('type')}>← Back</button>
        <p className="hub-eyebrow">Performance Booking</p>
        <p className="hub-dialog-title">Tell Sir Leo<br />about your event.</p>
        <div className="hub-form">
          <div className="hub-field"><label className="hub-label">Event Type</label>
            <select className="hub-select"><option value="" disabled selected>Select</option>
              {['Club / Nightlife','Private party','Art gallery','Conference / Workshop','Other'].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">Event Date & City</label>
            <input className="hub-input" type="text" placeholder="e.g. June 14, Chicago" /></div>
          <div className="hub-field"><label className="hub-label">Anything else?</label>
            <textarea className="hub-textarea" placeholder="Vision, vibe, expectations..."></textarea></div>
          <button className="hub-submit" onClick={() => go('contact', null)}>Continue</button>
        </div>
      </div>

      {/* workshop-q */}
      <div style={S('workshop-q')}>
        <button className="hub-back" onClick={() => back('type')}>← Back</button>
        <p className="hub-eyebrow">Workshop / Education</p>
        <p className="hub-dialog-title">Let's build<br />the right experience.</p>
        <div className="hub-form">
          <div className="hub-field"><label className="hub-label">Who is this for?</label>
            <select className="hub-select"><option value="" disabled selected>Select</option>
              {['Just me','Me and my partner','A group'].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">Format</label>
            <select className="hub-select"><option value="" disabled selected>Select</option>
              {['In-person (Chicago)','Virtual','Either works'].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">Anything else?</label>
            <textarea className="hub-textarea" placeholder="Topics of interest, goals, questions..."></textarea></div>
          <button className="hub-submit" onClick={() => go('contact', null)}>Continue</button>
        </div>
      </div>

      {/* contact */}
      <div style={S('contact')}>
        <button className="hub-back" onClick={() => back(prev)}>← Back</button>
        <p className="hub-eyebrow">{eyebrow}</p>
        <p className="hub-dialog-title">Your details.</p>
        <div className="hub-form">
          <div className="hub-field"><label className="hub-label">Name</label>
            <input className="hub-input" ref={nameRef} type="text" placeholder="Your name" /></div>
          <div className="hub-field"><label className="hub-label">Phone</label>
            <input className="hub-input" ref={phoneRef} type="tel" placeholder="Your number" /></div>
          <div className="hub-field"><label className="hub-label">Email</label>
            <input className="hub-input" ref={emailRef} type="email" placeholder="Your email" /></div>
          <button className="hub-submit" onClick={submit}>Submit Application</button>
        </div>
      </div>

      {/* confirm */}
      <div style={S('confirm')}>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: '28px', color: '#B8922E', marginBottom: '16px' }}>✦</div>
          <p className="hub-dialog-title" style={{ fontStyle: 'italic' }}>Application received.</p>
          <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(240,232,216,0.55)', letterSpacing: '0.04em', lineHeight: '2.0' }}>
            Sir Leo will be in touch.<br />Consider carefully — not all are chosen.
          </p>
        </div>
      </div>

    </div>
  );
}

// ── Collab Panel ──
function CollabPanel({ onClose }) {
  const [step, setStep] = useState('type');
  const [sels, setSels] = useState([]);
  const nameRef = useRef(); const phoneRef = useRef(); const emailRef = useRef();
  const panelRef = useRef();

  function go(toStep, label) { if (label) setSels(s => [...s, label]); setStep(toStep); }

  useEffect(() => {
    if (step === 'contact') {
      const n = localStorage.getItem('sl_name'); const e = localStorage.getItem('sl_email');
      if (nameRef.current && n) nameRef.current.value = n;
      if (emailRef.current && e) emailRef.current.value = e;
    }
  }, [step]);

  function submit() {
    if (!phoneRef.current?.value?.trim()) {
      phoneRef.current.style.borderColor = 'rgba(155,32,32,0.8)';
      setTimeout(() => { if (phoneRef.current) phoneRef.current.style.borderColor = ''; }, 2000);
      return;
    }
    if (nameRef.current?.value)  localStorage.setItem('sl_name',  nameRef.current.value);
    if (emailRef.current?.value) localStorage.setItem('sl_email', emailRef.current.value);
    saveToSupabase('collab', nameRef.current?.value, phoneRef.current?.value, emailRef.current?.value,
      { selections: sels, ...collectFields(panelRef.current) });
    setStep('confirm');
    setTimeout(() => { onClose(true); setTimeout(() => { setStep('type'); setSels([]); }, 500); }, 3200);
  }

  const S = id => stepStyle(id, step);

  return (
    <div ref={panelRef} style={{ position: 'relative', minHeight: '260px', overflow: 'hidden' }}>
      <div style={S('type')}>
        <p className="hub-eyebrow">Join the World</p>
        <p className="hub-dialog-title">What role do you<br />play in this?</p>
        <div className="hub-panel-options">
          {[
            ['Service Submissive',         'Dedicated · Discreet · Devoted',       'sub-q'],
            ['Model / Dancer',             'Performance & event talent',            'model-q'],
            ['Photographer / Videographer','Capture the world of Sir Leo',          'photo-q'],
            ['Content Creator',            'Collab · Co-create · Amplify',          'creator-q'],
          ].map(([l,s,t]) => (
            <button key={l} className="hub-panel-option" onClick={() => go(t, l)}>
              <div><div className="hub-card-label">{l}</div><div className="hub-card-sub">{s}</div></div>
              <span className="hub-arrow">→</span>
            </button>
          ))}
        </div>
      </div>

      {['sub-q','model-q','photo-q','creator-q'].map(id => (
        <div key={id} style={S(id)}>
          <button className="hub-back" onClick={() => setStep('type')}>← Back</button>
          <p className="hub-eyebrow">{sels[sels.length-1] || 'Collaborate'}</p>
          <p className="hub-dialog-title">Tell Sir Leo<br />about yourself.</p>
          <div className="hub-form">
            {id === 'sub-q' && <>
              <div className="hub-field"><label className="hub-label">What draws you to serving Sir Leo?</label>
                <textarea className="hub-textarea" placeholder="Be honest. Be yourself."></textarea></div>
              <div className="hub-field"><label className="hub-label">Commitment</label>
                <select className="hub-select"><option value="" disabled selected>Select</option>
                  {['One-time experience','Ongoing','Open to either'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </>}
            {['model-q','photo-q','creator-q'].includes(id) && (
              <div className="hub-field"><label className="hub-label">Social handle or portfolio link</label>
                <input className="hub-input" type="text" placeholder="@handle or URL" /></div>
            )}
            <div className="hub-field"><label className="hub-label">Anything else?</label>
              <textarea className="hub-textarea" placeholder="Open space"></textarea></div>
            <button className="hub-submit" onClick={() => go('contact', null)}>Continue</button>
          </div>
        </div>
      ))}

      <div style={S('contact')}>
        <button className="hub-back" onClick={() => setStep('type')}>← Back</button>
        <p className="hub-eyebrow">{sels.join(' · ')}</p>
        <p className="hub-dialog-title">Your details.</p>
        <div className="hub-form">
          <div className="hub-field"><label className="hub-label">Name</label>
            <input className="hub-input" ref={nameRef} type="text" placeholder="Your name" /></div>
          <div className="hub-field"><label className="hub-label">Phone</label>
            <input className="hub-input" ref={phoneRef} type="tel" placeholder="Your number" /></div>
          <div className="hub-field"><label className="hub-label">Email</label>
            <input className="hub-input" ref={emailRef} type="email" placeholder="Your email" /></div>
          <button className="hub-submit" onClick={submit}>Submit</button>
        </div>
      </div>

      <div style={S('confirm')}>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: '28px', color: '#B8922E', marginBottom: '16px' }}>✦</div>
          <p className="hub-dialog-title" style={{ fontStyle: 'italic' }}>Submission received.</p>
          <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(240,232,216,0.55)', letterSpacing: '0.04em', lineHeight: '2.0' }}>Sir Leo will review and be in touch.</p>
        </div>
      </div>
    </div>
  );
}

// ── Contact / Stay Connected Modal ──
function ContactModal({ onClose }) {
  const [done, setDone] = useState(false);
  const nameRef = useRef(); const phoneRef = useRef(); const emailRef = useRef();
  const interests = ['Just Curious','Private Session','Group Experience','Event / Performance','Collaborate','Learning / Education'];
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const n = localStorage.getItem('sl_name'); const e = localStorage.getItem('sl_email');
    if (nameRef.current && n) nameRef.current.value = n;
    if (emailRef.current && e) emailRef.current.value = e;
  }, []);

  function toggle(k) { setChecked(c => ({ ...c, [k]: !c[k] })); }
  function submit() {
    if (!phoneRef.current?.value?.trim()) {
      phoneRef.current.style.borderColor = 'rgba(155,32,32,0.8)';
      setTimeout(() => { if (phoneRef.current) phoneRef.current.style.borderColor = ''; }, 2000);
      return;
    }
    if (nameRef.current?.value)  localStorage.setItem('sl_name',  nameRef.current.value);
    if (emailRef.current?.value) localStorage.setItem('sl_email', emailRef.current.value);
    saveToSupabase('contact', nameRef.current?.value, phoneRef.current?.value, emailRef.current?.value,
      { interests: Object.keys(checked).filter(k => checked[k]) });
    localStorage.setItem('sl_submitted', '1');
    setDone(true);
    setTimeout(() => onClose(true), 2400);
  }

  if (done) return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <div style={{ fontSize: '28px', color: '#B8922E', marginBottom: '16px' }}>✦</div>
      <p className="hub-dialog-title" style={{ fontStyle: 'italic' }}>You're inside.</p>
      <p style={{ fontSize: '12px', color: 'rgba(240,232,216,0.4)', letterSpacing: '0.08em' }}>Expect to hear from Sir Leo.</p>
    </div>
  );

  return (
    <>
      <p className="hub-eyebrow">Step Inside</p>
      <p className="hub-dialog-title">Stay in the world<br />of Sir Leo.</p>
      <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(240,232,216,0.5)', letterSpacing: '0.04em', marginBottom: '24px' }}>Leave your details. I'll be in touch.</p>
      <div className="hub-form">
        <div className="hub-field"><label className="hub-label">Name</label>
          <input className="hub-input" ref={nameRef} type="text" placeholder="Your name" /></div>
        <div className="hub-field"><label className="hub-label">Phone</label>
          <input className="hub-input" ref={phoneRef} type="tel" placeholder="Your number" /></div>
        <div className="hub-field"><label className="hub-label">Email</label>
          <input className="hub-input" ref={emailRef} type="email" placeholder="Your email" /></div>
        <div className="hub-field">
          <label className="hub-label">What brings you here?</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            {interests.map(i => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!checked[i]} onChange={() => toggle(i)}
                  style={{ accentColor: '#6B1A1A', width: '14px', height: '14px' }} />
                <span style={{ fontSize: '13px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,232,216,0.6)' }}>{i}</span>
              </label>
            ))}
          </div>
        </div>
        <button className="hub-submit" onClick={submit}>Enter the World</button>
      </div>
    </>
  );
}

// ── Serve Panel (custom per audience) ──
function ServePanel({ onClose, type, who }) {
  const [step, setStep] = useState('questions');
  const nameRef = useRef(); const phoneRef = useRef(); const emailRef = useRef();
  const panelRef = useRef();
  const [groupBuild] = useState(() => {
    if (type !== 'serve-organizers') return null;
    try {
      const saved = JSON.parse(sessionStorage.getItem('sl_group_build') || 'null');
      return saved && typeof saved === 'object' ? saved : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (step === 'contact') {
      const n = localStorage.getItem('sl_name'); const e = localStorage.getItem('sl_email');
      if (nameRef.current && n) nameRef.current.value = n;
      if (emailRef.current && e) emailRef.current.value = e;
    }
  }, [step]);

  function submit() {
    if (!phoneRef.current?.value?.trim()) {
      phoneRef.current.style.borderColor = 'rgba(155,32,32,0.8)';
      setTimeout(() => { if (phoneRef.current) phoneRef.current.style.borderColor = ''; }, 2000);
      return;
    }
    if (nameRef.current?.value)  localStorage.setItem('sl_name',  nameRef.current.value);
    if (emailRef.current?.value) localStorage.setItem('sl_email', emailRef.current.value);
    saveToSupabase(type, nameRef.current?.value, phoneRef.current?.value, emailRef.current?.value,
      collectFields(panelRef.current));
    setStep('confirm');
    localStorage.setItem('sl_submitted', '1');
    setTimeout(() => { onClose(true); setTimeout(() => setStep('questions'), 500); }, 3200);
  }

  const S = id => stepStyle(id, step);
  const groupBuildType = groupBuild?.package === 'Bachelorette Package'
    ? 'Private group celebration (bachelorette, birthday, etc.)'
    : groupBuild?.package === 'Show & Performance'
      ? 'Other'
      : '';
  const groupBuildVision = groupBuild
    ? [
        groupBuild.package ? `Build type: ${groupBuild.package}` : '',
        groupBuild.directions?.length ? `Direction/logistics: ${groupBuild.directions.join(', ')}` : '',
        groupBuild.notes ? `Notes: ${groupBuild.notes}` : '',
      ].filter(Boolean).join('\n')
    : '';

  const configs = {
    'audience-individuals': {
      eyebrow: 'Individuals & Couples',
      title: <>What are you<br />looking for?</>,
      fields: (
        <>
          <div className="hub-field"><label className="hub-label">Who is this for?</label>
            {who
              ? <input className="hub-input" type="text" defaultValue={who} readOnly style={{opacity:0.55, cursor:'default'}} />
              : <select className="hub-select" defaultValue="">
                  <option value="" disabled>Select</option>
                  {['Just me','Me and my partner'].map(o => <option key={o}>{o}</option>)}
                </select>
            }
          </div>
          <div className="hub-field"><label className="hub-label">What are you hoping to explore?</label>
            <div className="hub-checks">
              {['Just curious','Session','Education'].map(o => (
                <label key={o} className="hub-check-item"><input type="checkbox" value={o} /><span>{o}</span></label>
              ))}
            </div>
          </div>
          <div className="hub-field"><label className="hub-label">Best availability</label>
            <input className="hub-input" type="text" placeholder="e.g. Weekday evenings, Saturday mornings" /></div>
          <div className="hub-field"><label className="hub-label">Tell me anything</label>
            <textarea className="hub-textarea" placeholder="Desire, questions, experience level, limits, curiosity — whatever helps Sir Leo understand you." /></div>
        </>
      )
    },
    'audience-organizers': {
      eyebrow: 'Organizers & Groups',
      title: <>What are you<br />bringing together?</>,
      fields: (
        <>
          <div className="hub-field"><label className="hub-label">Who is this for?</label>
            {who
              ? <input className="hub-input" type="text" defaultValue={who} readOnly style={{opacity:0.55, cursor:'default'}} />
              : <input className="hub-input" type="text" placeholder="Organization, group, venue, or event" />
            }
          </div>
          <div className="hub-field"><label className="hub-label">What are you planning?</label>
            <select className="hub-select" defaultValue="">
              <option value="" disabled>Select</option>
              {['Group experience / private event','Workshop / education','Venue or partner program','Performance booking','Not sure yet'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">Group or event type</label>
            <select className="hub-select" defaultValue="">
              <option value="" disabled>Select</option>
              {['Private friend group','Bachelorette / birthday / celebration','Organization / company','Salon, spa, or wellness space','Club, venue, or producer','Other'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">Date, city, and rough size</label>
            <input className="hub-input" type="text" placeholder="e.g. June 14, Chicago, 20 people" /></div>
          <div className="hub-field"><label className="hub-label">Tell me more about the event/group.</label>
            <textarea className="hub-textarea" placeholder="Tell me the tone, audience, goals, and any boundaries or logistics." /></div>
        </>
      )
    },
    'serve-individuals': {
      eyebrow: 'Private Session',
      title: <>Tell Sir Leo<br />about you.</>,
      fields: (
        <>
          <div className="hub-field"><label className="hub-label">Who is this for?</label>
            <select className="hub-select" defaultValue="">
              <option value="" disabled>Select</option>
              {['Just me','Me and my partner'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">Experience level</label>
            <select className="hub-select" defaultValue="">
              <option value="" disabled>Select your level</option>
              {['Never — this would be my first time','Curious beginner','Some experience','Experienced'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">What are you most curious about?</label>
            <textarea className="hub-textarea" placeholder="Be honest — there's no wrong answer." /></div>
          <div className="hub-field"><label className="hub-label">Best availability</label>
            <input className="hub-input" type="text" placeholder="e.g. Weekday evenings, Saturday mornings" /></div>
        </>
      )
    },
    'serve-organizers': {
      eyebrow: 'Events',
      title: <>Tell Sir Leo<br />about your event.</>,
      fields: (
        <>
          <div className="hub-field"><label className="hub-label">What brings you here?</label>
            <select className="hub-select" defaultValue={groupBuildType}>
              <option value="" disabled>Select</option>
              {['Private group celebration (bachelorette, birthday, etc.)','Venue or partner program','Other'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">Date & city</label>
            <input className="hub-input" type="text" placeholder="e.g. June 14, Chicago" /></div>
          <div className="hub-field"><label className="hub-label">Group size</label>
            <select className="hub-select" defaultValue="">
              <option value="" disabled>Select</option>
              {['Under 10','10–30','30–100','100+'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">What are you envisioning?</label>
            <textarea className="hub-textarea" defaultValue={groupBuildVision} placeholder="Tell me what you have in mind." /></div>
        </>
      )
    },
    'edu-person': {
      eyebrow: 'Education',
      title: <>Let's build<br />your path.</>,
      fields: (
        <>
          <div className="hub-field"><label className="hub-label">Who is this for?</label>
            {who
              ? <input className="hub-input" type="text" defaultValue={who} readOnly style={{opacity:0.55, cursor:'default'}} />
              : <select className="hub-select" defaultValue="">
                  <option value="" disabled>Select</option>
                  {['Just me','Me and my partner'].map(o => <option key={o}>{o}</option>)}
                </select>
            }
          </div>
          <div className="hub-field">
            <label className="hub-label">Role I want to learn</label>
            <div className="hub-checks">
              {['How to Dominate','How to Submit','Both / Still exploring'].map(r => (
                <label key={r} className="hub-check-item"><input type="checkbox" value={r} /><span>{r}</span></label>
              ))}
            </div>
          </div>
          <div className="hub-field"><label className="hub-label">What's the intention?</label>
            <select className="hub-select" defaultValue="">
              <option value="" disabled>Select</option>
              {['Recreational / Pleasure','Professional (building a practice)','Both'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field">
            <label className="hub-label">Topics I'm interested in</label>
            <div className="hub-checks">
              {['General Kink','Alternative Lifestyle','Power Dynamics','Sensation Play','Consent & Communication','Bedroom Kink & Dynamics'].map(t => (
                <label key={t} className="hub-check-item"><input type="checkbox" value={t} /><span>{t}</span></label>
              ))}
            </div>
          </div>
          <div className="hub-field"><label className="hub-label">Notes</label>
            <textarea className="hub-textarea" placeholder="Anything else — experience level, questions, what you're hoping to build." /></div>
        </>
      )
    },
    'group-inquiry': {
      eyebrow: 'Group Experience',
      title: <>Tell Sir Leo<br />about your group.</>,
      fields: (
        <>
          <div className="hub-field"><label className="hub-label">What are you planning?</label>
            <select className="hub-select" defaultValue={who || ''}>
              <option value="" disabled>Select</option>
              {['Group intimate experience','Bachelorette / birthday celebration','Show or performance booking','Not sure yet'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">Estimated guest count</label>
            <select className="hub-select" defaultValue="">
              <option value="" disabled>Select</option>
              {['Under 10','10–20','20–50','50+'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">Date & city</label>
            <input className="hub-input" type="text" placeholder="e.g. July 12, Chicago" /></div>
          <div className="hub-field"><label className="hub-label">Tone & intensity</label>
            <select className="hub-select" defaultValue="">
              <option value="" disabled>Select</option>
              {['Light & sensual','Medium — some edge','Full expression','Not sure yet'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">Tell me about the occasion</label>
            <textarea className="hub-textarea" placeholder="What's happening, who it's for, what you want them to walk away feeling." /></div>
        </>
      )
    },
    'edu-group': {
      eyebrow: 'Group · Education',
      title: <>Let's build<br />your group experience.</>,
      fields: (
        <>
          <div className="hub-field"><label className="hub-label">What's the group?</label>
            <select className="hub-select" defaultValue="">
              <option value="" disabled>Select</option>
              {['Private friend group','Organization / Company','Salon or spa','Wellness / lifestyle space','Club or membership group','Other'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field"><label className="hub-label">Rough group size</label>
            <select className="hub-select" defaultValue="">
              <option value="" disabled>Select</option>
              {['Under 10','10–25','25–50','50+'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="hub-field">
            <label className="hub-label">Topics to cover</label>
            <div className="hub-checks">
              {['General Kink','Alternative Lifestyle','Bedroom Kink & Dynamics','Consent & Communication','Power Dynamics','Understanding Kink Spaces'].map(t => (
                <label key={t} className="hub-check-item"><input type="checkbox" value={t} /><span>{t}</span></label>
              ))}
            </div>
          </div>
          <div className="hub-field">
            <label className="hub-label">Format preference</label>
            <div className="hub-checks">
              {['Private Workshop','Keynote','Custom Event'].map(s => (
                <label key={s} className="hub-check-item"><input type="checkbox" value={s} /><span>{s}</span></label>
              ))}
            </div>
          </div>
          <div className="hub-field"><label className="hub-label">Notes</label>
            <textarea className="hub-textarea" placeholder="What you want them to walk away with, any context that helps." /></div>
        </>
      )
    },
  };

  const config = configs[type] || configs['serve-individuals'];

  return (
    <div ref={panelRef} style={{ position: 'relative', minHeight: '320px', overflow: 'hidden' }}>
      <div style={S('questions')}>
        <p className="hub-eyebrow">{config.eyebrow}</p>
        <p className="hub-dialog-title">{config.title}</p>
        <div className="hub-form">
          {config.fields}
          <button className="hub-submit" onClick={() => setStep('contact')}>Continue</button>
        </div>
      </div>

      <div style={S('contact')}>
        <button className="hub-back" onClick={() => setStep('questions')}>← Back</button>
        <p className="hub-eyebrow">{config.eyebrow}</p>
        <p className="hub-dialog-title">Your details.</p>
        <div className="hub-form">
          <div className="hub-field"><label className="hub-label">Name</label>
            <input className="hub-input" ref={nameRef} type="text" placeholder="Your name" /></div>
          <div className="hub-field"><label className="hub-label">Phone</label>
            <input className="hub-input" ref={phoneRef} type="tel" placeholder="Your number" /></div>
          <div className="hub-field"><label className="hub-label">Email</label>
            <input className="hub-input" ref={emailRef} type="email" placeholder="Your email" /></div>
          <button className="hub-submit" onClick={submit}>Submit</button>
        </div>
      </div>

      <div style={S('confirm')}>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: '28px', color: '#B8922E', marginBottom: '16px' }}>✦</div>
          <p className="hub-dialog-title" style={{ fontStyle: 'italic' }}>Received.</p>
          <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(240,232,216,0.55)', letterSpacing: '0.04em', lineHeight: '2.0' }}>
            Sir Leo will be in touch.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Waitlist Panel ──
function WaitlistPanel({ onClose }) {
  const [step, setStep] = useState('form');
  const nameRef = useRef(); const phoneRef = useRef(); const emailRef = useRef();
  const [tier, setTier] = useState('ga');

  useEffect(() => {
    const n = localStorage.getItem('sl_name'); const e = localStorage.getItem('sl_email');
    if (nameRef.current && n) nameRef.current.value = n;
    if (emailRef.current && e) emailRef.current.value = e;
  }, []);

  function submit() {
    if (!phoneRef.current?.value?.trim()) {
      phoneRef.current.style.borderColor = 'rgba(155,32,32,0.8)';
      setTimeout(() => { if (phoneRef.current) phoneRef.current.style.borderColor = ''; }, 2000);
      return;
    }
    const name  = nameRef.current?.value?.trim();
    const phone = phoneRef.current?.value?.trim();
    const email = emailRef.current?.value?.trim();
    if (name)  localStorage.setItem('sl_name',  name);
    if (email) localStorage.setItem('sl_email', email);
    // Save to waitlist table — fetch event_id for KINK AfterDark
    if (window.SLDb) {
      window.SLDb.from('events_calendar').select('id').eq('name', 'KINK / AfterDark').single()
        .then(({ data }) => {
          window.SLDb.from('waitlist').insert({
            event_id:   data?.id || null,
            name, phone, email, tier,
            session_id: window.SL_SESSION || null,
          });
        });
      saveToSupabase('waitlist', name, phone, email, { tier });
    }
    localStorage.setItem('sl_submitted', '1');
    setStep('confirm');
    setTimeout(() => onClose(true), 3200);
  }

  const S = id => stepStyle(id, step);

  return (
    <div style={{ position: 'relative', minHeight: '280px', overflow: 'hidden' }}>
      <div style={S('form')}>
        <p className="hub-eyebrow">KINK / AfterDark</p>
        <p className="hub-dialog-title">Join the<br />waitlist.</p>
        <div className="hub-form">
          <div className="hub-field">
            <label className="hub-label">Experience tier</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              {[['ga','General Admission'],['vip','VIP Access']].map(([val, label]) => (
                <button key={val} onClick={() => setTier(val)}
                  className="hub-panel-option"
                  style={{ flex: 1, padding: '14px 16px', background: tier === val ? 'rgba(107,26,26,0.2)' : 'transparent', borderColor: tier === val ? 'rgba(107,26,26,0.5)' : undefined }}>
                  <div className="hub-card-label">{label}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="hub-field"><label className="hub-label">Name</label>
            <input className="hub-input" ref={nameRef} type="text" placeholder="Your name" /></div>
          <div className="hub-field"><label className="hub-label">Phone</label>
            <input className="hub-input" ref={phoneRef} type="tel" placeholder="Your number" /></div>
          <div className="hub-field"><label className="hub-label">Email</label>
            <input className="hub-input" ref={emailRef} type="email" placeholder="Your email" /></div>
          <button className="hub-submit" onClick={submit}>Join the Waitlist</button>
        </div>
      </div>
      <div style={S('confirm')}>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: '28px', color: '#B8922E', marginBottom: '16px' }}>✦</div>
          <p className="hub-dialog-title" style={{ fontStyle: 'italic' }}>You're on the list.</p>
          <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(240,232,216,0.55)', letterSpacing: '0.04em', lineHeight: '2.0' }}>
            Sir Leo will be in touch<br />as the date approaches.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Hub Section ──
function Hub() {
  const [activePanel, setActivePanel] = useState(null);
  const [panelContext, setPanelContext] = useState({});

  const openPanel = useCallback((type, context = {}) => {
    setPanelContext(context);
    setActivePanel(type);
    window.SLAnalytics?.track('panel_open', type);
  }, []);
  const closePanel = useCallback((submitted = false) => {
    if (!submitted) window.SLAnalytics?.track('panel_abandon', activePanel);
    setActivePanel(null);
    setPanelContext({});
  }, [activePanel]);

  // Expose to window so main.js + buttons can call it
  useEffect(() => {
    window.SLHub = { open: openPanel, close: closePanel };
    return () => { delete window.SLHub; };
  }, [openPanel, closePanel]);

  const [openCards, setOpenCards] = useState(new Set());
  function toggleCard(id) {
    setOpenCards(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const cards = [
    { id: 'connect', num: '01', label: 'Stay Connected', sub: 'Leave your details', action: () => openPanel('contact'), gold: true },
    { id: 'book',    num: '02', label: 'Book',           sub: 'Sessions · Performances · Events · Education', action: () => openPanel('book'), gold: true },
    { id: 'contact', num: '03', label: 'Contact',        sub: 'Text or email directly',
      expandContent: (
        <div className="hub-expand-options">
          <a href="sms:+17732348238" className="hub-expand-opt">Text Sir Leo <span>→</span></a>
          <a href="mailto:sir.black.leo@gmail.com" className="hub-expand-opt">Email Sir Leo <span>→</span></a>
        </div>
      )
    },
    { id: 'remember', num: '04', label: 'Remember', sub: 'Save contact or add to calendar',
      expandContent: (
        <div className="hub-expand-options">
          <a href="assets/sirleo.vcf" download="Sir Leo.vcf" className="hub-expand-opt">Save Contact <span>→</span></a>
          <a href="https://calendar.google.com/calendar/r/eventedit?text=KINK+AfterDark+%E2%80%94+Sir+Leo&dates=20260401/20260430&details=An+immersive+evening+by+Sir+Leo+at+the+intersection+of+performance+art+and+erotic+culture.+Chicago%2C+IL&location=Chicago%2C+IL" target="_blank" rel="noopener" className="hub-expand-opt">Add to Calendar <span>→</span></a>
        </div>
      )
    },
    { id: 'follow', num: '05', label: 'Follow', sub: 'Stay in the world',
      expandContent: (
        <div className="hub-expand-options">
          <a href="https://instagram.com/sir_black_leo" target="_blank" rel="noopener" className="hub-expand-opt">Instagram <span>→</span></a>
          <a href="https://www.facebook.com/sirblackleo" target="_blank" rel="noopener" className="hub-expand-opt">Facebook <span>→</span></a>
          <a href="https://fetlife.com/Sir__Leo" target="_blank" rel="noopener" className="hub-expand-opt">FetLife <span>→</span></a>
        </div>
      )
    },
    { id: 'collab', num: '06', label: 'Collaborate', sub: 'Talent · Submissives · Creatives', action: () => openPanel('collab') },
  ];

  return (
    <>
      {/* Overlay panel */}
      {activePanel && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(4,3,2,0.92)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease' }}
          onClick={e => e.target === e.currentTarget && closePanel()}
        >
          <div style={{ width: 'calc(100% - 48px)', maxWidth: '480px', background: '#0e0d0c', border: '1px solid rgba(184,146,46,0.15)', padding: '44px 36px 52px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
            <button onClick={closePanel}
              style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(240,232,216,0.4)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s', minHeight: '44px', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.target.style.color = 'rgba(240,232,216,0.55)'}
              onMouseLeave={e => e.target.style.color = 'rgba(240,232,216,0.2)'}>
              Close
            </button>
            {activePanel === 'book'    && <BookPanel    onClose={closePanel} initialStep={panelContext.step || 'type'} initialSels={panelContext.sels || []} />}
            {activePanel === 'collab'  && <CollabPanel  onClose={closePanel} />}
            {activePanel === 'contact' && <ContactModal onClose={closePanel} />}
            {['audience-individuals','audience-organizers','serve-individuals','serve-organizers','group-inquiry','edu-person','edu-group'].includes(activePanel) && <ServePanel key={activePanel} onClose={closePanel} type={activePanel} who={panelContext.who} />}
            {activePanel === 'waitlist' && <WaitlistPanel onClose={closePanel} />}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('hub-root'));
root.render(<Hub />);
