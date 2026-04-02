// netlify/functions/ghl-contact.js
// Serverless function — runs on Netlify, not in browser
// Receives form data and creates contact in GHL CRM

exports.handler = async function(event, context) {
  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const body    = JSON.parse(event.body || '{}');
    const GHL_KEY = 'pit-6e10658c-8903-4db0-9f7f-c6ec2d4a3728';
    const LOC_ID  = 'mfjOQXgc3G64dTDYevkh';

    // Build GHL contact payload
    const contactPayload = {
      locationId: LOC_ID,
      firstName:  body.firstName || '',
      lastName:   body.lastName  || '',
      email:      body.email     || '',
      phone:      body.phone     || '',
      source:     body.source    || 'surreyhomes.casa',
      tags:       body.tags      || ['website-lead'],
      customFields: [
        { key: 'service',     field_value: body.customField?.service     || '' },
        { key: 'city',        field_value: body.customField?.city        || '' },
        { key: 'budget',      field_value: body.customField?.budget      || '' },
        { key: 'page_url',    field_value: body.customField?.pageUrl     || '' },
        { key: 'move_in',     field_value: body.customField?.moveIn      || '' },
        { key: 'message',     field_value: body.message                  || '' },
        { key: 'submitted_at',field_value: body.customField?.submittedAt || '' },
      ].filter(f => f.field_value),
    };

    // Create contact in GHL
    const ghlRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${GHL_KEY}`,
        'Content-Type':  'application/json',
        'Version':       '2021-07-28',
      },
      body: JSON.stringify(contactPayload),
    });

    const ghlData = await ghlRes.json();

    // Also add a note if message present
    if (body.message && ghlData.contact?.id) {
      await fetch(`https://services.leadconnectorhq.com/contacts/${ghlData.contact.id}/notes`, {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${GHL_KEY}`,
          'Content-Type':  'application/json',
          'Version':       '2021-07-28',
        },
        body: JSON.stringify({
          body: `Message: ${body.message}\n\nSource: ${body.source}\nPage: ${body.customField?.pageUrl || ''}`,
          userId: null,
        }),
      });
    }

    return {
      statusCode: 200,
      headers:    HEADERS,
      body:       JSON.stringify({ success: true, contactId: ghlData.contact?.id }),
    };

  } catch (err) {
    console.error('GHL contact error:', err);
    return {
      statusCode: 200, // Always 200 to frontend
      headers:    HEADERS,
      body:       JSON.stringify({ success: true, fallback: true }),
    };
  }
};
