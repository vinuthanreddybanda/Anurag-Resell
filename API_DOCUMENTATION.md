# Campus Resell Portal - API Documentation

All API requests are prefixed with `/api`. All protected endpoints require a header format: `Authorization: Bearer <jwt_token>`.

---

## 1. Authentication (`/api/auth`)

### Register Account
* **URL**: `/auth/register`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex.mercer@university.edu",
    "password": "securepassword123",
    "department": "Computer Science",
    "graduationYear": 2027
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "Registration successful! Please check your email to verify your account."
  }
  ```

### Verify Email Address
* **URL**: `/auth/verify-email`
* **Method**: `GET`
* **Query Parameters**: `token` (verification token sent to student email)
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Your email has been successfully verified! You can now log in."
  }
  ```

### Login User
* **URL**: `/auth/login`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "email": "alex.mercer@university.edu",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "_id": "603f90e0c0b39527ec56f8a4",
      "name": "Alex Mercer",
      "email": "alex.mercer@university.edu",
      "profilePicture": "/uploads/avatar-123.png",
      "department": "Computer Science",
      "graduationYear": 2027,
      "role": "user"
    }
  }
  ```

---

## 2. User Profiles (`/api/users`)

### Fetch Profile details
* **URL**: `/users/profile`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "user": {
      "_id": "603f90e0c0b39527ec56f8a4",
      "name": "Alex Mercer",
      "email": "alex.mercer@university.edu",
      "profilePicture": "",
      "department": "Computer Science",
      "graduationYear": 2027,
      "role": "user",
      "isVerified": true,
      "isBanned": false
    }
  }
  ```

### Update Profile details
* **URL**: `/users/profile`
* **Method**: `PATCH`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Request Body (Form Data)**:
  - `name` (string, optional)
  - `department` (string, optional)
  - `graduationYear` (number, optional)
  - `profilePicture` (file upload, optional)
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Profile updated successfully",
    "user": { ... }
  }
  ```

### List User's Listed Products
* **URL**: `/users/my-products`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "products": [ ... ]
  }
  ```

---

## 3. Product Listings (`/api/products`)

### Query Products
* **URL**: `/products`
* **Method**: `GET`
* **Query Parameters**:
  - `search` (string, optional) - search string for title and descriptions
  - `category` (string, optional) - Books, Electronics, Cycles, Furniture, Others
  - `sort` (string, optional) - newest, priceAsc, priceDesc
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "results": 1,
    "products": [
      {
        "_id": "603f90e0c0b39527ec56f9b1",
        "title": "Veloce Outlaw Mountain Cycle",
        "description": "24-speed hybrid cycle, in excellent condition.",
        "price": 120,
        "category": "Cycles",
        "images": ["/uploads/cycle.jpg"],
        "seller": {
          "_id": "603f90e0c0b39527ec56f8a4",
          "name": "Alex Mercer"
        },
        "isSold": false,
        "createdAt": "2026-06-13T10:00:00.000Z"
      }
    ]
  }
  ```

### Create Product Listing
* **URL**: `/products`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Request Body (Form Data)**:
  - `title` (string, required)
  - `description` (string, required)
  - `price` (number, required)
  - `category` (enum, required)
  - `images` (1-5 image file uploads, required)
* **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "Product listing created successfully",
    "product": { ... }
  }
  ```

---

## 4. Chats and Messages (`/api/chats`)

### Start or Fetch Chat Room
* **URL**: `/chats`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "productId": "603f90e0c0b39527ec56f9b1"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "chat": {
      "_id": "603f90e0c0b39527ec56fa08",
      "buyer": { ... },
      "seller": { ... },
      "product": { ... }
    }
  }
  ```

### Get Messages in a Chat
* **URL**: `/chats/:chatId/messages`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "messages": [
      {
        "_id": "603f90e0c0b39527ec56fb15",
        "chat": "603f90e0c0b39527ec56fa08",
        "sender": {
          "_id": "603f90e0c0b39527ec56f8a4",
          "name": "Alex Mercer"
        },
        "content": "Hi, is this bicycle still available?",
        "createdAt": "2026-06-13T10:05:00.000Z"
      }
    ]
  }
  ```

---

## 5. Report Moderation (`/api/reports`)

### Submit Moderation Report
* **URL**: `/reports`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "reportedProduct": "603f90e0c0b39527ec56f9b1",
    "reportedUser": "603f90e0c0b39527ec56f8a4",
    "reason": "Fake Product",
    "description": "User is listing catalog photos and refusing physical meetups."
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "Report submitted successfully. Administrators will review it."
  }
  ```

---

## 6. Admin Panel (`/api/admin`)

### Ban User
* **URL**: `/admin/users/:userId/ban`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>` (Admin only)
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "User Jane Doe has been banned successfully"
  }
  ```
