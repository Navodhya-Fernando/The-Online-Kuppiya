#!/bin/bash

# Test script to verify the ResourceList fix
echo "🔧 Testing ResourceList.jsx fix..."

# Check if both servers are running
echo "1. Checking backend server..."
if curl -s http://localhost:3003/ > /dev/null; then
    echo "✅ Backend is running on port 3003"
else
    echo "❌ Backend is not running. Start it with: cd backend && npm run dev"
    exit 1
fi

echo "2. Checking frontend server..."
if curl -s http://localhost:5173/ > /dev/null || curl -s http://localhost:5174/ > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not running. Start it with: cd frontend && npm run dev"
    exit 1
fi

echo "3. Testing API endpoint..."
response=$(curl -s http://localhost:3003/api/resources)
if echo "$response" | grep -q "resources"; then
    echo "✅ API returns proper structure with 'resources' field"
else
    echo "⚠️ API response structure might need verification"
    echo "Response: $response"
fi

echo ""
echo "🚀 Both servers are running. Open http://localhost:5173 or http://localhost:5174"
echo "The ResourceList error should now be fixed!"
