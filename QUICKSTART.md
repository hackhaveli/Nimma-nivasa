# 🚀 QUICK START GUIDE - AIProp Real Estate App

## ⚡ 5-Minute Setup

### 1. Setup MongoDB (2 minutes)

1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Sign up (FREE account)
3. Create a new project: "AIProp"
4. Create a cluster (M0 FREE tier)
5. Security Quickstart:
   - Username: `aiprop`
   - Password: `aiprop123` (or your choice)
   - Click "Create User"
   - Choose "My Local Environment"
   - Add IP: `0.0.0.0/0` (Allow from anywhere)
6. Click "Finish and Close"
7. Click "Connect" → "Connect your application"
8. Copy the connection string (looks like: `mongodb+srv://aiprop:...`)

### 2. Configure Backend (1 minute)

1. Open `backend/.env` file
2. Replace line 1 with your connection string:

```env
MONGODB_URI=mongodb+srv://aiprop:aiprop123@cluster0.xxxxx.mongodb.net/aiprop?retryWrites=true&w=majority
```

Replace `xxxxx` with your actual cluster ID from the connection string.

### 3. Start Backend Server (30 seconds)

Open a NEW terminal:

```bash
cd backend
npm run dev
```

✅ You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 3000
```

### 4. Configure Frontend API (1 minute)

1. Find your computer's IP address:
   - **Windows**: Open CMD → `ipconfig` → Look for "IPv4 Address" (e.g., 192.168.1.100)
   - **Mac**: Terminal → `ifconfig | grep inet`

2. Open: `AIProp/services/api.ts`
3. Change line 6:

```typescript
const API_URL = 'http://192.168.1.100:3000/api';  // ← Use YOUR IP here
```

### 5. Test the App (30 seconds)

The Expo app is already running! Just:

1. Open Expo Go on your phone
2. Scan the QR code
3. Create a new account or login!

---

## ✅ Verification Checklist

- [ ] MongoDB Atlas created and connection string copied
- [ ] Backend `.env` configured with MongoDB URI
- [ ] Backend server running (port 3000)
- [ ] Frontend `api.ts` updated with your IP address
- [ ] Expo app running
- [ ] Phone connected to same WiFi as computer

---

## 🧪 Quick Test

**Test 1: Backend Health**
Open browser: http://localhost:3000/health

Should show:
```json
{"status":"OK","mongodb":"Connected"}
```

**Test 2: Create Account**
In the app:
1. Click "Sign Up"
2. Enter name, mobile, password
3. Click "Create Account"

**Test 3: Post Property**
1. Go to "Post Ad" tab
2. Fill in property details
3. Click "Post Property"
4. Check "Home" tab to see your listing!

---

## 🐛 Common Issues

### Backend won't start
❌ **Error**: "MongoServerError: bad auth"
✅ **Fix**: Check username/password in connection string

❌ **Error**: "ECONNREFUSED"
✅ **Fix**: Add IP `0.0.0.0/0` to MongoDB Atlas whitelist

### App can't connect to backend
❌ **Error**: "Network request failed"
✅ **Fix**: 
   1. Check backend is running
   2. Verify IP address in `api.ts`
   3. Ensure phone and computer on same WiFi

### Properties not loading
❌ **Error**: Empty screen
✅ **Fix**: Open browser DevTools in Expo → Check for errors

---

## 📞 Need Help?

1. Check backend terminal for errors
2. Check Expo terminal for errors
3. MongoDB Atlas → Database → Browse Collections (see if data is saving)

---

## 🎯 What Works Now

✅ User registration & login  
✅ Post properties with images  
✅ Browse all properties  
✅ Filter by category and purpose  
✅ Search by location  
✅ Save favorite properties  
✅ View your listings  
✅ Track views and leads  
✅ Distance calculation  
✅ MongoDB cloud storage  

---

## 🔜 Next Features to Add

- [ ] Image upload with Cloudinary
- [ ] MapMyIndia integration for map picker
- [ ] Google Sign-In
- [ ] Push notifications
- [ ] Edit/Delete properties
- [ ] Price range filtering

---

**Enjoy building your real estate empire! 🏡**
