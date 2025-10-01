# Express Server with User CRUD, Product CRUD, and JWT Authentication

A complete Express.js server built with TypeScript, featuring user management, product management, JWT authentication, and session management.

## Features

- **User Management**: Complete CRUD operations for users
- **Product Management**: Complete CRUD operations for products with filtering and pagination
- **Authentication**: JWT-based authentication with refresh tokens
- **Session Management**: Secure session handling with MongoDB
- **Validation**: Comprehensive input validation using Zod
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Security**: Password hashing, CORS, and security middleware
- **Logging**: Structured logging with Pino

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Logging**: Pino
- **Security**: bcrypt, CORS

## Project Structure

```
src/
├── controller/           # Route controllers
│   ├── auth.controller.ts
│   ├── product.controller.ts
│   └── user.cpmtroller.ts
├── middleware/          # Custom middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validate.middleware.ts
├── models/              # Mongoose models
│   ├── product.model.ts
│   ├── session.model.ts
│   └── user.model.ts
├── schema/              # Zod validation schemas
│   ├── product.schema.ts
│   ├── session.schems.ts
│   └── user.schema.ts
├── utilitys/            # Utility functions
│   ├── connectDb.ts
│   ├── logger.ts
│   └── swagger.ts
├── routes.ts            # Route definitions
└── server.ts           # Server entry point
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd express-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5050
   DATABASE_URL=mongodb://localhost:27017/bootstrap-react-next-express-node-mongo
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/signin` - Login user
- `POST /api/v1/auth/signout` - Logout user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/change-password` - Change user password

### Users
- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/:userId` - Get user by ID
- `PUT /api/v1/users/:userId` - Update user
- `DELETE /api/v1/users/:userId` - Delete user (admin only)

### Products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products` - Get all products with filtering
- `GET /api/v1/products/category/:category` - Get products by category
- `GET /api/v1/products/:productId` - Get product by ID
- `PUT /api/v1/products/:productId` - Update product
- `DELETE /api/v1/products/:productId` - Delete product

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: http://localhost:5050/api-docs
- **API Info**: http://localhost:5050/api/v1

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Types
- **Access Token**: Short-lived (15 minutes) for API access
- **Refresh Token**: Long-lived (7 days) for token renewal

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## User Registration Example

```bash
curl -X POST http://localhost:5050/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "passwordConfirmation": "password123",
    "gender": "male"
  }'
```

## User Login Example

```bash
curl -X POST http://localhost:5050/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Product Creation Example

```bash
curl -X POST http://localhost:5050/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "iPhone 15",
    "description": "Latest iPhone with advanced features",
    "price": 999.99,
    "category": "electronics",
    "brand": "Apple",
    "stock": 50,
    "images": ["https://example.com/iphone15.jpg"],
    "tags": ["smartphone", "apple", "5g"]
  }'
```

## Product Filtering Example

```bash
curl "http://localhost:5050/api/v1/products?category=electronics&minPrice=100&maxPrice=1000&search=iphone&page=1&limit=10"
```

## Database Models

### User Model
- `firstName`: String (required)
- `lastName`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `gender`: Enum (male, female, other)
- `role`: Enum (user, admin, default: user)
- `createdAt`: Date
- `updatedAt`: Date

### Product Model
- `name`: String (required)
- `description`: String (required)
- `price`: Number (required)
- `category`: Enum (electronics, clothing, books, home, sports, beauty, automotive, other)
- `brand`: String (required)
- `stock`: Number (required)
- `images`: Array of Strings (optional)
- `tags`: Array of Strings (optional)
- `isActive`: Boolean (default: true)
- `createdBy`: ObjectId (User reference)
- `createdAt`: Date
- `updatedAt`: Date

### Session Model
- `user`: ObjectId (User reference)
- `userAgent`: String (required)
- `valid`: Boolean (default: true)
- `createdAt`: Date
- `updatedAt`: Date

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Session Management**: Track and invalidate sessions
- **Input Validation**: Comprehensive validation using Zod
- **CORS**: Cross-origin resource sharing configuration
- **Error Handling**: Secure error responses without sensitive data exposure

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests (when implemented)

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5050)
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret

## Production Considerations

1. **Change JWT Secrets**: Use strong, unique secrets in production
2. **Database Security**: Use MongoDB Atlas or secure database hosting
3. **Environment Variables**: Use proper environment variable management
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **HTTPS**: Use HTTPS in production
6. **Logging**: Configure proper logging levels for production
7. **Monitoring**: Implement application monitoring and alerting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
