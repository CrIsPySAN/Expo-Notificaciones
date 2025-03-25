// utils/ctx.js
import { useContext, createContext } from "react";
import { useStorageState } from "./useStorageState";
import axios from "axios"; // O podrías usar tu instancia `api`
// OJO: para login usamos axios sin interceptores, ya que es la excepción

const AuthContext = createContext({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }
  return value;
}

export function SessionProvider({ children }) {
  // useStorageState -> [ [isLoading, session], setSession ]
  const [[isLoading, session], setSession] = useStorageState("session_token");

  return (
    <AuthContext.Provider
      value={{
        signIn: async (username, password) => {
          try {
            // Llamada al endpoint /auth con axios sin interceptores
            const res = await axios.post(
              "https://8bc1-2806-10be-8-111a-48d-9c66-daf-6f08.ngrok-free.app/auth",
              {
                username,
                password,
              }
            );
            if (res.data?.data?.token) {
              setSession(res.data.data.token);
              return true;
            }
            return false;
          } catch (error) {
            console.error("Error en login:", error);
            return false;
          }
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
