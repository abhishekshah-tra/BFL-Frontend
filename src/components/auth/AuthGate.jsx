"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "./AuthProvider";
import { LoginScreen } from "./LoginScreen";
function Gate({ children }) {
  const { session, ready } = useAuth();
  if (!ready) {
    return null;
  }
  if (!session) {
    return <div className="bfl-personas">
        <LoginScreen />
      </div>;
  }
  return <AppLayout>{children}</AppLayout>;
}
function AuthGate({ children }) {
  return <AuthProvider>
      <Gate>{children}</Gate>
    </AuthProvider>;
}
export {
  AuthGate
};
