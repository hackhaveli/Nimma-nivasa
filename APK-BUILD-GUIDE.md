# 📱 Complete APK Build Guide - Nimma Nivasa

This guide will help you create a working APK file for your real estate app.

---

## ⚠️ CRITICAL: Before Building APK

Your app currently connects to `localhost` or your local IP. **This will NOT work** on other phones or outside your WiFi network.

### You Have 2 Options:

#### **Option A: Quick Test APK (WiFi Only)**
- Build APK now
- **Only works on your WiFi network**
- Good for testing
- **NOT for distribution**

#### **Option B: Production APK (Works Everywhere)** ⭐ RECOMMENDED
- Deploy backend online first
- Update API URL
- Build APK
- **Works on any phone, anywhere**
- Ready for distribution

---

## 🚀 Option A: Quick Test APK (Local Network Only)

### Step 1: Find Your Computer's IP Address

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.100`)

### Step 2: Update API URL

Open `AIProp/services/api.ts` and change:
```typescript
const API_URL = 'http://YOUR_COMPUTER_IP:3000/api';
// Example: const API_URL = 'http://192.168.1.100:3000/api';
```

Also update `AIProp/services/adminAPI.ts`:
```typescript
const API_URL = 'http://YOUR_COMPUTER_IP:3000/api';
```

### Step 3: Keep Backend Running

Make sure your backend is running:
```bash
cd backend
npm run dev
```
**Keep this terminal open!**

### Step 4: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 5: Login to Expo

```bash
eas login
```
Enter your Expo account credentials (create one at expo.dev if needed)

### Step 6: Configure EAS Build

```bash
cd AIProp
eas build:configure
```
- Select: **Android**
- It will create `eas.json`

### Step 7: Build APK

```bash
eas build -p android --profile preview
```

**What happens:**
- Expo uploads your code to their servers
- They build the APK (takes 10-15 minutes)
- You get a download link

### Step 8: Download & Install

1. Click the link Expo provides
2. Download the `.apk` file
3. Transfer to your phone
4. Install it
5. **Important:** Your computer must be running the backend on the same WiFi!

---

## 🌍 Option B: Production APK (Recommended)

This creates an APK that works **everywhere**, not just on your WiFi.

### Phase 1: Deploy Backend to Cloud

#### Step 1: Create GitHub Repository

```bash
cd backend
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/nimma-nivasa-backend.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy to Render.com (FREE)

