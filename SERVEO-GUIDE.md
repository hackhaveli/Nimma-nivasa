# 🚀 How to Run with Serveo (Easy Remote)

This method is better because it doesn't force users to click a "Continue" button or enter a password.

## 1. Start Backend
Open a terminal in `backend`:
```bash
cd backend
npm run dev
```

## 2. Start Serveo Tunnel (The Magic Part)
Open a new terminal in the main folder:
```bash
ssh -R 80:localhost:3000 serveo.net
```
*   **Say "yes"** if it asks "Are you sure you want to continue connecting?".
*   It will give you a URL like `https://something.serveo.net`.

## 3. Update Code
Copy that new URL into your files:

**File: `AIProp/.env`**
```properties
API_URL=https://your-serveo-url.serveo.net/api
```

**File: `AIProp/services/api.ts`**
```typescript
const API_URL = 'https://your-serveo-url.serveo.net/api';
```

## 4. Start App
Open a new terminal in `AIProp`:
```bash
cd AIProp
npx expo start --tunnel --clear
```

**That's it! No passwords needed for the user.**
