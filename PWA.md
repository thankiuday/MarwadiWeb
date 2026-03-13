# King's Restaurant - Progressive Web App (PWA)

## Overview

The app is now a **Progressive Web App** that can be installed on phones and desktops. Both **customers** and **admins** use the same app URL; the panel they see depends on their login role.

## How It Works

### Single App, Two Panels

- **Same URL** – Everyone visits the same app (e.g. `https://your-app.com`)
- **Role-based access** – After login, users see:
  - **Customers**: Menu, cart, orders, subscriptions
  - **Admins**: Orders, QR codes, subscribers
  - **Superadmins**: Dashboard, menu management, analytics, etc.

### PWA Shortcuts (Add to Home Screen)

When users **Add to Home Screen** or **Install**, they get:

1. **Order Food** – Opens `/menu` (customer flow)
2. **Admin Panel** – Opens `/admin/login` (admin flow)

### Install from correct page

**Important:** The installed app opens to the page you were on when you installed:

- **Install from `/admin/login`** (or any `/admin/*` or `/superadmin/*` page) → App opens to **Admin Login**
- **Install from `/menu`** or other customer pages → App opens to **Customer** flow

So you can share:
- **Customers**: Share `https://your-app.com/menu` – they install from there, app opens to menu
- **Admins**: Share `https://your-app.com/admin/login` – they install from there, app opens to admin login

## Installation

### For Customers
1. Open the app in a browser (Chrome, Safari, Edge)
2. Tap **Add to Home Screen** (mobile) or **Install** (desktop)
3. Use the **Order Food** shortcut for quick access to the menu

### For Admins
1. Open the app
2. Add to Home Screen / Install
3. Use the **Admin Panel** shortcut to go directly to admin login

## Distribution

| User Type | What to Share | Entry Point |
|-----------|---------------|-------------|
| **Customers** | App URL | `/menu` or "Order Food" shortcut |
| **Admins** | App URL | `/admin/login` or "Admin Panel" shortcut |

**Example:**
- Customer link: `https://your-app.com/menu`
- Admin link: `https://your-app.com/admin/login`

## PWA Features

- **Installable** – Add to home screen on mobile and desktop
- **Offline** – Basic caching for previously visited pages
- **Standalone** – Runs in its own window without browser UI
- **Shortcuts** – Quick access to Order (customer) and Admin (admin)

## Icons (Optional)

For better install prompts, add PNG icons to `client/public/`:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

Then update `client/public/manifest.json`:

```json
"icons": [
  { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
  { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
]
```

## HTTPS Required

PWAs require **HTTPS** in production. Localhost works for development.