1. Go to [render.com](https://render.com)
2. Sign up/Login
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name:** `nimma-nivasa-backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`

6. **Add Environment Variables:**
   Click "Environment" and add:
   ```
   MONGODB_URI = your_mongodb_atlas_connection_string
   JWT_SECRET = your_secret_key
   PORT = 3000
   ```

7. Click **"Create Web Service"**

8. **Wait 5-10 minutes** for deployment

9. **Copy your URL** (e.g., `https://nimma-nivasa-backend.onrender.com`)

#### Step 3: Test Backend

Visit: `https://your-render-url.onrender.com/health`

You should see: `{"status":"ok","message":"API is running"}`

### Phase 2: Update Frontend

#### Step 1: Update API URLs

**File: `AIProp/services/api.ts`**
```typescript
const API_URL = 'https://nimma-nivasa-backend.onrender.com/api';
```

**File: `AIProp/services/adminAPI.ts`**
```typescript
const API_URL = 'https://nimma-nivasa-backend.onrender.com/api';
```

#### Step 2: Test Locally First

```bash
cd AIProp
npx expo start
```

Test the app on your phone via Expo Go. Make sure:
- ✅ Properties load
- ✅ Login works
- ✅ Posting works
- ✅ Admin panel works

### Phase 3: Build Production APK

#### Step 1: Install EAS CLI (if not done)

```bash
npm install -g eas-cli
```

#### Step 2: Login to Expo

```bash
eas login
```

#### Step 3: Configure Build

```bash
cd AIProp
eas build:configure
```

Select **Android**

#### Step 4: Update `eas.json`

Open `AIProp/eas.json` and make sure it looks like this:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### Step 5: Build APK

For testing (smaller, faster):
```bash
eas build -p android --profile preview
```

For production (optimized):
```bash
eas build -p android --profile production
```

**What happens:**
- Code is uploaded to Expo servers
- APK is built (10-20 minutes)
- You get a download link

#### Step 6: Download APK

1. Wait for build to complete
2. Click the download link
3. Download the `.apk` file
4. **This APK works on ANY Android phone, ANYWHERE!**

---

## 📲 Installing APK on Phone

### Method 1: Direct Download
1. Open the Expo link on your phone
2. Download APK
3. Tap to install
4. Allow "Install from Unknown Sources" if prompted

### Method 2: Transfer via USB
1. Download APK on computer
2. Connect phone via USB
3. Copy APK to phone
4. Open file manager on phone
5. Tap APK to install

### Method 3: Google Drive
1. Upload APK to Google Drive
2. Open Drive on phone
3. Download and install

---

## 🐛 Troubleshooting

### "Build Failed"
- Check `eas.json` is correct
- Make sure `app.json` has valid package name
- Try: `eas build --clear-cache -p android --profile preview`

### "App Crashes on Open"
- Backend URL is wrong
- Check API_URL in both `api.ts` and `adminAPI.ts`
- Make sure backend is deployed and running

### "Can't Connect to Server"
- Backend is not running
- Wrong URL in API files
- Check Render.com dashboard - service might be sleeping (free tier)

### "MongoDB Connection Error"
- MongoDB Atlas IP whitelist: Add `0.0.0.0/0` to allow all IPs
- Check MONGODB_URI in Render environment variables

---

## 📊 Build Status Check

During build, you can check status:
```bash
eas build:list
```

Or visit: https://expo.dev/accounts/YOUR_USERNAME/projects/nimma-nivasa/builds

---

## 🎯 Quick Command Reference

```bash
# Install EAS
npm install -g eas-cli

# Login
eas login

# Configure
cd AIProp
eas build:configure

# Build APK (Preview)
eas build -p android --profile preview

# Build APK (Production)
eas build -p android --profile production

# Check builds
eas build:list

# Cancel build
eas build:cancel
```

---

## ✅ Final Checklist

Before building:
- [ ] Backend deployed to Render.com
- [ ] Backend URL updated in `api.ts`
- [ ] Backend URL updated in `adminAPI.ts`
- [ ] Tested app locally with new URL
- [ ] MongoDB allows connections from anywhere
- [ ] `app.json` has correct app name and package
- [ ] `eas.json` exists and is configured

After building:
- [ ] APK downloaded
- [ ] Installed on phone
- [ ] App opens successfully
- [ ] Can login
- [ ] Can view properties
- [ ] Can post property
- [ ] Admin panel works

---

## 💡 Pro Tips

1. **Free Tier Limitations:**
   - Render.com free tier sleeps after 15 mins of inactivity
   - First request after sleep takes 30-60 seconds
   - Upgrade to paid tier ($7/month) for always-on

2. **APK Size:**
   - Preview build: ~50-80 MB
   - Production build: ~30-50 MB (optimized)

3. **Updates:**
   - To update app: Build new APK and reinstall
   - Users must manually download new version
   - Consider using Expo Updates for OTA updates

4. **Distribution:**
   - Share APK link directly
   - Upload to Google Drive
   - Later: Publish to Google Play Store

---

## 🚀 Ready to Build?

**Recommended Path:**
1. Deploy backend to Render.com (30 minutes)
2. Update API URLs in frontend
3. Test locally
4. Build production APK
5. Install and enjoy!

**Quick Test Path:**
1. Update API URL to your local IP
2. Build preview APK
3. Test on same WiFi
4. Later deploy backend for real distribution

---

Need help? Check:
- Expo Docs: https://docs.expo.dev/build/setup/
- Render Docs: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

Good luck! 🎉
