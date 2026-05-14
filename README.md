# Famiglia Europa 2025 — Trip Planner

A live-sync family trip planner. **100% free** — no server, no paid plan.

- Hosted on **GitHub Pages** (free, always-on)
- Data stored on **JSONBin.io** (free tier, no account needed for family)
- Syncs across all devices every ~10 seconds
- Works on any phone browser — no app, no login for family members

---

## Deploy in 5 minutes

### Step 1 — Push to GitHub

```bash
cd famiglia-europa-static
git init
git add .
git commit -m "Initial commit — Famiglia Europa trip planner"
```

Go to github.com → New repository → name it `famiglia-europa` (or anything) → Create.

```bash
git remote add origin https://github.com/YOUR_USERNAME/famiglia-europa.git
git branch -M main
git push -u origin main
```

### Step 2 — Enable GitHub Pages

1. Go to your repo on github.com → **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Branch: `main`, folder: `/ (root)` → **Save**
4. After ~60 seconds, your site is live at:
   `https://YOUR_USERNAME.github.io/famiglia-europa`

### Step 3 — Set up JSONBin (one time, takes 2 minutes)

1. Go to [jsonbin.io](https://jsonbin.io) → **Sign up free**
2. In your dashboard → **API Keys** → copy your **Secret Access Key**
3. Click **Create Bin** → paste `{}` as content → **Create Bin**
4. Copy the **Bin ID** from the URL bar (the long string after `/b/`)

### Step 4 — First launch

1. Open your GitHub Pages URL
2. You'll see a one-time setup screen — paste your Secret Access Key and Bin ID
3. Click **Connect & launch** — the planner loads with your full itinerary

### Step 5 — Share with family

1. Click the **Share** button in the app
2. Copy the link — it encodes your bin credentials in the URL hash
3. Send it to your family — they open it, no setup, no account needed

---

## How it works

- **You** do the one-time JSONBin setup. Your key + bin ID are saved in your browser's localStorage.
- **The share link** encodes the key + bin ID in the URL hash (`#cfg=...`) so family members auto-connect when they open it.
- **Syncing**: every 10 seconds, all open browsers check JSONBin for changes. If anything changed, the planner updates automatically.
- **Saving**: when you add/edit/delete an item, it saves to JSONBin immediately and all family browsers pick it up within 10 seconds.

---

## Customizing

All config lives in `index.html`:
- **Budget**: find `const BUDGET = 12000` and change the number
- **Cities / dates**: edit the `CITIES` object
- **Default itinerary**: edit the `defaultData()` function

After any change, just `git add . && git commit -m "update" && git push` and GitHub Pages deploys automatically.
