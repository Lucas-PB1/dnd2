export {
  AuthCard,
  AuthDivider,
  AuthAlert,
  FieldError,
} from "./components/AuthCard";
export { LoginForm } from "./components/LoginForm";
export { SignUpForm } from "./components/SignUpForm";
export { ForgotPasswordForm } from "./components/ForgotPasswordForm";
export { ResetPasswordForm } from "./components/ResetPasswordForm";
export { LogoutButton } from "./components/LogoutButton";

export type {
  AuthCredentials,
  AuthErrorResponse,
  AuthResponse,
  ForgotPasswordPayload,
  SignUpPayload,
  UpdatePasswordPayload,
} from "./types/auth.types";

export { translateAuthError, AUTH_ERROR_MESSAGES } from "./types/auth.types";
export { useAuthForm } from "./hooks/useAuthForm";
export {
  login,
  signUp,
  forgotPassword,
  updatePassword,
  startGoogleLogin,
  logout,
} from "./services/auth.service";
