import React, { createContext, useContext, useEffect, useState } from "react";
import { Models } from "react-native-appwrite";
import {
  getCurrentUser,
  signIn as appwriteSignIn,
  signUp as appwriteSignUp,
  signOut as appwriteSignOut,
  signInWithGoogle as appwriteGoogleSignIn,
} from "../services/appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignIn(email: string, password: string) {
    const loggedIn = await appwriteSignIn(email, password);
    setUser(loggedIn);
  }

  async function handleSignUp(
    email: string,
    password: string,
    name: string
  ) {
    const newUser = await appwriteSignUp(email, password, name);
    setUser(newUser);
  }

  async function handleSignOut() {
    await appwriteSignOut();
    setUser(null);
  }

  async function handleGoogleSignIn() {
    const googleUser = await appwriteGoogleSignIn();
    setUser(googleUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        signInWithGoogle: handleGoogleSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
