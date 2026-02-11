import {
  Client,
  Account,
  Databases,
  Storage,
  Functions,
  ID,
  Query,
  Models,
  OAuthProvider,
} from "react-native-appwrite";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import {
  UserProfile,
  UserProfileFormData,
  Technician,
  TechnicianFormData,
} from "../types";

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

// ── Constants ──
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
const TECHNICIANS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_TECHNICIANS_COLLECTION_ID!;
const GALLERY_BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_GALLERY_BUCKET_ID!;
const ADMIN_FUNCTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_ADMIN_FUNCTION_ID || "";

// ── Auth helpers ──

export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<Models.User<Models.Preferences>> {
  await account.create(ID.unique(), email, password, name);
  await account.createEmailPasswordSession(email, password);
  return account.get();
}

export async function signIn(
  email: string,
  password: string,
): Promise<Models.User<Models.Preferences>> {
  await account.createEmailPasswordSession(email, password);
  return account.get();
}

export async function signInWithGoogle(): Promise<
  Models.User<Models.Preferences>
> {
  const redirectUri = Linking.createURL("/");
  const response = account.createOAuth2Token(
    OAuthProvider.Google,
    redirectUri,
    redirectUri,
  );

  // Open the OAuth URL in the browser
  const browserResult = await WebBrowser.openAuthSessionAsync(
    (response as any).toString(),
    redirectUri,
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

// ── User Profile helpers ──

export async function createUserProfile(
  data: UserProfileFormData,
): Promise<UserProfile> {
  return (await databases.createDocument(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    ID.unique(),
    data,
  )) as unknown as UserProfile;
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("userId", userId), Query.limit(1)],
    );
    return (res.documents[0] as unknown as UserProfile) ?? null;
  } catch {
    return null;
  }
}

export async function updateUserProfile(
  documentId: string,
  data: Partial<UserProfileFormData>,
): Promise<UserProfile> {
  return (await databases.updateDocument(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    documentId,
    data,
  )) as unknown as UserProfile;
}

// ── Technician helpers ──

export async function createTechnician(
  data: TechnicianFormData,
): Promise<Technician> {
  return (await databases.createDocument(
    DATABASE_ID,
    TECHNICIANS_COLLECTION_ID,
    ID.unique(),
    data,
  )) as unknown as Technician;
}

export async function getTechnician(
  userId: string,
): Promise<Technician | null> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      TECHNICIANS_COLLECTION_ID,
      [Query.equal("userId", userId), Query.limit(1)],
    );
    return (res.documents[0] as unknown as Technician) ?? null;
  } catch {
    return null;
  }
}

export async function getTechnicianById(
  documentId: string,
): Promise<Technician> {
  return (await databases.getDocument(
    DATABASE_ID,
    TECHNICIANS_COLLECTION_ID,
    documentId,
  )) as unknown as Technician;
}

export async function listTechnicians(
  queries: string[] = [],
): Promise<Technician[]> {
  const res = await databases.listDocuments(
    DATABASE_ID,
    TECHNICIANS_COLLECTION_ID,
    queries,
  );
  return res.documents as unknown as Technician[];
}

export async function updateTechnician(
  documentId: string,
  data: Partial<TechnicianFormData>,
): Promise<Technician> {
  return (await databases.updateDocument(
    DATABASE_ID,
    TECHNICIANS_COLLECTION_ID,
    documentId,
    data,
  )) as unknown as Technician;
}

export async function deleteTechnician(documentId: string): Promise<void> {
  await databases.deleteDocument(
    DATABASE_ID,
    TECHNICIANS_COLLECTION_ID,
    documentId,
  );
}

// ── Gallery / Storage helpers ──

export async function uploadGalleryImage(file: {
  name: string;
  type: string;
  size: number;
  uri: string;
}): Promise<string> {
  const uploaded = await storage.createFile(
    GALLERY_BUCKET_ID,
    ID.unique(),
    file,
  );
  return uploaded.$id;
}

export function getGalleryImageUrl(fileId: string): string {
  return `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${GALLERY_BUCKET_ID}/files/${fileId}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
}

export async function deleteGalleryImage(fileId: string): Promise<void> {
  await storage.deleteFile(GALLERY_BUCKET_ID, fileId);
}

// ── Admin management (calls Appwrite Function) ──

export interface AdminUser {
  $id: string;
  name: string;
  email: string;
}

async function callAdminFunction(body: Record<string, string>): Promise<any> {
  if (!ADMIN_FUNCTION_ID) {
    throw new Error(
      "Admin function not configured. Set EXPO_PUBLIC_APPWRITE_ADMIN_FUNCTION_ID in .env",
    );
  }
  const execution = await functions.createExecution(
    ADMIN_FUNCTION_ID,
    JSON.stringify(body),
    false,
    "/",
    "POST" as any,
  );
  const result = JSON.parse(execution.responseBody);
  if (!result.ok) {
    throw new Error(result.message || "Function call failed");
  }
  return result;
}

export async function listAdmins(): Promise<AdminUser[]> {
  const result = await callAdminFunction({ action: "list" });
  return result.admins || [];
}

export async function promoteToAdmin(email: string): Promise<AdminUser> {
  const result = await callAdminFunction({ action: "promote", email });
  return result.user;
}

export async function demoteFromAdmin(userId: string): Promise<void> {
  await callAdminFunction({ action: "demote", userId });
}

export { client, account, databases, storage, Query };
