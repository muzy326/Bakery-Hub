import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (
    name: string,
    email: string,
    password?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // Only hit the server if we previously recorded a session.
    // This avoids a noisy 401 in the browser console for anonymous visitors.
    const hasSession = localStorage.getItem("kanz_session") === "1";
    if (!hasSession) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { user: AuthUser };
        setUser(data.user);
      } else {
        // Session expired or invalid — clear the hint
        localStorage.removeItem("kanz_session");
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json() as { user?: AuthUser; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Login failed");
    localStorage.setItem("kanz_session", "1");
    setUser(data.user!);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json() as { user?: AuthUser; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Registration failed");
    localStorage.setItem("kanz_session", "1");
    setUser(data.user!);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("kanz_session");
    setUser(null);
  };
const updateProfile = async (
  name: string,
  email: string,
  password?: string,
) => {
  const res = await fetch("/api/auth/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name,
      email,
      ...(password ? { password } : {}),
    }),
  });

  const data = await res.json() as {
    user?: AuthUser;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to update profile");
  }

  setUser(data.user!);
};
  return (
    <AuthContext.Provider
  value={{
    user,
    loading,
    login,
    register,
    updateProfile,
    logout,
    refresh,
  }}
>
    {children}
</AuthContext.Provider>
  );
}
