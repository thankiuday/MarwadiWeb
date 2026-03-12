# King's Restaurant - Ordering System

A production-ready restaurant QR code ordering system built with the MERN stack. Customers scan a table QR code, browse the menu, and place orders that arrive in real-time on the kitchen/admin dashboard via Socket.io.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Tailwind CSS, React Router, Recharts |
| Backend | Node.js, Express, MongoDB (Mongoose), JWT, Socket.io |
| Storage | Cloudinary (images) |
| Deploy | Vercel (frontend), Render (backend), MongoDB Atlas |

## Features

- **QR Table Detection** - `/table/1`, `/table/2`, `/table/3` - Scan QR codes to auto-set table number
- **Customer Flow** - Register/Login, browse menu, add to cart, place order, track status
- **Admin (Cook)** - Real-time order list, accept/reject/update status
- **Super Admin (Owner)** - Analytics dashboard, menu CRUD, admin management, subscription plans
- **Real-time** - Socket.io for live order notifications and status updates

## Project Structure

```
├── client/          # React frontend (Vite)
│   └── src/
│       ├── api/         # Axios API layer
│       ├── components/  # Reusable UI components
│       ├── context/     # Auth, Cart, Socket contexts
│       ├── hooks/       # Custom hooks
│       ├── pages/       # Route pages
│       └── routes/      # Router + protected routes
│
└── server/          # Express backend (MVC)
    ├── config/      # DB, Cloudinary, Socket.io setup
    ├── controllers/ # Route handlers
    ├── middleware/   # Auth, upload, error handler
    ├── models/      # Mongoose schemas
    ├── routes/      # Express routes
    └── utils/       # Token, error class
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### Backend Setup

```bash
cd server
cp .env.example .env
# Fill in your MongoDB URI, JWT secret, and Cloudinary credentials
npm install
npm run dev
```

### Generate Table QR Codes

```bash
npm run generate:qr
```

This creates `client/public/qr-codes/table-1.png`, `table-2.png`, `table-3.png`. Access the **QR Codes** page in the admin panel to view and print them for each table.

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to `http://localhost:5000`.

### Seed Super Admin

Use a tool like Postman or curl to create the first super admin:

```bash
# In MongoDB shell or Compass, insert into the admins collection:
# Or use the API after temporarily removing the auth middleware
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | - | Customer register |
| POST | `/api/auth/login` | - | Customer login |
| POST | `/api/auth/admin/login` | - | Admin login |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/menu` | - | List menu items |
| POST | `/api/menu` | Super Admin | Create menu item |
| PUT | `/api/menu/:id` | Super Admin | Update menu item |
| DELETE | `/api/menu/:id` | Super Admin | Delete menu item |
| POST | `/api/orders` | Customer | Place order |
| GET | `/api/orders/my` | Customer | My order history |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| POST | `/api/admins` | Super Admin | Create admin |
| GET | `/api/admins` | Super Admin | List admins |
| DELETE | `/api/admins/:id` | Super Admin | Delete admin |
| GET | `/api/analytics/summary` | Super Admin | Sales summary |
| GET | `/api/analytics/sales` | Super Admin | Sales chart data |
| CRUD | `/api/subscriptions` | Super Admin | Subscription plans |

## Deployment

### Frontend (Vercel)

1. Import the `client/` directory in Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`

### Backend (Render)

1. Create a new Web Service pointing to `server/`
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add all environment variables from `.env.example`

## License

MIT
