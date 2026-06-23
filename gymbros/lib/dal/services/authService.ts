import type { AuthResponse, UserResponse } from "@supabase/supabase-js";

import type { DomainDataClient } from "../client";

type Credentials = {
  email: string;
  password: string;
};

type SignUpInput = Credentials & {
  name?: string;
  emailRedirectTo?: string;
};

export class AuthService {
  constructor(private readonly client: DomainDataClient) {}

  signUp(input: SignUpInput): Promise<AuthResponse> {
    return this.client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: input.emailRedirectTo,
        data: input.name ? { name: input.name } : undefined,
      },
    });
  }

  signInWithPassword(input: Credentials): Promise<AuthResponse> {
    return this.client.auth.signInWithPassword(input);
  }

  signOut(): Promise<{ error: AuthResponse["error"] }> {
    return this.client.auth.signOut();
  }

  resetPasswordForEmail(
    email: string,
    redirectTo: string
  ): Promise<{ data: unknown; error: AuthResponse["error"] }> {
    return this.client.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
  }

  updatePassword(password: string): Promise<UserResponse> {
    return this.client.auth.updateUser({ password });
  }
}
