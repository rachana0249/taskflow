#!/bin/bash

# TaskFlow One-Click Deployment
# Deploys to Vercel + Railway automatically

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║         TaskFlow Automatic Deployment               ║"
echo "║              (Railway + Vercel)                     ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check Prerequisites
echo "📋 Checking Prerequisites..."
echo ""

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Git and Node.js found"
echo ""

# Step 2: Create .env file
echo "⚙️ Setting up Configuration..."
echo ""

if [ ! -f backend/.env ]; then
    echo "MongoDB Atlas Connection String:"
    echo "(Get from: https://www.mongodb.com/cloud/atlas)"
    read -p "Enter MONGO_URI: " MONGO_URI
    
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    cat > backend/.env << EOF
NODE_ENV=production
PORT=3000
MONGO_URI=$MONGO_URI
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=https://taskflow.vercel.app
EOF
    
    echo "✅ Backend .env created"
fi

# Step 3: Push to GitHub (Required for Railway/Vercel)
echo ""
echo "📤 Preparing Code for Deployment..."
echo ""

if [ ! -d .git ]; then
    echo "⚠️  Git repository not initialized."
    echo "Please run these commands to push to GitHub:"
    echo ""
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial TaskFlow deployment'"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/taskflow.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    echo ""
    exit 1
fi

# Step 4: Instructions
echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║              DEPLOYMENT INSTRUCTIONS               ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

echo "✨ Your code is ready to deploy!"
echo ""

echo "🚀 STEP 1: Deploy Backend on Railway"
echo "───────────────────────────────────────"
echo "1. Go to: https://railway.app"
echo "2. Sign up with GitHub"
echo "3. Click 'New Project' → 'Deploy from GitHub'"
echo "4. Select your repository"
echo "5. In Variables, add:"
echo "   - MONGO_URI: (from .env)"
echo "   - JWT_SECRET: (from .env)"
echo "   - FRONTEND_URL: https://taskflow.vercel.app"
echo ""
echo "✅ Your backend will auto-deploy!"
echo ""

echo "🎨 STEP 2: Deploy Frontend on Vercel"
echo "───────────────────────────────────────"
echo "1. Go to: https://vercel.com"
echo "2. Sign up with GitHub"
echo "3. Click 'Add New' → 'Project'"
echo "4. Import your GitHub repo"
echo "5. Set root directory: frontend"
echo "6. In Environment Variables, add:"
echo "   - REACT_APP_API_URL: https://your-railway-url/api"
echo ""
echo "✅ Your frontend will auto-deploy!"
echo ""

echo "🎯 STEP 3: Database Setup"
echo "───────────────────────────────────────"
echo "1. Go to: https://www.mongodb.com/cloud/atlas"
echo "2. Create a free cluster"
echo "3. Create database user"
echo "4. Copy connection string"
echo "5. Update in Railway Variables"
echo ""

echo "╔════════════════════════════════════════════════════╗"
echo "║              QUICK LINKS                           ║"
echo "╠════════════════════════════════════════════════════╣"
echo "║ Railway:        https://railway.app                ║"
echo "║ Vercel:         https://vercel.com                 ║"
echo "║ MongoDB Atlas:  https://mongodb.com/cloud/atlas    ║"
echo "║ Documentation:  See DEPLOYMENT.md                  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

echo "💡 TIP: Deployment takes 2-5 minutes per platform"
echo ""
