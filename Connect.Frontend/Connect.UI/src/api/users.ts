// ============================================================
//  Connect. API — Users Service
//  POST /api/Users/check-email
//  POST /api/Users/verify-email
//  POST /api/Users/register
//  POST /api/Users/login
//  POST /api/Users/refresh-token
//  POST /api/Users/forget-passwod   (note: typo in backend route)
//  GET  /api/Users/profile           [Authorize]
//  PUT  /api/Users/profile           [Authorize]
//  DELETE /api/Users/profile         [Authorize]
//  PUT  /api/Users/change-password   [Authorize]
//  GET  /api/Users                   [Admin]
// ============================================================

import { apiRequest, tokenStorage } from './client';
import {
  AuthTokens,
  UserDto,
  CheckEmailRequest,
  VerifyEmailRequest,
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  ForgetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from './types';

/**
 * Step 1 of registration.
 * Validates email uniqueness and sends a verification link via email.
 */
export async function checkEmail(data: CheckEmailRequest): Promise<void> {
  await apiRequest<void>('/api/Users/check-email', {
    method: 'POST',
    body: data,
    anonymous: true,
  });
}

/**
 * Step 2 of registration.
 * Exchanges the email verification token for a registration session token (30-min).
 */
export async function verifyEmail(data: VerifyEmailRequest): Promise<{ registrationSessionToken: string }> {
  return apiRequest('/api/Users/verify-email', {
    method: 'POST',
    body: data,
    anonymous: true,
  });
}

/**
 * Step 3 of registration.
 * Creates the user account using the session token from verifyEmail.
 */
export async function register(data: RegisterRequest): Promise<UserDto> {
  return apiRequest('/api/Users/register', {
    method: 'POST',
    body: data,
    anonymous: true,
  });
}

/**
 * Authenticates a user and returns JWT access + refresh tokens.
 * Automatically persists tokens to localStorage.
 */
export async function login(data: LoginRequest): Promise<{ tokens: AuthTokens; user: UserDto }> {
  const result = await apiRequest<{ accessToken: string; refreshToken: string }>(
    '/api/Users/login',
    { method: 'POST', body: data, anonymous: true },
  );
  
  // Parse JWT payload to get userID (sub claim)
  let userID = 0;
  try {
    const payload = JSON.parse(atob(result.accessToken.split('.')[1]));
    userID = Number(payload.sub);
  } catch (e) {
    console.error("Failed to parse JWT", e);
  }

  // Save tokens so subsequent requests are authenticated
  tokenStorage.save(
    { accessToken: result.accessToken, refreshToken: result.refreshToken },
    userID,
  );

  // Fetch the user profile using the newly saved token
  const user = await getProfile();

  return {
    tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken },
    user,
  };
}

/**
 * Rotates the refresh token pair.
 * Automatically persists the new tokens.
 */
export async function refreshToken(data: RefreshTokenRequest): Promise<AuthTokens> {
  const result = await apiRequest<AuthTokens>('/api/Users/refresh-token', {
    method: 'POST',
    body: data,
    anonymous: true,
    skipRefresh: true,
  });
  tokenStorage.save(result, data.userID);
  return result;
}

/**
 * Resets the password using a registration session token.
 * Note: the backend route has a typo: /forget-passwod (one 's').
 */
export async function forgetPassword(data: ForgetPasswordRequest): Promise<string> {
  return apiRequest('/api/Users/forget-passwod', {
    method: 'POST',
    body: data,
    anonymous: true,
  });
}

/**
 * Gets the current authenticated user's profile.
 */
export async function getProfile(): Promise<UserDto> {
  return apiRequest('/api/Users/profile');
}

/**
 * Updates the current authenticated user's profile.
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<UserDto> {
  return apiRequest('/api/Users/profile', {
    method: 'PUT',
    body: data,
  });
}

/**
 * Deletes the current authenticated user's account.
 */
export async function deleteProfile(): Promise<string> {
  return apiRequest('/api/Users/profile', { method: 'DELETE' });
}

/**
 * Changes the current authenticated user's password.
 */
export async function changePassword(data: ChangePasswordRequest): Promise<string> {
  return apiRequest('/api/Users/change-password', {
    method: 'PUT',
    body: data,
  });
}

/**
 * [Admin] Returns all registered users.
 */
export async function getAllUsers(): Promise<UserDto[]> {
  return apiRequest('/api/Users');
}

/** Clears stored tokens (client-side logout). */
export function logout(): void {
  tokenStorage.clear();
}
