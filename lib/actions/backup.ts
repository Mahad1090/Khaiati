"use server";

import { spawn } from "node:child_process";
import type { ActionResult } from "./customers";

/**
 * Runs `pg_dump` against DATABASE_URL and returns the SQL dump as text.
 *
 * Gated on ENABLE_BACKUP_ACTION so this cannot be triggered even by a direct
 * server-action call until it is wired behind real Supabase Auth + an
 * administrator-only route (see lib/permissions.ts — "backup:run"). The
 * Settings page keeps the button disabled for the same reason: never rely on
 * a hidden UI control as the only guard for a database-dumping endpoint.
 */
export async function createBackup(): Promise<ActionResult<{ sql: string; filename: string }>> {
  if (process.env.ENABLE_BACKUP_ACTION !== "true") {
    return {
      ok: false,
      error:
        "Backups are disabled until an administrator role is wired through Supabase Auth. Set ENABLE_BACKUP_ACTION=true only after that's in place.",
    };
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return { ok: false, error: "DATABASE_URL is not set." };
  }

  return new Promise((resolve) => {
    const proc = spawn("pg_dump", ["--no-owner", "--no-privileges", connectionString]);
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("error", () => {
      resolve({
        ok: false,
        error: "pg_dump is not installed or not on PATH in this environment.",
      });
    });
    proc.on("close", (code) => {
      if (code !== 0) {
        console.error("pg_dump failed", stderr);
        resolve({ ok: false, error: "Backup failed. Check server logs." });
        return;
      }
      const filename = `khaiati-backup-${new Date().toISOString().slice(0, 10)}.sql`;
      resolve({ ok: true, data: { sql: stdout, filename } });
    });
  });
}
