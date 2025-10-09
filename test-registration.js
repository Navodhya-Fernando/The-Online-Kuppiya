// Test registration with proper FormData
const formData = new FormData();
formData.append('firstName', 'Test');
formData.append('lastName', 'User');
formData.append('email', 'test@example.com');
formData.append('password', 'password123');
formData.append('whatsappNumber', '+94771234567');
formData.append('institute', 'NIBM');
formData.append('studentId', 'TEST001');
formData.append('degreeProgram', 'Data Science');
formData.append('level', '1st Year');

// Create a dummy file for studentIdFile
const dummyFile = new Blob(['dummy image content'], { type: 'image/png' });
formData.append('studentIdFile', dummyFile, 'test-id.png');

fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));

console.log('Test sent - check network tab');
