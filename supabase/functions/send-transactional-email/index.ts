import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import nodemailer from "npm:nodemailer@6.9.16";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  buildEmailBodies,
  corsHeaders,
  getAuthedAdminClient,
  jsonResponse,
  loadSmtpSettings,
} from "../_shared/messaging.ts";

type AdminClient = ReturnType<typeof createClient>;

type EmailPayload = {
  template: string;
  recipientEmail?: string;
  useMcLaborOfficeEmail?: boolean;
  subject: string;
  context?: Record<string, string>;
  relatedId?: string;
};

async function sendEmail(adminClient: AdminClient, payload: EmailPayload) {
  const settings = await loadSmtpSettings(adminClient);
  if (!settings?.email_enabled) {
    return jsonResponse({ skipped: true, reason: "Email delivery disabled" });
  }

  const smtpPass = Deno.env.get("SMTP_PASS");
  if (!settings.smtp_host || !settings.smtp_port || !settings.smtp_user || !smtpPass) {
    return jsonResponse({ error: "SMTP not fully configured" }, 400);
  }

  const fromEmail = settings.smtp_from_email || settings.smtp_user;
  const fromName = settings.smtp_from_name || settings.company_name;
  const webAppUrl = Deno.env.get("WEB_APP_URL") || "";
  const context = {
    companyName: settings.company_name,
    webAppUrl,
    ...payload.context,
  };
  const { html, text } = buildEmailBodies(payload.template, payload.subject, context);

  const logInsert = await adminClient
    .from("email_delivery_log")
    .insert({
      template: payload.template,
      recipient_email: payload.recipientEmail,
      subject: payload.subject,
      status: "PENDING",
      related_id: payload.relatedId ?? null,
    })
    .select("id")
    .single();

  const logId = logInsert.data?.id as string | undefined;

  try {
    const transport = nodemailer.createTransport({
      host: settings.smtp_host,
      port: settings.smtp_port,
      secure: settings.smtp_port === 465,
      auth: { user: settings.smtp_user, pass: smtpPass },
    });

    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: payload.recipientEmail,
      subject: payload.subject,
      text,
      html,
    });

    if (logId) {
      await adminClient.from("email_delivery_log").update({ status: "SENT" }).eq("id", logId);
    }

    return jsonResponse({ success: true, logId });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (logId) {
      await adminClient
        .from("email_delivery_log")
        .update({ status: "FAILED", error_message: message })
        .eq("id", logId);
    }
    return jsonResponse({ error: message }, 500);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const auth = await getAuthedAdminClient(req);
    if ("error" in auth && auth.error) return auth.error;

    const { adminClient, caller } = auth;
    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "SUPERVISOR"];
    if (!allowedRoles.includes(caller.role)) {
      return jsonResponse({ error: "Insufficient permissions" }, 403);
    }

    const body = (await req.json()) as EmailPayload;
    if (!body.template || !body.subject) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    let recipientEmail = body.recipientEmail;
    if (body.useMcLaborOfficeEmail) {
      recipientEmail = Deno.env.get("MC_LABOR_OFFICE_EMAIL") || "";
    }
    if (!recipientEmail) {
      return jsonResponse({ skipped: true, reason: "No recipient email" });
    }

    return await sendEmail(adminClient, { ...body, recipientEmail });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
