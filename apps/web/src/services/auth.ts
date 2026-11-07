import type { AuthUser } from "@/types/api";
import type { LoginInput, RegisterInput } from "@/lib/validations";
import { api } from "@/services/http";

export function login(input: LoginInput) {
  return api<AuthUser>("/auth/login", { method: "POST", body: input });
}

export function register(input: RegisterInput) {
  return api<AuthUser>("/auth/register", { method: "POST", body: input });
}

export function logout() {
  return api("/auth/logout", { method: "POST" });
}
