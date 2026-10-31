# Folio Bookstore API (Backend Only)

A backend practice project for a book inventory/store API. It uses Node.js, Express and MongoDB with Mongoose. There is **no frontend** in this version. Test endpoints with Postman, Thunder Client or curl.

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas
- npm

## Setup
1. Open this folder in VS Code.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`.
4. Set `MONGO_URI` in `.env` to your MongoDB connection string.
5. Start in development mode: `npm run dev`
6. The API runs at `http://localhost:8000`.

Example `.env`:
```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/folio_bookstore
NODE_ENV=development
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health check |
| GET | `/api/overview` | Inventory summary |
| GET | `/api/genres` | List distinct genres |
| GET | `/api/books` | List, search, filter, sort and paginate |
| GET | `/api/books/:id` | Fetch one book |
| POST | `/api/books` | Add a book |
| PATCH | `/api/books/:id` | Partially update a book |
| PUT | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Delete a book |
| POST | `/api/books/:id/buy` | Record a purchase and reduce stock |

### Query examples
- `/api/books?q=clean` — search title, author, genre or ISBN
- `/api/books?genre=Programming`
- `/api/books?minPrice=100&maxPrice=600`
- `/api/books?sort=price-low`
- `/api/books?page=2&limit=8`

### Create a book
Send JSON to `POST /api/books`:
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "genre": "Programming",
  "description": "A practical guide to writing readable software.",
  "price": 499,
  "stock": 8
}
```
To upload a cover, use `multipart/form-data` with the file field named `coverImage`. Supported formats: JPG, PNG, WEBP, GIF; maximum 2 MB.

### Purchase
Send `{"quantity": 2}` to `POST /api/books/:id/buy`. The API atomically reduces stock and returns the total. If stock is insufficient, it returns HTTP 409.

## Project structure
```text
folio-bookstore-backend/
├── config/db.js
├── controllers/bookController.js
├── middleware/
│   ├── asyncHandler.js
│   ├── upload.js
│   └── validate.js
├── models/Book.js
├── routes/bookRoutes.js
├── postman/folio-bookstore-api.collection.json
├── uploads/
├── .env.example
├── package.json
└── server.js
```

## Learning checklist
- Understand how `server.js` mounts routes and middleware.
- Explain the Book Mongoose schema and validation rules.
- Trace a request from route to controller to MongoDB model.
- Test CRUD, filtering, pagination, image upload and purchase behavior in Postman.
- Never commit `.env` or database credentials.
