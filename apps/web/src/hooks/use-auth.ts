"use client";

import { useState, useEffect } from "react";
import { User } from "@smarthire/types";
import { createClient } from "@/utils/supabase/client";
import { authService, SignUpParams, UserRole } from "@/services/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchUserWithDetails = async (sessionUser: any) => {
      if (!sessionUser) return null;
      try {
        const { data: dbUser } = await supabase
          .schema("identity")
          .from("users")
          .select("first_name, last_name, role")
          .eq("id", sessionUser.id)
          .maybeSingle();

        const meta = sessionUser.user_metadata;
        return {
          id: sessionUser.id,
          email: sessionUser.email || "",
          firstName: dbUser?.first_name || meta?.first_name || "",
          lastName: dbUser?.last_name || meta?.last_name || "",
          role: (dbUser?.role || meta?.role as UserRole) || "candidate",
          createdAt: sessionUser.created_at,
        };
      } catch (err) {
        console.error("Error fetching db user details", err);
        const meta = sessionUser.user_metadata;
        return {
          id: sessionUser.id,
          email: sessionUser.email || "",
          firstName: meta?.first_name || "",
          lastName: meta?.last_name || "",
          role: (meta?.role as UserRole) || "candidate",
          createdAt: sessionUser.created_at,
        };
      }
    };

    // 1. Initial session load
    const loadSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const detailedUser = await fetchUserWithDetails(session.user);
          setUser(detailedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to load session", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // 2. Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const detailedUser = await fetchUserWithDetails(session.user);
        setUser(detailedUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    register: async (params: SignUpParams) => {
      return await authService.signUp(params);
    },
    login: async (email: string, password: string) => {
      return await authService.signIn(email, password);
    },
    logout: async () => {
      return await authService.signOut();
    },
    forgotPassword: async (email: string) => {
      return await authService.forgotPassword(email);
    },
    resetPassword: async (password: string) => {
      return await authService.resetPassword(password);
    },
  };
}
