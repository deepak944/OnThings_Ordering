# OnThings Internship Project

This repository contains a full-stack e-commerce project named `OnThings`.
It includes:

- a React + Vite frontend
- a Node.js + Express backend
- a MySQL database accessed through Sequelize
- Docker support for frontend, backend, and database
- a chatbot support flow with website-aware fallback answers

The project is designed to let a user browse products, manage a cart, create an account, log in, reset a password, place orders, track orders, pay with Razorpay, and chat with a website assistant.

## 1. Project Overview

At a high level, the system works like this:

1. The browser loads the frontend application.
2. The frontend calls the backend API using `fetch`.
3. The backend validates the request and applies business logic.
4. Sequelize reads from or writes to MySQL.
5. The backend returns JSON to the frontend.
6. The frontend updates UI state and renders the result.

## 2. Main Technologies Used

### Frontend

- React
- Vite
- React Router
- Context API
- Tailwind CSS
- Lucide React icons

### Backend

- Node.js
- Express.js
- Sequelize
- MySQL
- JWT
- bcryptjs
- express-validator
- Razorpay SDK
- Nodemailer
- Helmet
- CORS
- Morgan

### Deployment / Containerization

- Docker
- Docker Compose
- Nginx

## 3. Core Runtime Modules Count

This project currently contains these main app modules:

- 9 frontend pages in `frontend/app/src/pages`
- 4 main reusable frontend components in `frontend/app/src/components`
- 2 frontend context providers in `frontend/app/src/context`
- 5 Sequelize data models in `backend/onthings-backend/models`
- 5 backend route files in `backend/onthings-backend/routes`
- 5 main backend controller files for business modules plus chatbot support
- 3 Docker runtime services in `docker-compose.yml`

## 4. Repository Layout

```text
Internship_Main/
|-- backend/
|   `-- onthings-backend/
|       |-- config/
|       |-- controllers/
|       |-- middleware/
|       |-- models/
|       |-- routes/
|       |-- scripts/
|       |-- utils/
|       |-- .env.example
|       |-- .dockerignore
|       |-- Dockerfile
|       |-- package.json
|       `-- server.js
|-- frontend/
|   `-- app/
|       |-- src/
|       |   |-- components/
|       |   |-- context/
|       |   |-- data/
|       |   |-- hooks/
|       |   |-- lib/
|       |   `-- pages/
|       |-- .env.example
|       |-- .dockerignore
|       |-- Dockerfile
|       |-- nginx.conf
|       |-- package.json
|       `-- vite.config.ts
|-- tools/
|   `-- rewrite_research_docx.py
|-- .env.example
|-- docker-compose.yml
`-- README.md
```

## 5. Frontend Explanation

The active frontend entry is:

- `frontend/app/src/main.tsx`

This file mounts the React app into `index.html` and imports:

- `frontend/app/src/App.jsx`

Important note:

- `frontend/app/src/App.jsx` is the active application shell.

### 5.1 Frontend Folder by Folder

#### `frontend/app/src/components`

Reusable UI pieces:

- `Navbar.jsx`
  Handles top navigation, search bar, login/signup links, cart link, logout, and mobile menu.
- `ProductCard.jsx`
  Displays each product card and supports Add to Cart / Buy Now actions.
- `ProtectedRoute.jsx`
  Blocks unauthenticated access to protected pages and redirects to login.
- `Chatbot.jsx`
  Floating support chat widget used across the app.

#### `frontend/app/src/context`

Global state containers:

- `AuthContext.jsx`
  Stores logged-in user, token, auth mode, login, signup, forgot password, reset password, logout.
- `CartContext.jsx`
  Stores cart items in localStorage and exposes cart operations.

#### `frontend/app/src/data`

- `products.js`
  Local fallback catalog used when backend product fetch fails.

#### `frontend/app/src/lib`

- `api.js`
  Common API helper that sends requests to the backend and throws structured errors.
- `utils.ts`
  General utility file from frontend setup.

#### `frontend/app/src/hooks`

- `use-mobile.ts`
  Device-responsive helper hook.

#### `frontend/app/src/pages`

Main screen-level routes:

- `Home.jsx`
  Product listing, category filters, search results, feature banners.
- `Login.jsx`
  Login form and forgot-password entry point.
- `Signup.jsx`
  New account registration.
- `ForgotPassword.jsx`
  Password reset request UI.
- `ResetPassword.jsx`
  Reset token + new password UI.
- `Cart.jsx`
  Cart view with totals and quantity controls.
- `Checkout.jsx`
  Shipping form, payment choice, order placement flow.
- `OrderSuccess.jsx`
  Final order confirmation page.
- `MyOrders.jsx`
  Displays previous user orders.
- `OrderTracking.jsx`
  Shows order timeline and shipping/order status.

### 5.2 Frontend Route Map

Defined in `frontend/app/src/App.jsx`:

- `/`
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`
- `/cart`
- `/checkout`
- `/order-success`
- `/my-orders`
- `/order-tracking/:orderId`

