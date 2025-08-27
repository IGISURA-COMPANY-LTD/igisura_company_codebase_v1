## IGISURA API Documentation

This document describes all backend API endpoints discovered in the codebase. Base URL prefix for all API routes is assumed to be your server origin (e.g., http://localhost:5000).

- Base path mappings (from `backend/app.js`):
  - Auth: `/api/auth`
  - Categories: `/api/categories`
  - Products: `/api/products`
  - Orders: `/api/orders`
  - Blog: `/api/blog`
  - Users: `/api/users`
  - Admin/Analytics: `/api/admin`

- Authentication: Bearer token via `Authorization: Bearer <JWT>` header.
- Admin-only: Endpoints marked Admin require a valid JWT for a user whose `role` is `ADMIN` (see `adminAuth` middleware). Non-admins receive 403.
- Error format: JSON object `{ "error": string }` with appropriate HTTP status codes.
- Validation: Routes use Joi-based validation. Body and some query parameters are validated where specified.


### Health

- GET `/health`
  - Description: Server health check
  - Auth: None
  - Response 200: `{ "status": "OK", "message": "Server is running" }`
  - Example:
```bash
curl "$BASE/health"
```

### Auth (`/api/auth`)

- POST `/register`
  - Description: Register a new customer account
  - Auth: None
  - Body:
    - `email` (string, email, required)
    - `password` (string, min 6, required)
    - `name` (string, optional)
  - Responses:
    - 201: `{ user: { id, email, name, role }, token }`
    - 400: `{ error: 'User already exists' }`
  - Example:
```bash
curl -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret12","name":"Jane"}'
```

- POST `/login`
  - Description: Login and receive JWT
  - Auth: None
  - Body:
    - `email` (string, email, required)
    - `password` (string, required)
  - Responses:
    - 200: `{ user: { id, email, name, role }, token }`
    - 400: `{ error: 'Invalid credentials' }`
  - Example:
```bash
curl -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'
```

- GET `/profile`
  - Description: Get current user profile
  - Auth: User
  - Responses:
    - 200: `{ id, email, name, role, createdAt, updatedAt }`
    - 401/400: `{ error: 'Access denied. No token provided.' | 'Invalid token.' }`
  - Example:
```bash
curl "$BASE/api/auth/profile" -H "Authorization: Bearer $TOKEN"
```

- PUT `/profile`
  - Description: Update current user name/email
  - Auth: User
  - Body:
    - `email` (string, email, optional)
    - `name` (string, optional)
  - Responses:
    - 200: `{ id, email, name, role, createdAt, updatedAt }`
    - 400: `{ error: 'Email already in use' }`
  - Example:
```bash
curl -X PUT "$BASE/api/auth/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane.d@example.com"}'
```

- PATCH `/password`
  - Description: Change current user password
  - Auth: User
  - Body:
    - `currentPassword` (string, required)
    - `newPassword` (string, required)
  - Responses:
    - 200: `{ message: 'Password updated successfully' }`
    - 400: `{ error: 'Current password is incorrect' }`
  - Example:
```bash
curl -X PATCH "$BASE/api/auth/password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"oldpass","newPassword":"newpass123"}'
```

Example (login):
```bash
curl -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'
```

### Categories (`/api/categories`)

- GET `/`
  - Description: List all categories (with product counts)
  - Auth: None
  - Response 200: `Category[]` with `_count.products`
  - Example:
```bash
curl "$BASE/api/categories"
```

- GET `/:idOrSlug`
  - Description: Get category by id or slug (with products)
  - Auth: None
  - Path params:
    - `idOrSlug` (number | string)
  - Responses:
    - 200: `Category` with `products[]`
    - 404: `{ error: 'Category not found' }`
  - Example:
```bash
curl "$BASE/api/categories/skin-care"
```

- POST `/`
  - Description: Create category
  - Auth: Admin
  - Body:
    - `name` (string, required)
    - `slug` (string, optional; auto-generated from name if omitted)
    - `description` (string, optional)
  - Response 201: `Category`
  - Example:
```bash
curl -X POST "$BASE/api/categories" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Skin Care","description":"All skin products"}'
```

- PUT `/:id`
  - Description: Update category
  - Auth: Admin
  - Path params: `id` (number)
  - Body: `name?`, `slug?`, `description?`
  - Response 200: `Category`

- DELETE `/:id`
  - Description: Delete category
  - Auth: Admin
  - Path params: `id` (number)
  - Response 201: `{ message: 'Category deleted successfully' }`

### Products (`/api/products`)

- GET `/`
  - Description: List products with filtering, search, and pagination
  - Auth: None
  - Query params:
    - `page` (number>=1, default 1)
    - `limit` (1..100, default 10)
    - `category` (string: category id or slug, optional)
    - `minPrice` (number, optional), `maxPrice` (number, optional)
    - `inStock` (boolean, optional), `featured` (boolean, optional)
    - `sortBy` ('name'|'price'|'createdAt'|'rating', default 'createdAt')
    - `sortOrder` ('asc'|'desc', default 'desc')
    - `search` (string, optional)
  - Response 200: `{ products: ProductWithRating[], pagination: { currentPage, totalPages, totalCount, hasNext, hasPrev, limit } }`
  - Example:
```bash
curl "$BASE/api/products?search=soap&minPrice=5&maxPrice=50&sortBy=price&sortOrder=asc"
```

- GET `/featured`
  - Description: Get featured products (defaults to 8, max 20)
  - Auth: None
  - Query: `limit?: number`
  - Response 200: `ProductWithRating[]`
  - Example:
```bash
curl "$BASE/api/products/featured?limit=12"
```

- GET `/category/:categoryIdOrSlug`
  - Description: Get products by category with filters/pagination
  - Auth: None
  - Path params: `categoryIdOrSlug` (number | string)
  - Query: same as in list products, excluding `category`
  - Responses:
    - 200: `{ category, products: ProductWithRating[], pagination }`
    - 404: `{ error: 'Category not found' }`
  - Example:
```bash
curl "$BASE/api/products/category/skin-care?page=2&limit=5"
```

- GET `/:idOrSlug`
  - Description: Get single product by id or slug (with reviews and rating)
  - Auth: None
  - Responses:
    - 200: `ProductWithRating`
    - 404: `{ error: 'Product not found' }`
  - Example:
```bash
curl "$BASE/api/products/green-tea-soap"
```

- POST `/upload-images`
  - Description: Upload up to 5 product images (Cloudinary)
  - Auth: Admin
  - Request: `multipart/form-data` with `images` files (max 5)
  - Responses:
    - 200: `{ images: string[] }` (uploaded URLs)
    - 400: `{ error: 'No images uploaded' | file/mimetype/limit errors }`
  - Example:
```bash
curl -X POST "$BASE/api/products/upload-images" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "images=@/path/img1.jpg" -F "images=@/path/img2.jpg"
```

- POST `/`
  - Description: Create product (supports image upload or URLs)
  - Auth: Admin
  - Request: `application/json` or `multipart/form-data`
  - Body:
    - `name` (string, required)
    - `slug` (string, optional; generated from name if omitted)
    - `description` (string, required)
    - `price` (number >= 0, required)
    - `categoryId` (number, optional) OR `categorySlug` (string, optional)
    - `images` (string[] of URLs or uploaded files, optional)
    - `benefits` (string, required)
    - `instructions` (string, optional)
    - `inStock` (boolean, default true)
    - `featured` (boolean, default false)
    - `stockQuantity` (number >= 0, optional)
  - Responses:
    - 201: `Product`
    - 400: `{ error: 'Category not found' | 'Product with this slug already exists' }`
  - Example:
```bash
curl -X POST "$BASE/api/products" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Green Tea Soap",
    "description":"Gentle soap",
    "price":5.99,
    "categorySlug":"skin-care",
    "images":["https://.../img1.jpg"],
    "benefits":"Cleansing",
    "stockQuantity":100
  }'
```

- PUT `/:id`
  - Description: Update product (supports image replacement)
  - Auth: Admin
  - Path params: `id` (number)
  - Request: `application/json` or `multipart/form-data`
  - Body (any subset):
    - `name?`, `slug?`, `description?`, `price?`
    - `categoryId?` (number) OR `categorySlug?` (string)
    - `images?` (files or URLs)
    - `benefits?`, `instructions?`, `inStock?` (boolean), `featured?` (boolean)
    - `quantityChange?` (number; can be negative to decrease stock, positive to increase)
  - Responses:
    - 200: `Product`
    - 404: `{ error: 'Product not found' }`
    - 400: `{ error: 'Category not found' | 'Product with this slug already exists' }`
  - Example:
```bash
curl -X PUT "$BASE/api/products/42" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price":7.49,"featured":true,"quantityChange":-5}'
```

- DELETE `/:id`
  - Description: Delete product (removes associated images)
  - Auth: Admin
  - Responses:
    - 200: `{ message: 'Product deleted successfully' }`
    - 404: `{ error: 'Product not found' }`
  - Example:
```bash
curl -X DELETE "$BASE/api/products/42" -H "Authorization: Bearer $ADMIN_TOKEN"
```

 

### Orders (`/api/orders`)

- POST `/`
  - Description: Create an order for the current user
  - Auth: User
  - Body:
    - `items` (array of objects): each `{ productId (number), quantity (number>=1), price (number>=0) }`
    - `phoneNumber` (string)
    - `address` (string)
    - `notes` (string, optional)
  - Responses:
    - 201: `{ order, message }`
    - 400: `{ error: 'Some products are not available or out of stock', missingProducts: number[] }` or price/stock errors
  - Example:
```bash
curl -X POST "$BASE/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items":[{"productId":1,"quantity":2,"price":5.99}],
    "phoneNumber":"+250788...",
    "address":"Kigali",
    "notes":"Call before delivery"
  }'
```

- GET `/`
  - Description: List orders. Admin: all; Non-admin: own orders
  - Auth: User (Admin to see all)
  - Query params: `page?`, `limit?`, `status?`, `sortBy?`, `sortOrder?`, `search?`
  - Response 200: `{ orders, pagination }`
  - Example:
```bash
curl "$BASE/api/orders?page=1&limit=10" -H "Authorization: Bearer $TOKEN"
```

- GET `/stats`
  - Description: High-level order stats
  - Auth: Admin
  - Response 200: `{ totalOrders, totalRevenue, ordersByStatus, recentOrders }`
  - Example:
```bash
curl "$BASE/api/orders/stats" -H "Authorization: Bearer $ADMIN_TOKEN"
```

- GET `/user/:id`
  - Description: List a user's orders (self or admin)
  - Auth: User
  - Path params: `id` (number)
  - Query: `page?, limit?, status?, sortBy?, sortOrder?`
  - Responses:
    - 200: `{ orders, pagination }`
    - 404: `{ error: 'User not found' }`
    - 403: `{ error: 'Access denied' }`
  - Example:
```bash
curl "$BASE/api/orders/user/1?page=1" -H "Authorization: Bearer $TOKEN"
```

- GET `/:id`
  - Description: Get a single order (self or admin)
  - Auth: User
  - Responses:
    - 200: `Order`
    - 404: `{ error: 'Order not found' }`
    - 403: `{ error: 'Access denied' }`
  - Example:
```bash
curl "$BASE/api/orders/100" -H "Authorization: Bearer $TOKEN"
```

- PATCH `/:id/status`
  - Description: Update order status; handles stock reserve/restore for CANCELLED transitions
  - Auth: Admin
  - Body: `{ status: 'NEW'|'CONTACTED'|'PAYMENT_CONFIRMED'|'DELIVERED'|'CANCELLED' }`
  - Responses:
    - 200: `Order`
    - 404: `{ error: 'Order not found' }`
  - Example:
```bash
curl -X PATCH "$BASE/api/orders/100/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"CANCELLED"}'
```

- DELETE `/:id`
  - Description: Delete an order (not allowed if delivered or payment confirmed)
  - Auth: Admin
  - Responses:
    - 200: `{ message: 'Order deleted successfully' }`
    - 400: `{ error: 'Cannot delete orders that are already delivered or payment confirmed' }`
    - 404: `{ error: 'Order not found' }`
  - Example:
```bash
curl -X DELETE "$BASE/api/orders/100" -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Blog (`/api/blog`)

- GET `/`
  - Description: List blog posts with filters and pagination
  - Auth: None
  - Query params: `page?, limit?, author?, tag?, search?, sortBy?, sortOrder?`
  - Response 200: `{ posts, pagination }`
  - Example:
```bash
curl "$BASE/api/blog?tag=skin"
```

- GET `/slug/:slug`
  - Description: Get blog post by slug
  - Auth: None
  - Responses:
    - 200: `BlogPost`
    - 404: `{ error: 'Blog post not found' }`
  - Example:
```bash
curl "$BASE/api/blog/slug/how-to-soap"
```

- GET `/:idOrSlug`
  - Description: Get blog post by id or slug
  - Auth: None
  - Responses:
    - 200: `BlogPost`
    - 404: `{ error: 'Blog post not found' }`
  - Example:
```bash
curl "$BASE/api/blog/how-to-soap"
```

- POST `/`
  - Description: Create blog post
  - Auth: Admin
  - Body:
    - `title` (string, required)
    - `slug` (string, optional; generated from title if omitted)
    - `content` (string, required)
    - `author` (string, required)
    - `image` (url string, optional)
    - `tags` (string[], optional)
  - Responses:
    - 201: `BlogPost`
    - 400: `{ error: 'Blog post with this slug already exists' }`
  - Example:
```bash
curl -X POST "$BASE/api/blog" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"How to Soap","content":"...","author":"Team","tags":["skin"]}'
```

- PUT `/:id`
  - Description: Update blog post
  - Auth: Admin
  - Path params: `id` (number)
  - Body: any subset of `title, slug, content, author, image, tags`
  - Responses:
    - 200: `BlogPost`
    - 400: `{ error: 'Blog post with this slug already exists' }`
    - 404: `{ error: 'Blog post not found' }`

- DELETE `/:id`
  - Description: Delete blog post
  - Auth: Admin
  - Responses:
    - 200: `{ message: 'Blog post deleted successfully' }`
    - 404: `{ error: 'Blog post not found' }`
  - Example:
```bash
curl -X DELETE "$BASE/api/blog/10" -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Users (`/api/users`)

