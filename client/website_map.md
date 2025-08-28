### **Document: Website Sitemap & Page Breakdown v2.0**
**Project:** Igisura Company Ltd E-Commerce Website
**Technical Base:** Full-Stack Application (React.js Frontend + Node.js/Express Backend with JWT Auth)

### 1. Sitemap
A visual hierarchy of all pages, reflecting both public-facing and private (user/admin) sections.

```
HOME
|
|-- ABOUT US
|   |-- Her Story
|   |-- Mission & Vision
|   |-- Our Team
|   |-- Certifications
|
|-- SHOP (PRODUCTS)
|   |-- [All Products Listing - with Filtering]
|   |-- [Product Category: e.g., Teas, Juices, Wine]
|   |   |-- [Individual Product Page]
|   |-- [Future Products Category]
|
|-- HEALTH BENEFITS
|
|-- BLOG / TIPS
|   |-- [Blog Post Listing]
|   |-- [Individual Blog Post Page]
|
|-- OUR IMPACT
|
|-- CONTACT
|
|-- 🛒 SHOPPING CART
|
|-- 👤 USER AUTH (Modals/Pages on Navbar)
|   |-- Login
|   |-- Register
|   |-- User Profile (Private)
|       |-- Order History
|       |-- Account Settings
|
|-- ⚙️ ADMIN DASHBOARD (Private, Secure Access)
    |-- Analytics Overview
    |-- Order Management
    |-- Product Management
    |-- Blog Management
    |-- User Management (Admins only)
    |-- Category Management
```

### 2. Page-by-Page Design and Feature Breakdown (Integrated with API)

#### **Page: Homepage**
*   **Purpose:** A stunning first impression, summarizing Igisura and guiding users to key actions.
*   **Key Features & API Integration:**
    *   **Hero Banner:** Full-screen video/image of nettle fields. Overlay with slogan and "Shop Now"/"Learn More" buttons.
    *   **Featured Products Showcase:** (`GET /api/products/featured?limit=4`)
        *   Fetches and displays 4 featured products with images, names, prices, and links to their individual pages.
    *   **Impact Stats:** A section with icons and numbers ("X+ Products Sold", "Y Jobs Created", "Z% Natural Ingredients"). Data can be sourced from `GET /api/admin/dashboard/stats` (admin endpoint) or a dedicated public endpoint if created.
    *   **Story Teaser:** A short excerpt and image from the founder's story, linking to the full "About Us" page.
    *   **Health Benefits Preview:** A short, bulleted list of key health benefits (Rich in Vitamins A, C, B6, Calcium, etc.), linking to the dedicated page.
    *   **Latest Blog Posts:** (`GET /api/blog?limit=3`)
        *   Fetches and displays the 3 most recent blog posts to drive engagement.

#### **Page: About Us**
*   **Purpose:** To build trust and connection by telling the authentic story behind the brand.
*   **Key Features:**
    *   **Her Story:** A detailed narrative featuring the founder's personal journey (inspired by childhood, President Kagame's speeches, and the initial 80,000 RWF investment).
    *   **Mission & Vision:** Clearly stated, directly from the project objective document.
    *   **Our Values:** Icons for Health, Sustainability, Community, Innovation, Quality.
    *   **Team Photos:** Introductions to key team members.
    *   **Certification Badges:** Displaying approvals from RDB, Rwanda Standards Board.

#### **Page: Shop / Products Listing**
*   **Purpose:** To display and sell products effectively with advanced filtering.
*   **Key Features & API Integration (`GET /api/products`):**
    *   **Product Grid:** Displays products with image, name, price, rating, and "Add to Cart" button.
    *   **Advanced Filtering Sidebar:**
        *   Search by name (`search` parameter)
        *   Filter by Category (`category` parameter - uses category `slug` or `id`)
        *   Filter by Price Range (`minPrice`, `maxPrice`)
        *   Filter by Stock status (`inStock`)
        *   Sort by Price, Name, Date, Rating (`sortBy`, `sortOrder`)
    *   **Pagination:** (`page`, `limit` parameters)

#### **Page: Individual Product**
*   **Purpose:** To provide detailed information and facilitate purchase.
*   **Key Features & API Integration (`GET /api/products/:idOrSlug`):**
    *   Fetches product details by its slug (e.g., `green-tea-soap`) or ID.
    *   **Image Gallery:** Displays all product `images` from Cloudinary.
    *   **Detailed Description:** Shows `name`, `description`, `price`, `benefits`, `instructions`.
    *   **Stock Status:** Clearly shows if the product is `inStock`.
    *   **Add to Cart:** Button adds the product to the local cart (or global state).
    *   **Customer Reviews & Ratings:** Section for displaying and submitting reviews (implied by `ProductWithRating` type in API).

