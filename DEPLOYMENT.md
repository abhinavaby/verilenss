# Deployment Guide

Since VeriLens has two parts (Frontend and Backend), the easiest and free way to deploy this for a hackathon is using **Vercel** for the frontend and **Render** for the backend.

---

## 1. Prepare your GitHub Repository

1. Make sure your entire `verilens` folder is pushed to a GitHub repository.
2. Ensure you have the `.gitignore` files in place so you don't push `node_modules` or `.env` files.

---

## 2. Deploy the Backend (Render)

Render is great for Node.js backends because it offers a free tier.

1. Go to [Render.com](https://render.com/) and create a free account.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `verilens` repository.
4. **Configuration:**
   - **Name:** `verilens-backend`
   - **Root Directory:** `backend` (This is crucial, tell Render to look inside the backend folder).
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. **Environment Variables:**
   - Add your `OPENAI_API_KEY` here (paste your actual key).
   - Add `PORT` with value `10000` (Render defaults to 10000, so this helps).
6. Click **Create Web Service**.

Wait a few minutes for the build to finish. Once it's live, copy the URL they give you (e.g., `https://verilens-backend.onrender.com`).

---

## 3. Deploy the Frontend (Vercel)

Vercel is the easiest place to host Vite React apps.

1. Go to [Vercel.com](https://vercel.com/) and create a free account.
2. Click **Add New -> Project**.
3. Import your `verilens` GitHub repository.
4. **Configuration:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit this and select `frontend`.
5. **Environment Variables:**
   - Add `VITE_BACKEND_URL` and paste the URL you got from Render (e.g., `https://verilens-backend.onrender.com`).
   - Add `VITE_USE_MOCK_DATA` and set it to `false`.
6. Click **Deploy**.

---

## 4. Final Security Check (CORS)

Right now, your backend `server.js` has `app.use(cors())` which allows *any* website to hit your backend. For a hackathon demo, this is perfectly fine.

If you ever want to make it production-ready and secure, you would update `server.js` to only allow your Vercel URL:

```javascript
app.use(cors({
  origin: 'https://your-frontend-app-name.vercel.app'
}))
```