All user management endpoints are Admin-only.

- GET `/`
  - Description: List users with filters and pagination
  - Auth: Admin
  - Query params: `page?, limit?, role?, search?, sortBy?, sortOrder?`
  - Response 200: `{ users, pagination }`
  - Example:
```bash
curl "$BASE/api/users?role=CUSTOMER&search=jane" -H "Authorization: Bearer $ADMIN_TOKEN"
```

- GET `/:id`
  - Description: Get a user with recent orders/reviews summary
  - Auth: Admin
  - Responses:
    - 200: `User`
    - 404: `{ error: 'User not found' }`
  - Example:
```bash
curl "$BASE/api/users/5" -H "Authorization: Bearer $ADMIN_TOKEN"
```

- POST `/`
  - Description: Create a user (admin-created)
  - Auth: Admin
  - Body:
    - `email` (string, email, required)
    - `password` (string, min 6, required)
    - `name` (string, optional)
    - `role` ("CUSTOMER" | "ADMIN", optional; default CUSTOMER)
  - Response 201: `User`
  - Example:
```bash
curl -X POST "$BASE/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"new@ex.com","password":"secret12","name":"New User","role":"ADMIN"}'
```

- PUT `/:id`
  - Description: Update a user
  - Auth: Admin
  - Path params: `id` (number)
  - Body: `email?`, `name?`, `role?`
  - Responses:
    - 200: `User`
    - 400: `{ error: 'Email already in use' }`
    - 404: `{ error: 'User not found' }`

