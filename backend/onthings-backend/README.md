# OnThings Backend

Full backend for your React e-commerce app using Node.js, Express.js, MySQL, Sequelize, JWT, Google OAuth, Razorpay, and Nodemailer.

## Stack
- Node.js + Express.js
- MySQL + Sequelize ORM
- JWT authentication
- Razorpay payments
- Google OAuth 2.0 login
- Nodemailer SMTP notifications

## Implemented API Modules

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/profile` (protected)

### Products (frontend aligned)
- `GET /api/products`
- `GET /api/products/:id`

### Orders
- `POST /api/orders/create` (protected)
- `GET /api/orders/user-orders` (protected)
- `GET /api/orders/:id` (protected)
- `PATCH /api/orders/:id/status` (protected, admin)

### Payments
- `POST /api/payment/create-order` (protected)
- `POST /api/payment/verify` (protected)

## Database Tables

### users
- `id` UUID PK
- `full_name`
- `email` (unique)
- `password`
- `google_id`
- `profile_picture`
- `phone`
- `address`
- `created_at`

### products
- `id`
- `name`
- `description`
- `price`
- `image_url`
- `category`

### orders
- `id`
- `user_id`
- `total_amount`
- `payment_status`
- `order_status`
- `created_at`

### order_items
- `id`
- `order_id`
- `product_id`
- `quantity`
- `price`

### notifications
- `id`
- `user_id`
- `message`
- `type`
- `created_at`

## Setup Instructions

1. Open backend directory:

```bash
cd backend/onthings-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create env file:

```bash
cp .env.example .env
```

4. Configure `.env` values:
- MySQL host/user/password/database
- JWT secret
- Razorpay test keys
- Google OAuth credentials
- SMTP credentials

5. Create MySQL database (or auto-create using script):

```sql
CREATE DATABASE flipkart_clone_db;
```

Or run:

```bash
npm run init:db
```

6. Run backend:

```bash
npm run dev
```

7. Seed product catalog for frontend cart/checkout compatibility:

```bash
npm run seed:products
```

8. Health check:
- `GET http://localhost:5000/api/health`

## Postman Request Examples

### Signup
`POST /api/auth/signup`

```json
{
  "full_name": "Deepak Kumar",
  "email": "deepak@example.com",
  "password": "deepak123",
  "phone": "9876543210",
  "address": "Bangalore"
}
```

### Login
`POST /api/auth/login`

```json
{
  "email": "deepak@example.com",
  "password": "deepak123"
}
```

### Create Razorpay Order
`POST /api/payment/create-order`
Headers: `Authorization: Bearer <token>`

```json
{
  "amount": 1499,
  "currency": "INR",
  "receipt": "receipt_1001"
}
```

### Verify Razorpay Payment
`POST /api/payment/verify`
Headers: `Authorization: Bearer <token>`

```json
{
  "app_order_id": 1,
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

### Create Order
`POST /api/orders/create`
Headers: `Authorization: Bearer <token>`

```json
{
  "items": [
    { "product_id": 1, "quantity": 1 },
    { "product_id": 3, "quantity": 2 }
  ],
  "payment_method": "cod",
  "shipping_address": {
    "fullName": "Deepak Kumar",
    "phone": "9876543210",
    "address": "Street 1",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001"
  }
}
```

## Frontend Integration Notes

Your frontend has already been updated to use backend APIs in these files:
- `src/context/AuthContext.jsx`
- `src/pages/Login.jsx`
- `src/pages/Signup.jsx`
- `src/pages/Checkout.jsx`
- `src/pages/Home.jsx`
- `src/lib/api.js`

### Auth flow
- Signup/Login now call backend APIs.
- JWT token stored in `localStorage` as `authToken`.
- User session stored as `authUser`.
- `Authorization: Bearer <token>` is sent on protected requests.

### Checkout flow
- Checkout now calls `/api/orders/create`.
- Uses cart item IDs as `product_id`, so run `seed:products` first.

## Google OAuth Setup

1. Google Cloud Console -> create project
2. Configure OAuth consent screen
3. Create OAuth client (Web Application)
4. Add callback URL:
   - `http://localhost:5000/api/auth/google/callback`
5. Add credentials in `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`

## Email Notifications

Emails are sent for:
- signup confirmation
- order confirmation
- order shipped
- order delivered

Configure SMTP settings in `.env`.

## Error Handling

Global error middleware handles:
- invalid login (`401`)
- invalid JWT / expired JWT (`401`)
- payment signature failures (`400`)
- DB validation and uniqueness (`400`)
- unknown routes (`404`)
- unexpected server errors (`500`)

## Razorpay Test Mode

Use Razorpay test keys in `.env`:
- `RAZORPAY_KEY_ID=rzp_test_...`
- `RAZORPAY_KEY_SECRET=...`

Sample test card details (sandbox):
- Card number: `4111 1111 1111 1111`
- Expiry: any future date
- CVV: any 3 digits
- Name: any value
- OTP: use sandbox OTP from Razorpay prompt

## Admin Order Status Updates

Set admin emails in `.env`:

```env
ADMIN_EMAILS=admin@example.com,owner@example.com
```

These users can call `PATCH /api/orders/:id/status`.
