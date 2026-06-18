import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import nodemailer from "npm:nodemailer@6.9.16";
import {
  buildEmailBodies,
  corsHeaders,
  getAuthedAdminClient,
  jsonResponse,
  loadSmtpSettings,
} from "../_shared/messaging.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const auth = await getAuthedAdminClient(req);
    if ("error" in auth && auth.error) return auth.error;

    const { adminClient, caller } = auth;
    if (!["SUPER_ADMIN", "ADMIN"].includes(caller.role)) {
      return jsonResponse({ error: "Admin access required" }, 403);
    }

    const body = await req.json();
    const recipientEmail = body.recipientEmail as string;
    if (!recipientEmail) {
      return jsonResponse({ error: "recipientEmail is required" }, 400);
    }

    const settings = await loadSmtpSettings(adminClient);
    if (!settings?.smtp_host || !settings.smtp_port || !settings.smtp_user) {
      return jsonResponse({ error: "Configure SMTP host, port, and user in Settings first" }, 400);
    }

    const smtpPass = Deno.env.get("SMTP_PASS");
    if (!smtpPass) {
      return jsonResponse({ error: "SMTP_PASS secret is not set on the server" }, 400);
    }

    const fromEmail = settings.smtp_from_email || settings.smtp_user;
    const fromName = settings.smtp_from_name || settings.company_name;
    const subject = `Test email from ${settings.company_name}`;
    const { html, text } = buildEmailBodies("TEST", subject, {
      companyName: settings.company_name,
    });

    const transport = nodemailer.createTransport({
      host: settings.smtp_host,
      port: settings.smtp_port,
      secure: settings.smtp_port === 465,
      auth: { user: settings.smtp_user, pass: smtpPass },
    });

    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientEmail,
      subject,
      text,
      html,
    });

    await adminClient.from("email_delivery_log").insert({
      template: "TEST",
      recipient_email: recipientEmail,
      subject,
      status: "SENT",
    });

    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
