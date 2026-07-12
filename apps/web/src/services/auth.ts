import { createClient } from "@/utils/supabase/client";
import { logger } from "@smarthire/logger";

const supabase = createClient();

export type UserRole = "candidate" | "recruiter" | "company-admin" | "platform-admin";

export interface SignUpParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export const authService = {
  /**
   * Register a new user with role metadata
   */
  signUp: async ({ email, password, firstName, lastName, role }: SignUpParams) => {
    logger.info(`Signing up user: ${email} with role: ${role}`);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      logger.error("Signup failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Authenticate a user with email and password
   */
  signIn: async (email: string, password: string) => {
    logger.info(`Signing in user: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error("Sign in failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Log out current user session
   */
  signOut: async () => {
    logger.info("Signing out current session");
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error("Sign out failed", error);
      throw error;
    }
  },

  /**
   * Forgot Password - send reset token link to email
   */
  forgotPassword: async (email: string) => {
    logger.info(`Sending password reset link to: ${email}`);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      logger.error("Forgot password request failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Reset Password - update user credentials
   */
  resetPassword: async (password: string) => {
    logger.info("Updating user password credentials");
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      logger.error("Password reset update failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Query the current session and user
   */
  getSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      logger.error("Get session failed", error);
      throw error;
    }
    return session;
  },
};
