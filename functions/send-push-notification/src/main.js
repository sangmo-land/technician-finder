import { Client, Databases, Query } from 'node-appwrite';
import { Expo } from 'expo-server-sdk';

/**
 * Appwrite Function: send-push-notification
 *
 * Triggers on: databases.*.collections.users.documents.*.create
 * 
 * When a new user registers, this function sends a push notification
 * to all admin users who have registered their devices.
 *
 * Environment variables (set in Appwrite Console):
 *   APPWRITE_DATABASE_ID
 *   APPWRITE_PUSH_TOKENS_COLLECTION_ID
 */
export default async ({ req, res, log, error }) => {
  const apiKey =
    req.headers['x-appwrite-key'] ||
    process.env.APPWRITE_FUNCTION_API_KEY;

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(apiKey);

  const databases = new Databases(client);
  const expo = new Expo();

  const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
  const PUSH_TOKENS_COLLECTION_ID = process.env.APPWRITE_PUSH_TOKENS_COLLECTION_ID;

  if (!DATABASE_ID || !PUSH_TOKENS_COLLECTION_ID) {
    error('Missing required environment variables: APPWRITE_DATABASE_ID or APPWRITE_PUSH_TOKENS_COLLECTION_ID');
    return res.json({ ok: false, message: 'Server configuration error' }, 500);
  }

  // Parse the event data
  let eventData;
  try {
    eventData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    log('No event data provided, this may be a test call');
    return res.json({ ok: true, message: 'Function ready' });
  }

  // Get new user info from the event
  const newUserName = eventData?.name || 'Someone';
  const newUserLocation = eventData?.location || '';
  const newUserId = eventData?.userId || '';

  log(`New user registered: ${newUserName} from ${newUserLocation || 'unknown location'}`);

  try {
    // Get all admin push tokens
    const tokenDocs = await databases.listDocuments(
      DATABASE_ID,
      PUSH_TOKENS_COLLECTION_ID,
      [
        Query.equal('isAdmin', true),
        Query.limit(100)
      ]
    );

    if (tokenDocs.total === 0) {
      log('No admin push tokens registered');
      return res.json({ ok: true, sent: 0 });
    }

    // Filter out tokens belonging to the new user (don't notify yourself)
    const tokens = tokenDocs.documents
      .filter(doc => doc.userId !== newUserId)
      .map(doc => doc.token);

    if (tokens.length === 0) {
      log('No eligible admin tokens to notify');
      return res.json({ ok: true, sent: 0 });
    }

    // Validate tokens
    const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));
    
    if (validTokens.length === 0) {
      log('No valid Expo push tokens found');
      return res.json({ ok: true, sent: 0 });
    }

    // Build notification messages
    const messages = validTokens.map(token => ({
      to: token,
      sound: 'default',
      title: '👤 New User Registration',
      body: newUserLocation 
        ? `${newUserName} just signed up from ${newUserLocation}`
        : `${newUserName} just signed up`,
      data: { 
        type: 'new_user_registration',
        userId: newUserId 
      },
      channelId: 'new-users', // Android notification channel
    }));

    // Send in chunks (Expo recommends max 100 per request)
    const chunks = expo.chunkPushNotifications(messages);
    let sentCount = 0;

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        
        // Log any errors
        ticketChunk.forEach((ticket, index) => {
          if (ticket.status === 'error') {
            error(`Push notification error for ${chunk[index].to}: ${ticket.message}`);
            
            // If device is not registered, we could clean up the token
            if (ticket.details?.error === 'DeviceNotRegistered') {
              log(`Device not registered, should clean up token: ${chunk[index].to}`);
            }
          } else {
            sentCount++;
          }
        });
      } catch (e) {
        error(`Failed to send push notification chunk: ${e.message}`);
      }
    }

    log(`Successfully sent ${sentCount} push notifications`);
    return res.json({ ok: true, sent: sentCount });

  } catch (e) {
    error(`Failed to send notifications: ${e.message}`);
    return res.json({ ok: false, message: e.message }, 500);
  }
};
