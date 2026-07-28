import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});

export const JWT_ISSUER = "waterwise-api";
export const JWT_AUDIENCE = "waterwise-frontend";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    const error = new Error(
      "JWT_SECRET must be configured in .env with at least 32 characters."
    );
    error.statusCode = 500;
    throw error;
  }
  return secret;
}
