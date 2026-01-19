# MongoDB Real Estate Backend

Backend API for AIProp Real Estate Mobile App

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string

**Option B: Local MongoDB**
1. Install MongoDB locally
2. Use connection string: `mongodb://localhost:27017/aiprop`

### 3. Update Environment Variables

Edit `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_secret_key_here
PORT=3000
```

### 4. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property (requires auth)
- `PUT /api/properties/:id` - Update property (requires auth)
- `DELETE /api/properties/:id` - Delete property (requires auth)
- `POST /api/properties/:id/lead` - Increment lead count

### Users
- `GET /api/users/my-listings` - Get user's properties (requires auth)
- `GET /api/users/saved-properties` - Get saved properties (requires auth)
- `POST /api/users/save-property/:id` - Save/unsave property (requires auth)
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update profile (requires auth)

## 🧪 Test the API

Health check:
```bash
curl http://localhost:3000/health
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication
- Protected routes
- Input validation

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password encryption
- **jsonwebtoken** - JWT authentication
- **cors** - CORS middleware
- **dotenv** - Environment variables

## 🗄️ Database Models

### User
- name, mobile, email, password
- avatar, isVerified, isPremium
- postings, views, leads
- savedProperties[]

### Property
- title, category, purpose, price
- images[], location{}, dimensions
- ownerName, whatsappNumber
- conditional: bedrooms, kitchen, hall
- views, leads, owner, isActive
