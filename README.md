# MovieHub

Movie streaming and management platform built with the **MERN stack** (MongoDB, Express.js, React, Node.js). Supports **three roles**—**admin**, **seller** (content creator), and **user** (viewer)—with JWT authentication, movie upload and approval, subscriptions, reviews, watch history, wishlists, and recommendations.

## Features

- **Authentication:** Email/password login for all roles; **Google OAuth** for users; JWT-protected APIs; bcrypt password hashing.
- **Admin:** Dashboard statistics, user and seller CRUD, movie approval and catalog management, subscription plans, notifications (with email via **Nodemailer**).
- **Seller:** Register/login, upload and update movies (video + metadata + cover), browse approved catalog, manage **persons** (cast/director), profile and payout card details.
- **User:** Home dashboard (trending / genre sections), **search and filter** movies, stream with watch history, wishlist, reviews with **rating distribution charts**, subscription checkout via **Stripe**, notifications.
- **Integrations:** Stripe (payments), Nodemailer (SMTP email), Google Sign-In, optional **Cloudinary** for video/poster hosting, **node-cron** for scheduled tasks.

## Tech stack

| Layer | Technologies |
|--------|----------------|
| Frontend | React 18, React Router, Vite, Tailwind CSS, Axios, Stripe.js, Chart.js (via API-rendered graphs) |
| Backend | Node.js, Express.js, Mongoose, Multer, JWT, bcrypt |
| Database | MongoDB Atlas or local MongoDB |

## Repository layout

```
Web_Project/
├── Web_Project_Backend/     # Express API (port 3213 by default)
│   ├── modules/             # Domain controllers & models
│   ├── scripts/             # e.g. seedDemoData.js
│   └── .env.example         # Copy to .env and fill values
└── Web_Project_Frontend_/my-project/   # Vite + React (port 5173)
    └── .env.example         # VITE_* keys for Stripe / Google
```

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **MongoDB** connection string (Atlas or local)
- Optional: Stripe test keys, Google OAuth client ID, SMTP and Cloudinary credentials (see `.env.example` files)

## Quick start

### 1. Backend

```bash
cd Web_Project_Backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, and optional Stripe / Google / SMTP / Cloudinary

npm install
npm start
```

Health check: `GET http://localhost:3213/health`

Optional demo data:

```bash
npm run seed
```

### 2. Frontend

```bash
cd Web_Project_Frontend_/my-project
cp .env.example .env
# Set VITE_STRIPE_PUBLISHABLE_KEY and VITE_GOOGLE_CLIENT_ID as needed

npm install
npm run dev
```

Open **http://localhost:5173**. The app expects the API at **http://localhost:3213** (see service files under `src/services/`).

## Environment variables

| Area | File |
|------|------|
| Server (DB, JWT, Stripe secret, OAuth, SMTP, Cloudinary) | `Web_Project_Backend/.env` — template: `.env.example` |
| Client (Stripe publishable key, Google client ID) | `Web_Project_Frontend_/my-project/.env` — template: `.env.example` |

Never commit real `.env` files or API secrets. The backend reads **Stripe** from `STRIPE_SECRET_KEY` (used for user subscriptions and optional scheduled seller payouts—if unset, payout jobs log a warning and skip).

## API overview

RESTful routes under the Express app include: auth (`/login/userSellerAdmin`, `/auth/google`), users, movies (upload, filter, stream, details), reviews, watch history, subscription plans and payments, notifications, persons, and recommendation endpoints. See `Web_Project_Backend/index.js` for the full route map.

## Authors

Course project — **Web Technologies Lab**.  
Team: **Asim Shehzad** (22i-2679), **Usman Asif** (22i-8802) — FAST-NU.

## License

Educational / semester project use unless otherwise specified.
