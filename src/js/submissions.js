(function() {
  function enrichData(data, sourcePage) {
    return {
      ...(data || {}),
      source_page: sourcePage || window.SLConfig?.sourcePage() || 'home',
      ...(window.SLConfig?.isTestEnv() ? { is_test: true } : {}),
    };
  }

  async function save({ panelType, name, phone, email, data, contactSource, sourcePage }) {
    if (!window.SLDb) {
      console.warn('[SL] SLDb not ready');
      return { submission: null, contact: null };
    }

    const utm = window.SL_UTM || {};
    const source = window.SL_SOURCE || utm.utm_source || null;
    const enrichedData = enrichData(data, sourcePage);
    const row = {
      session_id:   window.SL_SESSION || null,
      panel_type:   panelType,
      name:         name  || null,
      phone:        phone || null,
      email:        email || null,
      utm_source:   source,
      utm_medium:   utm.utm_medium   || null,
      utm_campaign: utm.utm_campaign || null,
      data: Object.keys(enrichedData).length ? enrichedData : null,
    };

    const submission = await window.SLDb.from('submissions').insert(row);
    if (submission.error) console.error('[SL] submissions insert error:', submission.error);

    let contact = null;
    if (phone) {
      contact = await window.SLDb.rpc('upsert_contact', {
        p_phone:        phone,
        p_name:         name  || null,
        p_email:        email || null,
        p_source:       contactSource || panelType,
        p_session_id:   window.SL_SESSION || null,
        p_utm_source:   source,
        p_utm_medium:   utm.utm_medium   || null,
        p_utm_campaign: utm.utm_campaign || null,
      });
      if (contact.error) console.error('[SL] upsert_contact error:', contact.error);
    }

    return { submission, contact };
  }

  window.SLSubmissions = { save, enrichData };
})();
