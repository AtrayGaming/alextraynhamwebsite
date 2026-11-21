// Contact form endpoint for alextraynham.com.
// Verifies the Turnstile token server-side, validates the fields, then hands
// the message to the alex-traynham-contact-mailer Worker through the
// EMAIL_SERVICE service binding. That Worker sends via Cloudflare Email
// Service to Alex's verified Gmail address, with reply-to set to the sender.

const EXPECTED_ACTION = "contact";
const EXPECTED_HOSTNAMES = new Set(["alextraynham.com", "www.alextraynham.com"]);

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const VERIFY_FAILED = "Verification did not pass. Please reload the page and try again.";
const SEND_FAILED = "Your message could not be sent. Please email hello@alextraynham.com instead.";

export async function onRequestPost(context) {
  const { request, env } = context;

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "The form could not be read. Please email hello@alextraynham.com instead." }, 400);
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  const token = String(form.get("cf-turnstile-response") ?? "");

  if (!name || !email || !message || name.length > 120 || email.length > 254 || message.length > 5000) {
    return json({ ok: false, error: "Please fill in every field, and keep the message under 5000 characters." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "That email address does not look right." }, 400);
  }
  if (!token || token.length > 2048 || !env.TURNSTILE_SECRET) {
    return json({ ok: false, error: VERIFY_FAILED }, 403);
  }

  let verify;
  try {
    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10000),
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: request.headers.get("CF-Connecting-IP") ?? "",
      }),
    });
    if (!resp.ok) throw new Error(`siteverify ${resp.status}`);
    verify = await resp.json();
  } catch {
    return json({ ok: false, error: VERIFY_FAILED }, 403);
  }

  if (!verify.success || verify.action !== EXPECTED_ACTION || !EXPECTED_HOSTNAMES.has(verify.hostname)) {
    return json({ ok: false, error: VERIFY_FAILED }, 403);
  }

  try {
    const resp = await env.EMAIL_SERVICE.fetch("https://contact-mailer/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    const mail = await resp.json().catch(() => null);
    if (!resp.ok || !mail?.ok) {
      console.error("contact mailer error", mail?.error ?? resp.status, mail?.detail ?? "");
      return json({ ok: false, error: SEND_FAILED }, 502);
    }
  } catch (err) {
    console.error("contact mailer fetch failed", err);
    return json({ ok: false, error: SEND_FAILED }, 502);
  }

  return json({ ok: true });
}
