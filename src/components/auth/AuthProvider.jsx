"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  clearSession,
  getSession,
  setSession,
  validateCredentials
} from "@/lib/auth";
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [session, setSessionState] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const saved = getSession();
    if (saved) setSessionState(saved);
    setReady(true);
  }, []);
  const login = useCallback((username, password) => {
    const next = validateCredentials(username, password);
    if (!next) return false;
    setSession(next);
    setSessionState(next);
    return true;
  }, []);
  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);
  const value = useMemo(
    () => ({ session, ready, login, logout }),
    [session, ready, login, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
function useRequireAuth(defaultRedirect) {
  const auth = useAuth();
  return { ...auth, defaultRedirect };
}
export {
  AuthProvider,
  useAuth,
  useRequireAuth
};
