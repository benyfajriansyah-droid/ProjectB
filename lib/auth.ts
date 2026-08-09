export const SESSION_COOKIE = "session";

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function expectedSessionToken(): Promise<string> {
  const password = process.env.APP_PASSWORD;
  if (!password) {
    throw new Error("APP_PASSWORD env var is not set");
  }
  return sha256Hex(password);
}

export async function isValidPassword(password: string): Promise<boolean> {
  return password === process.env.APP_PASSWORD;
}
