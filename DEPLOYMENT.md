# Deploying to Render

This guide covers deploying King's Restaurant (MarwadiWeb) to [Render](https://render.com).

## Architecture

The app deploys as a **single Web Service**:
- Express backend serves the API and Socket.io
- Built React frontend is served as static files from the same server
- MongoDB Atlas for database (configure separately)

## Prerequisites

1. **MongoDB Atlas** – Create a cluster and get your connection string
2. **Cloudinary** – For menu image uploads
3. **Render account** – [render.com](https://render.com)

## Quick Deploy (Blueprint)

1. Push your code to GitHub
2. In Render Dashboard: **New** → **Blueprint**
3. Connect your repo
4. Render will read `render.yaml` and create the service
5. Add environment variables (see below)

## Manual Deploy

1. **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** marwadi-web
   - **Region:** Oregon (or nearest)
   - **Branch:** main
   - **Runtime:** Node
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or paid for better performance)

## Environment Variables

Set these in Render Dashboard → **Environment**:

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Strong random string for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | Yes | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Yes | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Yes | From Cloudinary dashboard |
| `CLIENT_URL` | No | For single-service deploy, leave empty. Only set if frontend is on a different domain. |

## Post-Deploy

- Your app will be at `https://<your-service>.onrender.com`
- Free tier: service spins down after 15 min inactivity; first request may take ~30s
- Super admin login: use credentials from your seed/admin setup

## Local Development

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

## Troubleshooting

- **Build fails:** Ensure `client/` and `server/` have valid `package.json` files
- **MongoDB connection:** Whitelist `0.0.0.0/0` in Atlas Network Access for Render IPs
- **Socket.io:** Works automatically when frontend and backend are same origin