Protected routes:

- `/cart`
- `/checkout`
- `/order-success`
- `/my-orders`
- `/order-tracking/:orderId`

### 5.3 How Frontend Connects to Backend

The frontend calls backend APIs through `frontend/app/src/lib/api.js`.

Base URL:

- `VITE_API_URL`
- default local value: `http://localhost:5000/api`

Flow example:

1. User logs in on `Login.jsx`.
2. `AuthContext.jsx` calls `/auth/login`.
3. Backend returns user data + JWT.
4. Token is stored in localStorage.
5. Future protected calls send `Authorization: Bearer <token>`.

### 5.4 Frontend Payment Flow

Checkout supports:

- Cash on Delivery
- Card payment through Razorpay

Actual UI logic in `frontend/app/src/pages/Checkout.jsx`:

1. User reaches checkout after cart.
2. User fills shipping details.
3. User selects payment method.
4. If COD:
   the frontend directly creates an order through backend.
5. If card:
   the frontend creates a Razorpay order, opens Razorpay checkout, then verifies payment with backend.

### 5.5 Frontend Fallback Behavior

The frontend includes fallback behavior when backend is unavailable:

- local users for some auth fallback behavior
- local products in `src/data/products.js`
- chatbot widget still renders even if backend is unavailable

## 6. Backend Explanation

The backend entry point is:

- `backend/onthings-backend/server.js`

This file:

- loads environment variables
- creates the Express app
- applies middleware
- mounts route groups
- checks the database connection
- optionally syncs schema
- optionally starts the external chatbot process
- starts the HTTP server

### 6.1 Backend Folder by Folder

#### `backend/onthings-backend/config`

- `database.js`
  Creates the Sequelize MySQL connection from environment variables.

#### `backend/onthings-backend/controllers`

Business logic:

- `authController.js`
  Signup, login, profile, forgot-password, reset-password.
- `productController.js`
  Product listing and product-by-id logic.
- `orderController.js`
  Order creation, fetch user orders, fetch order detail, update order status.
- `paymentController.js`
  Razorpay order creation and signature verification.
- `chatbotController.js`
  Chatbot request handler, external chatbot call, product-aware fallback, session name memory.

#### `backend/onthings-backend/middleware`

- `authMiddleware.js`
  JWT token validation and admin check.
- `errorMiddleware.js`
  Central error formatting for validation, JWT, syntax, and server errors.

#### `backend/onthings-backend/models`

Database definitions:

- `User.js`
- `Product.js`
- `Order.js`
- `OrderItem.js`
- `Notification.js`
- `index.js`
  Defines Sequelize relationships between all models.

#### `backend/onthings-backend/routes`

Express routers:

- `authRoutes.js`
- `productRoutes.js`
- `orderRoutes.js`
- `paymentRoutes.js`
- `chatbotRoutes.js`

#### `backend/onthings-backend/scripts`

Operational scripts:

- `initDatabase.js`
  Creates database if needed, syncs schema, ensures password reset columns exist.
