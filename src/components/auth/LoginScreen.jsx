"use client";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { BflWordmark } from "@/components/brand/BflLogo";
import { PAGE_PATHS } from "@/lib/auth";

function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const resetPasswordToggle = () => setShowPassword(false);

  const goTo = (page) => {
    window.location.href = PAGE_PATHS[page];
  };

  const fillDemo = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError(false);
    resetPasswordToggle();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = login(username, password);
    if (!ok) {
      setError(true);
      setPassword("");
      return;
    }
    setError(false);
    const key = username.trim().toLowerCase();
    const profileDefault =
      key === "operations" ? "operations" : key === "warehouse" ? "process" : "control-tower";
    goTo(profileDefault);
  };

  return (
    <div id="login-screen">
      <div className="login-shell">
        <div className="login-brand">
          <BflWordmark />
          <h1>
            Warehouse
            <br />
            Operations Platform
          </h1>
          <p className="login-lead">
            BFL Group is the leading off-price retailer in the MENA region.
            Sign in to follow live merchandise journeys from supplier through
            YOTO, JAFZA and TECHNO to store — so product reaches the floor faster.
          </p>
          <ul className="login-features">
            <li>
              <span className="login-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19V5" />
                  <path d="M4 19h16" />
                  <path d="M8 15v-4" />
                  <path d="M12 15V8" />
                  <path d="M16 15v-6" />
                </svg>
              </span>
              <div>
                <strong>End-to-end journey visibility</strong>
                <span>
                  Search PO, shipment, container or SKU and see the actual route,
                  current location, dwell and exceptions.
                </span>
              </div>
            </li>
            <li>
              <span className="login-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="8" r="3" />
                  <circle cx="17" cy="9" r="2.5" />
                  <path d="M4 19c.6-3 2.6-4.5 5-4.5s4.4 1.5 5 4.5" />
                  <path d="M14.5 19c.4-2.2 1.8-3.2 3.5-3.2 1.4 0 2.5.7 3 2.2" />
                </svg>
              </span>
              <div>
                <strong>Persona-based warehouse control</strong>
                <span>
                  JAFZA, regional and operations users land on their own dashboard,
                  with SLA, bottlenecks and people vs workload in scope.
                </span>
              </div>
            </li>
            <li>
              <span className="login-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l8 4v6c0 5-3.4 7.6-8 9-4.6-1.4-8-4-8-9V7l8-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <div>
                <strong>What-if scenario planning</strong>
                <span>
                  Test volume surges and process capacity changes against today&apos;s
                  baseline before they hit counting, QC or dispatch.
                </span>
              </div>
            </li>
          </ul>
        </div>

        <div className="login-card">
          <h2>Sign In</h2>
          <div className={`login-error${error ? " show" : ""}`} id="login-error">
            Invalid username or password. Please try again.
          </div>
          <form id="login-form" autoComplete="on" onSubmit={handleSubmit}>
            <div className={`login-field${username ? " filled" : ""}`}>
              <span className="login-field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="3.2" />
                  <path d="M5 19c.8-3.6 3.4-5.5 7-5.5s6.2 1.9 7 5.5" />
                </svg>
              </span>
              <div className="login-field-body">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  className="form-input"
                  placeholder="Enter username"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className={`login-field${password ? " filled" : ""}`}>
              <span className="login-field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 018 0v3" />
                </svg>
              </span>
              <div className="login-field-body">
                <label htmlFor="password">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-input"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="button"
                className={`password-toggle${showPassword ? " visible" : ""}`}
                id="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                <svg className="icon-show" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg className="icon-hide" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M14.12 14.12a3 3 0 01-4.24-4.24" />
                </svg>
              </button>
            </div>

            <button type="submit" className="btn-login" id="btn-login">
              Sign In
            </button>
          </form>

          <div className="demo-users">
            <div className="demo-users-title">Demo accounts (click to fill)</div>
            <div
              className="demo-user-row"
              data-user="executive"
              data-pass="Executive@123"
              onClick={() => fillDemo("executive", "Executive@123")}
              onDoubleClick={() => {
                fillDemo("executive", "Executive@123");
                void login("executive", "Executive@123");
                goTo("control-tower");
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") fillDemo("executive", "Executive@123");
              }}
            >
              <span className="role-name">Executive / Control Tower</span>
              <span className="creds">executive</span>
            </div>
            <div
              className="demo-user-row"
              data-user="operations"
              data-pass="Operations@123"
              onClick={() => fillDemo("operations", "Operations@123")}
              onDoubleClick={() => {
                fillDemo("operations", "Operations@123");
                void login("operations", "Operations@123");
                goTo("operations");
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") fillDemo("operations", "Operations@123");
              }}
            >
              <span className="role-name">Operations Manager</span>
              <span className="creds">operations</span>
            </div>
            <div
              className="demo-user-row"
              data-user="warehouse"
              data-pass="Warehouse@123"
              onClick={() => fillDemo("warehouse", "Warehouse@123")}
              onDoubleClick={() => {
                fillDemo("warehouse", "Warehouse@123");
                void login("warehouse", "Warehouse@123");
                goTo("process");
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") fillDemo("warehouse", "Warehouse@123");
              }}
            >
              <span className="role-name">Warehouse Manager</span>
              <span className="creds">warehouse</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { LoginScreen };
