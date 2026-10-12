/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { mockClientsExtended } from "../data/mockTrace";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

const MANAGER_ACCOUNT = { email: "manager@meridian.com", password: "admin123", name: "Lokesh V" };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("wealthpilot_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("wealthpilot_token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  // On mount, check if there's an existing valid token
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem("wealthpilot_token");
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setToken(storedToken);
            localStorage.setItem("wealthpilot_user", JSON.stringify(data.user));
          } else {
            localStorage.removeItem("wealthpilot_token");
            localStorage.removeItem("wealthpilot_user");
            setUser(null);
          }
        } else {
          localStorage.removeItem("wealthpilot_token");
          localStorage.removeItem("wealthpilot_user");
          setUser(null);
        }
      } catch {
        // If server is unreachable, keep existing cached user session
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(mode, email, password) {
    setError("");
    const normalizedEmail = email.trim();

    try {
      // 1. Try real Backend API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password, role: mode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("wealthpilot_token", data.token);
        localStorage.setItem("wealthpilot_user", JSON.stringify(data.user));
        showToast(data.message || `Welcome back, ${data.user.name}.`, "success");
        return true;
      } else {
        const msg = data.message || "Invalid credentials.";
        setError(msg);
        showToast(msg, "error");
        return false;
      }
    } catch {
      // 2. Fallback to offline demo credentials if backend server is unreachable
      if (mode === "manager") {
        if (normalizedEmail === MANAGER_ACCOUNT.email && password === MANAGER_ACCOUNT.password) {
          const fallbackUser = { role: "manager", name: MANAGER_ACCOUNT.name, email: MANAGER_ACCOUNT.email };
          setUser(fallbackUser);
          localStorage.setItem("wealthpilot_user", JSON.stringify(fallbackUser));
          showToast(`Welcome back, ${MANAGER_ACCOUNT.name} (Offline Mode).`, "success");
          return true;
        }
        setError("Invalid manager credentials.");
        showToast("Invalid manager credentials.", "error");
        return false;
      } else {
        const client = mockClientsExtended.find((c) => c.email === normalizedEmail && c.password === password);
        if (client) {
          const fallbackUser = { role: "client", name: client.name, clientId: client.id, email: client.email };
          setUser(fallbackUser);
          localStorage.setItem("wealthpilot_user", JSON.stringify(fallbackUser));
          showToast(`Welcome back, ${client.name} (Offline Mode).`, "success");
          return true;
        }
        setError("Invalid client credentials.");
        showToast("Invalid client credentials.", "error");
        return false;
      }
    }
  }

  async function register(userData) {
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("wealthpilot_token", data.token);
        localStorage.setItem("wealthpilot_user", JSON.stringify(data.user));
        showToast(data.message || "Account registered successfully!", "success");
        return true;
      } else {
        const msg = data.message || "Registration failed.";
        setError(msg);
        showToast(msg, "error");
        return false;
      }
    } catch (err) {
      const msg = err.message || "Could not reach the registration server.";
      setError(msg);
      showToast(msg, "error");
      return false;
    }
  }

  function logout() {
    localStorage.removeItem("wealthpilot_token");
    localStorage.removeItem("wealthpilot_user");
    setUser(null);
    setToken(null);
    window.location.hash = "#/";
    showToast("Logged out successfully.", "info");
  }

  function updateUser(partialUser) {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...partialUser };
      localStorage.setItem("wealthpilot_user", JSON.stringify(next));
      return next;
    });
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, error, setError, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}