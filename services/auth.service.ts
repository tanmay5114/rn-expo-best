import supabase from '@/lib/api/supabase';
import { AuthError, Provider, Session, User } from '@supabase/supabase-js';


export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = LoginCredentials & {
  fullName: string;
};

export type AuthResponse = {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
};

/**
 * Sign in with email and password
 */
export async function signInWithEmail(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    return {
      user: data?.user || null,
      session: data?.session || null,
      error,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(credentials: RegisterCredentials): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.fullName,
        },
      },
    });

    // If successful signup, create a profile in the profiles table
    if (data?.user && !error) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: credentials.fullName,
        email: credentials.email,
        updated_at: new Date().toISOString(),
      });
    }

    return {
      user: data?.user || null,
      session: data?.session || null,
      error,
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * Sign in with social provider (Google, Apple, etc.)
 */
export async function signInWithProvider(provider: Provider): Promise<void> {
  try {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'yourapp://auth/callback',
      },
    });
  } catch (error) {
    console.error('Social sign in error:', error);
    throw error;
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'yourapp://auth/reset-password',
    });
    return { error };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: error as AuthError };
  }
}

/**
 * Update password
 */
export async function updatePassword(password: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    return { error };
  } catch (error) {
    console.error('Update password error:', error);
    return { error: error as AuthError };
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error as AuthError };
  }
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}