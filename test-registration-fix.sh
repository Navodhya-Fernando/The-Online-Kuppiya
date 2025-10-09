#!/bin/bash

echo "🔧 Testing Registration Form Fix..."

# Function to check if servers are running
check_servers() {
    backend_running=false
    frontend_running=false
    
    if curl -s http://localhost:3003/ > /dev/null 2>&1; then
        backend_running=true
    fi
    
    if curl -s http://localhost:5173/ > /dev/null 2>&1 || curl -s http://localhost:5174/ > /dev/null 2>&1; then
        frontend_running=true
    fi
}

echo "1. Checking servers..."
check_servers

if [ "$backend_running" = false ]; then
    echo "❌ Backend not running. Start with: cd backend && npm run dev"
else
    echo "✅ Backend is running"
fi

if [ "$frontend_running" = false ]; then
    echo "❌ Frontend not running. Start with: cd frontend && npm run dev"
else
    echo "✅ Frontend is running"
fi

if [ "$backend_running" = true ]; then
    echo ""
    echo "2. Testing backend registration endpoint with proper fields..."
    
    response=$(curl -s -X POST http://localhost:3003/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Test Registration Fix", 
        "email": "testregfix'$(date +%s)'@example.com", 
        "password": "testpass123", 
        "university": "University of Test", 
        "degree": "Computer Science", 
        "year": 2
      }')
    
    if echo "$response" | grep -q "success.*true"; then
        echo "✅ Backend registration endpoint working!"
    else
        echo "❌ Backend registration failed:"
        echo "$response"
    fi
fi

echo ""
echo "🛠️ Fixes Applied:"
echo "✅ Fixed field mapping (firstName+lastName -> name, institute -> university, etc.)"  
echo "✅ Removed Tailwind CDN warning (using PostCSS build instead)"
echo "✅ Added React Router v7 future flags to remove warnings"
echo "✅ Added proper error handling and logging"
echo ""
echo "📝 Frontend form now maps:"
echo "   firstName + lastName -> name"
echo "   institute -> university"  
echo "   degreeProgram -> degree"
echo "   level -> year (extracted from '1st Year' etc.)"
echo ""
echo "🚀 Try registering through the frontend now!"
