import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { User } from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("fin_token"));
  const queryClient = useQueryClient();

  const { data: user, isLoading: isQueryLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: getGetMeQueryKey()
    }
  });

  useEffect(() => {
    if (isError) {
      localStorage.removeItem("fin_token");
      setToken(null);
    }
  }, [isError]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("fin_token", newToken);
    setToken(newToken);
    queryClient.setQueryData(getGetMeQueryKey(), newUser);
  };

  const logout = () => {
    localStorage.removeItem("fin_token");
    setToken(null);
    queryClient.setQueryData(getGetMeQueryKey(), null);
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading: isQueryLoading && !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
