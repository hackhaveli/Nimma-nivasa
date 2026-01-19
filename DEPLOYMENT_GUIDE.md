# 🚀 Deployment Guide: How to Publish "Nimma Nivasa"

To make your app work on any phone (remote access) and turn it into an APK file, follow these 3 steps.

---

## **Step 1: Host the Backend (Free)**
Your app needs a server that is always online. running `npm run dev` on your laptop is not enough for a real app.

### **1. Push Code to GitHub**
1. Create a **New Repository** on GitHub (e.g., `real-estate-backend`).
2. Open terminal in your `backend` folder:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/real-estate-backend.git
    git push -u origin main
    ```

### **2. Deploy to Render.com (Free Tier)**
1. Go to [Render.com](https://render.com) and sign up.
2. Click **"New +"** -> **"Web Service"**.
3. Connect your GitHub repository.
4. Settings:
    - **Name:** `nimma-nivasa-backend`
    - **Runtime:** `Node`
    - **Build Command:** `npm install`
    - **Start Command:** `node server.js`
5. **Environment Variables** (Add these):
    - `MONGODB_URI`: (Your MongoDB Atlas connection string)
    - `JWT_SECRET`: (Your secret key)
    - `PORT`: `3000` (Render might set this auto, but good to have)
6. Click **"Create Web Service"**.
7. **Copy the URL** Render gives you (e.g., `https://nimma-nivasa-backend.onrender.com`).

---

## **Step 2: Update Frontend URL**
Now point your mobile app to this new online server.

1. Open `AIProp/services/api.ts`.
2. Find: `const API_URL = 'http://192.168.x.x:3000/api';`
3. Change it to your **Render URL**:
    ```typescript
    const API_URL = 'https://nimma-nivasa-backend.onrender.com/api';
    ```

---

## **Step 3: Build the APK (Android)**
Now we turn code into an app file (`.apk`).

### **1. Install EAS CLI**
Run this in your terminal:
```bash
npm install -g eas-cli
```

### **2. Login to Expo**
```bash
eas login
```

### **3. Configure Build**
Run this in `AIProp` folder:
```bash
eas build:configure
```
- Select `Android`.

### **4. Build the APK**
To get an APK you can install immediately:
```bash
eas build -p android --profile preview
```

**Wait for 10-15 minutes.**
Expo will generate a link. Click it to download your `application-preview.apk`.

### **5. Install on Phone**
- Transfer the file to your phone.
- Tap to install.
- 🎉 Done! Your app now works everywhere!

---

## **Checklist Before Building**
- [ ] Backend is deployed and running (visited URL and saw "API Running" message).
- [ ] MongoDB allows connections from anywhere (IP Whitelist: 0.0.0.0/0).
- [ ] `API_URL` in frontend is updated to https URL.
- [ ] `app.json` has correct name and package.
