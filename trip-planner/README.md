# 🗺️ Family Trip Planner

A live-syncing family Europe trip planner. Edits made on any device appear instantly on all other devices.

## 🚀 Deploy to Render (step by step)

### Step 1 — Push to GitHub

1. Create a free account at [github.com](https://github.com) if you don't have one
2. Click **New repository** → name it `family-trip-planner` → click **Create repository**
3. On your computer, open Terminal (Mac) or Command Prompt (Windows) and run:

```bash
cd path/to/trip-planner      # navigate to this folder
git init
git add .
git commit -m "Initial trip planner"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/family-trip-planner.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 2 — Deploy on Render

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **New +** → **Web Service**
3. Connect your GitHub account and select the `family-trip-planner` repo
4. Render will auto-detect the settings from `render.yaml`. Confirm:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Click **Create Web Service**
6. Wait ~2 minutes for the build to finish
7. Render gives you a URL like `https://family-trip-planner.onrender.com` — share this with your family!

### Step 3 — Share with family

Send your family the Render URL. That's it — everyone sees live updates the moment you save.

## 💡 How live sync works

- You make an edit → saved to the server instantly
- Every family member's browser is connected via a live stream
- Updates appear on their screen within 1 second, no refresh needed

## ⚠️ Free tier note

Render's free tier sleeps after 15 minutes of inactivity, causing a ~30 second cold start. 
This is fine for occasional use. To avoid it, upgrade to Render's $7/month Starter plan.

## 🛠️ Local development

```bash
npm install
npm run build        # build the React frontend
npm start            # start the server at http://localhost:3001
```
