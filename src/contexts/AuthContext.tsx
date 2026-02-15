import React, { createContext, useContext, useEffect, useState } from "react";
import { Models } from "react-native-appwrite";
import {
  getCurrentUser,
  signIn as appwriteSignIn,
  signUp as appwriteSignUp,
  signOut as appwriteSignOut,
  signInWithGoogle as appwriteGoogleSignIn,
  createAnonymousSession,
  handleOAuthCallback,
  isOAuthCallbackUrl,
} from "../services/appwrite";
import {
  registerPushToken,
  unregisterPushToken,
  setupNotifications,
} from "../services/notifications";
import { invalidateTechnicianCache } from "../services/storage";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  handleDeepLinkAuth: (url: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Compute isAdmin once
  const isAdmin = Array.isArray(user?.labels) && user.labels.includes("admin");

  useEffect(() => {
    checkUser();
  }, []);

  // Register push token when user logs in
  useEffect(() => {
    if (user?.email) {
      // Setup notifications and register push token
      setupNotifications().then((granted) => {
        if (granted) {
          registerPushToken(user.$id, isAdmin);
        }
      });
    }
  }, [user?.$id, isAdmin]);

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
    // Invalidate cache to force fresh data fetch with new auth context
    invalidateTechnicianCache();
    const loggedIn = await appwriteSignIn(email, password);
    setUser(loggedIn);
  }

  async function handleSignUp(email: string, password: string, name: string) {
    // Invalidate cache to force fresh data fetch with new auth context
    invalidateTechnicianCache();
    const newUser = await appwriteSignUp(email, password, name);
    setUser(newUser);
  }

  async function handleSignOut() {
    // Unregister push token before signing out
    await unregisterPushToken();
    await appwriteSignOut();
    setUser(null);
    // Invalidate cache to force fresh data fetch with anonymous context
    invalidateTechnicianCache();
    // Re-create anonymous session for guest browsing
    await createAnonymousSession();
  }

  async function handleGoogleSignIn() {
    // Invalidate cache to force fresh data fetch with new auth context
    invalidateTechnicianCache();
    const googleUser = await appwriteGoogleSignIn();
    setUser(googleUser);
  }

  /**
   * Handle OAuth callback from deep link (for cold start scenarios).
   * Returns true if the URL was handled successfully, false otherwise.
   */
  async function handleDeepLinkAuth(url: string): Promise<boolean> {
    if (!isOAuthCallbackUrl(url)) {
      return false;
    }

    // Invalidate cache to force fresh data fetch with new auth context
    invalidateTechnicianCache();
    const oauthUser = await handleOAuthCallback(url);
    if (oauthUser && oauthUser.email) {
      setUser(oauthUser);
      return true;
    }
    return false;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        signInWithGoogle: handleGoogleSignIn,
        handleDeepLinkAuth,
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
