import { createHash, randomBytes } from "node:crypto";

const TEST_PREFIX = "sk_test_";
const LIVE_PREFIX = "sk_live_";

function randomSecret(): string {
  return randomBytes(32).toString("hex");
}

export function generateTestSecret(): { secret: string; prefix: string; hash: string } {
  const secret = TEST_PREFIX + randomSecret();
  const prefix = secret.slice(0, 15) + "...";
  const hash = createHash("sha256").update(secret).digest("hex");
  return { secret, prefix, hash };
}

export function generateLiveSecret(): { secret: string; prefix: string; hash: string } {
  const secret = LIVE_PREFIX + randomSecret();
  const prefix = secret.slice(0, 15) + "...";
  const hash = createHash("sha256").update(secret).digest("hex");
  return { secret, prefix, hash };
}

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}
