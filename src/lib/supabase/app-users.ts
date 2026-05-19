import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AppUserRecord = {
  id: string;
  clerk_user_id: string;
  supabase_auth_user_id: string | null;
  email: string | null;
  full_name: string | null;
  username: string | null;
  image_url: string | null;
  status: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

type ClerkUserSnapshot = {
  id: string;
  email_addresses?: Array<{ email_address: string }>;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  image_url?: string | null;
};

function buildFullName(firstName?: string | null, lastName?: string | null) {
  const nameParts = [firstName, lastName].filter(
    (part): part is string => Boolean(part && part.trim())
  );

  return nameParts.length > 0 ? nameParts.join(" ") : null;
}

function getPrimaryEmail(user: ClerkUserSnapshot) {
  return user.email_addresses?.[0]?.email_address ?? null;
}

async function findAppUserByColumn(
  column: "clerk_user_id" | "supabase_auth_user_id",
  value: string
) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq(column, value)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to look up app user by ${column}: ${error.message}`);
  }

  return data as AppUserRecord | null;
}

export async function findAppUserByClerkUserId(clerkUserId: string) {
  return findAppUserByColumn("clerk_user_id", clerkUserId);
}

export async function findAppUserBySupabaseAuthUserId(supabaseAuthUserId: string) {
  return findAppUserByColumn("supabase_auth_user_id", supabaseAuthUserId);
}

export async function findAppUserByIdentity({
  clerkUserId,
  supabaseAuthUserId,
}: {
  clerkUserId?: string;
  supabaseAuthUserId?: string;
}) {
  if (clerkUserId) {
    return findAppUserByClerkUserId(clerkUserId);
  }

  if (supabaseAuthUserId) {
    return findAppUserBySupabaseAuthUserId(supabaseAuthUserId);
  }

  return null;
}

export async function upsertAppUserFromClerkUser(user: ClerkUserSnapshot) {
  const supabase = getSupabaseAdminClient();

  const payload = {
    clerk_user_id: user.id,
    email: getPrimaryEmail(user),
    full_name: buildFullName(user.first_name, user.last_name),
    username: user.username ?? null,
    image_url: user.image_url ?? null,
    status: "active",
    deleted_at: null,
  };

  const { error } = await supabase
    .from("app_users")
    .upsert(payload, { onConflict: "clerk_user_id" });

  if (error) {
    throw new Error(`Failed to sync Clerk user ${user.id}: ${error.message}`);
  }

  return payload;
}

export async function markAppUserDeletedFromClerkUser(clerkUserId: string) {
  const supabase = getSupabaseAdminClient();

  const payload = {
    clerk_user_id: clerkUserId,
    status: "deleted",
    deleted_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("app_users")
    .upsert(payload, { onConflict: "clerk_user_id" });

  if (error) {
    throw new Error(
      `Failed to mark Clerk user ${clerkUserId} deleted: ${error.message}`
    );
  }

  return payload;
}