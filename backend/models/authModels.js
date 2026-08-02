import bcrypt from "bcryptjs";
import { timingSafeEqual } from "node:crypto";
import { supabase } from "../config/supabase.js";

const ACCOUNT_SOURCES = [
  { role: "admin", table: "admins" },
  { role: "meter-reader", table: "meter_readers" },
  { role: "consumer", table: "consumers" },
];

const findAccount = async (table, identifier) => {
  const fields = "id, username, email, password, status";
  const emailResult = await supabase
    .from(table)
    .select(fields)
    .ilike("email", identifier)
    .maybeSingle();

  if (emailResult.error) {
    throw new Error(`Failed to check account: ${emailResult.error.message}`);
  }
  if (emailResult.data) return emailResult.data;

  const usernameResult = await supabase
    .from(table)
    .select(fields)
    .ilike("username", identifier)
    .maybeSingle();

  if (usernameResult.error) {
    throw new Error(`Failed to check account: ${usernameResult.error.message}`);
  }
  return usernameResult.data;
};

const verifyAndUpgradePassword = async (table, account, password) => {
  const storedPassword = String(account.password ?? "");
  const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedPassword);

  if (isBcryptHash) {
    return bcrypt.compare(password, storedPassword);
  }

  const suppliedBuffer = Buffer.from(password, "utf8");
  const storedBuffer = Buffer.from(storedPassword, "utf8");
  const matches =
    suppliedBuffer.length === storedBuffer.length &&
    timingSafeEqual(suppliedBuffer, storedBuffer);

  if (!matches) return false;

  const hashedPassword = await bcrypt.hash(password, 10);
  const { error } = await supabase
    .from(table)
    .update({
      password: hashedPassword,
      updated_at: new Date().toISOString(),
    })
    .eq("id", account.id);

  if (error) {
    throw new Error(
      `Failed to secure the legacy account password: ${error.message}`,
    );
  }

  return true;
};

export async function authenticateAccount(identifier, password) {
  const normalizedIdentifier = String(identifier ?? "").trim().toLowerCase();
  if (!normalizedIdentifier) {
    const error = new Error("Email address or username is required.");
    error.statusCode = 400;
    error.field = "identifier";
    throw error;
  }
  if (typeof password !== "string" || !password) {
    const error = new Error("Password is required.");
    error.statusCode = 400;
    error.field = "password";
    throw error;
  }

  let identifierMatched = false;

  for (const source of ACCOUNT_SOURCES) {
    const account = await findAccount(source.table, normalizedIdentifier);
    if (!account) {
      continue;
    }

    identifierMatched = true;

    if (!(await verifyAndUpgradePassword(source.table, account, password))) {
      continue;
    }

    if (account.status && account.status !== "active") {
      const error = new Error("This account is inactive.");
      error.statusCode = 403;
      throw error;
    }

    return {
      id: account.id,
      username: account.username,
      email: account.email,
      name: account.username,
      role: source.role,
    };
  }

  const error = new Error(
    identifierMatched
      ? "Incorrect password."
      : "Email address or username was not found.",
  );
  error.statusCode = 401;
  error.field = identifierMatched ? "password" : "identifier";
  throw error;
}
