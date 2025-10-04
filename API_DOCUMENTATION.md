# TurfHub Complete API Documentation

## Project Overview
TurfHub is a comprehensive turf booking platform built with MERN stack (MongoDB, Express.js, React.js, Node.js) featuring role-based access control for Users, Turf Admins, and Super Admins.

## Architecture
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **File Upload**: Cloudinary integration
- **Payments**: Stripe and Razorpay integration
- **Email**: SendGrid/Nodemailer support
- **Real-time**: Socket.io (for notifications)

---

## Authentication APIs

### Base URL: `/api/auth`

#### 1. User Registration
```
POST /api/auth/register
```
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1234567890",
  "role": "user"
}
```
**Response:**
```json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "user": { "id": "...", "email": "...", "role": "user" },
    "tokens": { "accessToken": "...", "refreshToken": "..." }
  }
}
```

#### 2. Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### 3. Refresh Token
```
POST /api/auth/refresh-token
```
**Body:**
```json
{
  "refreshToken": "..."
}
```

#### 4. Forgot Password
```
POST /api/auth/forgot-password
```
**Body:**
```json
{
  "email": "john@example.com"
}
```

#### 5. Reset Password
```
POST /api/auth/reset-password
```
**Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

#### 6. Change Password
```
PATCH /api/auth/change-password
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

---

## User Management APIs

### Base URL: `/api/users`

#### 1. Get Enhanced Profile
```
GET /api/users/profile
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "membershipLevel": "Gold",
      "completionRate": 95,
      "preferences": {...},
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "stats": {
      "totalBookings": 25,
      "totalSpent": 15000,
      "completedBookings": 24,
      "cancelledBookings": 1
    }
  }
}
```