- DELETE `/:id`
  - Description: Delete a user (cannot delete self)
  - Auth: Admin
  - Responses:
    - 200: `{ message: 'User deleted successfully' }`
    - 400: `{ error: 'Cannot delete your own account' }`
    - 404: `{ error: 'User not found' }`
  - Example:
```bash
curl -X DELETE "$BASE/api/users/5" -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Admin/Analytics (`/api/admin`)

- GET `/dashboard/stats`
  - Description: Dashboard KPIs (revenue, counts, recent, inventory)
  - Auth: Admin
  - Response 200: `{ totalRevenue, totalOrders, totalProducts, totalUsers, totalBlogPosts, revenueThisMonth, ordersThisMonth, newUsersThisMonth, lowStockProducts, pendingOrders, totalInventoryValue }`
  - Example:
```bash
curl "$BASE/api/admin/dashboard/stats" -H "Authorization: Bearer $ADMIN_TOKEN"
```

- GET `/analytics/inventory`
  - Description: Inventory summary and low/zero stock products
  - Auth: Admin
  - Response 200: `{ totalProducts, inStockProducts, outOfStockProducts, lowStockProducts, zeroStockProducts, inventoryValue, products: LowOrZeroStockTop10[] }`
  - Example:
```bash
curl "$BASE/api/admin/analytics/inventory" -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Authentication and Authorization

- Provide JWT in `Authorization: Bearer <token>` header.
- Admin-only routes explicitly marked require `role: ADMIN`.
- 401 responses for missing/invalid/expired tokens; 403 for insufficient role.

### Common Error Responses

- 400 Bad Request: `{ error: string }` (validation issues, logical constraints)
- 401 Unauthorized: `{ error: 'Access denied. No token provided.' | 'Invalid token' | 'Token expired' }`
- 403 Forbidden: `{ error: 'Access denied' | 'Access denied. Admin required.' }`
- 404 Not Found: `{ error: string }`
- 500 Server Error: `{ error: string }`

### Notes

- Product create/update endpoints accept either image URLs via JSON or image files via `multipart/form-data` (`images` field, up to 5 files). Successful uploads return Cloudinary URLs.
- Query parameter validation is defined via Joi schemas; some middleware validates body by default, but routes indicate intended query validation where applicable.


