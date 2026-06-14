# Campus Resell Portal - Deployment Instructions

This guide provides instructions to deploy the Campus Resell Portal to production.

---

## 1. Database Setup: MongoDB Atlas
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Database Cluster (e.g. Shared Cluster - free tier).
3. Under **Database Access**, create a user with a secure password (make note of it).
4. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere, required for Render).
5. Go to your cluster dashboard, click **Connect**, select **Drivers**, and copy the connection string. Replace `<username>` and `<password>` with your database user credentials.

---

## 2. Image Storage Setup: Cloudinary
1. Sign up for a free account at [Cloudinary](https://cloudinary.com).
2. Go to your Dashboard and copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Set these values in your backend environment variables (Render configuration).

---

## 3. Backend Deployment: Render
1. Sign up at [Render](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Name**: `campus-resell-backend`
   - **Language**: `Node`
   - **Build Command**: `npm install` (since backend is in a subfolder, configure the root directory or run script)
     * *Note*: If your backend files are under a subdirectory named `backend`, set the **Root Directory** setting on Render to `backend`.
   - **Start Command**: `node src/server.js` or `npm start`
5. Click **Advanced** and add the following **Environment Variables**:
   - `PORT`: `5000` (Render binds automatically, but good to define)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A secure random string*
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: *Your Vercel deployment URL (e.g. https://your-app.vercel.app)*
   - `CLOUDINARY_CLOUD_NAME`: *Your Cloudinary Cloud Name*
   - `CLOUDINARY_API_KEY`: *Your Cloudinary API Key*
   - `CLOUDINARY_API_SECRET`: *Your Cloudinary API Secret*
   - `COLLEGE_DOMAIN`: `edu` (or your campus email suffix, e.g. `college.edu`)
   - `EMAIL_HOST`: *Your SMTP server*
   - `EMAIL_PORT`: `585`
   - `EMAIL_USER`: *Your SMTP Username*
   - `EMAIL_PASS`: *Your SMTP Password*
   - `EMAIL_FROM`: `noreply@campusresell.edu`
6. Click **Deploy Web Service**. Render will build and start your Node.js application. Take note of the public URL provided by Render (e.g. `https://campus-resell-backend.onrender.com`).

---

## 4. Frontend Deployment: Vercel
1. Install the Vercel CLI locally or connect your repository on the [Vercel Dashboard](https://vercel.com).
2. If connecting via the Vercel dashboard:
   - Create a **New Project**.
   - Import your repository.
   - Configure the project settings:
     * **Root Directory**: `frontend`
     * **Framework Preset**: `Vite`
     * **Build Command**: `npm run build`
     * **Output Directory**: `dist`
3. We need to tell Vercel to proxy `/api` and `/socket.io` requests to our deployed backend on Render. Create a `vercel.json` file inside the `frontend` folder with the following contents:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.onrender.com/api/:path*"
    },
    {
      "source": "/socket.io/:path*",
      "destination": "https://your-backend-url.onrender.com/socket.io/:path*"
    }
  ]
}
```

Replace `https://your-backend-url.onrender.com` with your actual Render deployment URL.
4. Click **Deploy**. Vercel will build and serve your static React application.

---

## 5. Development Mode Running

### Backend
1. Copy `.env.example` to `.env` inside the `backend` folder.
2. Ensure you have MongoDB running locally, or configure a MongoDB Atlas cluster URL in `.env`.
3. In the `backend` directory, run:
   ```bash
   npm run start
   ```

### Frontend
1. In the `frontend` directory, run:
   ```bash
   npm run dev
   ```
2. The Vite dev server will start at `http://localhost:5173`. Any requests to `/api` or `/socket.io` are proxied to `http://localhost:5000` via `vite.config.js`.