- `seedProducts.js`
  Inserts or updates the product catalog.
- `updateOrderStatus.js`
  Helper script for manual order status updates.
- `waitForDatabase.js`
  Docker startup helper that waits for MySQL before booting the backend.

#### `backend/onthings-backend/utils`

Shared helpers:

- `token.js`
  JWT generation.
- `email.js`
  Nodemailer wrapper.
- `razorpay.js`
  Razorpay client helper.
- `google.js`
  Google auth helper utilities.
- `ApiError.js`
  Custom application error type.
- `asyncHandler.js`
  Promise wrapper for async Express handlers.
- `schema.js`
  Ensures password reset columns exist in `users`.
- `chatbotFallback.js`
  Website-aware fallback chatbot engine.
- `chatbotSession.js`
  In-memory chatbot session storage, including remembered user names.

## 7. Database Explanation

Database technology:

- MySQL

ORM:

- Sequelize

The main database contains 5 application tables:

1. `users`
2. `products`
3. `orders`
4. `order_items`
5. `notifications`

### 7.1 `users`

Stores:

- identity
- email
- password hash
- optional Google identity
- phone
- address
- admin flag
- password reset token
- password reset expiry

### 7.2 `products`

Stores:

- product name
- description
- price
- image URL
- category
- rating
- reviews

### 7.3 `orders`

Stores:

- user reference
- total amount
- payment status
- order status
- payment method
- shipping address
- Razorpay IDs

### 7.4 `order_items`

Stores:

- order reference
- product reference
- quantity
- price at order time

### 7.5 `notifications`

Stores:

- user reference
- event message
- type
- timestamp

### 7.6 Relationships

Defined in `backend/onthings-backend/models/index.js`:

- User -> many Orders
- Order -> many OrderItems
- Product -> many OrderItems
- User -> many Notifications

## 8. API Explanation

Base backend URL:

- `http://localhost:5000/api`

### 8.1 Health

- `GET /api/health`

Used to confirm the backend is running.

### 8.2 Auth APIs

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/profile`

What they do:

- signup creates a new user
- login returns user + JWT
- forgot-password generates a reset token or sends email if SMTP is configured
- reset-password updates password using the reset token
- profile returns the authenticated user profile

### 8.3 Product APIs

- `GET /api/products`
- `GET /api/products/:id`

What they do:

- return the product catalog
- support search/category filtering in controller logic

### 8.4 Order APIs

- `POST /api/orders/create`
- `GET /api/orders/user-orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`

What they do:

- create order
- fetch current user's orders
- fetch one order detail
- update order status for admin users

### 8.5 Payment APIs

- `POST /api/payment/create-order`
- `POST /api/payment/verify`

What they do:

- create a Razorpay order
- verify payment signature and update app order payment state

### 8.6 Chatbot API

- `POST /api/chatbot/chat`

What it does:

- accepts website-related or support-related questions
- tries external chatbot if configured
- falls back to website-aware support logic
- can remember the user's name for the chat session

## 9. How Frontend, Backend, and Database Connect

### Product Browsing

1. Frontend calls `/api/products`.
2. Backend controller reads `Product` rows.
3. Sequelize queries MySQL.
4. Backend returns product JSON.
5. Frontend renders cards.

### Login

1. User submits login form.
2. Frontend calls `/api/auth/login`.
3. Backend validates email/password.
4. Backend signs a JWT.
5. Frontend stores token and user.

### Checkout

1. Frontend reads cart from context.
2. User fills shipping data.
3. Frontend calls backend order and payment endpoints.
4. Backend writes order tables.
5. Frontend navigates to order success and tracking pages.

### Chatbot

1. Frontend sends `POST /api/chatbot/chat`.
2. Backend checks for external chatbot response.
3. If unavailable, fallback chatbot answers using site rules and product context.
4. Name memory is stored per chat session ID.

## 10. Docker Support Added

I added these Docker files:

- `backend/onthings-backend/Dockerfile`
- `backend/onthings-backend/.dockerignore`
- `backend/onthings-backend/scripts/waitForDatabase.js`
- `frontend/app/Dockerfile`
- `frontend/app/.dockerignore`
- `frontend/app/nginx.conf`
- `docker-compose.yml`
- `.env.example`

### 10.1 Docker Services

The compose setup creates 3 services:

1. `db`
   MySQL 8.0 database
2. `backend`
   Node.js Express API container
3. `frontend`
   Nginx container serving the built frontend

### 10.2 Docker Image Build Commands

If you want to build images manually:

```bash
docker build -t onthings-backend ./backend/onthings-backend
```

```bash
docker build ^
  -t onthings-frontend ^
  --build-arg VITE_API_URL=http://localhost:5001/api ^
  --build-arg VITE_CHATBOT_API_URL=http://localhost:5001/api/chatbot/chat ^
  --build-arg VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx ^
  ./frontend/app
