# 🎯 NEXT STEPS - Get Your App Running!

## ⚠️ IMPORTANT: Do These Steps in Order

### Step 1: Setup MongoDB Atlas (5 minutes)

1. **Create FREE MongoDB Account:**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up with email

2. **Create Database:**
   - Create new project: "AIProp"
   - Create cluster: M0 FREE tier
   - Wait for cluster to deploy (~3 min)

3. **Setup Access:**
   - **Database Access** → "Add New Database User"
     - Username: `aiprop`
     - Password: `aiprop123`
     - Click "Add User"
   
   - **Network Access** → "Add IP Address"
     - Select: "Allow Access from Anywhere"
     - IP: `0.0.0.0/0`
     - Click "Confirm"

4. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string:
     ```
     mongodb+srv://aiprop:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with `aiprop123`
   - Replace `xxxxx` with your actual cluster ID

---

### Step 2: Configure Backend (.env file)

1. **Open:** `backend/.env`

2. **Replace line 1** with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://aiprop:aiprop123@cluster0.XXXXX.mongodb.net/aiprop?retryWrites=true&w=majority
   ```
   ⚠️ Don't forget to replace `XXXXX` with your cluster ID!

3. **Save the file**

---

### Step 3: Test MongoDB Connection

```bash
cd backend
npm test
```

You should see:
```
✅ MongoDB Connected Successfully
✅ Test user created
✅ Test property created
✅✅✅ All tests passed! ✅✅✅
```

If you see errors, go back to Step 1 and verify your connection string.

---

### Step 4: Start Backend Server

```bash
npm run dev
```

Keep this terminal running! You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 3000
📍 API available at http://localhost:3000/api
```

**Test in browser:** http://localhost:3000/health

Should show:
```json
{
  "status": "OK",
  "mongodb": "Connected"
}
```

---

### Step 5: Find Your Computer's IP Address

**Windows:**
1. Open Command Prompt (CMD)
2. Type: `ipconfig`
3. Look for "IPv4 Address" under "Wireless LAN adapter Wi-Fi"
4. Example: `192.168.1.100` ← This is YOUR IP

**Mac:**
1. Open Terminal
2. Type: `ifconfig | grep inet`
3. Look for something like `192.168.1.100`

---

### Step 6: Configure Frontend API

1. **Open:** `AIProp/services/api.ts`

2. **Line 6:** Replace with YOUR IP:
   ```typescript
   const API_URL = 'http://192.168.1.100:3000/api';  // ← Use YOUR IP here
   ```

3. **Save the file**

⚠️ **IMPORTANT:** 
- Use your ACTUAL IP address from Step 5
- Do NOT use localhost or 127.0.0.1
- Phone and computer MUST be on same WiFi

---

### Step 7: Launch the App

The Expo app should already be running in another terminal.

If not, open a NEW terminal:
```bash
cd AIProp
npx expo start
```

---

### Step 8: Test on Your Phone

1. **Install Expo Go:**
   - iOS: App Store → "Expo Go"
   - Android: Play Store → "Expo Go"

2. **Scan QR Code:**
   - iOS: Open Camera app → Scan QR code
   - Android: Open Expo Go → Scan QR code

3. **Wait for app to load** (~30 seconds first time)

---

### Step 9: Create Your First Account!

1. Click "Sign Up"
2. Enter:
   - Name: Your name
   - Mobile: +919876543210 (any number)
   - Password: test123
3. Click "Create Account"

✅ If you see your profile → **SUCCESS!**

---

### Step 10: Post Your First Property

1. Go to "Post Ad" tab (+ icon)
2. Fill in:
   - Title: "Test Property"
   - Category: House
   - Purpose: Sale
   - Price: 5000000
   - Area Name: Connaught Place
   - City: Delhi
   - Owner Name: Your name
   - WhatsApp: +919999999999
   - Bedrooms: 3
   - Kitchen: 1
   - Hall: 1
3. Click "Post Property"

✅ Check Home tab to see your listing!

---

## ✅ Verification Checklist

Before asking for help, verify:

- [ ] MongoDB cluster is running (green in Atlas dashboard)
- [ ] backend/.env has correct connection string
- [ ] `npm test` passes in backend folder
- [ ] Backend server is running (port 3000)
- [ ] AIProp/services/api.ts has YOUR IP address
- [ ] Phone and computer on SAME WiFi network
- [ ] Expo app is running without errors
- [ ] You can create an account in the app

---

## 🐛 Troubleshooting

### "MongoServerError: bad auth"
❌ **Problem:** Wrong username or password  
✅ **Fix:** Check connection string in backend/.env

### "Network request failed"
❌ **Problem:** App can't reach backend  
✅ **Fix:** 
1. Verify backend is running
2. Check IP address in api.ts
3. Ensure same WiFi network

### "Cannot find module..."
❌ **Problem:** Missing dependencies  
✅ **Fix:** Run `npm install` in backend folder

### Backend won't start
❌ **Problem:** MongoDB not accessible  
✅ **Fix:** Add 0.0.0.0/0 to IP whitelist in MongoDB Atlas

### Properties not loading
❌ **Problem:** API connection issue  
✅ **Fix:** Check browser console in Expo for errors

---

## 📞 Still Need Help?

Check these in order:

1. **Backend Terminal** - Look for error messages
2. **Expo Terminal** - Look for error messages
3. **MongoDB Atlas** - Database → Browse Collections
   - Should see `users` and `properties` collections
4. **Browser DevTools** - In Expo browser window
   - Check Console tab for errors

---

## 🎉 When Everything Works

You should be able to:

✅ Create account and login  
✅ Post properties with images  
✅ Browse all properties  
✅ Search and filter  
✅ Save favorite properties  
✅ View your profile and stats  
✅ See distance from your location  

---

**You're ready to build! 🚀**

Next: Read `IMPLEMENTATION.md` to see all features and architecture.
