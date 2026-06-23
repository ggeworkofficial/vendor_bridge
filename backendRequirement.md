# VendorBridge Backend Requirements

**To:** Backend Development Team  
**From:** Founder  
**Date**: June 23, 2026  
**Subject**: Backend API Requirements for VendorBridge Rebrand

---

## Overview

This document outlines the complete backend API requirements for the VendorBridge transformation into a comprehensive commerce ecosystem. The frontend has been built with React, TypeScript, and expects RESTful API endpoints at `http://localhost:5000/api` (configurable via environment variables).

**Authentication**: Cookie-based sessions with `withCredentials: true` enabled on frontend requests.

---

## Database Schema Requirements

### Users Table Updates
Add new roles to the existing users table:
```sql
ALTER TABLE users 
MODIFY COLUMN role ENUM('buyer', 'contributor', 'admin', 'reseller', 'service_provider', 'bulk_buyer', 'seller');
```

### New Tables

#### seller_applications
```sql
CREATE TABLE seller_applications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  business_type ENUM('individual', 'company', 'cooperative') NOT NULL,
  tax_id VARCHAR(100),
  business_license VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  product_categories JSON NOT NULL,
  social_media JSON,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### reseller_applications
```sql
CREATE TABLE reseller_applications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  social_media_accounts JSON NOT NULL,
  marketing_experience TEXT NOT NULL,
  preferred_categories JSON NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
  rejection_reason TEXT,
  admin_notes TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 0.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### reseller_shares
```sql
CREATE TABLE reseller_shares (
  id VARCHAR(36) PRIMARY KEY,
  reseller_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  caption TEXT,
  generated_link VARCHAR(500) NOT NULL,
  total_clicks INT DEFAULT 0,
  total_conversions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reseller_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES inventory(id)
);
```

#### reseller_clicks
```sql
CREATE TABLE reseller_clicks (
  id VARCHAR(36) PRIMARY KEY,
  reseller_share_id VARCHAR(36) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reseller_share_id) REFERENCES reseller_shares(id)
);
```

#### reseller_payouts
```sql
CREATE TABLE reseller_payouts (
  id VARCHAR(36) PRIMARY KEY,
  reseller_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'processing', 'paid', 'rejected') DEFAULT 'pending',
  payment_method VARCHAR(100) NOT NULL,
  payment_details TEXT NOT NULL,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  rejection_reason TEXT,
  FOREIGN KEY (reseller_id) REFERENCES users(id)
);
```

