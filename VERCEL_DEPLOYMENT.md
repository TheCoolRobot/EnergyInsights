Deploy EnergyInsights to Vercel - Complete Guide
What Changed for Vercel
Your app has been restructured for Vercel's serverless platform:

Added mangum - Adapter that makes FastAPI work with Vercel's serverless functions
Created vercel.json - Configuration file that tells Vercel how to deploy
Simplified data - Using in-memory data (you can connect MongoDB later)
Handler export - Added handler = Mangum(app) at the end of server.py
Prerequisites
Vercel account: https://vercel.com/signup (free)
Groq API key: https://console.groq.com (free)
Git repository: Push your code to GitHub/GitLab/Bitbucket
Step 1: Prepare Your Repository
File Structure
Make sure your repository has this structure:

your-project/
├── backend/
│   ├── server.py          (updated with Mangum handler)
│   ├── requirements.txt   (updated with mangum)
│   └── .env              (don't commit this!)
├── frontend/
│   ├── package.json
│   ├── src/
│   └── public/
└── vercel.json           (new file)
Update Files
Replace backend/server.py with the new Vercel-ready version
Replace backend/requirements.txt with the updated dependencies
Create vercel.json in your project root (provided above)
Push to Git
bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
Step 2: Deploy to Vercel
Option A: Using Vercel Dashboard (Easiest)
Go to Vercel: https://vercel.com/new
Import Your Repository
Click "Import Git Repository"
Select your GitHub/GitLab/Bitbucket repo
Click "Import"
Configure Project
Framework Preset: Other
Root Directory: ./ (leave as is)
Build Command: Leave empty (vercel.json handles this)
Output Directory: Leave empty
Add Environment Variables Click "Environment Variables" and add:
GROQ_API_KEY = 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
CORS_ORIGINS = *
Optional (if using MongoDB):

MONGO_URL = mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME = energy_insights
Deploy
Click "Deploy"
Wait 2-3 minutes
Your app will be live!
Option B: Using Vercel CLI
Install Vercel CLI
bash
npm install -g vercel
Login
bash
vercel login
Deploy
bash
vercel
Answer the prompts:

Set up and deploy? Yes
Which scope? Select your account
Link to existing project? No
Project name? energy-insights (or any name)
In which directory? ./ (just press Enter)
Want to modify settings? No
Set Environment Variables
bash
vercel env add GROQ_API_KEY
# Paste: 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

vercel env add CORS_ORIGINS
# Enter: *
Deploy to Production
bash
vercel --prod
Step 3: Get Your URLs
After deployment, Vercel gives you:

Frontend URL: https://your-project.vercel.app
Backend API: https://your-project.vercel.app/api
Test Your API
bash
# Test the API
curl https://your-project.vercel.app/api/

# Get power plants
curl https://your-project.vercel.app/api/power-plants

# Test AI suggestion
curl -X POST https://your-project.vercel.app/api/ai/suggest \
-H "Content-Type: application/json" \
-d '{"state":"CA","energy_type":"solar","budget_millions":500}'
Step 4: Update Frontend (if needed)
If your frontend needs to know the backend URL, update the environment variable:

bash
# In frontend/.env
REACT_APP_BACKEND_URL=https://your-project.vercel.app/api
Then commit and push:

bash
git add frontend/.env
git commit -m "Update backend URL"
git push
Vercel will automatically redeploy!

Step 5: Update CORS (Optional)
For better security, update CORS to only allow your frontend:

Go to Vercel Dashboard → Your Project → Settings → Environment Variables
Edit CORS_ORIGINS
Change from * to https://your-project.vercel.app
Redeploy
Troubleshooting
Backend API not working
Check function logs:

bash
vercel logs <your-url>
Common issues:

Missing environment variables
Groq API key incorrect
Python dependency issues
Fix: Go to Vercel Dashboard → Project → Settings → Environment Variables

Frontend can't reach backend
Check CORS:

Make sure CORS_ORIGINS includes your frontend URL or *
Check API URL:

Frontend should call /api/endpoint not http://localhost:8000/api/endpoint
Build fails
Check build logs in Vercel Dashboard

Common fixes:

bash
# Update requirements.txt
cd backend
pip freeze > requirements.txt

# Update package.json
cd frontend
npm install
AI suggestions fail
Check Groq API key:

Verify key is correct: https://console.groq.com
Check Vercel environment variables
Redeploy after updating
Advanced: Add MongoDB (Optional)
If you want to use MongoDB instead of in-memory data:

Create MongoDB Atlas cluster: https://www.mongodb.com/cloud/atlas/register
Get connection string
Add to Vercel:
bash
vercel env add MONGO_URL
# Paste: mongodb+srv://user:pass@cluster.mongodb.net/energy_insights

vercel env add DB_NAME
# Enter: energy_insights
Redeploy:
bash
vercel --prod
Automatic Deployments
Vercel automatically deploys when you push to Git:

bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel automatically deploys!
Custom Domain (Optional)
Go to Vercel Dashboard → Your Project → Settings → Domains
Add your domain (e.g., energyinsights.com)
Follow DNS instructions
Done! Your app is on your custom domain
Monitoring
View logs:

bash
vercel logs --follow
View deployments:

bash
vercel ls
Analytics:

Go to Vercel Dashboard → Your Project → Analytics
See traffic, performance, errors
Cost Breakdown (FREE!)
Vercel Free Tier includes:

✅ Unlimited deployments
✅ 100GB bandwidth/month
✅ Serverless functions
✅ Automatic HTTPS
✅ Global CDN
✅ Automatic CI/CD
Groq Free Tier:

✅ 30 requests/minute
✅ 6,000 requests/day
✅ Llama 3.3 70B model
Quick Commands
bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Environment variables
vercel env ls
vercel env add VARIABLE_NAME
vercel env rm VARIABLE_NAME
Need Help?
Vercel Docs: https://vercel.com/docs
Vercel Support: https://vercel.com/support
Groq Docs: https://console.groq.com/docs
Success! 🎉
Your app should now be live at:

Frontend: https://your-project.vercel.app
API: https://your-project.vercel.app/api
Try the AI suggestion feature to test the full stack!

