import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { client } from "./appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

// Detect if running inside Expo Go (notifications not supported since SDK 53)
const isExpoGo = Constants.appOwnership === "expo";

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

  const channel = `databases.${DATABASE_ID}.collections.${USERS_COLLECTION_ID}.documents`;

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

  return () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
}
