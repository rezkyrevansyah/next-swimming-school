import type { SupabaseClient } from "@supabase/supabase-js";

interface LogActivityParams {
  action: string;
  resource_type: string;
  resource_id?: string;
  branch_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget activity logger. Never throws — failures are silently ignored
 * so they don't interrupt the main operation.
 */
export async function logActivity(
  supabase: SupabaseClient,
  params: LogActivityParams
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("activity_logs").insert({
      user_id: user?.id ?? null,
      branch_id: params.branch_id ?? null,
      action: params.action,
      resource_type: params.resource_type,
      resource_id: params.resource_id ?? null,
      metadata: params.metadata ?? null,
    });
  } catch {
    // Intentionally silent — logging must not break business operations
  }
}
