# 🌍 How to Share Your App Remotely (from Scratch)

Use this guide to show your app to someone far away.

## 🖥️ Part 1: Your Computer (The Host)
You need to run 3 things simultaneously. Open 3 separate terminal windows.

### Step 1: Start the Backend
1. Open **Terminal 1**.
2. Run:
   ```bash
   cd backend
   npm run dev
   ```
   *Keep this running.*

### Step 2: Create the Public Tunnel (For Backend)
1. Open **Terminal 2**.
2. Run:
   ```bash
   npx localtunnel --port 3000
   ```
3. Copy the URL it gives you (e.g., `https://random-name.loca.lt`).
   *Keep this running. Do not close it.*

### Step 3: Update Your Code (Crucial!)
Since the tunnel URL changes every time you restart it, you must update your app to point to the new URL.

1. **Update `AIProp/.env`**:
   ```properties
   API_URL=https://your-new-url.loca.lt/api
   ```

2. **Update `AIProp/services/api.ts` (Line 6)**:
   ```typescript
   const API_URL = 'https://your-new-url.loca.lt/api';
   ```

### Step 4: Start the App Frontend
1. Open **Terminal 3**.
2. Run:
   ```bash
   cd AIProp
   npx expo start --tunnel --clear
   ```
   *(The `--clear` flag ensures it sees your new API URL)*

---

## 📱 Part 2: Their Phone (The User)

Now, share the app with your friend/client.

### Option A: Android User
1. Ask them to install **"Expo Go"** from the Play Store.
2. **Send them the QR Code**: Take a screenshot of the QR code in your Terminal 3 and send it to them.
3. They verify the scan and the app loads!

### Option B: iPhone (iOS) User
1. Ask them to install **"Expo Go"** from the App Store.
2. **Send them the URL**: In Terminal 3, you will see a link starting with `exp://...`. Copy and text it to them.
   *(Note: Sometimes iOS requires you to be logged into the same Expo account. Android is easier for public sharing.)*

---

## ⚠️ Troubleshooting "Network Error"

If the app loads but shows "Network Error" or "Connection Failed" when they try to Login or see properties:

1. **Check the Tunnel Password**:
   The free tunnel service sometimes blocks traffic until you verify.
   
2. **The Fix**:
   Ask the user to open their phone's browser (Chrome/Safari) and visit your backend URL (e.g., `https://your-new-url.loca.lt`).
   
   If they see a "Click to Continue" page:
   - Ask them to ask you for the password.
   - You get the password by visiting `https://loca.lt/mytunnelpassword` on your computer.
   - They enter that number (IP address) and click Submit.
   
   *Note: We added code to bypass this, so it shouldn't happen often, but keep this in mind as a backup!*
