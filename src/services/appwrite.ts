import { Client, Account, ID, Models, OAuthProvider } from "react-native-appwrite";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-linking";

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);

// ── Auth helpers ──

export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<Models.User<Models.Preferences>> {
  await account.create(ID.unique(), email, password, name);
  await account.createEmailPasswordSession(email, password);
  return account.get();
}

export async function signIn(
  email: string,
  password: string
): Promise<Models.User<Models.Preferences>> {
  await account.createEmailPasswordSession(email, password);
  return account.get();
}

export async function signInWithGoogle(): Promise<Models.User<Models.Preferences>> {
  const redirectUri = makeRedirectUri({ scheme: "technician-finder" });
  const response = account.createOAuth2Token(
    OAuthProvider.Google,
    redirectUri,
    redirectUri
  );

  // Open the OAuth URL in the browser
  const browserResult = await WebBrowser.openAuthSessionAsync(
    (response as any).toString(),
    redirectUri
  );

  if (browserResult.type !== "success" || !browserResult.url) {
    throw new Error("Google sign-in was cancelled");
  }

  // Extract the secret & userId from the callback URL
  const url = new URL(browserResult.url);
  const secret = url.searchParams.get("secret");
  const userId = url.searchParams.get("userId");

  if (!secret || !userId) {
    throw new Error("Missing authentication parameters");
  }

  // Create session from the OAuth2 token
  await account.createSession(userId, secret);
  return account.get();
}

export async function signOut(): Promise<void> {
  await account.deleteSession("current");
}

export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export { client, account };
