# Skills Migration to Appwrite

## Summary
Custom skills are now stored in Appwrite (shared across all devices) instead of local AsyncStorage.

## Migration Steps

### 1. Create the Skills Collection
Run the setup script with your Appwrite server API key:

```bash
APPWRITE_API_KEY=<your-api-key> node scripts/setup-skills-collection.js
```

This will:
- Create a `skills` collection in Appwrite
- Seed the 5 default skills (Plumber, Electrician, Carpenter, Mason, Painter)
- Print the collection ID

### 2. Update .env
The script output will show:
```
EXPO_PUBLIC_APPWRITE_SKILLS_COLLECTION_ID=<id>
```

Add this line to your `.env` file.

### 3. Restart the App
The app will now load skills from Appwrite on startup.

## What Changed

**Before**: Custom skills stored in AsyncStorage (device-only)
- Skills added on one device didn't sync to others
- Uninstalling the app deleted custom skills

**After**: Skills stored in Appwrite (cloud, production-ready)
- Skills added by any admin are visible to all users globally
- Bilingual names (EN + FR) stored in the database
- Auto-assigned colors from a predefined palette
- Icons can be customized per skill

## Admin Permissions
Only users with the `admin` role can create/delete skills. This is enforced by Appwrite's permission system on the collection.

## Existing AsyncStorage Data
If users had custom skills in AsyncStorage before this update, those won't be automatically migrated. They can re-add them via the admin Skills tab.
