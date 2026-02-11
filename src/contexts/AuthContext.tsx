import React, { createContext, useContext, useEffect, useState } from "react";
import { Models } from "react-native-appwrite";
import {
  getCurrentUser,
  signIn as appwriteSignIn,
  signUp as appwriteSignUp,
  signOut as appwriteSignOut,
  signInWithGoogle as appwriteGoogleSignIn,
  createAnonymousSession,
} from "../services/appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// TODO: DEMO MODE - Remove this flag to re-enable authentication
const DEMO_MODE = false;

const DEMO_USER = {
  $id: "demo-user",
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  name: "Demo User",
  email: "demo@example.com",
  phone: "",
  emailVerification: true,
  phoneVerification: false,
  status: true,
  labels: [],
  prefs: {},
  accessedAt: new Date().toISOString(),
  registration: new Date().toISOString(),
  mfa: false,
  targets: [],
  hash: "",
  hashOptions: {},
  password: "",
} as unknown as Models.User<Models.Preferences>;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    DEMO_MODE ? DEMO_USER : null,
  );
  const [isLoading, setIsLoading] = useState(DEMO_MODE ? false : true);

  useEffect(() => {
    if (!DEMO_MODE) {
      checkUser();
    }
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      // Treat anonymous sessions as "not logged in" for the UI
      // Anonymous users have no email and no name set through normal signup
      if (currentUser && currentUser.email) {
        setUser(currentUser);
      } else {
        setUser(null);
        // ensureSession() in _layout already created an anonymous session if needed
      }
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

  async function handleSignUp(email: string, password: string, name: string) {
    const newUser = await appwriteSignUp(email, password, name);
    setUser(newUser);
  }

  async function handleSignOut() {
    await appwriteSignOut();
    setUser(null);
    // Re-create anonymous session for guest browsing
    await createAnonymousSession();
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
        isAdmin: Array.isArray(user?.labels) && user.labels.includes("admin"),
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
