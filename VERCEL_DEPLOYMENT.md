# Deploy EnergyInsights to Vercel - Complete Guide

## Prerequisites
1. Vercel account (free tier works): https://vercel.com/signup
2. MongoDB Atlas account (free tier): https://www.mongodb.com/cloud/atlas/register
3. Groq API key (free): https://console.groq.com

## Step 1: Set Up MongoDB Atlas (Database)

Since Vercel is serverless, you need a cloud database. MongoDB Atlas is free and perfect for this.

### Create MongoDB Atlas Cluster:
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a new cluster (choose Free tier - M0)
4. Choose a cloud provider and region (any works)
5. Click "Create Cluster" (takes ~3-5 minutes)

### Get Connection String:
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string, it looks like:
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual database password
5. Add a database name at the end: `...mongodb.net/energy_insights?retryWrites=true&w=majority`

### Allow Access:
1. In Atlas, go to "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Click "Confirm"

## Step 2: Deploy Backend to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy Backend:**
   ```bash
   cd backend
   vercel
   ```
   - Answer prompts:
     - Set up and deploy? **Yes**
     - Which scope? Choose your account
     - Link to existing project? **No**
     - What's your project's name? `energy-insights-backend` (or any name)
     - In which directory is your code? `./`
     - Want to modify settings? **No**

4. **Set Environment Variables:**
   ```bash
   vercel env add MONGO_URL
   # Paste your MongoDB Atlas connection string

   vercel env add DB_NAME
   # Enter: energy_insights

   vercel env add CORS_ORIGINS
   # Enter: * (will update later with frontend URL)

   vercel env add GROQ_API_KEY
   # Paste: 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
   ```

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

6. **Save your backend URL** (looks like: `https://energy-insights-backend.vercel.app`)

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository (push to GitHub first)
3. Select the `backend` directory as the root
4. Add environment variables in the dashboard:
   - `MONGO_URL`: Your MongoDB Atlas connection string
   - `DB_NAME`: `energy_insights`
   - `CORS_ORIGINS`: `*` (update later)
   - `GROQ_API_KEY`: Your Groq API key
5. Click "Deploy"

## Step 3: Deploy Frontend to Vercel

### Update Frontend Environment:

1. **Edit `frontend/.env`:**
   ```bash
   REACT_APP_BACKEND_URL=https://your-backend-url.vercel.app
   WDS_SOCKET_PORT=443
   ENABLE_HEALTH_CHECK=false
   ```
   Replace `your-backend-url.vercel.app` with your actual backend URL from Step 2.

### Deploy:

1. **Using Vercel CLI:**
   ```bash
   cd ../frontend
   vercel
   ```
   - Answer prompts similar to backend
   - Project name: `energy-insights-frontend` (or any name)

   Then deploy to production:
   ```bash
   vercel --prod
   ```

2. **Using Vercel Dashboard:**
   - Import the project
   - Set root directory to `frontend`
   - Build command: `yarn build`
   - Output directory: `build`
   - Click "Deploy"

3. **Save your frontend URL** (looks like: `https://energy-insights-frontend.vercel.app`)

## Step 4: Update CORS Settings

Now that you have your frontend URL, update the backend CORS settings:

1. **Using Vercel CLI:**
   ```bash
   cd backend
   vercel env rm CORS_ORIGINS production
   vercel env add CORS_ORIGINS production
   # Enter: https://your-frontend-url.vercel.app

   vercel --prod
   ```

2. **Using Vercel Dashboard:**
   - Go to your backend project settings
   - Navigate to "Environment Variables"
   - Edit `CORS_ORIGINS` to your frontend URL
   - Redeploy

## Step 5: Test Your Deployment

1. Open your frontend URL: `https://your-frontend-url.vercel.app`
2. The map and data should load automatically
3. Try the AI Analyst feature:
   - Select a state
   - Choose an energy type
   - Enter a budget
   - Click "Get AI Recommendation"
4. You should see a detailed analysis with energy demand data

## Troubleshooting

### Backend Issues:
- **"Application error"**: Check Vercel function logs
- **Database connection failed**: Verify MongoDB Atlas connection string and IP whitelist
- **Groq API errors**: Verify API key is correct

### Frontend Issues:
- **Can't connect to backend**: Check `REACT_APP_BACKEND_URL` in frontend environment
- **CORS errors**: Make sure backend `CORS_ORIGINS` includes your frontend URL
- **Build fails**: Run `yarn build` locally first to check for errors

### Common Fixes:
```bash
# View backend logs
vercel logs <deployment-url>

# Redeploy backend
cd backend
vercel --prod

# Redeploy frontend
cd frontend
vercel --prod
```

## Cost Breakdown (All Free!)

- **Vercel**: Free tier includes:
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Serverless functions

- **MongoDB Atlas**: Free tier includes:
  - 512 MB storage
  - Shared RAM
  - Perfect for development/small apps

- **Groq API**: Free tier includes:
  - 30 requests per minute
  - 6,000 requests per day
  - Llama 3.3 70B model

## Quick Commands Reference

```bash
# Deploy backend to production
cd backend
vercel --prod

# Deploy frontend to production
cd frontend
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs

# View environment variables
vercel env ls
```

## Need Help?

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas/
- Groq API Docs: https://console.groq.com/docs

Your app is now fully deployed and accessible from anywhere! 🚀
