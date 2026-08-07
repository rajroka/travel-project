# Smart Tourism Management System — API Documentation

**Base URL:** `http://localhost:3000/api`  
**Auth:** Better Auth session cookie (browser) **or** `Authorization: Bearer <token>` (API clients)  
**Content-Type:** `application/json` for all request bodies  
**Roles:** `customer` · `staff` · `admin`

---

## Response Format

All endpoints return a consistent envelope:

```json
{ "success": true,  "message": "...", "data": { ... } }
{ "success": false, "message": "...", "errors": { ... } }
```

---

## Authentication Architecture

This project uses **[Better Auth](https://better-auth.com)** for session management with two authentication methods:

| Method | Flow | Use case |
|--------|------|----------|
| Email + Password | POST body → session cookie | Web browser |
| Google OAuth | Redirect flow | Web browser (one-click login) |

Better Auth mounts its full handler at **`/api/auth/[...all]`** and handles sessions via a signed `httpOnly` cookie automatically. For API clients (mobile, Postman), the session token can also be passed as a Bearer token.

**Frontend client setup:**
```ts
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({ baseURL: "http://localhost:3000" });
```

---

## 1. Authentication

> All `/api/auth/*` routes below are handled by Better Auth unless noted otherwise.

---

### POST /api/auth/sign-up/email
Register a new customer account with email and password.

**Auth required:** No

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password1"
}
```

**Response 200:**
```json
{
  "token": "session_token...",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "customer" }
}
```

Sets `better-auth.session_token` httpOnly cookie.  
**Frontend shortcut:** `authClient.signUp.email({ name, email, password })`

---

### POST /api/auth/sign-in/email
Sign in with email and password.

**Auth required:** No

**Body:**
```json
{ "email": "john@example.com", "password": "Password1" }
```

**Response 200:**
```json
{
  "token": "session_token...",
  "user": { "id": "...", "name": "John Doe", "email": "...", "role": "customer" }
}
```

**Frontend shortcut:** `authClient.signIn.email({ email, password })`  
**Errors:** `401` invalid credentials · `403` account deactivated

---

### GET /api/auth/sign-in/social?provider=google
Initiate Google OAuth sign-in (redirect flow).

**Auth required:** No  
**Behavior:** Redirects browser to Google's consent screen. After approval, Google redirects back to `/api/auth/callback/google` and a session cookie is set automatically.

**Frontend shortcut:**
```ts
await authClient.signIn.social({ provider: "google" });
```

**Google Cloud Console setup:**
- Go to APIs & Services → Credentials → OAuth client ID
- Add redirect URI: `http://localhost:3000/api/auth/callback/google`
- Copy Client ID and Client Secret into `.env.local`

---

### GET /api/auth/callback/google
OAuth callback URL — handled automatically by Better Auth.  
**Do not call this directly.** Google redirects here after the user approves.

---

### POST /api/auth/sign-out
Sign out and clear session cookie.

**Auth required:** Yes (session cookie)  
**Response 200:** `{ "success": true }`  
**Frontend shortcut:** `authClient.signOut()`

---

### GET /api/auth/get-session
Get the current session and user object.

**Auth required:** Yes (session cookie or Bearer token)

**Response 200:**
```json
{
  "session": { "id": "...", "userId": "...", "expiresAt": "..." },
  "user": { "id": "...", "name": "John Doe", "email": "...", "role": "customer" }
}
```

**Frontend shortcut:** `authClient.useSession()` (reactive hook)

---

### POST /api/auth/forget-password
Request a password reset email.

**Auth required:** No

**Body:**
```json
{ "email": "john@example.com", "redirectTo": "/reset-password" }
```

**Response 200:** Always succeeds (prevents email enumeration).  
**Frontend shortcut:** `authClient.forgetPassword({ email, redirectTo })`

---

### POST /api/auth/reset-password
Reset password using the token from the email link.

**Auth required:** No

**Body:**
```json
{ "token": "abc123...", "newPassword": "NewPassword1" }
```

**Response 200:** `{ "status": true }`  
**Frontend shortcut:** `authClient.resetPassword({ token, newPassword })`

---

### POST /api/auth/send-verification-email
Resend email verification link.

**Auth required:** Yes

**Body:**
```json
{ "email": "john@example.com", "callbackURL": "/verify-email" }
```

**Frontend shortcut:** `authClient.sendVerificationEmail({ email, callbackURL })`

---

### POST /api/auth/change-password
Change password while logged in (custom route — not Better Auth).

**Auth required:** Any authenticated user (cookie or Bearer)

**Body:**
```json
{ "currentPassword": "OldPass1", "newPassword": "NewPass1" }
```

**Response 200:** `{ "success": true, "message": "Password changed successfully" }`  
**Errors:** `400` current password incorrect

---

### GET /api/auth/profile
Get logged-in user's full profile from the Mongoose User model.

**Auth required:** Any authenticated user  
**Response 200:** `{ "data": { "user": { ... } } }`

---

### PATCH /api/auth/profile
Update profile fields (phone, avatar, address, etc.).

**Auth required:** Any authenticated user

