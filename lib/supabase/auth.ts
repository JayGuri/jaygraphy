import { supabase } from "./client";

// Sign in with magic link (passwordless)
export async function signInWithEmail(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/upload`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user (client-side)
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

// Check if email is admin
export async function isAdmin(email?: string | null) {
  if (!email) return false;

  const adminEmail =
    process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  return email === adminEmail;
}

// Get session on client (named server for compatibility with prompt)
export async function getServerSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ?? null;
}

