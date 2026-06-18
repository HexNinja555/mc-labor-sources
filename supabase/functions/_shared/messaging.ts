import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function getAuthedAdminClient(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) {
    return { error: jsonResponse({ error: "Invalid token" }, 401) };
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: caller } = await adminClient
    .from("users")
    .select("id, role")
    .eq("auth_user_id", authData.user.id)
    .single();

  if (!caller) {
    return { error: jsonResponse({ error: "User profile not found" }, 403) };
  }

  return { adminClient, caller, authUserId: authData.user.id };
}

export async function getAuthedClient(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) {
    return { error: jsonResponse({ error: "Invalid token" }, 401) };
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: caller } = await adminClient
    .from("users")
    .select("id, role, employee_id")
    .eq("auth_user_id", authData.user.id)
    .single();

  if (!caller) {
    return { error: jsonResponse({ error: "User profile not found" }, 403) };
  }

  return { adminClient, caller };
}

export type SmtpSettings = {
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_from_email: string | null;
  smtp_from_name: string | null;
  email_enabled: boolean;
  company_name: string;
};

export async function loadSmtpSettings(adminClient: SupabaseClient): Promise<SmtpSettings | null> {
  const { data: rows } = await adminClient.from("company_settings").select("*").limit(1);
  if (!rows?.length) return null;
  const row = rows[0] as Record<string, unknown>;
  return {
    smtp_host: (row.smtp_host as string) ?? null,
    smtp_port: row.smtp_port != null ? Number(row.smtp_port) : null,
    smtp_user: (row.smtp_user as string) ?? null,
    smtp_from_email: (row.smtp_from_email as string) ?? null,
    smtp_from_name: (row.smtp_from_name as string) ?? null,
    email_enabled: Boolean(row.email_enabled),
    company_name: row.company_name as string,
  };
}

export function buildEmailBodies(
  template: string,
  subject: string,
  context: Record<string, string> = {},
): { html: string; text: string } {
  const company = context.companyName || "MC Labor Sources";
  const webUrl = context.webAppUrl || "";

  const lines: Record<string, { text: string; html: string }> = {
    JOB_ORDER: {
      text: `${subject}\n\nYou have a new job order (${context.orderNumber || ""}) starting ${context.startDate || ""}.\n\n${context.instructions || ""}\n\nView in the app: ${webUrl}`,
      html: `<p>${subject}</p><p>You have a new job order <strong>${context.orderNumber || ""}</strong> starting <strong>${context.startDate || ""}</strong>.</p><p>${context.instructions || ""}</p>${webUrl ? `<p><a href="${webUrl}">Open workforce portal</a></p>` : ""}`,
    },
    SAFETY: {
      text: `${subject}\n\n${context.message || ""}\n\nView in the app: ${webUrl}`,
      html: `<p><strong>${subject}</strong></p><p>${context.message || ""}</p>${webUrl ? `<p><a href="${webUrl}">Open workforce portal</a></p>` : ""}`,
    },
    TIMESHEET_SIGNED: {
      text: `${subject}\n\nA timesheet has been signed for ${context.jobSiteName || "your job site"} by ${context.foremanName || "foreman"}.\n\nView in the portal: ${webUrl}`,
      html: `<p>${subject}</p><p>A timesheet has been signed for <strong>${context.jobSiteName || "your job site"}</strong> by ${context.foremanName || "foreman"}.</p>${webUrl ? `<p><a href="${webUrl}">View signed timesheet</a></p>` : ""}`,
    },
    TIMESHEET_SENT: {
      text: `${subject}\n\nSigned timesheet for ${context.jobSiteName || "job site"} has been sent to your office.\n\nView in the portal: ${webUrl}`,
      html: `<p>${subject}</p><p>Signed timesheet for <strong>${context.jobSiteName || "job site"}</strong> has been sent to your office.</p>${webUrl ? `<p><a href="${webUrl}">View in portal</a></p>` : ""}`,
    },
    TEST: {
      text: `This is a test email from ${company}. SMTP delivery is configured correctly.`,
      html: `<p>This is a test email from <strong>${company}</strong>.</p><p>SMTP delivery is configured correctly.</p>`,
    },
  };

  const body = lines[template] || {
    text: `${subject}\n\n${company}`,
    html: `<p>${subject}</p><p>${company}</p>`,
  };
  return body;
}