#### service_providers
```sql
CREATE TABLE service_providers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  bio TEXT,
  skills JSON NOT NULL,
  certifications JSON,
  hourly_rate DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  total_completed_projects INT DEFAULT 0,
  response_time INT DEFAULT 0,
  availability ENUM('available', 'busy', 'offline') DEFAULT 'available',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### services
```sql
CREATE TABLE services (
  id VARCHAR(36) PRIMARY KEY,
  provider_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('creative', 'technical', 'marketing', 'professional', 'local') NOT NULL,
  pricing_type ENUM('hourly', 'project', 'package') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  delivery_time INT NOT NULL,
  revisions INT NOT NULL,
  requirements JSON,
  portfolio_images JSON,
  status ENUM('active', 'inactive', 'pending_review', 'rejected') DEFAULT 'pending_review',
  views INT DEFAULT 0,
  orders INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES service_providers(id)
);
```

#### service_requests
```sql
CREATE TABLE service_requests (
  id VARCHAR(36) PRIMARY KEY,
  service_id VARCHAR(36) NOT NULL,
  client_id VARCHAR(36) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(10,2),
  deadline DATE,
  status ENUM('open', 'in_review', 'accepted', 'rejected', 'completed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (client_id) REFERENCES users(id)
);
```

#### service_proposals
```sql
CREATE TABLE service_proposals (
  id VARCHAR(36) PRIMARY KEY,
  request_id VARCHAR(36) NOT NULL,
  provider_id VARCHAR(36) NOT NULL,
  proposed_price DECIMAL(10,2) NOT NULL,
  proposed_delivery DATE NOT NULL,
  cover_letter TEXT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id),
  FOREIGN KEY (provider_id) REFERENCES service_providers(id)
);
```

#### service_projects
```sql
CREATE TABLE service_projects (
  id VARCHAR(36) PRIMARY KEY,
  service_id VARCHAR(36) NOT NULL,
  request_id VARCHAR(36),
  proposal_id VARCHAR(36),
  client_id VARCHAR(36) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  provider_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'in_progress', 'in_review', 'completed', 'cancelled') DEFAULT 'pending',
  agreed_price DECIMAL(10,2) NOT NULL,
  escrow_amount DECIMAL(10,2) NOT NULL,
  milestones JSON,
  start_date DATE,
  deadline DATE,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (request_id) REFERENCES service_requests(id),
  FOREIGN KEY (proposal_id) REFERENCES service_proposals(id),
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (provider_id) REFERENCES service_providers(id)
);
```

#### service_reviews
```sql
CREATE TABLE service_reviews (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  service_id VARCHAR(36) NOT NULL,
  reviewer_id VARCHAR(36) NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES service_projects(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);
```

#### bulk_listings
```sql
CREATE TABLE bulk_listings (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  listing_type ENUM('retail', 'bulk', 'both') NOT NULL,
  min_order_quantity INT NOT NULL,
  tiered_pricing JSON NOT NULL,
  available_quantity INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  incoterms VARCHAR(50) NOT NULL,
  lead_time INT NOT NULL,
  sample_available BOOLEAN DEFAULT FALSE,
  sample_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES inventory(id)
);
```

#### rfq (Request for Quote)
```sql
CREATE TABLE rfq (
  id VARCHAR(36) PRIMARY KEY,
  buyer_id VARCHAR(36) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  budget DECIMAL(10,2),
  delivery_deadline DATE,
  delivery_location VARCHAR(255) NOT NULL,
  specifications TEXT NOT NULL,
  status ENUM('open', 'quoted', 'negotiating', 'accepted', 'rejected', 'expired') DEFAULT 'open',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES inventory(id)
);
```

#### rfq_quotes
```sql
CREATE TABLE rfq_quotes (
  id VARCHAR(36) PRIMARY KEY,
  rfq_id VARCHAR(36) NOT NULL,
  seller_id VARCHAR(36) NOT NULL,
  seller_name VARCHAR(255) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  delivery_time INT NOT NULL,
  payment_terms VARCHAR(255) NOT NULL,
  valid_until DATE NOT NULL,
  notes TEXT,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rfq_id) REFERENCES rfq(id),
  FOREIGN KEY (seller_id) REFERENCES users(id)
);
```

#### bulk_orders
```sql
CREATE TABLE bulk_orders (
  id VARCHAR(36) PRIMARY KEY,
  rfq_id VARCHAR(36),
  quote_id VARCHAR(36),
  buyer_id VARCHAR(36) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  seller_id VARCHAR(36) NOT NULL,
  seller_name VARCHAR(255) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'partial_shipment', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
  delivery_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rfq_id) REFERENCES rfq(id),
  FOREIGN KEY (quote_id) REFERENCES rfq_quotes(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES inventory(id)
);
```

#### bulk_shipments
```sql
CREATE TABLE bulk_shipments (
  id VARCHAR(36) PRIMARY KEY,
  bulk_order_id VARCHAR(36) NOT NULL,
  tracking_number VARCHAR(255) NOT NULL,
  carrier VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  shipped_date DATE NOT NULL,
  estimated_delivery DATE NOT NULL,
  actual_delivery DATE,
  status ENUM('pending', 'in_transit', 'delivered') DEFAULT 'pending',
  FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id)
);
```

#### business_verification
```sql
CREATE TABLE business_verification (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  business_type ENUM('importer', 'manufacturer', 'wholesaler', 'cooperative') NOT NULL,
  business_license VARCHAR(100) NOT NULL,
  tax_id VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  documents JSON,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Existing Table Updates

#### inventory
```sql
ALTER TABLE inventory 
ADD COLUMN posted_by ENUM('vendorbridge', 'vendor') DEFAULT 'vendorbridge',
ADD COLUMN approval_status ENUM('draft', 'pending_review', 'approved', 'rejected') DEFAULT 'approved',
ADD COLUMN listing_type ENUM('retail', 'bulk', 'both') DEFAULT 'retail';
```

---

## API Endpoints

### Authentication (Existing)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Seller Applications
- `POST /seller-applications` - Create seller application
- `GET /seller-applications` - List all applications (admin)
- `GET /seller-applications/:id` - Get single application
- `PUT /seller-applications/:id` - Update application (approve/reject)
- `DELETE /seller-applications/:id` - Delete application
- `GET /seller-applications/my` - Get my application

### Reseller Applications
- `POST /reseller-applications` - Create reseller application
- `GET /reseller-applications` - List all applications (admin)
- `GET /reseller-applications/:id` - Get single application
- `PUT /reseller-applications/:id` - Update application (approve/reject, set commission)
- `GET /reseller-applications/my` - Get my application

### Reseller Profile
- `GET /resellers/me` - Get reseller profile
- `GET /resellers` - List all resellers (admin)
- `PUT /resellers/:id` - Update reseller profile

### Reseller Shares
- `POST /reseller-shares` - Create product share link
- `GET /reseller-shares` - List my shares
- `GET /reseller-shares/:id` - Get single share
- `DELETE /reseller-shares/:id` - Delete share
- `POST /reseller-shares/:id/click` - Track click on share link

### Reseller Analytics
- `GET /resellers/analytics` - Get reseller analytics (earnings, clicks, conversions)

### Reseller Payouts
- `POST /reseller-payouts` - Request payout
- `GET /reseller-payouts` - List payout history
- `GET /reseller-payouts/:id` - Get single payout

### Service Providers
- `POST /service-providers` - Create service provider profile
- `GET /service-providers/:id` - Get service provider
- `GET /service-providers/me` - Get my service provider profile
- `PUT /service-providers/:id` - Update service provider profile
- `GET /service-providers` - List service providers (with filters)

### Services
- `POST /services` - Create service listing
- `GET /services` - List services (with filters: category, status, search, price range, pricing_type, sort)
- `GET /services/:id` - Get single service
- `PUT /services/:id` - Update service
- `DELETE /services/:id` - Delete service
- `GET /services/my` - Get my services

### Service Requests
- `POST /service-requests` - Create service request
- `GET /service-requests` - List requests (with filters: service_id, client_id)
- `GET /service-requests/:id` - Get single request
- `GET /service-requests/my` - Get my requests (as client)

### Service Proposals
- `POST /service-proposals` - Create proposal
- `GET /service-proposals` - List proposals (with filters: request_id, provider_id)
- `GET /service-proposals/:id` - Get single proposal
- `PUT /service-proposals/:id` - Update proposal status (accept/reject)
- `GET /service-proposals/my` - Get my proposals (as provider)

### Service Projects
- `GET /service-projects` - List projects (with filters: client_id, provider_id)
- `GET /service-projects/:id` - Get single project
- `PUT /service-projects/:id` - Update project (status, milestones)
- `GET /service-projects/my` - Get my projects

### Service Reviews
- `POST /service-reviews` - Create review
- `GET /service-reviews` - List reviews (with filters: service_id, project_id)
- `GET /service-reviews/:id` - Get single review

### Bulk Listings
- `POST /bulk-listings` - Create bulk listing
- `GET /bulk-listings` - List bulk listings (with filters: listing_type, product_id, search)
- `GET /bulk-listings/:id` - Get single bulk listing
- `PUT /bulk-listings/:id` - Update bulk listing
- `DELETE /bulk-listings/:id` - Delete bulk listing
- `GET /bulk-listings/my` - Get my bulk listings

### RFQ (Request for Quote)
- `POST /rfq` - Create RFQ
- `GET /rfq` - List RFQs (with filters: buyer_id, status, search)
- `GET /rfq/:id` - Get single RFQ
- `PUT /rfq/:id` - Update RFQ (status, expires_at)
- `DELETE /rfq/:id` - Delete RFQ
- `GET /rfq/my` - Get my RFQs

### RFQ Quotes
- `POST /rfq-quotes` - Create quote
- `GET /rfq-quotes` - List quotes (with filters: rfq_id, seller_id)
- `GET /rfq-quotes/:id` - Get single quote
- `PUT /rfq-quotes/:id` - Update quote status (accept/reject)
- `GET /rfq-quotes/my` - Get my quotes

### Bulk Orders
- `POST /bulk-orders` - Create bulk order
- `GET /bulk-orders` - List bulk orders (with filters: buyer_id, seller_id, status)
- `GET /bulk-orders/:id` - Get single bulk order
- `PUT /bulk-orders/:id` - Update bulk order (status, payment_status)
- `GET /bulk-orders/my` - Get my bulk orders

### Business Verification
- `POST /business-verification` - Submit business verification
- `GET /business-verification` - List verifications (admin)
- `GET /business-verification/:id` - Get single verification
- `PUT /business-verification/:id` - Update verification (approve/reject)
- `GET /business-verification/my` - Get my verification

### Inventory Updates
- Update `POST /inventory` to accept `posted_by`, `approval_status`, and `listing_type` fields
- Update `PUT /inventory/:id` to allow updating `approval_status`

---

## Response Formats

### Standard Success Response
```json
{
  "data": { /* response data */ },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Standard Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error message"
}
```

---

## Authentication & Authorization

### Cookie Configuration
- Use httpOnly cookies for session management
- Set `SameSite` to `Strict` or `Lax`
- Enable secure flag in production (HTTPS)

### Role-Based Access Control (RBAC)
- `admin`: Full access to all endpoints
- `seller`: Access to seller-specific endpoints, create/update own products
- `reseller`: Access to reseller-specific endpoints
- `service_provider`: Access to service provider endpoints
- `bulk_buyer`: Access to bulk buying features
- `buyer`: Standard buyer access
- `contributor`: Legacy role (can be deprecated)

---

## File Upload Requirements

### Image Uploads
- Accept: JPG, PNG, WEBP
- Max size: 5MB per image
- Store in: Cloud storage (AWS S3, Cloudinary, or local with CDN)
- Return: Public URL of uploaded file

### Document Uploads
- Accept: PDF, JPG, PNG
- Max size: 10MB per document
- Store: Secure storage with access control

---

## Commission Tracking Logic

### Attribution Window
- Cookie-based tracking with 30-day attribution window
- Store `reseller_id` in cookie when user clicks reseller link

### Commission Calculation
- Commission rates: 5-15% based on product category
- Higher commissions for VendorBridge-curated products
- Performance bonuses for top resellers (to be implemented later)

### Payout Processing
- Minimum payout threshold: $50
- Processing time: Weekly
- Payment methods: Bank transfer, mobile money

---

## Open Graph Image Generation

### Dynamic OG Images
- Generate images on-the-fly using canvas or image processing library
- Overlay caption text on product image
- Add VendorBridge branding
- Include price and "Shop Now" CTA
- Cache generated images for performance

### Meta Tags
- `og:title`: Product name + custom caption
- `og:description`: Product description
- `og:image`: Dynamically generated image URL
- `og:url`: Full tracking link with reseller ID

---

## Security Requirements

### Rate Limiting
- Implement rate limiting on all API endpoints
- Suggested limits:
  - Auth endpoints: 5 requests per minute
  - Public endpoints: 100 requests per minute
  - Authenticated endpoints: 200 requests per minute

### CSRF Protection
- Implement CSRF tokens for state-changing requests
- Validate CSRF token on POST, PUT, DELETE requests

### Input Validation
- Validate all input data using schemas matching frontend Zod schemas
- Sanitize user-generated content (descriptions, reviews, etc.)
- Prevent SQL injection (use parameterized queries)

### Security Headers
- Set appropriate security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security` (in production)

---

## Environment Variables

Create `.env` file with:
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/vendorbridge
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=vendorbridge-uploads
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

---

## Technology Stack Recommendations

### Backend Framework
- Node.js with Express.js or Fastify
- OR
- Python with FastAPI or Django REST Framework
- OR
- Go with Gin or Echo

### Database
- PostgreSQL (recommended) or MySQL
- Redis for caching and session storage

### File Storage
- AWS S3 or Cloudinary for images
- Local storage with CDN for development

### Authentication
- JWT with httpOnly cookies
- Passport.js or custom middleware

### Validation
- Joi or Zod (matching frontend schemas)

### Documentation
- Swagger/OpenAPI for API documentation

---

## Testing Requirements

### Unit Tests
- Test all API endpoints
- Test business logic (commission calculation, etc.)
- Test validation schemas

### Integration Tests
- Test database operations
- Test authentication flows
- Test file uploads

### API Tests
- Test all endpoints with various inputs
- Test error handling
- Test rate limiting

---

## Deployment Checklist

- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up SSL certificate
- [ ] Configure CDN for images
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Load testing before launch
- [ ] Security audit

---

## Priority Order

### Phase 1 (Weeks 1-4) - Foundation
1. Database schema updates
2. Authentication & authorization updates
3. Seller application endpoints
4. Product approval workflow
5. Basic admin approval interfaces

### Phase 2 (Weeks 5-8) - Hybrid Selling
1. Seller portal endpoints
2. Product management for sellers
3. Trust badge logic
4. Seller profile endpoints

### Phase 3 (Weeks 9-12) - Bulk Selling
1. Bulk listing endpoints
2. RFQ system
3. Bulk order management
4. Business verification

### Phase 4 (Weeks 13-16) - Reseller Program
1. Reseller application endpoints
2. Commission tracking system
3. Link tracking and attribution
4. Payout management
5. OG image generation

### Phase 5 (Weeks 17-20) - Skills Marketplace
1. Service provider endpoints
2. Service CRUD operations
3. Service request/proposal system
4. Project management
5. Reviews and ratings

---

## Notes for Backend Team

- The frontend expects all responses to follow the standard format shown above
- All dates should be in ISO 8601 format
- All monetary values should be in decimal format (2 decimal places)
- Pagination: Use `page` and `limit` query parameters
- Sorting: Use `sort` and `order` query parameters
- Search: Use `search` query parameter for text search
- Filters: Use field-specific query parameters (e.g., `status`, `category`)
- File uploads should return the public URL of the uploaded file
- Implement proper error handling with meaningful error messages
- Log all errors for debugging
- Use transaction for multi-step operations

---

**Document Version**: 1.0  
**Last Updated**: June 23, 2026  
**Frontend Progress**: 17% complete (Phase 1-2 mostly done)
