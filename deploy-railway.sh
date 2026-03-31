#!/bin/bash

# TaskFlow Rapid Deployment Script
# Deploy to Railway (Recommended)

echo "🚀 TaskFlow Deployment to Railway"
echo "===================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Create backend project
echo ""
echo "📦 Setting up Backend..."
cd backend

railway init
railway add

# Add environment variables
echo ""
echo "⚙️ Configuring Backend Environment..."
echo "📝 Enter your MongoDB URI (from MongoDB Atlas):"
read MONGO_URI

echo "🔑 Generating JWT Secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "Generated JWT Secret: $JWT_SECRET"

railway variables set MONGO_URI="$MONGO_URI"
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"

# Deploy backend
echo ""
echo "🚀 Deploying Backend..."
railway up

# Get backend URL
BACKEND_URL=$(railway status | grep "Railway URL" | awk '{print $NF}')
echo "✅ Backend deployed at: $BACKEND_URL"

# Deploy frontend
echo ""
echo "📦 Setting up Frontend..."
cd ../frontend

railway init

# Set frontend environment variables
echo "⚙️ Configuring Frontend..."
railway variables set REACT_APP_API_URL="${BACKEND_URL}/api"
railway variables set REACT_APP_SOCKET_URL="${BACKEND_URL}"

echo ""
echo "🚀 Deploying Frontend..."
railway up

echo ""
echo "===================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "===================================="
echo ""
echo "📍 Backend URL: $BACKEND_URL"
echo "📍 Frontend URL: https://your-frontend-domain"
echo ""
echo "✨ Your app is now live!"
