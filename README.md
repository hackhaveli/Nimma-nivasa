# 🏡 AIProp - Real Estate Mobile App with MongoDB

A full-stack real estate mobile application built with React Native (Expo), Node.js, Express, and MongoDB.

## 📋 Features

✅ **User Authentication**
- Register with name, mobile, password, and optional email
- Login/Logout with session management
- JWT-based authentication
- Profile management

✅ **Property Listings**
- Browse all properties with beautiful cards
- Filter by category (House, Plot, Shop, Land)
- Filter by purpose (Rent/Sale)
- Search by location, area, or landmark
- Distance calculation from user location

✅ **Post Property**
- Add new properties with images
- Conditional fields for House category
- Location selection
- Price and dimensions
- Owner contact details

✅ **Saved Properties**
- Favorite/unfavorite properties
- View all saved properties

✅ **User Profile**
- View your listings
- Track views and leads
- Manage saved properties

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or bun
- MongoDB Atlas account (free tier)
- Expo Go app on your phone

### Step 1: Setup MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a **FREE** account
3. Create a new cluster (M0 Free tier)
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string

### Step 2: Configure Backend

1. Open `backend/.env` file
2. Replace the MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/aiprop?retryWrites=true&w=majority
JWT_SECRET=your_random_secret_key_here
PORT=3000
```

3. Install backend dependencies and start server:

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 3000
```

### Step 3: Configure Frontend

1. Find your computer's local IP address:
   - **Windows**: Open CMD and run `ipconfig` (look for IPv4 Address)
   - **Mac/Linux**: Run `ifconfig` (look for inet)

2. Open `AIProp/services/api.ts`
3. Update the API_URL (line 6):

```typescript
const API_URL = 'http://YOUR_LOCAL_IP:3000/api'; // e.g., http://192.168.1.100:3000/api
```

### Step 4: Run the App

The app should already be running! If not:

```bash
cd AIProp
npx expo start
```

Scan the QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

## 📱 App Structure

```
AIProp/
├── app/
│   ├── (tabs)/           # Tab screens
│   │   ├── index.tsx     # Home screen
│   │   ├── search.tsx    # Search screen
│   │   ├── post.tsx      # Post property
│   │   ├── saved.tsx     # Saved properties
│   │   └── profile.tsx   # User profile
├── contexts/
│   └── AppContext.tsx    # State management
├── services/
│   └── api.ts            # API service layer
├── mocks/                # Mock data (for reference)
└── package.json
```

```
backend/
├── models/
│   ├── User.js           # User schema
│   └── Property.js       # Property schema
├── routes/
│   ├── auth.js           # Auth endpoints
│   ├── properties.js     # Property endpoints
│   └── users.js          # User endpoints
├── server.js             # Express server
├── package.json
└── .env                  # Environment variables
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user
```

### Properties
```
GET    /api/properties               - Get all properties (with filters)
GET    /api/properties/:id           - Get single property
POST   /api/properties               - Create property
PUT    /api/properties/:id           - Update property
DELETE /api/properties/:id           - Delete property
POST   /api/properties/:id/lead      - Track WhatsApp lead
```

### Users
```
GET    /api/users/my-listings        - Get user's properties
GET    /api/users/saved-properties   - Get saved properties
POST   /api/users/save-property/:id  - Toggle save property
GET    /api/users/profile            - Get user profile
PUT    /api/users/profile            - Update user profile
```

## 🧪 Testing the Setup

1. **Test Backend Health:**
   Open browser: `http://localhost:3000/health`
   
   You should see:
   ```json
   {
     "status": "OK",
     "message": "AIProp Backend is running",
     "mongodb": "Connected"
   }
   ```

2. **Test User Registration:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","mobile":"+919999999999","password":"test123"}'
   ```

3. **Open the App:**
   - Scan QR code with Expo Go
   - Create an account or login
   - Start adding properties!

## 🎨 Key Features Implemented

### 1. Authentication System
- ✅ Basic login/registration (no OTP)
- ✅ JWT token-based auth
- ✅ Session persistence
- ✅ Profile management

### 2. Property Management
- ✅ Create properties with images
- ✅ Category selection (House/Plot/Shop/Land)
- ✅ Conditional fields for House
- ✅ Location with coordinates
- ✅ Price and dimensions
- ✅ Owner contact info

### 3. Search & Filters
- ✅ Filter by category
- ✅ Filter by purpose (Rent/Sale)
- ✅ Search by area/landmark
- ✅ Distance calculation
- ✅ Nearest properties fallback

### 4. User Features
- ✅ My listings
- ✅ Saved properties
- ✅ View/Lead tracking
- ✅ Profile stats

## 🔐 Security

- Passwords are hashed with bcrypt
- JWT tokens for API authentication
- Protected routes require authentication
- Input validation on all endpoints

## 📝 Next Steps

1. **Image Upload:**
   - Integrate image upload service (Cloudinary recommended)
   - Update `POST /api/properties` to handle file uploads

2. **MapMyIndia Integration:**
   - Add MapMyIndia SDK for location picker
   - Implement map view in property details

3. **Google Sign-In (Optional):**
   - Add OAuth with Google
   - Implement in `backend/routes/auth.js`

4. **Notifications:**
   - Add push notifications for new leads
   - Email notifications for saved property updates

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB connection string in `.env`
- Ensure MongoDB Atlas IP whitelist includes your IP (or use 0.0.0.0/0 for all IPs)

**App can't connect to backend:**
- Verify IP address in `services/api.ts`
- Ensure phone and computer are on same WiFi
- Check if backend server is running (port 3000)

**Properties not loading:**
- Check backend console for errors
- Verify MongoDB connection
- Test API endpoints with curl or Postman

## 💡 Demo Credentials

After first registration, you can use:
- Mobile: +919876543210
- Password: password123

## 📞 Support

Need help? Check:
1. Backend logs in terminal
2. Expo logs in browser
3. MongoDB Atlas logs in dashboard

---

**Built with ❤️ using React Native, Node.js, and MongoDB**
