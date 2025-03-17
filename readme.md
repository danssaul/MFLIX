# MFLIX Application

## Overview
MFLIX is a movie database application that allows users to browse, search, and manage movie-related data. It includes features for user authentication, data management, and error handling, all powered by a MongoDB backend.

---

## Business Rules
1. Users can register and log in to access personalized features.
2. Only authenticated users can add, update, or delete movie data.
3. Admin users have elevated privileges to manage all data.
4. Movies must have a title, release year, and genre to be valid.
5. Reviews can only be added by authenticated users and must be linked to a movie.
6. Users can add movies to their favorites and provide feedback.

---

## Authorization and Authentication
- **Authentication**: Implemented using JSON Web Tokens (JWT). Users must log in to receive a token, which is required for accessing protected routes.
- **Authorization**: Role-based access control (e.g., USER, PREMIUM_USER, ADMIN) ensures that only authorized users can perform certain actions.

---

## Logging
- **Node Logging**: Uses Winston for logging. Logs are displayed on the console and can be configured via environment variables.
  - Production: Default log level is `info`.
  - Development: Default log level is `debug`.
- **Express Logging**: Uses Morgan middleware.
  - Production: Logs are written to rotated file streams.
  - Development: Logs are displayed on the console.

---

## MongoDB
- **Database**: MongoDB is used to store all application data.
- **Collections**:
  - `users`: Stores user credentials and roles.
    ```json
    {
      "_id": "<email string>",
      "name": "<name and last name>",
      "role": "<USER | PREMIUM_USER | ADMIN>",
      "hashPassword": "<bcrypt hash>",
      "expiration": "<time in milliseconds>",
      "blocked": "<true | false>"
    }
    ```
  - `movies`: Stores movie details, including ratings and comments.
  - `comments`: Stores user comments linked to movies.
    ```json
    {
      "_id": "<ObjectId>",
      "email": "<email string>",
      "movie_id": "<ObjectId>",
      "text": "<comment text>"
    }
    ```
  - `favorites`: Stores user favorite movies.
    ```json
    {
      "_id": "<ObjectId>",
      "email": "<email string>",
      "movie_id": "<ObjectId>",
      "viewed": "<true | false>",
      "feedback": "<optional text>"
    }
    ```

---

## Dependencies
- **Express**: Web framework for building the API.
- **MongoDB**:  MongoDB.
- **jsonwebtoken**: For handling JWT-based authentication.
- **bcrypt**: For hashing user passwords.
- **Winston**: For logging.
- **Morgan**: For HTTP request logging.
- **dotenv**: For managing environment variables.
- **Joi**: For request validation.

---

## Errors and Status Codes
### Common Errors
- **400 Bad Request**: Invalid input data.
- **401 Unauthorized**: Missing or invalid authentication token.
- **403 Forbidden**: User lacks necessary permissions.
- **404 Not Found**: Resource not found.
- **409 Conflict**: Duplicate resource or invalid operation.
- **500 Internal Server Error**: Unexpected server error.

### Status Codes by Route
- **Movies**:
  - `GET /movies/:id`: 200 OK, 404 Not Found
  - `POST /movies`: 201 Created, 400 Bad Request, 401 Unauthorized
  - `PUT /movies/:id`: 200 OK, 400 Bad Request, 403 Forbidden
  - `DELETE /movies/:id`: 204 No Content, 403 Forbidden
- **Comments**:
  - `GET /comments/:movieid`: 200 OK, 404 Not Found
  - `POST /comments`: 201 Created, 400 Bad Request, 401 Unauthorized
  - `PUT /comments`: 200 OK, 400 Bad Request, 403 Forbidden
  - `DELETE /comments/:commentId`: 204 No Content, 404 Not Found
- **Favorites**:
  - `GET /favorites/:email`: 200 OK, 404 Not Found
  - `POST /favorites`: 201 Created, 400 Bad Request, 409 Conflict
  - `PUT /favorites`: 200 OK, 404 Not Found
  - `DELETE /favorites`: 204 No Content, 404 Not Found
- **Accounts**:
  - `POST /accounts`: 201 Created, 400 Bad Request, 409 Conflict
  - `GET /accounts/:email`: 200 OK, 404 Not Found
  - `PUT /accounts`: 200 OK, 404 Not Found
  - `DELETE /accounts/:email`: 204 No Content, 404 Not Found

---

## Installation Instructions
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd MFLIX
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     MONGO_URI=<your-mongodb-connection-string>
     JWT_SECRET=<your-jwt-secret>
     PORT=<application-port>
     LOG_LEVEL=<log-level>
     ```
5. Start the application:
   ```bash
   npm start
   ```

---

## Project Structure
```
MFLIX/
├── controllers/       # Route handlers
├── models/            # Mongoose schemas
├── routes/            # API routes
├── middleware/        # Custom middleware (e.g., auth)
├── utils/             # Utility functions (e.g., logging)
├── .env               # Environment variables
├── app.js             # Main application file
├── package.json       # Project metadata and dependencies
└── readme.md          # Project documentation
```

---

## Notes
- Ensure MongoDB is running before starting the application.
- Use Postman or a similar tool to test API endpoints.
- Validate all request bodies and parameters using Joi schemas.
## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contributions and Feedback
Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

Feedback is also appreciated! Feel free to open an issue or contact the maintainers with suggestions or questions.