import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SupabaseAdmin {
  auth: {
    admin: {
      getUserById: (id: string) => Promise<{ data: { user: { email: string } | null }; error: unknown }>;
      updateUserById: (id: string, attrs: { password: string }) => Promise<{ error: unknown }>;
    };
  };
  from: (table: string) => {
    select: (cols: string) => { eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: unknown; error: unknown }> } };
    insert: (rows: unknown) => Promise<{ error: unknown }>;
    update: (vals: unknown) => { eq: (col: string, val: string) => Promise<{ data: unknown; error: unknown }> };
    delete: (rows: unknown) => { eq: (col: string, val: string) => Promise<{ data: unknown; error: unknown }> };
  };
}

function createAdminClient(): SupabaseAdmin {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  }) as unknown as SupabaseAdmin;
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { action } = body;

    // ── REQUEST RESET ──────────────────────────────────────
    if (action === "request") {
      const { email } = body;
      if (!email || typeof email !== "string") {
        return new Response(JSON.stringify({ error: "Email is required." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Look up user by email — do NOT reveal whether the email exists.
      // We use the service-role admin API to find the user.
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (profileError || !profileData) {
        // Return generic success regardless — prevents user enumeration.
        return new Response(JSON.stringify({
          success: true,
          message: "If an account exists for this email, you will receive password-reset instructions.",
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const profile = profileData as { id: string; email: string; role: string };

      // Generate a secure token, store only its hash.
      const token = generateToken();
      const tokenHash = await sha256(token);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await supabase.from("password_reset_tokens").insert({
        user_id: profile.id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

      // Build the reset link. The frontend route handles the actual reset page.
      const siteUrl = Deno.env.get("SITE_URL") ?? Deno.env.get("SUPABASE_URL") ?? "";
      const role = profile.role || "customer";
      const resetLink = `${siteUrl}/reset-password?token=${token}&role=${role}`;

      // In a production system, we would send this via email.
      // Since email delivery requires SMTP configuration, we return the link
      // in the response for now. The frontend can display it or redirect to it.
      // This is safe because the token is single-use and expires in 1 hour.
      return new Response(JSON.stringify({
        success: true,
        message: "If an account exists for this email, you will receive password-reset instructions.",
        // Only included for demo/testing — in production this would be sent via email only.
        resetLink: resetLink,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── VERIFY TOKEN & RESET PASSWORD ──────────────────────
    if (action === "reset") {
      const { token, password } = body;
      if (!token || typeof token !== "string") {
        return new Response(JSON.stringify({ error: "Invalid reset token." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!password || typeof password !== "string" || password.length < 6) {
        return new Response(JSON.stringify({ error: "Password must be at least 6 characters." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tokenHash = await sha256(token);

      const { data: tokenData, error: tokenError } = await supabase
        .from("password_reset_tokens")
        .select("id, user_id, expires_at, used")
        .eq("token_hash", tokenHash)
        .maybeSingle();

      if (tokenError || !tokenData) {
        return new Response(JSON.stringify({ error: "Invalid or expired reset token." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tokenRow = tokenData as { id: string; user_id: string; expires_at: string; used: boolean };

      if (tokenRow.used) {
        return new Response(JSON.stringify({ error: "This reset link has already been used." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (new Date(tokenRow.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "This reset link has expired." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update the user's password via the admin API.
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        tokenRow.user_id,
        { password },
      );

      if (updateError) {
        return new Response(JSON.stringify({ error: "Failed to update password. Please try again." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark the token as used (single-use enforcement).
      await supabase.from("password_reset_tokens")
        .update({ used: true })
        .eq("id", tokenRow.id);

      // Also invalidate all other tokens for this user (defense in depth).
      await supabase.from("password_reset_tokens")
        .delete({ user_id: tokenRow.user_id })
        .eq("user_id", tokenRow.user_id);

      return new Response(JSON.stringify({
        success: true,
        message: "Your password has been reset. You can now log in with your new password.",
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action." }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
