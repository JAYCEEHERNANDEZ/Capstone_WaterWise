import { apiRequest } from "./apiClient";
import {
  ACCOUNT_STORAGE_KEY,
  clearSession,
  getStoredAccount,
  storeSession,
} from "./authToken";

export { ACCOUNT_STORAGE_KEY };

export async function login(credentials) {
  try {
    const result = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (result.token && result.user) storeSession(result);
    return result;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ??
        error.message ??
        "Unable to sign in.",
      { cause: error },
    );
  }
}

export async function verifyAdminLoginOtp(challengeToken, otp) {
  try {
    const result = await apiRequest("/auth/admin/verify-login-otp", {
      method: "POST",
      body: JSON.stringify({ challengeToken, otp }),
    });
    storeSession(result);
    return result;
  } catch (error) {
    throw new Error(error.response?.data?.message ?? "Unable to verify the admin sign-in code.", { cause: error });
  }
}

export async function requestPasswordReset(email) {
  try {
    return await apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  } catch (error) {
    throw new Error(error.response?.data?.message ?? "Unable to send the reset email.", { cause: error });
  }
}

export async function verifyPasswordResetOtp(challengeToken, otp) {
  try {
    return await apiRequest("/auth/verify-reset-otp", {
      method: "POST",
      body: JSON.stringify({ challengeToken, otp }),
    });
  } catch (error) {
    throw new Error(error.response?.data?.message ?? "Unable to verify the code.", { cause: error });
  }
}

export async function changePasswordWithCurrent(currentPassword, newPassword) {
  try {
    return await apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  } catch (error) {
    throw new Error(error.response?.data?.message ?? "Unable to change your password.", { cause: error });
  }
}

export async function requestAuthenticatedPasswordOtp() {
  try {
    return await apiRequest("/auth/change-password/email-otp", { method: "POST" });
  } catch (error) {
    throw new Error(error.response?.data?.message ?? "Unable to send a verification code.", { cause: error });
  }
}

export async function requestConsumerEmailChangeOtp() {
  try {
    return await apiRequest("/auth/consumer/change-email/otp", { method: "POST" });
  } catch (error) {
    throw new Error(error.response?.data?.message ?? "Unable to send the verification code.", { cause: error });
  }
}

export async function verifyConsumerEmailChangeOtp(challengeToken, otp) {
  try {
    return await apiRequest("/auth/consumer/change-email/verify", {
      method: "POST",
      body: JSON.stringify({ challengeToken, otp }),
    });
  } catch (error) {
    throw new Error(error.response?.data?.message ?? "Unable to verify the code.", { cause: error });
  }
}

export async function completeConsumerEmailChange(emailChangeToken, newEmail) {
  try {
    return await apiRequest("/auth/consumer/change-email", {
      method: "POST",
      body: JSON.stringify({ emailChangeToken, newEmail }),
    });
  } catch (error) {
    throw new Error(error.response?.data?.message ?? "Unable to change your email.", { cause: error });
  }
}

export async function resetPassword(token, password) {
  try {
    return await apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  } catch (error) {
    throw new Error(error.response?.data?.message ?? "Unable to reset your password.", { cause: error });
  }
}

export async function getCurrentAccount(options) {
  const result = await apiRequest("/auth/me", options);
  const storedAccount = getStoredAccount();
  const user = { ...storedAccount, ...result.user };
  window.sessionStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(user));
  return { user };
}

export function logout() {
  clearSession();
  return Promise.resolve();
}
