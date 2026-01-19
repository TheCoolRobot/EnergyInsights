# EnergyInsights - Deployment Guide

## Local Development Setup

### Prerequisites
- Python 3.9+ with pip3
- Node.js and Yarn
- MongoDB running locally (or a MongoDB Atlas connection string)
- Groq API key (get one free at https://console.groq.com - no age restrictions!)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Update the `.env` file with your credentials:
```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
GROQ_API_KEY=your_actual_groq_api_key_here
```

5. Start the backend server:
```bash
uvicorn server:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
yarn install
```

3. The `.env` file is already configured for local development:
```bash
REACT_APP_BACKEND_URL=http://localhost:8000
WDS_SOCKET_PORT=0
ENABLE_HEALTH_CHECK=false
```

4. Start the frontend development server:
```bash
yarn start
```

The frontend will be available at `http://localhost:3000`

## Deploying to Vercel

### Backend Deployment

1. Install Vercel CLI (if not already installed):
```bash
npm install -g vercel
```

2. Navigate to the backend directory:
```bash
cd backend
```

3. Deploy to Vercel:
```bash
vercel
```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings on Vercel
   - Navigate to "Environment Variables"
   - Add the following variables:
     - `MONGO_URL`: Your MongoDB connection string (use MongoDB Atlas for production)
     - `DB_NAME`: Your database name
     - `CORS_ORIGINS`: Your frontend URL (e.g., `https://your-frontend.vercel.app`)
     - `GROQ_API_KEY`: Your Groq API key

5. Redeploy after setting environment variables:
```bash
vercel --prod
```

### Frontend Deployment

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Update the `.env` file to use your production backend URL:
```bash
REACT_APP_BACKEND_URL=https://your-backend.vercel.app
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

3. Deploy to Vercel:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

## Important Notes

### MongoDB Setup
- **Local Development**: Use a local MongoDB instance
- **Production**: Use MongoDB Atlas (free tier available)
  - Create a cluster at https://www.mongodb.com/cloud/atlas
  - Whitelist Vercel's IP addresses or use `0.0.0.0/0` (allow from anywhere)
  - Copy the connection string and add it as `MONGO_URL` environment variable in Vercel

### Groq API Key
- Get a free API key at https://console.groq.com
- **Generous free tier includes:**
  - 30 requests per minute
  - 6,000 requests per day
  - No credit card required
  - Uses Llama 3.3 70B model (very powerful!)
- **To get your API key:**
  1. Visit https://console.groq.com
  2. Sign up with your email (no age restrictions)
  3. Go to "API Keys" section
  4. Click "Create API Key"
  5. Copy the key and add it to your `.env` file

### CORS Configuration
- For local development, `CORS_ORIGINS="*"` is fine
- For production, update to your actual frontend URL for security:
  ```
  CORS_ORIGINS="https://your-frontend.vercel.app"
  ```

## Troubleshooting

### Backend Issues
- If Python dependencies fail to install, ensure you're using Python 3.9 or higher
- If MongoDB connection fails, check your connection string and ensure MongoDB is running
- If Groq API fails, verify your API key is correct

### Frontend Issues
- If the frontend can't connect to the backend, check that `REACT_APP_BACKEND_URL` is correct
- Clear browser cache and rebuild: `yarn build`
- Check browser console for CORS errors

### Vercel Deployment Issues
- Ensure all environment variables are set in Vercel dashboard
- Check Vercel function logs for backend errors
- Verify build settings match the configuration in `vercel.json`
