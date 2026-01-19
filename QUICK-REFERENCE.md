# Nimma Nivasa - Quick Reference Guide

## 🚀 Starting the App

### 1. Start Backend
```bash
cd backend
npm run dev
```
✅ Server runs on: http://localhost:3000

### 2. Start Frontend
```bash
cd AIProp
npx expo start
```
✅ Scan QR code with Expo Go app

---

## 🔧 Maintenance Scripts

### Update Existing Properties with Coordinates
```bash
cd backend
node migrate-locations.js
```

### Seed Sample Properties (if database is empty)
```bash
cd backend
node seed-database.js
```

---

## 🔑 Test Credentials

### Admin Login
- Mobile: `9999999999`
- Password: `admin123`

### Create Regular User
- Use app registration
- Any 10-digit mobile + password

---

## 🧪 Testing Location Features

### Test With Different Locations

**Delhi (Has Properties):**
```
Latitude: 28.7041
Longitude: 77.1025
```

**Bangalore (Has Properties):**
```
Latitude: 12.9716
Longitude: 77.5946
```

**Remote Area (Triggers Fallback):**
```
Latitude: 15.0
Longitude: 75.0
```

---

## 📊 API Endpoints Quick Test

### Check Health
```bash
curl http://localhost:3000/health
```

### Get All Properties
```bash
curl http://localhost:3000/api/properties
```

### Get Nearby Properties (Delhi)
```bash
curl "http://localhost:3000/api/properties/nearby?latitude=28.7041&longitude=77.1025"
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check MongoDB connection in .env
# Ensure special characters in password are URL encoded
# @ should be %40
```

### Frontend Can't Connect
```bash
# Update API_URL in AIProp/services/api.ts
# Use your computer's local IP (run ipconfig)
# Example: http://192.168.1.100:3000/api
```

### No Properties Showing
```bash
# Run seed script
cd backend
node seed-database.js
```

### Location Permission Denied
```bash
# On phone: Settings → Expo Go → Permissions → Location → Allow
# On emulator: Use location simulation
```

---

##📱 App Features Checklist

### For Users:
- ✅ View properties near you
- ✅ See distance to each property
- ✅ Filter by type, purpose, price
- ✅ Search by area/landmark
- ✅ Save favorite properties
- ✅ Contact owner via WhatsApp
- ✅ Post your own properties
- ✅ Edit/delete your listings
- ✅ Google Sign-In

### For Admins:
- ✅ View all properties
- ✅ Approve/reject listings
- ✅ Delete spam properties
- ✅ Manage users
- ✅ View statistics

---

## 🔍 Key Files to Know

### Frontend (`AIProp/`)
- `app/(tabs)/index.tsx` - Home screen
- `app/property/[id].tsx` - Property details
- `app/(tabs)/post.tsx` - Add property
- `app/admin/index.tsx` - Admin panel
- `hooks/useLocation.ts` - GPS location
- `services/api.ts` - API calls

### Backend (`backend/`)
- `server.js` - Main server
- `routes/properties.js` - Property endpoints
- `routes/auth.js` - Authentication
- `models/Property.js` - Property schema
- `.env` - Configuration

---

## 📝 Environment Variables

### Backend `.env`
```
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
GOOGLE_WEB_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MAPMYINDIA_API_KEY=...
MAPMYINDIA_CLIENT_ID=...
MAPMYINDIA_CLIENT_SECRET=...
```

### Frontend `.env`
```
API_URL=http://YOUR_IP:3000/api
GOOGLE_WEB_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MAPMYINDIA_API_KEY=...
MAPMYINDIA_CLIENT_ID=...
MAPMYINDIA_CLIENT_SECRET=...
```

---

## 🎯 Quick Wins

### Add More Sample Properties
Edit `backend/seed-database.js` and add to `sampleProperties` array.

### Change Admin Credentials
Update in `backend/seed-database.js` or modify user directly in MongoDB.

### Adjust Nearby Radius
In `backend/routes/properties.js`, change `maxDistance` values (currently 5000m and 50000m).

### Update Property Images
Add real Cloudinary credentials in `backend/.env` or use Unsplash URLs.

---

## ✅ What's Working

✅ GPS auto-detection  
✅ Distance calculation  
✅ Nearby search with fallback  
✅ Never empty screen  
✅ Real property images  
✅ WhatsApp contact  
✅ Save favorites  
✅ Admin panel  
✅ Google Sign-In  
✅ All filters & search  

**Everything is production-ready! 🚀**
