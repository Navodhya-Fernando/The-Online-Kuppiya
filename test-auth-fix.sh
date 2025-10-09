#!/bin/bash

echo "🔧 Testing Authentication API Fix..."

# Test the backend endpoint directly
echo "1. Testing backend /api/auth/register endpoint..."
response=$(curl -s -X POST http://localhost:3003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User", 
    "email": "testuser@example.com", 
    "password": "testpass123", 
    "university": "University of Test", 
    "degree": "Computer Science", 
    "year": "2"
  }' \
  --connect-timeout 5)

if echo "$response" | grep -q "success.*true"; then
    echo "✅ Backend /api/auth/register is working!"
else
    echo "❌ Backend registration failed"
    echo "Response: $response"
fi

# Test login endpoint
echo "2. Testing backend /api/auth/login endpoint..."
login_response=$(curl -s -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com", 
    "password": "testpass123"
  }' \
  --connect-timeout 5)

if echo "$login_response" | grep -q "success.*true"; then
    echo "✅ Backend /api/auth/login is working!"
else
    echo "❌ Backend login failed (user might not exist)"
    echo "Response: $login_response"
fi

echo ""
echo "🚀 Frontend should now be able to register/login without 404 errors!"
echo "Open your browser and try registering a new user."
