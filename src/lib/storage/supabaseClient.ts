/**
 * Zero-dependency lightweight Supabase REST Client
 * Interacts with Supabase Auth (/auth/v1) and PostgREST (/rest/v1)
 * Safely runs without external dependencies and degrades gracefully when credentials are not supplied.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export class SupabaseClient {
  private static config: SupabaseConfig = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    isConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase')
    ),
  };

  public static getConfig(): SupabaseConfig {
    return this.config;
  }

  public static isConfigured(): boolean {
    return this.config.isConfigured;
  }

  private static getHeaders(authToken?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: this.config.anonKey,
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else {
      headers['Authorization'] = `Bearer ${this.config.anonKey}`;
    }
    return headers;
  }

  /**
   * Supabase Auth: Sign Up with email & password
   */
  public static async signUp(email: string, password: string, metadata?: Record<string, any>) {
    if (!this.isConfigured()) {
      return { data: null, error: new Error('Supabase is not configured. Please supply NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.') };
    }

    try {
      const response = await fetch(`${this.config.url}/auth/v1/signup`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          email,
          password,
          data: metadata,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { data: null, error: new Error(data.msg || data.error_description || 'Sign up failed') };
      }
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  /**
   * Supabase Auth: Sign In with email & password
   */
  public static async signIn(email: string, password: string) {
    if (!this.isConfigured()) {
      return { data: null, error: new Error('Supabase is not configured. Running in local session mode.') };
    }

    try {
      const response = await fetch(`${this.config.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { data: null, error: new Error(data.error_description || data.msg || 'Invalid login credentials') };
      }
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  /**
   * Sync Profile record to Supabase
   */
  public static async syncProfile(profile: any, token: string) {
    if (!this.isConfigured() || !token) return null;
    try {
      const response = await fetch(`${this.config.url}/rest/v1/profiles?on_conflict=id`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(token),
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(profile),
      });
      return await response.json();
    } catch (err) {
      console.warn('Supabase sync profile failed:', err);
      return null;
    }
  }
}

