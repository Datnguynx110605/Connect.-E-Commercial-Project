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

export async function checkEmail(data: CheckEmailRequest): Promise<void> {
  await apiRequest<void>('/api/Users/check-email', {
    method: 'POST',
    body: data,
    anonymous: true,
  });
}

export async function verifyEmail(data: VerifyEmailRequest): Promise<{ registrationSessionToken: string }> {
  return apiRequest('/api/Users/verify-email', {
    method: 'POST',
    body: data,
    anonymous: true,
  });
}

export async function register(data: RegisterRequest): Promise<UserDto> {
  return apiRequest('/api/Users/register', {
    method: 'POST',
    body: data,
    anonymous: true,
  });
}

export async function login(data: LoginRequest): Promise<{ tokens: AuthTokens; user: UserDto }> {
  const result = await apiRequest<{ accessToken: string; refreshToken: string }>(
    '/api/Users/login',
    { method: 'POST', body: data, anonymous: true },
  );
  
  tokenStorage.save(
    { accessToken: result.accessToken, refreshToken: result.refreshToken },
    0,
  );

  const user = await getProfile();

  tokenStorage.save(
    { accessToken: result.accessToken, refreshToken: result.refreshToken },
    user.userID,
  );

  return {
    tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken },
    user,
  };
}

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

export async function forgetPassword(data: ForgetPasswordRequest): Promise<string> {
  return apiRequest('/api/Users/forget-password', {
    method: 'POST',
    body: data,
    anonymous: true,
  });
}

export async function getProfile(): Promise<UserDto> {
  return apiRequest('/api/Users/get-profile');
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserDto> {
  return apiRequest('/api/Users/update-profile', {
    method: 'PUT',
    body: data,
  });
}

export async function deleteProfile(): Promise<string> {
  return apiRequest('/api/Users/delete-profile', { method: 'DELETE' });
}

export async function changePassword(data: ChangePasswordRequest): Promise<string> {
  return apiRequest('/api/Users/change-password', {
    method: 'PUT',
    body: data,
  });
}

export function logout(): void {
  tokenStorage.clear();
}
