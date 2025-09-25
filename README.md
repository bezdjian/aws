# BiblioCloud 📚☁️

A modern, serverless library management system built with AWS Lambda, API Gateway, DynamoDB, and S3. BiblioCloud
provides a comprehensive solution for managing books, users, and lending operations in a digital library environment.

## 🚀 Features

### Core Library Management

- **Book Inventory Management**: Add, update, delete, and search books
- **User Management**: Register and manage library members
- **Borrowing System**: Handle book checkout and return operations
- **Transaction Tracking**: Complete audit trail of all library activities

### Advanced Capabilities

- **File Storage**: Upload and manage book covers and documents via S3
- **Search Functionality**: Find books by title, author, or ISBN
- **Category Management**: Organize books by categories
- **Membership Types**: Support different user privileges (standard, premium, student, faculty, staff)
- **Overdue Tracking**: Monitor late returns and calculate overdue days
- **Availability Management**: Real-time tracking of book availability

### Technical Features

- **Serverless Architecture**: Scale automatically with demand
- **RESTful API**: Clean, well-documented endpoints
- **CORS Support**: Ready for web frontend integration
- **Error Handling**: Comprehensive error responses
- **Data Validation**: Input validation and business rule enforcement

## 🏗️ Architecture

A modern, serverless library management system built on AWS using Lambda, API Gateway, DynamoDB, and S3.

## 🌟 Features

- **Book Management**: Complete CRUD operations for books with metadata
- **User Management**: User registration, profiles, and account management
- **Borrowing System**: Track book borrowing and returns with due dates
- **File Storage**: Upload and manage book covers and documents
- **Search & Filter**: Find books and users with powerful search capabilities
- **Overdue Tracking**: Monitor overdue books and borrowing history

## 🏗️ Architecture

### AWS Services Used

- **AWS Lambda**: Serverless compute for all business logic
- **API Gateway**: RESTful API endpoints
- **DynamoDB**: NoSQL database for books, users, and borrowing records
- **S3**: File storage for book covers and documents
- **CloudFormation**: Infrastructure as Code via SAM

### Database Schema

- **Books Table**: book_id (PK), title, author, ISBN, genre, copies
- **Users Table**: user_id (PK), email, name, membership details
- **BorrowedBooks Table**: borrow_id (PK), user_id, book_id, dates

## 🚀 API Endpoints

### Books API (`/books`)

- `GET /books` - List all books (supports search)
- `GET /books/{id}` - Get specific book
- `POST /books` - Create new book
- `PUT /books/{id}` - Update book
- `DELETE /books/{id}` - Delete book

### Users API (`/users`)

- `GET /users` - List all users (supports search)
- `GET /users/{id}` - Get specific user
- `POST /users` - Create new user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Deactivate user

### Borrowing API

- `GET /borrowed` - List all borrowed books
- `GET /users/{id}/borrowed` - User's borrowed books
- `POST /borrow` - Borrow a book
- `POST /return` - Return a book

### Files API (`/files`)

- `POST /files/upload` - Upload file to S3
- `GET /files/{key}` - Get file URL

## 📦 Deployment

### Prerequisites

- AWS CLI configured with appropriate permissions
- SAM CLI installed
- Python 3.12

### Deploy Steps

1. **Build the application**:
