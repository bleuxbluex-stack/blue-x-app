# BlueX Supabase Vercel Proxy Setup

This reverse proxy forwards incoming mobile app requests to Supabase (`https://thldfqdcesaajigjgquv.supabase.co`).
It bypasses ISP domain blocks (e.g. Jio/Airtel blocking `*.supabase.co` on mobile networks in India).

---

## Step 1: Deploy Proxy to Vercel (1-Minute Setup)

### Option A: Using Vercel CLI
1. Open your terminal inside `vercel-proxy` folder:
   ```bash
   cd vercel-proxy
   npx vercel
   ```
2. Press `Enter` to confirm default prompts.
3. Once deployed, Vercel will give you a live production URL like:
   `https://blue-x-supabase-proxy.vercel.app`

### Option B: Using GitHub & Vercel Dashboard
1. Create a new repository on GitHub (or use your repository `https://github.com/bleuxbluex-stack/blue-x-app.git`).
2. Push the `vercel-proxy/vercel.json` file.
3. Go to [vercel.com/new](https://vercel.com/new), select your repository, and click **Deploy**.

---

## Step 2: Update Mobile App Environment (.env)

Open your mobile app's `.env` file and add the proxy URL:

```env
EXPO_PUBLIC_SUPABASE_PROXY_URL="https://blue-x-supabase-proxy.vercel.app"
```

Replace `https://blue-x-supabase-proxy.vercel.app` with your actual Vercel URL!

---

## How It Works Under the Hood
1. `services/supabase.ts` detects `EXPO_PUBLIC_SUPABASE_PROXY_URL`.
2. All REST, Auth, Realtime, and Storage requests are routed through Vercel's fast global CDN.
3. Vercel forwards the requests to Supabase securely over SSL.
4. Mobile ISP blocks are completely bypassed!
