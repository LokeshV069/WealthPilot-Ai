/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { mockClientsExtended } from "../data/mockTrace";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

const MANAGER_ACCOUNT = { email: "manager@meridian.com", password: "admin123", name: "Lokesh V" };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  function login(mode, email, password) {
    setError("");
    if (mode === "manager") {
      if (email === MANAGER_ACCOUNT.email && password === MANAGER_ACCOUNT.password) {
        setUser({ role: "manager", name: MANAGER_ACCOUNT.name });
        showToast(`Welcome back, ${MANAGER_ACCOUNT.name}.`, "success");
        return true;
      }
      setError("Invalid manager credentials.");
      showToast("Invalid manager credentials.", "error");
      return false;
    } else {
      const client = mockClientsExtended.find((c) => c.email === email && c.password === password);
      if (client) {
        setUser({ role: "client", name: client.name, clientId: client.id });
        showToast(`Welcome back, ${client.name}.`, "success");
        return true;
      }
      setError("Invalid client credentials.");
      showToast("Invalid client credentials.", "error");
      return false;
    }
  }

  function logout() {
    showToast("Logged out.", "info");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout, error }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}