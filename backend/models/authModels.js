import bcrypt from "bcryptjs";
import { timingSafeEqual } from "node:crypto";
import { supabase } from "../config/supabase.js";

const ACCOUNT_SOURCES = [
  { role: "admin", table: "admins" },
  { role: "meter-reader", table: "meter_readers" },
  { role: "consumer", table: "consumers" },
];

const createLockoutError = (lockedUntil) => {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000),
  );
  const error = new Error(
    `Too many incorrect attempts. Try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
  );
  error.statusCode = 429;
  error.retryAfterSeconds = retryAfterSeconds;
  return error;
};

const findAccount = async (table, identifier) => {
  const fields = "id, username, email, password, status, failed_login_attempts, locked_until";
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

const recordFailedLogin = async (source, account) => {
  const { data, error } = await supabase.rpc("record_failed_login", {
    p_account_type: source.role,
    p_account_id: account.id,
  });

  if (error) {
    throw new Error(`Failed to record login attempt: ${error.message}`);
  }

  if (data?.locked_until) {
    throw createLockoutError(data.locked_until);
  }

  return {
    failedAttempts: Number(data?.failed_attempts ?? 0),
    remainingAttempts: Math.max(0, 5 - Number(data?.failed_attempts ?? 0)),
  };
};

const resetLoginFailures = async (table, accountId) => {
  const { error } = await supabase
    .from(table)
    .update({
      failed_login_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId);

  if (error) {
    throw new Error(`Failed to reset login attempts: ${error.message}`);
  }
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
  let loginAttemptStatus = null;

  for (const source of ACCOUNT_SOURCES) {
    const account = await findAccount(source.table, normalizedIdentifier);
    if (!account) {
      continue;
    }

    identifierMatched = true;

    if (account.locked_until && new Date(account.locked_until).getTime() > Date.now()) {
      throw createLockoutError(account.locked_until);
    }

    if (!(await verifyAndUpgradePassword(source.table, account, password))) {
      loginAttemptStatus = await recordFailedLogin(source, account);
      continue;
    }

    if (account.status && account.status !== "active") {
      const error = new Error("This account is inactive.");
      error.statusCode = 403;
      throw error;
    }

    if (account.failed_login_attempts || account.locked_until) {
      await resetLoginFailures(source.table, account.id);
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
  if (identifierMatched && loginAttemptStatus) {
    error.failedAttempts = loginAttemptStatus.failedAttempts;
    error.remainingAttempts = loginAttemptStatus.remainingAttempts;
  }
  throw error;
}
