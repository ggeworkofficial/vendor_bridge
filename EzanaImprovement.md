Admin Dashboard Refactoring and Modularization(*)
Problem
The current implementation of src/pages/AdminDashboard.tsx contains approximately 3,211 lines of code and includes all administrative functionality inside a single file.
The file currently contains multiple independent sections, including but not limited to:
	• Dashboard Overview
	• Inventory Management
	• Category Management
	• Seller Management
	• Logistics Management
	• Order Management
	• Receipt Management
	• User-related Administration
	• Additional Admin Features
	
Required Refactor
The Admin Dashboard should be modularized into dedicated components.
Suggested structure:
src/
└── pages/
    └── AdminDashboard/
        ├── index.tsx
        ├── DashboardSection.tsx
        ├── InventorySection.tsx
        ├── CategorySection.tsx
        ├── SellerSection.tsx
        ├── LogisticsSection.tsx
        ├── OrdersSection.tsx
        ├── ReceiptsSection.tsx
        ├── UsersSection.tsx

Make sure to double check just in case I forgot some admin features.

The new index.tsx file should act as the container and orchestrator for the dashboard, while each administrative module should be moved into its own dedicated component file.
Requirements
	• Preserve all existing functionality.
	
	• 
This refactor should be considered a high-priority architectural improvement before continuing major frontend-backend integration work because its going to be really hard for you to modify or read anything if the file remains unmodularized.

Receipt Creation Integration
Current Status
Order creation has already been implemented.
The checkout flow successfully:
	• Creates an order
	• Sends cart products
	• Sends payment method
	• Sends delivery address
After successful order creation, the newly created order ID is available from the response.
No additional work is required for order creation.

Remaining Work
Implement receipt creation after the order is successfully created.
The order ID returned from the order creation response should be used as:
order_id
when creating the receipt.

Backend Validation
Receipt validator:
{
  order_id: uuid,
  account?: string,
  note?: string
}
Route:
POST /receipts
Upload middleware:
upload.array("images", 1)
Image field name:
images
Maximum images:
1

Frontend Requirements
The checkout page should allow the user to provide:
Required
	• Receipt Image
Optional
	• Account
	• Note
The image is mandatory.
Account and note are optional.

Receipt Creation Flow
After order creation succeeds:
	1. Retrieve the created order ID.
	2. Build FormData.
	3. Append:
		○ order_id
		○ account (if provided)
		○ note (if provided)
		○ images
	4. Call the existing receipt creation API.
Example fields:
order_id
account
note
images
The uploaded image must use the field name:
images
and only one image should be uploaded.

Success Behavior
After both order creation and receipt creation succeed:
	• Clear cart
	• Show success notification
	• Redirect user to Orders page

Failure Behavior
If receipt creation fails:
	• Show error notification
	• Do not clear cart
	• Do not redirect
The checkout process should only be considered complete when both operations succeed.


Complaint & Complaint Message Integration
Overview
We need to implement the complaint system and complaint message system on both the admin side and customer side.
This requires:
	• API integration
	• Zustand stores
	• Type definitions
	• UI integration
Create the necessary files under:
	• src/api
	• src/features
	• src/types

Backend Structure
Complaint and Complaint Message share the same route.
Base route:
/complaints
Routes:
Complaints
POST /complaints
GET /complaints
GET /complaints/:id
PUT /complaints/:id

Complaint Messages
GET /complaints/messages
GET /complaints/messages/:id
POST /complaints/messages

Admin Side
Location:
src/pages/AdminDashboard/OrderSection.tsx

Order Complaints Button
Inside the orders table, add a new button next to the Eye/View button.
Example:
View Order | Complaints
When clicked:
Load complaints for the selected order.
Use:
GET /complaints
Required query parameter:
order_id

Complaint List
Display all complaints returned for the selected order.
Each complaint should show:
	• Subject
	• Description
	• Status
	• Priority
	• Created Date
When a complaint is selected:
Load its conversation.

Complaint Conversation
Use:
GET /complaints/messages
Required query parameter:
complaint_id
Display all complaint messages as a conversation/thread.
Each message contains:
	• Sender Name
	• Sender Role
	• Message
	• Created At
Treat complaint messages as chat history attached to a complaint.

Complaint Editing
Support updating complaints.
Use:
PUT /complaints/:id
Editable fields:
	• subject
	• description
	• status
	• priority
Follow backend validation exactly.

Complaint Message Creation
Admins should be able to send replies.
Use:
POST /complaints/messages
Body:
{
  "complaint_id": "uuid",
  "message": "reply text"
}
Messages are immutable.
Do NOT implement edit or delete for complaint messages.
Only creation is supported.

Customer Side
Location:
src/pages/Orders.tsx

