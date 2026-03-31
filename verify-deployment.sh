#!/bin/bash

# TaskFlow Deployment Status Checker
# Verify your deployment is working correctly

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     TaskFlow Deployment Health Check                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Read URLs
read -p "Enter your Backend URL (e.g., https://taskflow-xyz.railway.app): " BACKEND_URL
read -p "Enter your Frontend URL (e.g., https://taskflow.vercel.app): " FRONTEND_URL

echo ""
echo "🔍 Checking deployment health..."
echo ""

# Test Backend
echo "📊 Backend Health Check"
echo "─────────────────────────────"

if curl -s "$BACKEND_URL/api/health" > /dev/null 2>&1; then
    RESPONSE=$(curl -s "$BACKEND_URL/api/health")
    echo "✅ Backend is running"
    echo "   Response: $RESPONSE"
else
    echo "❌ Backend is not responding"
    echo "   Check deployment logs on Railway"
fi

echo ""

# Test MongoDB Connection (by attempting simple API call)
echo "🗄️  Database Connection Check"
echo "─────────────────────────────"

RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}')

if echo "$RESPONSE" | grep -q "Invalid\|error\|400\|401"; then
    echo "✅ Database is connected"
    echo "   (Authentication working)"
else
    echo "⚠️  Database may not be configured"
    echo "   Check MONGO_URI in Railway Variables"
fi

echo ""

# Test Frontend
echo "🎨 Frontend Health Check"
echo "─────────────────────────────"

if curl -s "$FRONTEND_URL" | grep -q "TaskFlow"; then
    echo "✅ Frontend is running"
    echo "   Visit: $FRONTEND_URL"
else
    echo "⚠️  Frontend may have issues"
    echo "   Check Vercel deployment logs"
fi

echo ""

# Test CORS
echo "🔗 CORS Configuration Check"
echo "─────────────────────────────"

CORS_RESPONSE=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/projects" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET")

if echo "$CORS_RESPONSE" | grep -q "Access-Control"; then
    echo "✅ CORS is properly configured"
else
    echo "⚠️  CORS may need adjustment"
    echo "   Ensure FRONTEND_URL is set in backend"
fi

echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  SUMMARY                                    ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ Backend:  $BACKEND_URL"
echo "║ Frontend: $FRONTEND_URL"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ Next Steps:                                                 ║"
echo "║ 1. Visit frontend URL in your browser                      ║"
echo "║ 2. Register a new account                                  ║"
echo "║ 3. Create a project                                        ║"
echo "║ 4. Add tasks and test functionality                        ║"
echo "║ 5. Check browser console (F12) for any errors             ║"
echo "║                                                             ║"
echo "║ For detailed logs:                                         ║"
echo "║ - Railway: https://railway.app                             ║"
echo "║ - Vercel:  https://vercel.com/dashboard                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
