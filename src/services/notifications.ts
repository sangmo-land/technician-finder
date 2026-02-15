import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { Databases, ID, Query } from "react-native-appwrite";
import { client } from "./appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
const PUSH_TOKENS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_PUSH_TOKENS_COLLECTION_ID!;

// Detect if running inside Expo Go (notifications not supported since SDK 53)
const isExpoGo = Constants.appOwnership === "expo";

const databases = new Databases(client);

// ── Configure how notifications appear when the app is in the foreground ──
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ── Setup notification channel (Android) + request permissions ──

export async function setupNotifications(): Promise<boolean> {
  if (isExpoGo) {
    console.log("Notifications: skipped in Expo Go (use a development build)");
    return false;
  }

  // Android needs an explicit channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("new-users", {
      name: "New User Registrations",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#065F46",
      sound: "default",
    });
  }

  // Must be a physical device for push tokens
  if (!Device.isDevice) {
    console.log("Notifications: running on emulator, skipping push token");
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

// ── Push Token Management ──

/**
 * Get the Expo push token for this device.
 * Returns null if running in Expo Go or on simulator.
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (isExpoGo) {
    console.log("Push tokens: not available in Expo Go");
    return null;
  }

  if (!Device.isDevice) {
    console.log("Push tokens: must use physical device for push notifications");
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.log("Push tokens: missing EAS projectId in app config");
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return token;
  } catch (error) {
    console.log("Push tokens: failed to get token -", error);
    return null;
  }
}

/**
 * Register the device's push token in Appwrite.
 * Call this after user login/signup.
 */
export async function registerPushToken(
  userId: string,
  isAdmin: boolean = false,
): Promise<void> {
  if (!PUSH_TOKENS_COLLECTION_ID) {
    console.log("Push tokens: PUSH_TOKENS_COLLECTION_ID not configured");
    return;
  }

  const token = await getExpoPushToken();
  if (!token) return;

  try {
    // Check if token already exists
    const existing = await databases.listDocuments(
      DATABASE_ID,
      PUSH_TOKENS_COLLECTION_ID,
      [Query.equal("token", token), Query.limit(1)],
    );

    if (existing.total > 0) {
      // Update existing token with new userId/isAdmin (in case user changed)
      const doc = existing.documents[0];
      await databases.updateDocument(
        DATABASE_ID,
        PUSH_TOKENS_COLLECTION_ID,
        doc.$id,
        { userId, isAdmin },
      );
      console.log("Push tokens: updated existing token");
    } else {
      // Create new token record
      await databases.createDocument(
        DATABASE_ID,
        PUSH_TOKENS_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          token,
          platform: Platform.OS,
          isAdmin,
          createdAt: new Date().toISOString(),
        },
      );
      console.log("Push tokens: registered new token");
    }
  } catch (error) {
    console.log("Push tokens: failed to register -", error);
  }
}

/**
 * Remove the device's push token from Appwrite.
 * Call this on logout.
 */
export async function unregisterPushToken(): Promise<void> {
  if (!PUSH_TOKENS_COLLECTION_ID) return;

  const token = await getExpoPushToken();
  if (!token) return;

  try {
    const existing = await databases.listDocuments(
      DATABASE_ID,
      PUSH_TOKENS_COLLECTION_ID,
      [Query.equal("token", token), Query.limit(1)],
    );

    if (existing.total > 0) {
      await databases.deleteDocument(
        DATABASE_ID,
        PUSH_TOKENS_COLLECTION_ID,
        existing.documents[0].$id,
      );
      console.log("Push tokens: unregistered token");
    }
  } catch (error) {
    console.log("Push tokens: failed to unregister -", error);
  }
}

// ── Send a local notification ──

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  if (isExpoGo) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
      data: data ?? {},
      ...(Platform.OS === "android" && { channelId: "new-users" }),
    },
    trigger: null, // show immediately
  });
}

// ── Appwrite real-time listener for new user registrations ──

let unsubscribe: (() => void) | null = null;

export function subscribeToNewUsers(
  onNewUser: (name: string, location: string) => void,
  currentUserId?: string,
): () => void {
  // Unsubscribe previous listener if any
  if (unsubscribe) {
    unsubscribe();
  }

  // Guard: skip if env vars are missing to avoid broken websocket loops
  if (!DATABASE_ID || !USERS_COLLECTION_ID) {
    console.log(
      "Notifications: skipping realtime – DATABASE_ID or USERS_COLLECTION_ID not set",
    );
    return () => {};
  }

  // No point subscribing in Expo Go – notifications can't fire anyway
  if (isExpoGo) {
    return () => {};
  }

  const channel = `databases.${DATABASE_ID}.collections.${USERS_COLLECTION_ID}.documents`;

  try {
    unsubscribe = client.subscribe(channel, (response) => {
      // Only react to newly-created documents
      const events = response.events ?? [];
      const isCreate = events.some((e: string) =>
        e.includes(".documents.*.create"),
      );
      if (!isCreate) return;

      const payload = response.payload as any;
      const name: string = payload?.name ?? "Someone";
      const location: string = payload?.location ?? "";
      const userId: string = payload?.userId ?? "";

      // Don't notify for the user's own registration
      if (currentUserId && userId === currentUserId) return;

      onNewUser(name, location);
    });
  } catch (error) {
    console.log("Notifications: realtime subscription failed –", error);
    unsubscribe = null;
  }

  return () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
}