#### 2. Update Profile
```
PATCH /api/users/profile
```
**Body:**
```json
{
  "firstName": "John Updated",
  "phoneNumber": "+9876543210",
  "dateOfBirth": "1990-01-01",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

#### 3. Update Preferences
```
PATCH /api/users/preferences
```
**Body:**
```json
{
  "notifications": {
    "email": true,
    "sms": false,
    "push": true,
    "booking": true,
    "promotional": false
  },
  "privacy": {
    "shareProfile": false,
    "showBookings": true,
    "shareLocation": false
  },
  "booking": {
    "autoConfirm": false,
    "defaultDuration": 90,
    "reminders": true,
    "favoriteLocations": ["New York", "Brooklyn"]
  }
}
```

#### 4. Get Booking History
```
GET /api/users/booking-history
```
**Query Params:**
- `page=1` - Page number
- `limit=10` - Results per page
- `status=all|confirmed|completed|cancelled`
- `dateFrom=2024-01-01`
- `dateTo=2024-12-31`
- `sortBy=date|amount`
- `sortOrder=desc|asc`

#### 5. Get Favorites
```
GET /api/users/favorites
```

#### 6. Toggle Favorite
```
POST /api/users/favorites/:turfId
```

#### 7. Get User Analytics
```
GET /api/users/analytics?period=6m
```
**Query Params:** `period` - 1m, 3m, 6m, 1y

#### 8. Get Recommendations
```
GET /api/users/recommendations
```

#### 9. Delete Account
```
DELETE /api/users/account
```
**Body:**
```json
{
  "password": "currentPassword",
  "confirmDelete": "DELETE MY ACCOUNT"
}
```

---

## Turf Management APIs

### Base URL: `/api/turfs`

#### 1. Get All Turfs (Public)
```
GET /api/turfs
```
**Query Params:**
- `page=1`
- `limit=12`
- `search=football`
- `city=New York`
- `sports=football,cricket`
- `minPrice=100`
- `maxPrice=500`
- `amenities=parking,restroom`
- `rating=4.5`
- `availability=2024-01-15`

#### 2. Get Turf Details
```
GET /api/turfs/:turfId
```

#### 3. Create Turf (Admin only)
```
POST /api/turfs
```
**Headers:** `Authorization: Bearer <admin_token>`
**Body:**
```json
{
  "name": "Champions Sports Arena",
  "description": "Premier football turf with modern facilities",
  "location": {
    "address": "123 Sports Complex",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "coordinates": [-74.006, 40.7128]
  },
  "sports": ["football", "cricket"],
  "pricePerHour": 200,
  "amenities": ["parking", "restroom", "lighting"],
  "images": ["image1.jpg", "image2.jpg"],
  "capacity": 22,
  "dimensions": "100x60 meters"
}
```

#### 4. Update Turf
```
PATCH /api/turfs/:turfId
```

#### 5. Delete Turf
```
DELETE /api/turfs/:turfId
```

#### 6. Get Turf Availability
```
GET /api/turfs/:turfId/availability?date=2024-01-15
```

---

## Booking Management APIs

### Base URL: `/api/bookings`

#### 1. Create Booking
```
POST /api/bookings
```
**Body:**
```json
{
  "turfId": "turf_id_here",
  "date": "2024-01-15",
  "timeSlotId": "timeslot_id_here",
  "duration": 90,
  "totalAmount": 300,
  "notes": "Birthday party booking"
}
```

#### 2. Get User Bookings
```
GET /api/bookings/my-bookings
```

#### 3. Get Booking Details
```
GET /api/bookings/:bookingId
```

#### 4. Update Booking
```
PATCH /api/bookings/:bookingId
```

#### 5. Cancel Booking
```
DELETE /api/bookings/:bookingId
```
**Body:**
```json
{
  "reason": "Schedule conflict"
}
```

---

## Payment APIs

### Base URL: `/api/payments`

#### 1. Create Stripe Checkout
```
POST /api/payments/stripe/checkout
```
**Body:**
```json
{
  "bookingId": "booking_id_here",
  "amount": 300,
  "currency": "usd",
  "successUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel"
}
```

#### 2. Create Razorpay Order
```
POST /api/payments/razorpay/create-order
```
**Body:**
```json
{
  "bookingId": "booking_id_here",
  "amount": 300
}
```

#### 3. Verify Razorpay Payment
```
POST /api/payments/razorpay/verify
```
**Body:**
```json
{
  "razorpay_payment_id": "pay_xxx",
  "razorpay_order_id": "order_xxx",
  "razorpay_signature": "signature_xxx",
  "bookingId": "booking_id_here"
}
```

#### 4. Process Refund
```
POST /api/payments/refund
```
**Body:**
```json
{
  "paymentId": "payment_id_here",
  "amount": 150,
  "reason": "Booking cancelled by admin"
}
```

#### 5. Get Payment History
```
GET /api/payments/history
```

#### 6. Get Transaction Details
```
GET /api/payments/transaction/:transactionId
```

---

## Notification APIs

### Base URL: `/api/notifications`

#### 1. Get User Notifications
```
GET /api/notifications
```
**Query Params:**
- `page=1`
- `limit=20`
- `type=booking_confirmed|payment_success`
- `read=true|false`
- `priority=low|medium|high`

#### 2. Mark as Read
```
PATCH /api/notifications/:notificationId/read
```

#### 3. Mark All as Read
```
PATCH /api/notifications/read-all
```

#### 4. Delete Notification
```
DELETE /api/notifications/:notificationId
```

#### 5. Send Manual Notification (Admin)
```
POST /api/notifications/send
```
**Body:**
```json
{
  "recipientIds": ["user1", "user2"],
  "type": "booking_confirmed",
  "data": {
    "userName": "John",
    "turfName": "Champions Arena",
    "bookingDate": "2024-01-15",
    "timeSlot": "10:00 AM - 11:30 AM",
    "amount": 300
  },
  "options": {
    "email": true,
    "sms": false,
    "push": true,
    "priority": "high"
  }
}
```

#### 6. Get Notification Stats (Admin)
```
GET /api/notifications/stats?period=30d
```

---

## Admin Dashboard APIs

### Base URL: `/api/admin`

#### 1. Get Dashboard Stats
```
GET /api/admin/dashboard
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "totalBookings": 150,
    "totalRevenue": 45000,
    "activeUsers": 89,
    "turfsManaged": 5,
    "recentBookings": [...],
    "revenueChart": [...],
    "popularTurfs": [...]
  }
}
```

#### 2. Get All Bookings (Admin's turfs)
```
GET /api/admin/bookings
```

#### 3. Update Booking Status
```
PATCH /api/admin/bookings/:bookingId/status
```
**Body:**
```json
{
  "status": "confirmed",
  "notes": "Booking confirmed"
}
```

#### 4. Get Revenue Analytics
```
GET /api/admin/analytics/revenue?period=1m
```

#### 5. Get Customer Analytics
```
GET /api/admin/analytics/customers
```

---

## Super Admin APIs

### Base URL: `/api/super-admin`

#### 1. Get Platform Dashboard
```
GET /api/super-admin/dashboard
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "totalUsers": 1250,
    "totalAdmins": 45,
    "totalTurfs": 128,
    "totalBookings": 3456,
    "totalRevenue": 234000,
    "growth": {
      "users": 12.5,
      "bookings": 8.3,
      "revenue": 15.2
    },
    "recentActivity": [...],
    "systemHealth": {...}
  }
}
```

#### 2. Get All Users
```
GET /api/super-admin/users
```
**Query Params:**
- `page=1`
- `limit=20`
- `search=john@example.com`
- `status=active|inactive|suspended`
- `role=user|admin`

#### 3. Get All Admins
```
GET /api/super-admin/admins
```

#### 4. Update Admin Status
```
PATCH /api/super-admin/admins/:adminId/status
```
**Body:**
```json
{
  "status": "approved",
  "notes": "Admin verified and approved"
}
```

#### 5. Platform Analytics
```
GET /api/super-admin/analytics
```
**Query Params:** `period=7d|30d|90d|1y`

#### 6. User Management
```
PATCH /api/super-admin/users/:userId
```
**Body:**
```json
{
  "status": "suspended",
  "reason": "Policy violation"
}
```

#### 7. System Settings
```
GET /api/super-admin/settings
POST /api/super-admin/settings
```

#### 8. Content Management
```
GET /api/super-admin/content
PATCH /api/super-admin/content/:contentId
```

---

## File Upload APIs

### Base URL: `/api/upload`

#### 1. Upload Profile Image
```
POST /api/upload/profile
```
**Headers:** `Content-Type: multipart/form-data`
**Body:** FormData with `image` field

#### 2. Upload Turf Images
```
POST /api/upload/turf
```
**Body:** FormData with multiple `images` fields

#### 3. Upload Documents
```
POST /api/upload/documents
```

---

## Search & Filter APIs

### Base URL: `/api/search`

#### 1. Global Search
```
GET /api/search?q=football&type=turfs
```
**Query Params:**
- `q` - Search query
- `type` - turfs, users, bookings
- `filters` - Additional filters JSON

#### 2. Advanced Turf Search
```
POST /api/search/turfs/advanced
```
**Body:**
```json
{
  "location": {
    "city": "New York",
    "radius": 10,
    "coordinates": [-74.006, 40.7128]
  },
  "availability": {
    "date": "2024-01-15",
    "duration": 90
  },
  "filters": {
    "sports": ["football"],
    "priceRange": { "min": 100, "max": 400 },
    "amenities": ["parking", "lighting"],
    "rating": 4.0
  },
  "sort": {
    "field": "rating",
    "order": "desc"
  }
}
```

---

## Maps Integration APIs

### Base URL: `/api/maps`

#### 1. Get Nearby Turfs
```
GET /api/maps/nearby
```
**Query Params:**
- `lat=40.7128`
- `lng=-74.0060`
- `radius=5` (km)

#### 2. Get Directions
```
GET /api/maps/directions
```
**Query Params:**
- `from=40.7128,-74.0060`
- `to=40.7589,-73.9851`

#### 3. Geocode Address
```
POST /api/maps/geocode
```
**Body:**
```json
{
  "address": "123 Sports Complex, New York, NY"
}
```

---

## Analytics & Reports APIs

### Base URL: `/api/analytics`

#### 1. Booking Analytics
```
GET /api/analytics/bookings
```

#### 2. Revenue Reports
```
GET /api/analytics/revenue
```

#### 3. User Engagement
```
GET /api/analytics/engagement
```

#### 4. Platform Metrics
```
GET /api/analytics/platform
```

---

## Error Responses

All APIs follow consistent error response format:

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error"
  }
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **General APIs**: 100 requests per minute
- **File uploads**: 10 requests per minute
- **Search APIs**: 50 requests per minute

---

## Webhooks

### Payment Webhooks

#### Stripe Webhook
```
POST /api/payments/webhooks/stripe
```

#### Razorpay Webhook
```
POST /api/payments/webhooks/razorpay
```

### Notification Webhooks
```
POST /api/webhooks/notifications
```

---

## Socket.io Events

### Client Events
- `join_user_room` - Join user-specific room
- `join_admin_room` - Join admin-specific room
- `booking_update` - Real-time booking updates
- `new_notification` - Live notifications

### Server Events
- `booking_confirmed` - Booking confirmation
- `booking_cancelled` - Booking cancellation
- `payment_success` - Payment completion
- `new_message` - Chat messages

---

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/turfhub
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@turfhub.com

# Payments
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Maps
GOOGLE_MAPS_API_KEY=your_maps_key

# App Settings
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## Postman Collection

A complete Postman collection is available with:
- Pre-configured environment variables
- Authentication setup
- All API endpoints with sample requests
- Test scripts for automated testing

Import the collection from: `/docs/TurfHub_API_Collection.json`

---

This documentation covers the complete API architecture for the TurfHub platform. Each endpoint includes proper authentication, validation, error handling, and follows REST API best practices.