#### **Page: Shopping Cart**
*   **Purpose:** To allow users to review and modify items before checkout.
*   **Key Features:**
    *   List of items with image, name, price, quantity (adjustable), and total.
    *   Display of cart subtotal.
    *   **Proceed to Checkout** button that redirects to the checkout page.

#### **Page: Checkout (Order Submission)**
*   **Purpose:** To securely collect customer information and finalize the order.
*   **Key Features & API Integration (`POST /api/orders`):**
    *   **Auth Wall:** User must be logged in. If not, redirect to login/register.
    *   **Order Summary:** Final review of cart items.
    *   **Customer Information Form:**
        *   Pre-populates `name` and `email` from the user's profile (`GET /api/auth/profile`).
        *   Collects `phoneNumber` (required), `address` (required), and `notes` (optional).
    *   **Order Placement:** Submits the order to `POST /api/orders`.
        *   **Success:** Clears the cart, displays a confirmation message: *"Thank you for your order! It has been received. You can view its status in your profile. Our team will contact you shortly to confirm payment and delivery."*
        *   **Error:** Handles API errors like `400 - Some products are not available` and informs the user.

#### **Page: User Profile (Private)**
*   **Purpose:** To allow users to manage their account and view order history.
*   **Key Features & API Integration:**
    *   **Account Info:** Displays user info from `GET /api/auth/profile`.
    *   **Edit Profile Form:** (`PUT /api/auth/profile`) to update `name` and `email`.
    *   **Change Password Form:** (`PATCH /api/auth/password`).
    *   **Order History:** (`GET /api/orders/`)
        *   Fetches and displays a paginated list of the user's own orders with statuses.
    *   **View Order Details:** (`GET /api/orders/:id`) Clicking an order shows full details.

#### **Page: Health Benefits**
*   **Purpose:** To educate visitors on the health benefits of Igisura products.
*   **Key Features:** Content directly from the project objective PDF, structured into sections:
    *   Rich in Metals & Vitamins (A, C, B6)
    *   High in Protein and Calcium (strengthens bones)
    *   Increases milk for mothers who breastfeed
    *   Supports liver health (from the founder's story)

#### **Page: Blog / Tips**
*   **Purpose:** To engage users with educational and promotional content.
*   **Key Features & API Integration (`GET /api/blog`):**
    *   **Blog Listing:** Paginated grid of blog posts with featured `image`, `title`, `author`, excerpt, and `tags`. Supports filtering by `author`, `tag`, and `search`.
    *   **Individual Blog Post:** (`GET /api/blog/slug/:slug`) Full blog post page with title, author, content, and image.

#### **Page: Admin Dashboard (Private)**
*   **Purpose:** A powerful interface for managing the entire e-commerce operation.
*   **Key Features & API Integration:**
    *   **Secure Login:** JWT authentication with `role: ADMIN` check.
    *   **Analytics Overview:** (`GET /api/admin/dashboard/stats`)
        *   Cards displaying `totalRevenue`, `totalOrders`, `totalProducts`, `totalUsers`, `ordersThisMonth`, `revenueThisMonth`, `lowStockProducts`.
    *   **Order Management:**
        *   **Table of Orders:** (`GET /api/orders?limit=50`) Lists all orders with customer info, total, status.
        *   **Update Status:** (`PATCH /api/orders/:id/status`) Dropdown to change status (e.g., to `CANCELLED`, which automatically restores stock via API logic).
        *   **Delete Order:** (`DELETE /api/orders/:id`) For orders that are not delivered/payment confirmed.
    *   **Product Management:**
        *   **List Products:** (`GET /api/products?limit=100`) View all products.
        *   **Add Product:** (`POST /api/products`) Form with fields for all product data. Integrates with `POST /api/products/upload-images` for image uploads.
        *   **Edit Product:** (`PUT /api/products/:id`) Pre-filled form to edit any product detail, including stock adjustments via `quantityChange`.
        *   **Delete Product:** (`DELETE /api/products/:id`)
    *   **Inventory Analytics:** (`GET /api/admin/analytics/inventory`) View low/zero stock reports and total inventory value.
    *   **Blog Management:** Full CRUD using `POST /api/blog`, `PUT /api/blog/:id`, `DELETE /api/blog/:id`.
    *   **User Management (Admins):** (`GET /api/users`) List, view, create, update, and delete users.
    *   **Category Management:** (`GET /api/categories`, `POST /api/categories`) Create and manage product categories.