```

To verify images:

```bash
docker image ls
```

### 10.3 Docker Compose Commands

1. Copy Docker env template:

```bash
copy .env.example .env
```

2. Build all images:

```bash
docker compose build
```

3. Start all containers:

```bash
docker compose up -d
```

4. Check running containers:

```bash
docker compose ps
```

5. Check logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

6. Seed products into MySQL:

```bash
docker compose exec backend npm run seed:products
```

7. Stop containers:

```bash
docker compose down
```

8. Stop containers and remove MySQL volume:

```bash
docker compose down -v
```

### 10.4 What Docker Compose Does Internally

- starts MySQL first
- waits for MySQL healthcheck
- starts backend after database is healthy
- backend waits for DB using `waitForDatabase.js`
- frontend image is built and served by Nginx
- frontend is exposed on `http://localhost:8080`
- backend is exposed on `http://localhost:5001`
- MySQL is exposed on `localhost:3307`

## 11. How I Created the Docker Images

### Backend image

I used:

- base image: `node:20-alpine`
- installed dependencies with `npm ci --omit=dev`
- copied backend source
- exposed port `5000`
- started container with `npm run start:docker`

Why:

- Alpine keeps image smaller
- `npm ci` is stable for lockfile-based installs
- `start:docker` ensures DB wait happens before app boot

### Frontend image

I used a multi-stage build:

1. build stage with `node:20-alpine`
2. runtime stage with `nginx:1.27-alpine`

Why:

- frontend needs Node only for build time
- Nginx is lightweight for serving built static files
- SPA routing needs `try_files ... /index.html`, which is configured in `nginx.conf`

### Database image

I used:

- `mysql:8.0`

Why:

- this project already uses MySQL in Sequelize
- the image is standard and well-supported

## 12. Local Non-Docker Run Commands

### Backend

```bash
cd backend/onthings-backend
npm install
npm run init:db
npm run seed:products
npm start
```

### Frontend

```bash
cd frontend/app
npm install
npm run dev
```

## 13. Important Notes

- `frontend/app/dist` is generated output, not source code.
- `node_modules` folders are dependency folders, not handwritten project logic.
- `tools/` currently contains helper scripts outside the main runtime app.
- chatbot general knowledge is limited without an external AI/chat service, but website-specific support works through fallback logic.

## 14. Recommended Start Order

For full project testing, use this order:

1. Start MySQL
2. Initialize database
3. Seed products
4. Start backend
5. Start frontend
6. Open frontend in browser
7. Test API with Postman

If using Docker:

1. `copy .env.example .env`
2. `docker compose build`
3. `docker compose up -d`
4. `docker compose exec backend npm run seed:products`

## 15. Final Summary

This project is a container-ready full-stack e-commerce application with:

- React frontend
- Express backend
- MySQL database
- JWT auth
- password reset flow
- order management
- payment integration
- support chatbot
- Dockerized deployment path

The frontend talks to the backend through HTTP APIs, the backend talks to MySQL through Sequelize, and Docker Compose can run the whole stack together as a 3-service system.