Create Complaint
Each order should have a button:
Create Complaint
When clicked:
Open a dialog/form.
Use:
POST /complaints
Body:
{
  "order_id": "uuid",
  "subject": "Complaint subject",
  "description": "Complaint description"
}
Follow backend validation exactly.

View Complaints
Each order should also have:
View Complaints
When clicked:
Load all complaints belonging to that order.
Use:
GET /complaints
Query:
order_id

View Complaint Messages
When a complaint is selected:
Load all messages for that complaint.
Use:
GET /complaints/messages
Query:
complaint_id
Display them as a conversation thread.

Send Complaint Reply
Customers should be able to send new messages to an existing complaint.
Use:
POST /complaints/messages
Body:
{
  "complaint_id": "uuid",
  "message": "reply text"
}
Messages are immutable.
No edit.
No delete.

Backend Validation
Complaint Creation
{
  "order_id": "uuid",
  "subject": "string",
  "description": "string"
}
Complaint Update
{
  "subject": "string?",
  "description": "string?",
  "status": "open | investigating | resolved",
  "priority": "low | medium | high"
}
At least one field must be provided.

Complaint Message Creation
{
  "complaint_id": "uuid",
  "message": "string"
}
Message is required.

Complaint Response Types
Complaint List Response
GET /complaints
{
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "user-id",
        "full_name": "Test User"
      },
      "subject": "Complaint subject",
      "description": "Complaint description",
      "status": "resolved",
      "priority": "medium",
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
Single Complaint Response
GET /complaints/:id
{
  "id": "uuid",
  "user": {
    "id": "user-id",
    "full_name": "Test User"
  },
  "subject": "Complaint subject",
  "description": "Complaint description",
  "status": "open",
  "priority": "medium",
  "created_at": "...",
  "updated_at": "..."
}

