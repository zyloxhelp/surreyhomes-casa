// Netlify Serverless Function — Surrey Homes Lead Handler
// Every form submission → GHL CRM contact created instantly

const GHL_TOKEN    = "pit-6e10658c-8903-4db0-9f7f-c6ec2d4a3728";
const GHL_LOC      = "mfjOQXgc3G64dTDYevkh";
const GHL_WORKFLOW = "04f882c6-ce3c-4c04-b3cd-72637be2ac9d";

exports.handler = async (event) => {
  // Only POST allowed
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const {
      firstName = "Website",
      lastName  = "Lead",
      email     = "",
      phone     = "",
      service   = "General Inquiry",
      message   = "",
      page      = ""
    } = body;

    // Validate — at minimum need name or email or phone
    if (!email && !phone && firstName === "Website") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Please fill in your details" })
      };
    }

    // ── Step 1: Create contact in GHL ──────────────────────────────────────
    const contactRes = await fetch("https://services.leadconnectorhq.com/contacts/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GHL_TOKEN}`,
        "Content-Type":  "application/json",
        "Version":       "2021-07-28"
      },
      body: JSON.stringify({
        locationId:   GHL_LOC,
        firstName,
        lastName,
        email,
        phone,
        source:       "Website — surreyhomes.casa",
        tags:         ["website-lead", service.toLowerCase().split(" ")[0]],
        customFields: [
          { key: "interested_in", field_value: service },
          { key: "message",       field_value: message },
          { key: "form_page",     field_value: page    },
        ]
      })
    });

    const contactData = await contactRes.json();
    const contactId   = contactData?.contact?.id;

    console.log("GHL Contact created:", contactId, email);

    // ── Step 2: Enroll in "New Lead Welcome" workflow ───────────────────────
    if (contactId) {
      const wfRes = await fetch(
        `https://services.leadconnectorhq.com/contacts/${contactId}/workflow/${GHL_WORKFLOW}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GHL_TOKEN}`,
            "Content-Type":  "application/json",
            "Version":       "2021-07-28"
          },
          body: JSON.stringify({ eventStartTime: new Date().toISOString() })
        }
      );
      const wfData = await wfRes.json();
      console.log("Workflow enrolled:", wfData?.succeded);
    }

    // ── Success ─────────────────────────────────────────────────────────────
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success:   true,
        contactId: contactId || null,
        message:   "Lead received! We'll respond within 45 minutes."
      })
    };

  } catch (err) {
    console.error("submit-lead error:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
