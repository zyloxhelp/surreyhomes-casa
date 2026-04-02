export default async (request, context) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const GHL_TOKEN = 'pit-6e10658c-8903-4db0-9f7f-c6ec2d4a3728';
    const GHL_LOC   = 'mfjOQXgc3G64dTDYevkh';
    const GHL_WF    = '04f882c6-ce3c-4c04-b3cd-72637be2ac9d';

    // Create contact
    const contactRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        locationId: GHL_LOC,
        firstName:  body.firstName || 'Website',
        lastName:   body.lastName  || 'Lead',
        email:      body.email     || '',
        phone:      body.phone     || '',
        address1:   body.address   || '',
        source:     'Website — surreyhomes.casa',
        tags:       ['website-lead'],
      })
    });

    const contactData = await contactRes.json();
    const contactId   = contactData?.contact?.id;

    // Add note with details
    if (contactId) {
      await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_TOKEN}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          body: `WEBSITE LEAD\nService: ${body.service||''}\nPage: ${body.page||''}\nAddress: ${body.address||''}\nMessage: ${body.message||''}\nTime: ${new Date().toISOString()}`
        })
      });

      // Trigger workflow
      await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/workflow/${GHL_WF}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_TOKEN}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({ eventStartTime: new Date().toISOString() })
      });
    }

    return new Response(JSON.stringify({ success: true, id: contactId }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const config = { path: '/api/lead' };
