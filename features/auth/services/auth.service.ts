import type {
  AuthCredentials,
  AuthErrorResponse,
  AuthResponse,
  ForgotPasswordPayload,
  SignUpPayload,
  UpdatePasswordPayload,
} from "@/features/auth/types/auth.types";

async function parseResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json();
  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as AuthErrorResponse).error === "string"
        ? (data as AuthErrorResponse).error
        : "Ocorreu um erro. Tente novamente.";
    throw new Error(message);
  }
  return data as T;
}

export async function login(payload: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<AuthResponse>(response);
}

export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<AuthResponse>(response);
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<AuthResponse> {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<AuthResponse>(response);
}

export async function updatePassword(
  payload: UpdatePasswordPayload,
): Promise<AuthResponse> {
  const response = await fetch("/api/auth/update-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<AuthResponse>(response);
}

export function startGoogleLogin(next?: string): void {
  const params = next ? `?next=${encodeURIComponent(next)}` : "";
  window.location.href = `/api/auth/google${params}`;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/entrar";
}
