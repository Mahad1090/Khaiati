"use server";

import { query } from "@/lib/db";
import { createSupabaseServerClient, isSupabaseAuthConfigured } from "@/lib/supabase/server";

/** Internal helper — call from other actions on real events. Never exported to a page directly. */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body?: string
): Promise<void> {
  try {
    await query(`insert into notifications (user_id, type, title, body) values ($1, $2, $3, $4)`, [
      userId,
      type,
      title,
      body || null,
    ]);
  } catch (err) {
    // Never let a notification failure break the action that triggered it.
    console.error("createNotification failed", err);
  }
}

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseAuthConfigured()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getMyNotifications(): Promise<NotificationRow[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { rows } = await query<NotificationRow>(
    `select id, type, title, body, read_at, created_at
     from notifications where user_id = $1
     order by created_at desc
     limit 30`,
    [userId]
  );
  return rows;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const userId = await getCurrentUserId();
  if (!userId) return 0;
  const { rows } = await query<{ count: string }>(
    `select count(*) from notifications where user_id = $1 and read_at is null`,
    [userId]
  );
  return Number(rows[0]?.count ?? 0);
}

export async function markNotificationsRead(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  await query(`update notifications set read_at = now() where user_id = $1 and read_at is null`, [userId]);
}
