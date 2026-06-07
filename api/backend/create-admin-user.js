// Quick script to create an admin user for testing
// Run this in your MongoDB or create manually in the database

// Sample admin user document to insert into your users collection:
/*
{
  "firstName": "Admin",
  "lastName": "User", 
  "email": "admin@kuppiya.com",
  "password": "$2a$10$hashedPasswordHere", // You need to hash this
  "whatsappNumber": "+94771234567",
  "institute": "System Administrator",
  "studentId": "ADMIN001", 
  "studentIdFile": "admin-verification.jpg",
  "degreeProgram": "System Administration",
  "level": "Administrator",
  "emailVerified": true,
  "whatsappVerified": true,
  "approvalStatus": "approved",
  "role": "admin",
  "createdAt": new Date(),
  "updatedAt": new Date()
}
*/

// OR create via registration and then manually update the role in MongoDB:
// db.users.updateOne(
//   { email: "youremail@domain.com" }, 
//   { $set: { role: "admin", approvalStatus: "approved" } }
// )
