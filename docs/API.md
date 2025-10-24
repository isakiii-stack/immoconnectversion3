# ImmoConnect API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33123456789",
  "city": "Paris",
  "country": "France",
  "role": "BUYER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "BUYER",
      "isVerified": false
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/logout
Logout user (requires authentication).

#### POST /auth/refresh-token
Refresh JWT token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### Users

#### GET /users/profile
Get current user profile (requires authentication).

#### PUT /users/profile
Update user profile (requires authentication).

#### POST /users/avatar
Upload user avatar (requires authentication).

#### DELETE /users/account
Delete user account (requires authentication).

### Listings

#### GET /listings
Get all listings with optional filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `propertyType` (string): Filter by property type
- `listingType` (string): Filter by listing type (SALE, RENT, BOTH)
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `minSurface` (number): Minimum surface filter
- `maxSurface` (number): Maximum surface filter
- `city` (string): City filter
- `country` (string): Country filter

#### GET /listings/:id
Get specific listing by ID.

#### POST /listings
Create new listing (requires authentication).

**Request Body:**
```json
{
  "title": "Beautiful apartment in Paris",
  "description": "Luxury apartment with great views",
  "price": 500000,
  "surface": 80,
  "rooms": 3,
  "bedrooms": 2,
  "bathrooms": 1,
  "propertyType": "APARTMENT",
  "listingType": "SALE",
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "country": "France",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

#### PUT /listings/:id
Update listing (requires authentication, owner only).

#### DELETE /listings/:id
Delete listing (requires authentication, owner only).

### Buyer Requests

#### GET /buyer-requests
Get all buyer requests with optional filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `propertyType` (string): Filter by property type
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `city` (string): City filter
- `country` (string): Country filter

#### GET /buyer-requests/:id
Get specific buyer request by ID.

#### POST /buyer-requests
Create new buyer request (requires authentication).

**Request Body:**
```json
{
  "title": "Looking for apartment in Paris",
  "description": "I'm looking for a 2-bedroom apartment in central Paris",
  "maxPrice": 400000,
  "minPrice": 300000,
  "minSurface": 60,
  "maxSurface": 100,
  "minRooms": 2,
  "maxRooms": 3,
  "propertyType": "APARTMENT",
  "city": "Paris",
  "country": "France",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

#### PUT /buyer-requests/:id
Update buyer request (requires authentication, owner only).

#### DELETE /buyer-requests/:id
Delete buyer request (requires authentication, owner only).

### Messages

#### GET /messages/conversations
Get user conversations (requires authentication).

#### GET /messages/conversations/:id
Get specific conversation with messages (requires authentication).

#### POST /messages/conversations
Create new conversation (requires authentication).

**Request Body:**
```json
{
  "receiverId": "user_id",
  "listingId": "listing_id",
  "buyerRequestId": "buyer_request_id"
}
```

#### POST /messages/send
Send message (requires authentication).

**Request Body:**
```json
{
  "content": "Hello, I'm interested in your property",
  "conversationId": "conversation_id",
  "listingId": "listing_id"
}
```

#### PUT /messages/conversations/:id/read
Mark conversation messages as read (requires authentication).

### Favorites

#### GET /favorites
Get user favorites (requires authentication).

#### POST /favorites
Add item to favorites (requires authentication).

**Request Body:**
```json
{
  "listingId": "listing_id"
}
```

#### DELETE /favorites/:id
Remove favorite (requires authentication).

### Reports

#### POST /reports
Create report (requires authentication).

**Request Body:**
```json
{
  "reason": "Inappropriate content",
  "description": "This listing contains inappropriate content",
  "listingId": "listing_id"
}
```

### Notifications

#### GET /notifications
Get user notifications (requires authentication).

#### GET /notifications/unread-count
Get unread notifications count (requires authentication).

#### PUT /notifications/:id/read
Mark notification as read (requires authentication).

#### PUT /notifications/read-all
Mark all notifications as read (requires authentication).

### Upload

#### POST /upload/image
Upload image (requires authentication).

**Form Data:**
- `image` (file): Image file
- `width` (number, optional): Resize width
- `height` (number, optional): Resize height
- `quality` (number, optional): Image quality (default: 80)

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited to 100 requests per 15 minutes per IP address.

## WebSocket Events

### Connection
Connect to WebSocket with authentication token:
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Client to Server
- `join-conversation` - Join a conversation room
- `leave-conversation` - Leave a conversation room
- `send-message` - Send a message
- `typing` - Typing indicator
- `mark-as-read` - Mark messages as read

#### Server to Client
- `new-message` - New message received
- `message-notification` - Message notification
- `user-typing` - User typing indicator
- `messages-read` - Messages marked as read
- `user-online` - User came online
- `user-offline` - User went offline