**Body (all optional):**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+977-9800000001",
  "avatar": "https://res.cloudinary.com/...",
  "nationality": "Nepali",
  "dateOfBirth": "1995-01-15",
  "address": { "street": "123 Main St", "city": "Kathmandu", "country": "Nepal" }
}
```

**Response 200:** `{ "data": { "user": { ... } } }`

---

## 2. Destinations

### GET /api/destinations
List destinations with pagination and filters.

**Auth required:** No

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 12 | Items per page (max 100) |
| search | string | — | Full-text search |
| category | ObjectId | — | Filter by category ID |
| country | string | — | Filter by country |
| city | string | — | Filter by city |
| featured | boolean | — | Only featured destinations |
| sort | string | newest | `name` · `rating` · `newest` · `popular` |

**Response 200:**
```json
{
  "data": {
    "destinations": [ { "name": "Pokhara", "slug": "pokhara", ... } ],
    "pagination": { "total": 50, "page": 1, "limit": 12, "totalPages": 5 }
  }
}
```

---

### POST /api/destinations
Create a destination.

**Auth required:** `staff` · `admin`

**Body:**
```json
{
  "name": "Pokhara",
  "description": "A beautiful lake city...",
  "shortDescription": "City of lakes",
  "category": "categoryId",
  "images": ["https://..."],
  "coverImage": "https://...",
  "location": { "city": "Pokhara", "country": "Nepal", "coordinates": { "lat": 28.2, "lng": 83.9 } },
  "bestSeason": ["Autumn", "Spring"],
  "highlights": ["Phewa Lake", "Sarangkot"],
  "isFeatured": true
}
```

**Response 201:** `{ "data": { "destination": { ... } } }`

---

### GET /api/destinations/featured
List featured destinations (up to 8).

**Auth required:** No  
**Response 200:** `{ "data": { "destinations": [ ... ] } }`

---

### GET /api/destinations/:id
Get single destination by ID or slug.

**Auth required:** No  
**Response 200:** `{ "data": { "destination": { ... } } }`  
**Errors:** `404` not found

---

### PATCH /api/destinations/:id
Update a destination.

**Auth required:** `staff` · `admin`  
**Body:** Any subset of create fields  
**Response 200:** `{ "data": { "destination": { ... } } }`

---

### DELETE /api/destinations/:id
Soft-delete a destination (sets `isActive: false`).

**Auth required:** `staff` · `admin`  
**Response 200:** `{ "message": "Destination deleted" }`

---

### POST /api/destinations/:id/images
Add images to a destination.

**Auth required:** `staff` · `admin`

**Body:**
```json
{ "images": ["https://..."], "coverImage": "https://..." }
```

**Response 200:** `{ "data": { "destination": { ... } } }`

---

### DELETE /api/destinations/:id/images
Remove an image URL from a destination.

**Auth required:** `staff` · `admin`

**Body:**
```json
{ "imageUrl": "https://..." }
```

**Response 200:** `{ "data": { "destination": { ... } } }`

---

## 3. Tour Packages

### GET /api/packages
List packages with pagination and filters.

**Auth required:** No

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 12 | Items per page |
| search | string | — | Full-text search |
| destination | ObjectId | — | Filter by destination ID |
| category | ObjectId | — | Filter by category ID |
| minPrice | number | — | Minimum price |
| maxPrice | number | — | Maximum price |
| minDays | number | — | Minimum duration (days) |
| maxDays | number | — | Maximum duration (days) |
| difficulty | string | — | `easy` · `moderate` · `challenging` |
| promotional | boolean | — | Only promotional packages |
| sort | string | newest | `price_asc` · `price_desc` · `rating` · `newest` · `popular` |

**Response 200:** `{ "data": { "packages": [...], "pagination": {...} } }`

---

### POST /api/packages
Create a tour package.

**Auth required:** `staff` · `admin`

**Body:**
```json
{
  "title": "Annapurna Base Camp Trek",
  "description": "A classic trek...",
  "destination": "destinationId",
  "price": 450,
  "discountPrice": 399,
  "duration": { "days": 7, "nights": 6 },
  "maxTravelers": 15,
  "includedServices": ["Guide", "Accommodation", "Meals"],
  "itinerary": [
    { "day": 1, "title": "Arrival in Pokhara", "description": "...", "activities": ["City tour"] }
  ],
  "difficultyLevel": "moderate",
  "isPromotional": false
}
```

**Response 201:** `{ "data": { "package": { ... } } }`

---

### GET /api/packages/compare?ids=id1,id2,id3
Compare 2–4 packages side by side.

**Auth required:** No  
**Query:** `ids` — comma-separated package IDs (max 4)  
**Response 200:** `{ "data": { "packages": [ ... ] } }`  
**Errors:** `400` fewer than 2 IDs

---

### GET /api/packages/:id
Get single package by ID or slug.

**Auth required:** No  
**Response 200:** `{ "data": { "package": { ... } } }`

---

### PATCH /api/packages/:id
Update a package.

**Auth required:** `staff` · `admin`  
**Body:** Any subset of create fields  
**Response 200:** `{ "data": { "package": { ... } } }`

---

### DELETE /api/packages/:id
Soft-delete a package.

**Auth required:** `staff` · `admin`  
**Response 200:** `{ "message": "Package deleted" }`

---

### PATCH /api/packages/:id/activate
Activate or deactivate a package.

**Auth required:** `staff` · `admin`

**Body:**
```json
{ "isActive": true }
```

**Response 200:** `{ "message": "Package activated" }`

---

### POST /api/packages/:id/images
Add images to a package.

**Auth required:** `staff` · `admin`

**Body:**
```json
{ "images": ["https://..."], "coverImage": "https://..." }
```

---

### DELETE /api/packages/:id/images
Remove an image from a package.

**Auth required:** `staff` · `admin`

**Body:**
```json
{ "imageUrl": "https://..." }
```

---

## 4. Bookings

### GET /api/bookings
List bookings. Customers see only their own; staff/admin see all.

**Auth required:** Any authenticated user

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | `pending` · `confirmed` · `completed` · `cancelled` |
| paymentStatus | string | `unpaid` · `partial` · `paid` · `refunded` |
| startDate | ISO date | Travel date from |
| endDate | ISO date | Travel date to |
| sort | string | `newest` · `oldest` · `travel_date` |

**Response 200:** `{ "data": { "bookings": [...], "pagination": {...} } }`

---

### POST /api/bookings
Create a new booking.

**Auth required:** Any authenticated user

**Body:**
```json
{
  "packageId": "packageObjectId",
  "travelDate": "2026-10-15",
  "numberOfTravelers": 2,
  "specialRequests": "Vegetarian meals",
  "travelers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "nationality": "Nepali",
      "passportNumber": "P1234567"
    }
  ],
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+977-9800000000",
    "relationship": "Spouse"
  }
}
```

**Response 201:** `{ "data": { "booking": { "bookingNumber": "BK-...", "status": "pending", ... } } }`  
**Side effects:** Creates in-app notification + sends confirmation email

---

### GET /api/bookings/:id
Get single booking with traveler details.

**Auth required:** Owner · `staff` · `admin`  
**Response 200:** `{ "data": { "booking": {...}, "detail": { "travelers": [...] } } }`

---

### PATCH /api/bookings/:id
Update booking status.

**Auth required:** `staff` · `admin`

**Body:**
```json
{ "status": "confirmed", "cancelReason": "Optional reason" }
```

**Allowed status transitions:** `pending → confirmed` · `pending/confirmed → cancelled` · `confirmed → completed`  
**Side effects:** In-app notification + status email to customer

---

### PATCH /api/bookings/:id/status
Shorthand status update endpoint (same behavior as PATCH /api/bookings/:id).

**Auth required:** `staff` · `admin`  
**Body:** `{ "status": "confirmed" }`

---

## 5. Payments

### GET /api/payments
List payments. Customers see own; staff/admin see all.

**Auth required:** Any authenticated user

**Query params:** `page` · `limit` · `status` (`pending/paid/failed/refunded`) · `method` (`esewa/khalti/stripe/paypal/cash`) · `startDate` · `endDate`

**Response 200:** `{ "data": { "payments": [...], "pagination": {...} } }`

---

### POST /api/payments/esewa
Initiate an eSewa payment.

**Auth required:** Any authenticated user

**Body:**
```json
{ "bookingId": "bookingId", "paymentMethod": "esewa", "amount": 450 }
```

**Response 200:**
```json
{
  "data": {
    "paymentId": "paymentId",
    "esewaUrl": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    "esewaData": { "total_amount": "450", "transaction_uuid": "BK-...", "signature": "..." }
  }
}
```

---

### PUT /api/payments/esewa
Verify eSewa callback after payment.

**Auth required:** No (called by eSewa gateway)

**Body:**
```json
{
  "paymentId": "paymentId",
  "transactionId": "txn123",
  "totalAmount": "450",
  "transactionUuid": "BK-...",
  "signedFieldNames": "total_amount,transaction_uuid,product_code",
  "signature": "base64sig..."
}
```

**Response 200:** `{ "data": { "payment": {...}, "invoice": {...} } }`  
**Side effects:** Updates booking `paymentStatus: paid`, creates Invoice, sends receipt email

---

### POST /api/payments/khalti
Initiate a Khalti payment.

**Auth required:** Any authenticated user  
**Body:** Same as eSewa — `bookingId`, `paymentMethod: "khalti"`, `amount`

**Response 200:**
```json
{
  "data": {
    "paymentId": "paymentId",
    "paymentUrl": "https://pay.khalti.com/?pidx=...",
    "pidx": "pidx123"
  }
}
```

---

### PUT /api/payments/khalti
Verify Khalti payment after redirect.

**Auth required:** No

**Body:**
```json
{ "paymentId": "paymentId", "pidx": "pidx123" }
```

**Response 200:** `{ "data": { "payment": {...}, "invoice": {...} } }`

---

### POST /api/payments/stripe
Create a Stripe PaymentIntent.

**Auth required:** Any authenticated user  
**Body:** `bookingId`, `paymentMethod: "stripe"`, `amount`

**Response 200:**
```json
{
  "data": {
    "paymentId": "paymentId",
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx"
  }
}
```

Use `clientSecret` on the frontend with Stripe.js to complete the payment.

---

### PUT /api/payments/stripe
Confirm Stripe payment after frontend completes it.

**Auth required:** No

**Body:**
```json
{ "paymentId": "paymentId", "paymentIntentId": "pi_xxx" }
```

**Response 200:** `{ "data": { "payment": {...}, "invoice": {...} } }`

---

### POST /api/payments/paypal
Create a PayPal order.

**Auth required:** Any authenticated user  
**Body:** `bookingId`, `paymentMethod: "paypal"`, `amount`

**Response 200:**
```json
{
  "data": {
    "paymentId": "paymentId",
    "orderId": "PAYPAL-ORDER-ID",
    "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=..."
  }
}
```

---

### PUT /api/payments/paypal
Capture a PayPal order after user approval.

**Auth required:** No

**Body:**
```json
{ "paymentId": "paymentId", "orderId": "PAYPAL-ORDER-ID" }
```

**Response 200:** `{ "data": { "payment": {...}, "invoice": {...} } }`

---

### GET /api/payments/:id
Get single payment details.

**Auth required:** Owner · `staff` · `admin`  
**Response 200:** `{ "data": { "payment": { ... } } }`

---

### PATCH /api/payments/:id
Staff actions: verify cash payment or issue refund.

**Auth required:** `staff` · `admin`

**Verify cash payment:**
```json
{ "action": "verify_cash", "bookingId": "...", "amount": 450, "notes": "Cash received at office" }
```

**Issue refund:**
```json
{ "action": "refund", "paymentId": "...", "refundAmount": 450, "refundReason": "Customer cancelled" }
```

**Response 200:** `{ "data": { "payment": {...} } }`

---

### POST /api/payments/:id/refund
Dedicated refund endpoint for staff/admin.

**Auth required:** `staff` · `admin`

**Body:**
```json
{ "refundAmount": 450, "refundReason": "Customer request" }
```

**Response 200:** `{ "data": { "payment": {...} } }`  
**Note:** For Stripe payments, the actual Stripe refund API is called automatically.

---

## 6. Reviews

### GET /api/reviews
List reviews with filters.

**Auth required:** No

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| packageId | ObjectId | Filter by package |
| minRating | 1–5 | Minimum star rating |
| maxRating | 1–5 | Maximum star rating |
| sort | string | `newest` · `oldest` · `rating_high` · `rating_low` |

**Response 200:** `{ "data": { "reviews": [...], "pagination": {...} } }`

---

### POST /api/reviews
Submit a review for a completed booking.

**Auth required:** `customer` (must own the booking, booking must be `completed`)

**Body:**
```json
{
  "bookingId": "bookingId",
  "packageId": "packageId",
  "rating": 5,
  "title": "Amazing experience!",
  "comment": "The trek was absolutely breathtaking...",
  "photos": ["https://..."]
}
```

**Response 201:** `{ "data": { "review": { ... } } }`  
**Side effects:** Recalculates package `averageRating` and `totalReviews`  
**Errors:** `400` booking not completed · `409` already reviewed

---

### PATCH /api/reviews/:id
Staff/admin actions on a review.

**Auth required:** `staff` · `admin`

**Hide a review:**
```json
{ "action": "hide" }
```

**Restore a hidden review:**
```json
{ "action": "show" }
```

**Respond to a review:**
```json
{ "action": "respond", "comment": "Thank you for your feedback!" }
```

**Response 200:** `{ "data": { "review": { ... } } }`  
**Side effects (hide/show):** Recalculates package rating · (respond) sends notification to customer

---

## 7. Favorites

### GET /api/favorites
List logged-in user's favorite destinations.

**Auth required:** Any authenticated user

**Query params:** `page` · `limit`  
**Response 200:** `{ "data": { "favorites": [...], "pagination": {...} } }`

---

### POST /api/favorites
Add a destination to favorites.

**Auth required:** Any authenticated user

**Body:**
```json
{ "destinationId": "destinationObjectId" }
```

**Response 201:** `{ "data": { "favorite": { ... } } }`  
**Note:** Idempotent — silently succeeds if already favorited.

---

### DELETE /api/favorites
Remove a destination from favorites by destination ID.

**Auth required:** Any authenticated user

**Body:**
```json
{ "destinationId": "destinationObjectId" }
```

**Response 200:** `{ "message": "Removed from favorites" }`

---

### DELETE /api/favorites/:id
Remove a specific favorite by its document `_id`.

**Auth required:** Any authenticated user  
**Response 200:** `{ "message": "Removed from favorites" }`

---

## 8. AI Trip Planner

### POST /api/ai-planner
Generate a new AI trip plan using DeepSeek.

**Auth required:** Any authenticated user

**Body:**
```json
{
  "destination": "Pokhara",
  "days": 4,
  "budget": 350,
  "interests": ["Adventure", "Photography"],
  "numberOfTravelers": 2,
  "save": true,
  "planName": "Pokhara Adventure 2026"
}
```

**Response 201:**
```json
{
  "data": {
    "plan": {
      "input": { "destination": "Pokhara", "days": 4, "budget": 350 },
      "generatedPlan": {
        "recommendedPackages": [ { "title": "Annapurna Base Camp", ... } ],
        "itinerary": [ { "day": 1, "title": "Arrival", "activities": [...] } ],
        "packingChecklist": ["Hiking boots", "Rain jacket"],
        "travelTips": ["Book early", "Carry cash"],
        "totalEstimatedCost": 340
      },
      "isSaved": true
    }
  }
}
```

**Notes:**  
- Only recommends packages that exist in the database for that destination.  
- Set `"save": true` to persist the plan. Omit or set `false` for one-time generation.

---

### GET /api/ai-planner
List all saved plans for the current user.

**Auth required:** Any authenticated user  
**Query params:** `page` · `limit`  
**Response 200:** `{ "data": { "plans": [...], "pagination": {...} } }`

---

### GET /api/ai-planner/:id
Get a specific plan.

**Auth required:** Owner only  
**Response 200:** `{ "data": { "plan": { ... } } }`

---

### PATCH /api/ai-planner/:id
Save or rename a plan.

**Auth required:** Owner only

**Body:**
```json
{ "isSaved": true, "planName": "My Pokhara Trip" }
```

**Response 200:** `{ "data": { "plan": { ... } } }`

---

### DELETE /api/ai-planner/:id
Delete a saved plan.

**Auth required:** Owner only  
**Response 200:** `{ "message": "Plan deleted" }`

---

### GET /api/ai-planner/plans
Alias endpoint — same as GET /api/ai-planner (saved plans list).

**Auth required:** Any authenticated user

---

### GET /api/ai-planner/plans/:id
Alias for GET /api/ai-planner/:id with full package details populated.

---

### DELETE /api/ai-planner/plans/:id
Alias for DELETE /api/ai-planner/:id.

---

## 9. Search & Recommendations

### GET /api/search
Search destinations and/or packages.

**Auth required:** No (search history saved only when logged in)

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| q | string | Search query (min 2 chars) |
| type | string | `destination` · `package` · `all` (default: `all`) |
| limit | number | Max results per type (default: 10) |

**Response 200:**
```json
{
  "data": {
    "destinations": [ { "name": "Pokhara", ... } ],
    "packages": [ { "title": "ABC Trek", ... } ]
  }
}
```

**Side effects:** Saves query to `SearchHistory` collection (user-linked if authenticated).

---

### GET /api/search/history
Get logged-in user's search history.

**Auth required:** Any authenticated user  
**Query params:** `page` · `limit`  
**Response 200:** `{ "data": { "history": [...], "pagination": {...} } }`

---

### DELETE /api/search/history
Clear all search history for the logged-in user.

**Auth required:** Any authenticated user  
**Response 200:** `{ "message": "Search history cleared" }`

---

### GET /api/recommendations
Personalized package recommendations based on search history, bookings, and favorites.

**Auth required:** Any authenticated user  
**Query params:** `limit` (default: 8)

**Response 200:**
```json
{
  "data": {
    "recommendations": [
      { "title": "Everest Base Camp", "price": 1200, ... }
    ]
  }
}
```

---

## 10. Notifications

### GET /api/notifications
List notifications for the current user.

**Auth required:** Any authenticated user

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Items per page (default: 20) |
| unread | boolean | `true` to show only unread |

**Response 200:**
```json
{
  "data": {
    "notifications": [ { "type": "booking_confirmed", "title": "...", "isRead": false } ],
    "unreadCount": 3,
    "pagination": { ... }
  }
}
```

---

### PATCH /api/notifications
Mark notifications as read (all or specific IDs).

**Auth required:** Any authenticated user

**Body:**
```json
{ "ids": ["notifId1", "notifId2"] }
```

Omit `ids` to mark **all** notifications as read.  
**Response 200:** `{ "message": "Notifications marked as read" }`

---

### POST /api/notifications
Broadcast a notification to users (admin only).

**Auth required:** `admin`

**Body:**
```json
{
  "userIds": ["userId1", "userId2"],
  "title": "New Package Launched!",
  "message": "Check out our new Mustang trek package.",
  "type": "new_package",
  "link": "/packages/mustang-trek"
}
```

Omit `userIds` to broadcast to **all active users**.  
**Response 201:** `{ "message": "Notification sent to 150 users" }`

---

### PATCH /api/notifications/:id
Mark a single notification as read.

**Auth required:** Owner  
**Response 200:** `{ "data": { "notification": { ... } } }`

---

### DELETE /api/notifications/:id
Delete a single notification.

**Auth required:** Owner  
**Response 200:** `{ "message": "Notification deleted" }`

---

## 11. Invoices

### GET /api/invoices
List invoices. Customers see own; staff/admin see all.

**Auth required:** Any authenticated user  
**Query params:** `page` · `limit`  
**Response 200:** `{ "data": { "invoices": [...], "pagination": {...} } }`

---

### GET /api/invoices/:id
Get a specific invoice with full details.

**Auth required:** Owner · `staff` · `admin`

**Response 200:**
```json
{
  "data": {
    "invoice": {
      "invoiceNumber": "INV-2026-00123",
      "issueDate": "2026-08-07",
      "totalAmount": 450,
      "subtotal": 450,
      "tax": 0,
      "discount": 0,
      "items": [ { "description": "Tour Package Booking", "quantity": 1, "unitPrice": 450, "total": 450 } ],
      "status": "paid",
      "payment": { "paymentMethod": "khalti", "transactionId": "...", "paymentDate": "..." },
      "booking": { "bookingNumber": "BK-...", "travelDate": "..." },
      "user": { "firstName": "John", "lastName": "Doe", "email": "..." }
    }
  }
}
```

---

## 12. Users (Admin)

### GET /api/users
List all users with filters.

**Auth required:** `admin` · `staff`

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| role | string | `customer` · `staff` · `admin` |
| search | string | Search by name or email |
| active | boolean | Filter by active status |

**Response 200:** `{ "data": { "users": [...], "pagination": {...} } }`

---

### GET /api/users/:id
Get a single user.

**Auth required:** `admin` · `staff`  
**Response 200:** `{ "data": { "user": { ... } } }`

---

### PATCH /api/users/:id
Update user details or role.

**Auth required:** `admin`

**Body (all optional):**
```json
{
  "role": "staff",
  "isActive": false,
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+977-9800000000"
}
```

**Response 200:** `{ "data": { "user": { ... } } }`

---

### DELETE /api/users/:id
Soft-deactivate a user account.

**Auth required:** `admin`  
**Response 200:** `{ "message": "User deactivated" }`

---

### PATCH /api/users/:id/status
Quickly toggle user active/inactive.

**Auth required:** `admin`

**Body:**
```json
{ "isActive": true }
```

**Response 200:** `{ "message": "User activated" }`

---

## 13. Staff Management

### GET /api/staff
List all staff members.

**Auth required:** `admin`  
**Query params:** `page` · `limit`  
**Response 200:** `{ "data": { "staff": [...], "pagination": {...} } }`

---

### POST /api/staff
Create a new staff account.

**Auth required:** `admin`

**Body:**
```json
{
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice@company.com",
  "password": "Password1",
  "phone": "+977-9800000000"
}
```

**Response 201:** `{ "data": { "staff": { "id": "...", "role": "staff", ... } } }`  
**Note:** Staff accounts skip email verification.

---

### GET /api/staff/:id
Get a staff member.

**Auth required:** `admin`  
**Response 200:** `{ "data": { "staff": { ... } } }`

---

### PATCH /api/staff/:id
Update staff details or activation status.

**Auth required:** `admin`

**Body (all optional):**
```json
{ "firstName": "Alice", "phone": "+977-9800000001", "isActive": false }
```

---

### DELETE /api/staff/:id
Deactivate a staff account.

**Auth required:** `admin`  
**Response 200:** `{ "message": "Staff account deactivated" }`

---

## 14. Dashboards

### GET /api/dashboard/admin
Complete admin analytics dashboard.

**Auth required:** `admin`

**Response 200:**
```json
{
  "data": {
    "overview": {
      "totalCustomers": 1240,
      "totalStaff": 8,
      "totalBookings": 3400,
      "pendingBookings": 45,
      "totalRevenue": 125000,
      "monthlyRevenue": 12400,
      "dailyRevenue": 850,
      "pendingPayments": 12,
      "completedPayments": 3200,
      "refundedPayments": 15
    },
    "recentBookings": [ { "bookingNumber": "BK-...", "user": {...}, "package": {...} } ],
    "popularPackages": [ { "title": "ABC Trek", "totalBookings": 250 } ],
    "popularDestinations": [ { "name": "Pokhara", "totalReviews": 180 } ],
    "topSearches": [ { "query": "pokhara", "count": 340 } ],
    "paymentMethodStats": [ { "_id": "khalti", "total": 55000, "count": 800 } ],
    "cashflow": [ { "_id": { "month": 8, "year": 2026 }, "revenue": 12400, "count": 180 } ]
  }
}
```

---

### GET /api/dashboard/staff
Staff operations dashboard.

**Auth required:** `staff` · `admin`

**Response 200:**
```json
{
  "data": {
    "todayBookings": [ ... ],
    "todayBookingsCount": 12,
    "pendingApprovals": [ ... ],
    "pendingApprovalsCount": 5,
    "recentCustomers": [ ... ],
    "pendingPayments": [ ... ],
    "recentPayments": [ ... ],
    "upcomingSchedule": [ ... ]
  }
}
```

---

### GET /api/dashboard/customer
Customer personal dashboard.

**Auth required:** Any authenticated user

**Response 200:**
```json
{
  "data": {
    "upcomingTrips": [ { "travelDate": "2026-10-15", "package": {...} } ],
    "bookingHistory": [ ... ],
    "bookingStats": { "pending": 1, "confirmed": 2, "completed": 5, "cancelled": 0 },
    "favoritesCount": 8,
    "savedPlans": [ { "planName": "Pokhara Adventure", ... } ],
    "unreadNotifications": 3,
    "paymentHistory": [ ... ],
    "pendingPayments": [ ... ]
  }
}
```

---

## 15. Reports

All report endpoints require `admin` role.

---

### GET /api/reports/revenue
Revenue analytics.

**Auth required:** `admin`

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| period | string | `daily` · `monthly` (default) · `yearly` |
| year | number | Year (default: current year) |
| month | number | Month 1–12 (used only for `daily` period) |

**Response 200:**
```json
{
  "data": {
    "revenueByPeriod": [ { "_id": { "month": 8, "year": 2026 }, "revenue": 12400, "count": 180 } ],
    "summary": {
      "totalRevenue": 125000,
      "totalTransactions": 3200,
      "totalRefunds": 2500,
      "refundCount": 15,
      "netRevenue": 122500
    },
    "methodBreakdown": [ { "_id": "khalti", "total": 55000, "count": 800 } ]
  }
}
```

---

### GET /api/reports/bookings
Booking analytics.

**Auth required:** `admin`

**Query params:** `status` · `startDate` · `endDate`

**Response 200:**
```json
{
  "data": {
    "statusBreakdown": [ { "_id": "confirmed", "count": 2800, "revenue": 115000 } ],
    "monthlyBookings": [ { "_id": { "month": 8 }, "count": 180, "revenue": 12400 } ],
    "summary": { "total": 3400, "totalRevenue": 125000, "avgAmount": 367 },
    "recentBookings": [ ... ]
  }
}
```

---

### GET /api/reports/customers
Customer analytics.

**Auth required:** `admin`

**Response 200:**
```json
{
  "data": {
    "summary": { "totalCustomers": 1240, "activeCustomers": 1200, "newThisMonth": 45 },
    "topCustomers": [ { "user": { "firstName": "John" }, "bookingCount": 8, "totalSpent": 3600 } ],
    "registrationsByMonth": [ { "_id": { "month": 8, "year": 2026 }, "count": 45 } ]
  }
}
```

---

### GET /api/reports/tour-popularity
Tour package popularity analytics.

**Auth required:** `admin`  
**Query params:** `limit` (default: 10)

**Response 200:**
```json
{
  "data": {
    "packagesByBookings": [ { "title": "ABC Trek", "totalBookings": 250 } ],
    "packagesByRevenue": [ { "package": { "title": "..." }, "revenue": 45000 } ],
    "packagesByRating": [ { "title": "...", "averageRating": 4.8, "totalReviews": 120 } ],
    "bookingTrends": [ ... ]
  }
}
```

---

### GET /api/reports/search-analytics
Search behavior analytics.

**Auth required:** `admin`

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | number | 20 | Top queries to return |
| days | number | 30 | Look-back window in days |

**Response 200:**
```json
{
  "data": {
    "topSearches": [ { "query": "pokhara", "count": 340 } ],
    "searchByType": [ { "_id": "destination", "count": 1200 } ],
    "searchTrends": [ { "_id": { "day": 7, "month": 8, "year": 2026 }, "count": 85 } ],
    "uniqueSearchers": 520,
    "totalSearches": 3400
  }
}
```

---

## 16. Content Management

### GET /api/content/homepage
Public homepage data — featured destinations, packages, banners, and stats.

**Auth required:** No

**Response 200:**
```json
{
  "data": {
    "featuredDestinations": [ { "name": "Pokhara", ... } ],
    "featuredPackages": [ { "title": "ABC Trek", ... } ],
    "promotionalPackages": [ { "title": "...", "discountPrice": 299 } ],
    "bannerImages": [ { "imageUrl": "https://...", "title": "..." } ],
    "stats": { "destinations": 45, "packages": 120 }
  }
}
```

---

### GET /api/content/contact
Get company contact information.

**Auth required:** No  
**Response 200:** `{ "data": { "contact": { "companyName": "...", "email": "...", ... } } }`

---

### PUT /api/content/contact
Update company contact info (upsert).

**Auth required:** `admin`

**Body:**
```json
{
  "companyName": "Smart Tourism Pvt. Ltd.",
  "email": "info@smarttourism.com",
  "phone": "+977-1-4000000",
  "address": "Thamel, Kathmandu",
  "city": "Kathmandu",
  "country": "Nepal",
  "mapEmbedUrl": "https://maps.google.com/...",
  "businessHours": "Sun–Fri 9am–6pm",
  "socialLinks": {
    "facebook": "https://facebook.com/...",
    "instagram": "https://instagram.com/..."
  }
}
```

**Response 200:** `{ "data": { "contact": { ... } } }`

---

### GET /api/content/gallery
List gallery images.

**Auth required:** No

**Query params:** `page` · `limit` · `category` (`destination` · `package` · `general` · `banner`)

**Response 200:** `{ "data": { "images": [...], "pagination": {...} } }`

---

### DELETE /api/content/gallery
Remove an image from the gallery.

**Auth required:** `staff` · `admin`

**Body:**
```json
{ "id": "galleryDocumentId" }
```

**Response 200:** `{ "message": "Image removed from gallery" }`

---

## 17. File Upload

### POST /api/upload
Upload an image to Cloudinary.

**Auth required:** Any authenticated user  
**Content-Type:** `multipart/form-data`

**Form fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Image file (JPEG/PNG/WebP/GIF, max 10MB) |
| folder | string | No | Cloudinary sub-folder (e.g. `destinations`) |
| category | string | No | `destination` · `package` · `general` · `banner` |
| relatedId | string | No | ObjectId of related document |
| relatedModel | string | No | `Destination` · `TourPackage` |
| title | string | No | Image title |

**Response 201:**
```json
{
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "travel-project/destinations/abc123",
    "width": 1920,
    "height": 1080,
    "galleryId": "galleryDocumentId"
  }
}
```

**Errors:** `422` invalid file type or size too large

---

### DELETE /api/upload
Delete an image from Cloudinary and the Gallery collection.

**Auth required:** Any authenticated user

**Body:**
```json
{ "publicId": "travel-project/destinations/abc123", "galleryId": "optionalGalleryId" }
```

**Response 200:** `{ "message": "Image deleted" }`

---

---

## 18. Error Reference

| HTTP Status | Meaning |
|-------------|---------|
| 200 | OK — request succeeded |
| 201 | Created — resource created |
| 400 | Bad Request — invalid data or business rule violation |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — authenticated but insufficient role |
| 404 | Not Found — resource doesn't exist |
| 409 | Conflict — duplicate resource (e.g. email already registered) |
| 422 | Unprocessable Entity — Zod validation failed |
| 500 | Internal Server Error — unexpected server failure |

All `422` responses include an `errors` object with per-field messages:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

---

## 19. Authentication Flow

### Email + Password (Better Auth)
```
1. authClient.signUp.email()    →  POST /api/auth/sign-up/email  →  session cookie set
2. authClient.signIn.email()    →  POST /api/auth/sign-in/email  →  session cookie set
3. All protected requests       →  cookie sent automatically by browser
4. authClient.signOut()         →  POST /api/auth/sign-out       →  cookie cleared
```

### Google OAuth (Better Auth)
```
1. authClient.signIn.social({ provider: "google" })
   →  GET /api/auth/sign-in/social?provider=google
   →  Redirect to Google consent screen
   →  User approves
   →  GET /api/auth/callback/google  (Better Auth handles this)
   →  Session cookie set, user created/found in DB
   →  Redirect to callbackURL (default: /)
