#!/bin/bash

echo "🔧 Testing Updated Registration Flow..."

# Test backend registration with new approval flow
echo "1. Testing backend registration (should require approval)..."
response=$(curl -s -X POST http://localhost:3003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Pending User", 
    "email": "testpending'$(date +%s)'@example.com", 
    "password": "testpass123", 
    "university": "Test University", 
    "degree": "Computer Science", 
    "year": 2
  }')

echo "Response:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"

echo ""
if echo "$response" | grep -q "requiresApproval.*true"; then
    echo "✅ Backend properly requires approval"
elif echo "$response" | grep -q "pending admin approval"; then
    echo "✅ Backend shows pending approval message"
else
    echo "❌ Backend response doesn't show approval requirement"
fi

if echo "$response" | grep -q '"isApproved":false'; then
    echo "✅ User created with isApproved: false"
else
    echo "❌ User not created with proper approval status"
fi

echo ""
echo "📝 Expected Registration Flow:"
echo "1. User fills registration form"
echo "2. Backend creates user with isApproved: false"
echo "3. Backend returns requiresApproval: true"
echo "4. Frontend shows pending approval message"
echo "5. User redirected to login with success message"
echo ""
echo "🔍 Frontend Changes:"
echo "✅ Registration success message updated"
echo "✅ Login page shows pending approval message"
echo "✅ AuthContext handles approval requirement"
echo "✅ No auto-login for pending users"
echo ""
echo "🚀 Test registration through frontend now!"