Complaint Message Response Types
Complaint Message List Response
GET /complaints/messages
{
  "data": [
    {
      "id": "uuid",
      "sender": {
        "id": "user-id",
        "full_name": "Ezana Tadesse",
        "role": "admin"
      },
      "message": "Message content",
      "created_at": "..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
Single Complaint Message Response
GET /complaints/messages/:id
{
  "id": "uuid",
  "sender": {
    "id": "user-id",
    "full_name": "Ezana Tadesse",
    "role": "admin"
  },
  "message": "Message content",
  "created_at": "..."
}

Pagination
Both complaints and complaint messages support pagination.
Always pass:
	• page
	• limit
For complaint messages, use a larger default limit such as:
limit: 100
The backend supports pagination, but conversations are typically small enough that loading up to 100 messages at once provides a better chat-like experience.

Required Frontend Files
Create:
	• src/api/complaint.api.ts
	• src/api/complaint-message.api.ts
Create Zustand stores:
	• src/features/complaint.store.ts
	• src/features/complaint-message.store.ts
Create types:
	• src/types/complaint.ts
	• src/types/complaint-message.ts
Follow the same architecture already used by:
	• order.api.ts
	• receipt.api.ts
	• seller.api.ts
and their corresponding Zustand stores.
Use React Query for all server communication and invalidate queries after successful creates and updates.


Product Image Viewer Integration (Admin ProductSection)
Goal
Add product image viewing functionality inside:
src/pages/AdminSection/ProductSection.tsx
When an admin clicks:
	• Eye (view product)
	• Edit (edit product)
A dialog opens.
Inside that dialog, add a new button:
View Images
This button loads and displays all images for the selected product.

Backend Overview
Base Route
/product-images

Endpoints
Get all images for a product
GET /product-images?product_id=uuid
Returns:
[
  {
    "id": "uuid",
    "product_id": "uuid",
    "image_url": "http://localhost:5000/uploads/image.jpg",
    "is_primary": true,
    "created_at": "...",
    "updated_at": "...",
    "image_name": "file.jpg"
  }
]

Get single image
GET /product-images/:id
Returns:
{
  "id": "uuid",
  "product_id": "uuid",
  "image_url": "...",
  "is_primary": true,
  "created_at": "...",
  "updated_at": "...",
  "image_name": "file.jpg"
}

Validation Rules (IMPORTANT)
Get Images Query
{
  product_id: uuid (required)
}

Create Product Image
{
  product_id: uuid,
  is_primary: boolean (default false)
}
NOTE:
	• Uses multipart/form-data
	• Field name for file upload is:
images
Only 1 image allowed.

Update Product Image
{
  is_primary?: boolean
}

Frontend Requirements
Location
src/pages/AdminSection/ProductSection.tsx

UI CHANGE
Inside product detail dialog:
Add button:
View Images

Behavior
When clicked:
	1. Call:
GET /product-images?product_id=PRODUCT_ID
	1. Store result in local state or Zustand (recommended if already used elsewhere)
	2. Open image viewer dialog

Image Viewer Dialog
Display:
	• Grid or list of images
	• Each image shows:
		○ image preview (image_url)
		○ image_name
		○ is_primary badge

Optional Actions (Admin)
If admin functionality exists in UI:
Set Primary Image
Call:
PUT /product-images/:id
Body:
{
  "is_primary": true
}
After success:
	• refresh image list

Delete Image (if UI supports it)
Call:
DELETE /product-images/:id
Then refetch list.

Frontend Files to Create (IF NEEDED)
API
src/api/product-image.api.ts
Implement:
	• getProductImages(product_id)
	• getProductImage(id)
	• updateProductImage(id, body)
	• deleteProductImage(id)
Follow same pattern as:
	• inventory.api.ts
	• order.api.ts

Zustand Store (optional but recommended if consistent with project)
src/features/product-image.store.ts
State:
	• images: ProductImage[]
	• selectedImage: ProductImage | null
Methods:
	• setImages()
	• setSelectedImage()
	• clearImages()

Type Definition
Create:
src/types/product-image.ts
export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_name: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

React Query Rules
	• Use React Query for fetching images
	• Invalidate query after update/delete
	• Do NOT manually refetch unless necessary
	• Follow same pattern as inventory section

Key Rules
	• Do NOT modify existing ProductSection structure
	• Do NOT duplicate product API logic
	• Do NOT add pagination (not required)
	• Do NOT over-engineer store unless project already uses Zustand here
	• Keep UI minimal and consistent with existing dialogs

Summary
You are adding:
	• "View Images" button inside product dialog
	• API integration for product images
	• Simple image viewer UI
	• Optional admin actions (set primary, delete)
	• Clean TypeScript types
No backend changes required.
Only frontend integration.


Product Reviews UI Integration (ProductDetails.tsx + Admin Inventory Section)

1. Goal
Make the reviews count text clickable in:
src/pages/ProductDetails.tsx
When clicked:
	• Open Reviews Modal/Dialog
	• Fetch reviews from backend using product_id
	• Display paginated reviews
	• ALSO allow users to CREATE a review from the same modal

2. Backend Endpoint (GET REVIEWS)
GET /reviews
Required Query Param:
	• product_id (required)

3. Query Rules (STRICT — FOLLOW BACKEND VALIDATION)
Request Shape:
	• product_id: required
	• page: default 1
	• limit: default 10 (max 100)
	• include_empty_comments: MUST remain false
	• search: optional
	• sort: "rating" | "created_at" (default: created_at)
	• order: "asc" | "desc" (default: desc)

IMPORTANT RULE
	• DO NOT override include_empty_comments
	• MUST remain false
	• DO NOT show empty-comment reviews unless backend explicitly includes them

4. Response Shape (LIST)
{
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "string"
      },
      "rating": 1-5,
      "comment": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}

5. SINGLE REVIEW RESPONSE
{
  "id": "uuid",
  "product": {
    "id": "uuid",
    "name": "string"
  },
  "user": {
    "id": "uuid",
    "name": "string"
  },
  "rating": 1-5,
  "comment": "string",
  "created_at": "date",
  "updated_at": "date"
}

6. UI BEHAVIOR (ProductDetails.tsx)
On Click of Review Text:
Example:
0 (0 reviews)
Action:
	1. Open modal/dialog
	2. Fetch reviews using product_id
	3. Display list of reviews
	4. ALSO show “Create Review” form inside modal

7. CREATE REVIEW (NEW FEATURE)
Backend Validation:
{
  product_id: string (uuid),
  rating: number (1–5),
  comment?: string
}

Create Review Endpoint:
POST /reviews

UI REQUIREMENT:
Inside Reviews Modal:
	• Add “Write Review” section
	• Fields:
		○ rating (1–5 stars)
		○ comment (optional)
	• Submit button: “Submit Review”

IMPORTANT RULES:
	• Users can ONLY create reviews
	• No edit/delete for users
	• comment is OPTIONAL
	• rating is REQUIRED

8. REVIEW ITEM UI
Each review must show:
	• user.name
	• rating (stars 1–5)
	• comment (ONLY if exists)
	• created_at

9. PAGINATION
Backend-controlled:
	• page
	• limit
Default:
	• page = 1
	• limit = 10
UI Options:
	• infinite scroll (preferred)
OR
	• load more button

10. SORTING (OPTIONAL)
	• sort: rating | created_at
	• order: asc | desc
Default:
	• created_at desc

11. REQUIRED FRONTEND FILES
API FILE:
src/api/review.api.ts
Must implement:
	• getReviews(product_id, params)
	• createReview(payload)

OPTIONAL STORE:
src/features/review.store.ts
State:
	• reviews
	• selectedProductReviews
	• loading
	• creatingReviewState

12. ADMIN PANEL EXTENSION (IMPORTANT)
Location:
src/pages/AdminDashboard/InventorySection.tsx

NEW BUTTON:
Add next to Eye button:
👁 View Reviews

ADMIN REVIEW VIEW:
On click:
	• Fetch reviews for product_id
	• Show modal/dialog

ADMIN CAPABILITIES:
Admins can:
	• View all reviews
	• DELETE reviews

ADMIN DELETE RULE:
	• Only allowed in InventorySection
	• NOT allowed for users
	• Must call:
DELETE /reviews/:id
or existing backend route

13. USER VS ADMIN RULES
USERS CAN:
	• Create reviews
	• View reviews
	• Cannot delete
	• Cannot edit

ADMINS CAN:
	• View all reviews (InventorySection)
	• Delete reviews (InventorySection only)

14. REACT QUERY RULES
	• Cache by product_id
	• Refetch when:
		○ review created
		○ review deleted (admin)
		○ review updated (if ever supported later)

15. MODAL FLOW
	1. Click review text OR admin button
	2. Open modal
	3. Fetch reviews
	4. Show list
	5. Allow:
		○ create review (user)
		○ delete review (admin)
	6. pagination / load more

16. STRICT CONSTRAINTS
DO NOT:
	• show empty comment reviews unless backend allows it
	• override include_empty_comments
	• fetch without product_id
	• allow user deletion
	• mix admin/user review logic
	• hardcode reviews

RESULT
After implementation:
	• Reviews become interactive
	• Users can create reviews
	• Admin can delete reviews
	• Fully backend-driven
	• Proper pagination
	• Clean modal UX

UI Dialog System Refactor (Admin + Profile Pages)
Problem
The current UI dialogs in the project (AdminDashboard sections + Profile page) are inconsistent, poorly structured, and duplicated across multiple files.
This results in:
	• inconsistent layout and spacing
	• duplicated dialog implementations per feature
	• poor visual hierarchy
	• unmaintainable UI patterns
We need to introduce a unified dialog system and refactor all existing dialogs to use it.

Goal
Create a reusable, standardized dialog system and refactor all existing dialogs in:
	• AdminDashboard sections (Orders, Inventory, Seller, Complaints, Receipts, etc.)
	• Profile.tsx
so they all follow the same UI structure and behavior.

1. Create Shared Dialog System
Create the following folder:
src/components/ui/app-dialog/
Inside it, implement reusable components:
BaseDialog.tsx
A universal dialog wrapper that handles:
	• layout structure
	• padding
	• width consistency
	• overlay behavior
	• animation consistency
All dialogs MUST use this component.

DialogHeader.tsx
Standard header component:
	• title (required)
	• subtitle (optional)
	• close button

DialogFooter.tsx
Standard footer component:
	• primary action button (Save / Confirm)
	• secondary action button (Cancel)

DialogSection.tsx
Used to structure content inside dialogs:
	• groups related fields
	• consistent spacing
	• consistent typography

2. UI Standard Rules (IMPORTANT)
All dialogs must follow these rules:
Layout Rules
	• Always use BaseDialog
	• Always use DialogHeader + DialogFooter
	• Never implement custom dialog layouts per page
Field Layout Rules
Each field must follow:
Label
Value/Input
NOT inline label-value formatting.
Spacing Rules
	• Use consistent vertical spacing (gap-4 or gap-6)
	• No random margins or ad-hoc spacing

3. Refactor Existing Admin Dialogs
All existing dialogs inside AdminDashboard must be updated to use the new system:
	• Orders view/edit dialog
	• Inventory view/edit dialog
	• Seller view/edit dialog
	• Complaint dialogs
	• Receipt dialogs
No exceptions.
Each dialog must:
	• use BaseDialog
	• use DialogHeader and DialogFooter
	• use DialogSection for grouping
	• follow consistent layout rules

4. Fix Profile.tsx UI
Profile.tsx must also be refactored to follow the same UI system.
Required changes:
	• remove inconsistent layouts
	• use structured sections (similar to DialogSection)
	• standardize spacing and typography
	• align UI style with Admin dialogs

5. Standard UI Structure (MANDATORY PATTERN)
All dialogs should follow this structure:
Header
Section 1 (Core Info)
Section 2 (Details)
Section 3 (Actions)
Footer

6. Key Principle
This is NOT a per-dialog fix.
This is a system-level UI standardization change.
Do NOT:
	• duplicate dialog logic per feature
	• create custom layouts for each page
	• mix old + new dialog styles
DO:
	• build one reusable system
	• enforce it everywhere

Expected Result
After implementation:
	• All dialogs across Admin + Profile pages look consistent
	• UI becomes structured and predictable
	• No duplicated dialog code
	• Future features automatically follow correct design system