```

### API Clients (Bearer Token)
```
1. POST /api/auth/sign-in/email         →  returns { token }
2. All requests                         →  Authorization: Bearer <token>
3. Token stored client-side (localStorage / secure storage)
```

**Session lifetime** (configurable via `better-auth.ts`):
- Session cookie — 7 days, refreshed if older than 1 day
- Cookie cache — 5 minutes (reduces DB lookups)

---

## 20. Payment Workflows

### Online Payment (eSewa / Khalti)
```
1. POST /api/payments/esewa       →  get esewaData + esewaUrl
2. Submit form to eSewa gateway   →  user completes payment
3. PUT  /api/payments/esewa       →  verify callback → booking confirmed + invoice created
```

### Card Payment (Stripe)
```
1. POST /api/payments/stripe      →  get clientSecret
2. stripe.confirmPayment()        →  user enters card on frontend
3. PUT  /api/payments/stripe      →  confirm intent → booking confirmed + invoice created
```

### Cash Payment
```
1. Customer selects "Cash" at booking          →  paymentStatus: "unpaid"
2. Customer pays at office
3. PATCH /api/payments/:id  action:"verify_cash"  →  staff marks paid → invoice created
```

### Refund
```
1. POST /api/payments/:id/refund  →  staff submits refundAmount + reason
2. Stripe refunds are processed via Stripe API automatically
3. Booking cancelled + customer notified
```

---

## 21. File Structure Reference

```
src/
├── app/
│   └── (backend)/
│       └── api/
│           ├── auth/
│           │   ├── [...all]/route.ts   # Better Auth catch-all (email, Google OAuth, sessions)
│           │   ├── change-password/    # Custom: change password while logged in
│           │   └── profile/            # Custom: get/update Mongoose user profile
│           ├── ai-planner/             # AI trip planner routes
│           ├── bookings/               # Booking CRUD + status
│           ├── content/                # Homepage, gallery, contact
│           ├── dashboard/              # Admin, staff, customer dashboards
│           ├── destinations/           # Destination CRUD + images
│           ├── favorites/              # Favorites management
│           ├── invoices/               # Invoice list + detail
│           ├── notifications/          # In-app notifications
│           ├── packages/               # Tour package CRUD + compare
│           ├── payments/               # eSewa, Khalti, Stripe, PayPal
│           ├── recommendations/        # Personalized recommendations
│           ├── reports/                # Analytics reports
│           ├── reviews/                # Reviews + admin actions
│           ├── search/                 # Search + history
│           ├── staff/                  # Staff management
│           ├── upload/                 # Cloudinary image upload
│           └── users/                  # User management
├── lib/
│   ├── ai/                             # DeepSeek client + itinerary generator
│   ├── auth/
│   │   ├── auth.ts                     # JWT helpers (for API client Bearer tokens)
│   │   ├── better-auth.ts              # Better Auth instance (email + Google OAuth)
│   │   ├── auth-client.ts              # Frontend Better Auth client
│   │   ├── session.ts                  # Unified session helper (cookie + JWT)
│   │   └── middleware.ts               # Auth middleware helpers
│   ├── cloudinary/                     # Upload + delete helpers
│   ├── db/
│   │   ├── connection.ts               # MongoDB connection (Mongoose)
│   │   └── models/                     # 18 Mongoose models
│   ├── email/                          # Nodemailer + HTML templates
│   ├── payments/                       # eSewa, Khalti, Stripe, PayPal helpers
│   ├── utils/                          # Response helpers, pagination, slugify
│   └── validations/                    # Zod schemas for all entities
└── middleware.ts                       # Root Next.js middleware (session guard)
```

---

## 22. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values before starting the server.

Key variables:
- `BETTER_AUTH_SECRET` — long random string (min 32 chars), used by Better Auth for signing
- `BETTER_AUTH_URL` — full base URL of your app (e.g. `http://localhost:3000`)
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — from Google Cloud Console OAuth credentials  
  Redirect URI to register: `http://localhost:3000/api/auth/callback/google`
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — used for Bearer tokens issued to API clients
- `SMTP_*` — email sending credentials
- `CLOUDINARY_*` — image storage
- `STRIPE_SECRET_KEY` — Stripe secret key
- `ESEWA_SECRET_KEY` + `ESEWA_MERCHANT_CODE` — eSewa credentials
- `KHALTI_SECRET_KEY` — Khalti secret key
- `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` — PayPal credentials
- `DEEPSEEK_API_KEY` — AI trip planner
