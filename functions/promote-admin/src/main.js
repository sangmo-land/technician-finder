import { Client, Users, Query } from 'node-appwrite';

/**
 * Appwrite Function: promote-admin
 *
 * Actions:
 *   list    → returns all admin users
 *   promote → adds "admin" label to a user (by email)
 *   demote  → removes "admin" label from a user (by userId)
 *
 * Execute permissions: users (any authenticated user)
 * Authorization: verified inside the function via user labels
 * Required scopes: users.read, users.write
 */
export default async ({ req, res, log }) => {
  // Appwrite Cloud passes the API key through req.headers
  const apiKey =
    req.headers['x-appwrite-key'] ||
    process.env.APPWRITE_FUNCTION_API_KEY;

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(apiKey);

  const users = new Users(client);

  // ── Authorization: verify caller is admin ──
  const callerId = req.headers['x-appwrite-user-id'];
  if (!callerId) {
    return res.json({ ok: false, message: 'Authentication required' }, 401);
  }

  try {
    const caller = await users.get(callerId);
    if (!caller.labels || !caller.labels.includes('admin')) {
      return res.json({ ok: false, message: 'Only admins can perform this action' }, 403);
    }
  } catch (err) {
    log('Failed to verify caller: ' + err.message);
    return res.json({ ok: false, message: 'Failed to verify admin status' }, 403);
  }

  let body = {};
  try {
    body = JSON.parse(req.body || '{}');
  } catch {
    return res.json({ ok: false, message: 'Invalid JSON body' }, 400);
  }

  const { action, email, userId } = body;

  try {
    switch (action) {
      case 'list': {
        // List all users that have the "admin" label
        const result = await users.list([Query.contains('labels', ['admin']), Query.limit(100)]);
        const admins = result.users.map(u => ({
          $id: u.$id,
          name: u.name,
          email: u.email,
        }));
        return res.json({ ok: true, admins });
      }

      case 'promote': {
        if (!email) return res.json({ ok: false, message: 'Email is required' }, 400);

        const result = await users.list([Query.equal('email', email), Query.limit(1)]);
        if (result.total === 0) {
          return res.json({ ok: false, message: `No user found with email: ${email}` }, 404);
        }

        const user = result.users[0];
        let labels = user.labels || [];

        if (labels.includes('admin')) {
          return res.json({ ok: true, message: 'User is already an admin', user: { $id: user.$id, name: user.name, email: user.email } });
        }

        labels = [...labels, 'admin'];
        await users.updateLabels(user.$id, labels);
        log(`Promoted ${user.email} to admin`);

        return res.json({ ok: true, user: { $id: user.$id, name: user.name, email: user.email }, labels });
      }

      case 'demote': {
        if (!userId) return res.json({ ok: false, message: 'userId is required' }, 400);

        const user = await users.get(userId);
        let labels = (user.labels || []).filter(l => l !== 'admin');

        await users.updateLabels(user.$id, labels);
        log(`Demoted ${user.email} from admin`);

        return res.json({ ok: true, user: { $id: user.$id, name: user.name, email: user.email }, labels });
      }

      default:
        return res.json({ ok: false, message: 'Invalid action. Use: list, promote, demote' }, 400);
    }
  } catch (err) {
    return res.json({ ok: false, message: err.message }, 500);
  }
};
