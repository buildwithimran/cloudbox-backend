🌩️ CloudBox Backend
CloudBox is a full-stack cloud storage application designed for secure file management. This repository contains the backend built using Node.js, Express, and MongoDB.

🚀 Key Features
🔹 Authentication & Security
JWT-based Register & Login: Secure user registration and login.
OTP Verification: Email-based OTP for secure account verification.
Password Reset: Forgot password functionality with OTP validation.
Session Management: Token expiration and auto-logout for security.
🔹 File Management
Drag & Drop & Batch Uploads: Easy file uploads with progress tracking.
Folder Management: Create and delete folders.
File Operations: Upload, delete, download files, and manage file metadata.
📦 Installation
To run the CloudBox backend locally, follow these steps:

Clone the repository

bash
Copy
Edit
git clone git@github.com:buildwithimran/cloudbox-backend.git
cd cloudbox-backend
Install dependencies

bash
Copy
Edit
npm install
Configure Environment Variables
Create a .env file and configure your environment variables (e.g., database connection string, JWT secret, etc.).

Run the application

bash
Copy
Edit
npm start
The backend server will be available at http://localhost:3001/.

🛠️ Technologies Used
Node.js: JavaScript runtime for server-side logic.
Express: Web framework for building APIs.
MongoDB: NoSQL database for storing user and file data.
JWT: JSON Web Tokens for secure authentication and session management.
Nodemailer: For sending email-based OTPs for registration and password rese
