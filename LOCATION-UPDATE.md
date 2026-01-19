# 📍 Location Tracking Update

## Features Added:
1. **User Location Storage**: 
   - Backend now stores `location` object for every user.
   - Includes: `city`, `state`, `country`, `coordinates`, `address`.

2. **Auto-Sync**: 
   - When a user opens their Profile tab, the app automatically syncs their current location to the database.

3. **Admin Visibility**: 
   - Admin Dashboard -> Users tab now shows the user's location.
   - Display format: `📍 City, State`

## Files Modified:
- `backend/models/User.js`: Schema update
- `backend/routes/users.js`: API update
- `app/(tabs)/profile.tsx`: Frontend sync logic
- `app/admin/index.tsx`: Admin UI update

## How to Test:
1. Reload App (`r`).
2. Go to **Profile** tab (triggers location sync).
3. Go to **Admin Dashboard**.
4. Tap **Users** tab.
5. See your location under your email!
