#!/bin/bash

# TaskFlow Quick Setup Script
# This script helps set up the project quickly

echo "🚀 TaskFlow - Quick Setup"
echo "========================="
echo ""

# Check Node.js
echo "📋 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✓ Node.js found: $NODE_VERSION"
else
    echo "✗ Node.js not found. Please install from https://nodejs.org"
    exit 1
fi

# Check npm
echo "📋 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✓ npm found: $NPM_VERSION"
else
    echo "✗ npm not found. Please install Node.js"
    exit 1
fi

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
cd backend

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your MongoDB URI:"
    echo "   MONGO_URI=mongodb://localhost:27017/taskflow"
    echo "   JWT_SECRET=your_super_secret_key"
fi

echo "Installing backend dependencies..."
npm install

echo ""
echo "✓ Backend setup complete!"
echo "  To start: cd backend && npm start"

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd ../frontend

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

echo ""
echo "✓ Frontend setup complete!"
echo "  To start: cd frontend && python -m http.server 3000"

echo ""
echo "========================="
echo "✅ Setup Complete!"
echo "========================="
echo ""
echo "📌 Next Steps:"
echo "1. Ensure MongoDB is running"
echo "2. Start Backend:   cd backend && npm start"
echo "3. Start Frontend:  cd frontend && python -m http.server 3000"
echo "4. Open browser:    http://localhost:3000"
echo ""
echo "📖 For more help, see README.md"
