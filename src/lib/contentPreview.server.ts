/**
 * Preview tokens for the content editing system.
 *
 * A preview token is NOT a guessable string. It is an HMAC-SHA256 signature,
 * produced with a server-only secret, over `<userId>.<expiry>`. It can only be
 * minted by an authenticated staff session (see `createPreviewToken` in
 * content.functions.ts) and every verification re-checks, against the
 * database, that the user named inside the token still holds a staff role.
 *
 * So a random or tampered `?preview=` value fails the signature check, and an
 * old token belonging to someone whose access was removed fails the role
 * check. Neither can ever surface `draft_value`.
 */

const TTL_MS = 60 * 60 * 1000; // one hour

function secret(): string {
  const s = process.env["SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_JWKS"];
  if (!s) throw new Error("Preview token secret is not configured on the server");
  return s;
}

const enc = new TextEncoder();

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function mintPreviewToken(userId: string): Promise<string> {
  const exp = Date.now() + TTL_MS;
  const payload = `${userId}.${exp}`;
  return `${payload}.${await sign(payload)}`;
}

/** Returns the staff user id the token belongs to, or null when invalid. */
export async function verifyPreviewToken(token: string | null | undefined): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expRaw, sig] = parts;
  const exp = Number(expRaw);
  if (!userId || !Number.isFinite(exp) || exp < Date.now()) return null;
  if (!safeEqual(sig, await sign(`${userId}.${expRaw}`))) return null;

  // Signature is good; confirm the role is still there.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("is_staff", { _user_id: userId });
  if (error || data !== true) return null;
  return userId;
}
