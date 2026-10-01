# SilvyOS — Digital Restaurant Menu Platform
## Product Requirements, Development Plan & AI Build Instructions

**Document version:** 1.0  
**Product status:** Pre-MVP  
**Company:** SilvyOS  
**Primary market:** Restaurants, cafés, bakeries and similar food businesses  
**Initial objective:** Build and validate a digital menu platform that provides restaurants with a QR-based menu, rich food presentation, customer feedback and basic analytics, with optional 3D/AR dish visualization.

---

# 1. Product Vision

SilvyOS should become a **digital dining experience platform**, not merely a QR-code menu generator.

The initial product must solve three practical problems:

1. Restaurants need a menu that is easy to update without reprinting.
2. Customers need better information about dishes before ordering, including appearance, ingredients, portion information and language.
3. Restaurant owners need basic information about which dishes customers are actually interested in.

3D/AR is a differentiating feature, but it must **not be the sole reason the product is valuable**.

The platform must remain useful if a restaurant chooses not to use 3D/AR.

---

# 2. Core Product Principles

The development AI MUST follow these principles:

### 2.1 Customer-first
The customer-facing menu must be extremely fast and simple.

A customer should be able to:

**Scan QR → Menu opens → Select category → View dish → Understand dish → Continue browsing**

Do not force customers to create an account.

### 2.2 Restaurant-owner simplicity
Restaurant staff should be able to update:
- Dish name
- Price
- Description
- Photo
- Category
- Availability
- Ingredients/allergens
- Portion information
- Languages

without technical knowledge.

### 2.3 Mobile-first
Most customers will access the menu from a phone.

Design for mobile first, then tablet and desktop.

### 2.4 Performance over visual complexity
Do not sacrifice loading speed for animations, 3D effects or excessive UI decoration.

### 2.5 AR is optional
Every dish must work without AR.

AR should enhance the menu, not block access to it.

### 2.6 Multi-tenant architecture
The system must support multiple restaurants from the beginning.

Restaurant A must never be able to access Restaurant B's data.

---

# 3. MVP Scope

The first production MVP MUST contain the following:

## Customer-facing

- QR digital menu
- Restaurant branding
- Menu categories
- Dish cards
- Dish detail pages/modals
- Food photos
- Optional 3D model
- Optional AR experience
- Price display
- Description
- Ingredients
- Allergens
- Portion/size information
- Vegetarian/non-vegetarian/other dietary labels
- Availability status
- Multi-language menu
- Responsive mobile UI
- Feedback submission

## Restaurant dashboard

- Secure login
- Restaurant profile
- Menu category management
- Dish CRUD
- Photo upload
- 3D model upload
- AR enable/disable
- Language management
- Availability toggle
- QR generation
- Basic analytics
- Feedback management

## Analytics

Track at minimum:

- Menu opens
- Unique visitors/session count
- Category views
- Dish views
- Most viewed dishes
- QR scans
- Language selected
- AR launches
- Feedback submissions

Avoid collecting unnecessary personal information.

---

# 4. Explicitly OUT OF SCOPE for MVP

Do NOT build these in the first version unless specifically requested later:

- Online food ordering
- Payment gateway
- Table booking
- POS integration
- Kitchen management
- Delivery system
- Loyalty program
- Customer accounts
- Complex CRM
- AI chatbot
- Inventory management
- Automated 3D generation
- Native iOS app
- Native Android app
- Full restaurant ERP
- Advanced recommendation engine

These may be considered after product validation.

---

# 5. User Types

## 5.1 Customer

The customer scans a QR code and views the restaurant menu.

Customer does not need an account.

Primary goals:
- Quickly understand the menu
- See what a dish looks like
- Understand portion/size
- Check price
- Check ingredients/allergens
- Change language
- Optionally view a dish in AR
- Submit feedback

## 5.2 Restaurant Owner/Admin

Primary goals:
- Create and manage menu
- Update prices and availability
- Upload photos
- Add optional 3D models
- Manage translations
- Generate QR codes
- View analytics
- Read customer feedback

## 5.3 SilvyOS Super Admin

For internal management.

Capabilities:
- Manage restaurants
- Activate/deactivate restaurants
- View platform-level metrics
- Manage subscriptions later
- Support restaurants
- Audit system activity

---

# 6. Customer User Flow

## Standard flow

1. Customer scans QR.
2. Restaurant menu opens.
3. Restaurant logo/name is displayed.
4. Customer sees menu categories.
5. Customer selects a category.
6. Customer sees dishes.
7. Customer opens a dish.
8. Customer sees:
   - Photo
   - Name
   - Price
   - Description
   - Portion
   - Ingredients
   - Allergens
   - Dietary labels
   - 3D/AR button if available
9. Customer optionally launches AR.
10. Customer continues browsing.
11. Customer optionally submits feedback.

## Important UX rule

Do not require:
- App installation
- Customer registration
- Phone number
- Email

to view the menu.

---

# 7. Restaurant Dashboard

The dashboard should have the following sections:

### Dashboard
- Total menu views
- Unique visitors
- Top dishes
- QR scans
- AR interactions
- Feedback count

### Menu
- Categories
- Dishes
- Search
- Availability
- Ordering/sorting

### Restaurant Profile
- Name
- Logo
- Address
- Contact information
- Opening hours
- Currency
- Default language
- Supported languages
- Theme/branding

### Media
- Food photos
- 3D models

### QR Codes
- Generate QR
- Download QR
- Regenerate QR if necessary
- QR identifier

### Feedback
- Rating
- Comments
- Date
- Dish if feedback is dish-specific

### Analytics
- Date range
- Views
- Popular dishes
- Popular categories
- Language usage
- AR usage

---

# 8. Menu Data Model

Use a relational database.

Suggested entities:

## restaurants

- id
- name
- slug
- logo_url
- description
- address
- phone
- email
- default_language
- currency
- status
- created_at
- updated_at

## users

- id
- restaurant_id
- name
- email
- password_hash / authentication provider
- role
- status
- created_at
- updated_at

Roles:
- restaurant_admin
- restaurant_staff
- super_admin

## categories

- id
- restaurant_id
- name
- description
- display_order
- is_active
- created_at
- updated_at

## dishes

- id
- restaurant_id
- category_id
- name
- description
- price
- portion
- ingredients
- allergens
- dietary_type
- image_url
- model_3d_url
- ar_enabled
- is_available
- display_order
- created_at
- updated_at

## dish_translations

- id
- dish_id
- language_code
- name
- description
- ingredients
- allergens
- portion

## category_translations

- id
- category_id
- language_code
- name
- description

## restaurant_translations

- id
- restaurant_id
- language_code
- description

## qr_codes

- id
- restaurant_id
- identifier
- destination_url
- status
- created_at

## feedback

- id
- restaurant_id
- dish_id nullable
- rating
- comment
- language_code
- created_at

## analytics_events

- id
- restaurant_id
- dish_id nullable
- category_id nullable
- event_type
- session_id
- language_code
- metadata
- created_at

---

# 9. Multi-Tenant Security

This is critical.

Every restaurant-owned database record must contain a restaurant identifier where appropriate.

Every authenticated dashboard request must verify:

**authenticated user → restaurant_id → requested resource**

Never trust a restaurant_id supplied by the frontend.

Do not allow:

`Restaurant A user → Restaurant B data`

Implement server-side authorization checks.

Use:
- parameterized queries/ORM
- secure password hashing
- HTTP-only secure cookies where applicable
- CSRF protection where applicable
- rate limiting
- input validation
- file type validation
- file size limits
- secure upload handling
- audit logging for important admin actions

Never store plaintext passwords.

---

# 10. 3D / AR Strategy

## Important architectural decision

Do NOT make customers depend on iPhone LiDAR.

LiDAR is useful for **capturing/scanning or creating 3D assets**, but customers should ideally be able to view the result using supported browser/device AR capabilities.

The platform should support:

- Standard 3D viewer
- AR where the customer's device/browser supports it
- Normal photo fallback

## Asset pipeline

Initial workflow:

1. Restaurant provides food item.
2. SilvyOS creates or obtains 3D model.
3. Model is optimized.
4. Model is uploaded.
5. Restaurant associates model with a dish.
6. Customer sees "View in 3D" / "View in AR".
7. Unsupported devices receive a normal 3D viewer or photo.

## Model requirements

Prefer optimized web-friendly formats such as:

- GLB/glTF

Do not upload unnecessarily huge models.

Target:
- optimized geometry
- compressed textures
- reasonable polygon count
- mobile-friendly texture sizes

The system must validate uploaded model types and size.

---

# 11. AR UX

The AR button should appear only when:
- A valid 3D model exists.
- AR is enabled for the dish.

Example:

**View Dish in AR**

If unsupported:

**View in 3D**

If 3D is unavailable:

Show the normal food photo.

Never make AR a dead-end.

---

# 12. Multi-Language System

The architecture must support multiple languages from the beginning.

Do NOT create separate hardcoded menu pages for each language.

Use language codes, for example:

- en
- hi
- mr

The restaurant chooses supported languages.

Customer can select language from the menu.

Default language should be detected from the restaurant configuration, not blindly from browser language.

If a translation does not exist:

Fallback to the restaurant's default language.

Do not machine-translate silently and present it as verified restaurant content.

---

# 13. Menu Editing

Restaurant staff should be able to:

### Create category
- Name
- Description
- Display order

### Create dish
- Name
- Description
- Price
- Portion
- Ingredients
- Allergens
- Dietary type
- Image
- 3D model
- Availability

### Update dish

Changes should appear on the public menu without requiring a new QR code.

This is a major selling point.

---

# 14. QR System

Each restaurant should have a stable public menu URL.

Example concept:

`https://menu.silvyos.com/r/{restaurant-slug}`

The exact domain can be decided during implementation.

The QR code points to the stable URL.

Therefore:

**Changing the menu must NOT require printing a new QR code.**

Generate downloadable:
- PNG
- SVG

where practical.

---

# 15. Analytics Design

Analytics must answer useful business questions.

## Required events

### menu_view
Customer opened menu.

### category_view
Customer opened a category.

### dish_view
Customer viewed a dish.

### ar_launch
Customer launched AR.

### model_3d_view
Customer viewed 3D.

### language_change
Customer changed language.

### feedback_submit
Customer submitted feedback.

## Dashboard metrics

Display:

- Total menu views
- Unique sessions
- Top 10 dishes
- Top categories
- AR usage
- 3D usage
- Language distribution
- Feedback rating
- Feedback volume

Avoid claiming that analytics directly increased revenue unless actual ordering/revenue data is integrated later.

---

# 16. Feedback System

Keep it simple initially.

Customer can submit:

- Rating: 1–5
- Optional comment
- Optional dish association

Avoid forcing login.

Add basic anti-spam controls:
- rate limiting
- session/device throttling
- moderation capability for restaurant admin

Restaurant dashboard:

- Average rating
- Recent feedback
- Rating distribution
- Filter by dish/date

---

# 17. Design Requirements

The interface should feel:

- Premium
- Clean
- Food-focused
- Fast
- Modern
- Mobile-first

Avoid:
- excessive gradients
- unnecessary animations
- giant hero sections
- slow video backgrounds
- excessive 3D effects
- complicated navigation

The food should be the visual focus.

The public menu should be usable with one hand on a phone.

---

# 18. Accessibility

Implement:

- semantic HTML
- keyboard navigation for dashboard
- sufficient contrast
- alt text for food images
- accessible buttons
- visible focus states
- screen-reader-friendly labels
- readable font sizes
- do not rely only on color to communicate availability/status

---

# 19. Performance Requirements

Target:

- Fast initial page load on mobile
- Optimized images
- Lazy-load images below the fold
- Lazy-load 3D assets
- Do not load 3D models until requested
- Use responsive image sizes
- Compress assets
- Cache public menu data where appropriate
- Minimize JavaScript sent to customers

The public customer menu should receive higher performance priority than the admin dashboard.

---

# 20. Recommended Technical Architecture

The AI may choose a modern stack, but the architecture must remain maintainable.

Recommended direction:

### Frontend
- React / Next.js or equivalent
- TypeScript
- Responsive CSS
- Component-based architecture

### Backend
Either:
- Next.js server/API architecture
OR
- Node.js backend

A PHP backend is also acceptable if it materially improves development speed or matches existing SilvyOS infrastructure.

### Database
- PostgreSQL preferred
- MySQL acceptable

### Storage
Object storage for:
- food images
- logos
- 3D models
- QR assets

Do not store large media files directly inside relational database rows.

### Authentication
Use secure session-based authentication or a reputable authentication provider.

### Deployment
Use:
- HTTPS
- production environment
- staging environment
- environment variables
- database backups
- error monitoring

---

# 21. Suggested Project Structure

The exact structure may vary by framework.

A logical separation should exist between:

```text
src/
  components/
  pages/
  features/
    auth/
    restaurants/
    menu/
    analytics/
    feedback/
    qr/
    ar/
  services/
  database/
  utils/
  types/
  middleware/
```

Keep business logic separate from UI components.

Do not create one enormous component or one enormous backend file.

---

# 22. API Design

Use clear resource-oriented APIs.

Example:

```text
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/restaurants/:id
PATCH  /api/restaurants/:id

GET    /api/restaurants/:id/categories
POST   /api/restaurants/:id/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id

GET    /api/restaurants/:id/dishes
POST   /api/restaurants/:id/dishes
PATCH  /api/dishes/:id
DELETE /api/dishes/:id

POST   /api/dishes/:id/image
POST   /api/dishes/:id/model

GET    /api/restaurants/:id/analytics
POST   /api/analytics/events

GET    /api/restaurants/:id/feedback
POST   /api/feedback

GET    /api/restaurants/:slug/menu
```

Do not expose sensitive admin endpoints publicly without authentication and authorization.

---

# 23. Development Phases

## Phase 1 — UX Prototype

Build:

- Customer menu mockup
- Restaurant dashboard mockup
- Dish detail page
- 3D/AR concept
- Analytics dashboard

No backend required initially.

Goal:

**Get restaurant owners to react to something concrete.**

---

## Phase 2 — Core MVP

Build:

- Authentication
- Multi-tenant restaurants
- Categories
- Dishes
- Photos
- Availability
- QR menu
- Restaurant branding
- Public menu
- Feedback
- Basic analytics

Goal:

**One restaurant can actually use the system.**

---

## Phase 3 — 3D / AR

Build:

- 3D upload
- Model validation
- 3D viewer
- AR support
- Device fallback
- Analytics for 3D/AR interactions

Goal:

**One restaurant can publish several real dishes in 3D/AR.**

---

## Phase 4 — Pilot

Target:

**5–10 restaurants.**

Do not attempt hundreds yet.

Measure:

- Menu usage
- Returning users
- Dish views
- AR usage
- Feedback
- Restaurant usage of dashboard
- Number of menu updates
- Customer complaints
- Restaurant willingness to continue paying

Goal:

**Validate retention and willingness to pay.**

---

## Phase 5 — Commercial MVP

Only after pilot validation:

- Subscription system
- Restaurant onboarding
- Better analytics
- Improved translations
- Better 3D asset workflow
- Support system
- Automated backups
- Monitoring
- Documentation

---

# 24. MVP Success Criteria

The MVP is NOT successful because:

- The website looks beautiful.
- AR works.
- The code is impressive.
- The dashboard has many features.

The MVP is successful if:

### Customer
Customers can scan a QR and quickly understand the menu.

### Restaurant
Restaurant staff can update their menu without technical assistance.

### Business
Restaurants are willing to pay for the product.

### Retention
Restaurants continue using it after the initial trial.

### Differentiation
Customers actually use the rich dish presentation/3D/AR enough to justify keeping it.

---

# 25. Initial Business Hypotheses

These are hypotheses, not facts.

The product should test whether:

1. Restaurants have a meaningful pain around physical menu maintenance.
2. Customers benefit from richer visual information.
3. Customers care about portion/appearance before ordering.
4. Restaurants value menu analytics.
5. Restaurants will pay recurring fees for the platform.
6. 3D/AR increases engagement.
7. 3D/AR can be produced cheaply enough to make the business economically viable.
8. Restaurants renew after the initial period.

Do not assume these are true until validated.

---

# 26. Important Business Metrics

Track:

### Acquisition
- Restaurants contacted
- Demos
- Trials
- Paid conversions

### Activation
- Restaurant created menu
- QR generated
- QR deployed
- First customer visit

### Engagement
- Menu views
- Dish views
- AR launches
- Feedback submissions

### Retention
- Monthly active restaurants
- Churn
- Renewal rate

### Revenue
- Monthly recurring revenue
- Average revenue per restaurant
- Customer acquisition cost
- Gross margin

### 3D economics
Track:

- Cost to create one model
- Time to create one model
- Number of models per restaurant
- Model usage
- Revenue attributable to restaurants using 3D/AR

This is especially important because 3D model production may become the largest operational cost.

---

# 27. Pricing Strategy for Testing

Do not assume the final price immediately.

Test pricing with actual restaurants.

Potential structure:

### Basic
- QR menu
- Photos
- Multi-language
- Live updates
- Feedback
- Basic analytics

### Premium
- Everything in Basic
- 3D dishes
- AR
- Advanced analytics
- More customization

Possible setup fee can be tested separately because onboarding and 3D asset creation may require manual work.

The exact pricing should be determined after customer interviews.

---

# 28. 3D Model Production Experiment

Before building an automated 3D generation pipeline, perform a manual experiment.

Select approximately 10–20 common dishes.

Measure:

- Capture time
- Processing time
- Cleanup time
- File size
- Visual quality
- AR quality
- Customer reaction
- Restaurant reaction
- Total cost per model

Calculate:

**Cost per restaurant = number of models × average model-production cost**

Then compare that against:

**Revenue per restaurant**

If model production costs too much, redesign the business model before scaling.

---

# 29. AI Coding Agent Rules

The AI building this project MUST follow these instructions.

### Rule 1
Do not build features outside the defined MVP without asking first.

### Rule 2
Do not replace working architecture unnecessarily.

### Rule 3
Before implementing a major feature, explain:
- What will change
- Why it is needed
- Files/modules affected
- Potential risks

### Rule 4
Write production-quality code.

Avoid:
- duplicated logic
- hardcoded restaurant IDs
- hardcoded menu data
- insecure authentication
- plaintext passwords
- secrets inside source code
- fake APIs
- fake analytics

### Rule 5
Use environment variables for:
- database credentials
- API keys
- storage credentials
- authentication secrets
- third-party services

### Rule 6
Validate all user input on the server.

Frontend validation is not sufficient.

### Rule 7
Every database query involving restaurant data must enforce tenant ownership.

### Rule 8
Never expose private storage credentials to the browser.

### Rule 9
Images and 3D models must be validated before storage.

### Rule 10
Do not make AR mandatory.

Always provide a fallback.

### Rule 11
Do not use mock data in production flows.

Mock data is acceptable only for prototypes/tests.

### Rule 12
Do not claim a feature is complete until it has been tested.

---

# 30. Testing Requirements

Implement:

### Unit tests
For:
- pricing/data validation
- permissions
- analytics event processing
- translation fallback
- menu logic

### Integration tests
For:
- authentication
- restaurant isolation
- CRUD operations
- uploads
- feedback
- analytics

### End-to-end tests
At minimum:

**Restaurant**
Login → Create category → Create dish → Upload image → Publish → QR

**Customer**
Scan/open menu → Category → Dish → Photo → 3D/AR → Feedback

**Security**
Restaurant A attempts to access Restaurant B's resource → Must fail.

---

# 31. Deployment Requirements

Use separate:

- Development
- Staging
- Production

Production must have:

- HTTPS
- database backup
- environment variables
- logging
- error monitoring
- rate limiting
- secure authentication
- storage restrictions

Never use production credentials during local development.

---

# 32. Documentation Requirements

The AI must maintain:

```text
README.md
ARCHITECTURE.md
DATABASE.md
API.md
DEPLOYMENT.md
ENVIRONMENT.md
CHANGELOG.md
```

The documentation must be updated when architecture or setup changes.

---

# 33. Definition of Done

A feature is considered complete only when:

- UI is implemented.
- Backend/API is implemented where required.
- Database changes are implemented.
- Validation exists.
- Authorization exists.
- Error handling exists.
- Loading states exist.
- Empty states exist.
- Mobile layout works.
- Relevant tests pass.
- Documentation is updated.
- No known critical security issue remains.

---

# 34. First Build Order

The coding AI should follow this order unless there is a documented reason not to:

### Step 1
Project setup and architecture.

### Step 2
Database schema and migrations.

### Step 3
Authentication and authorization.

### Step 4
Restaurant creation/profile.

### Step 5
Categories.

### Step 6
Dishes.

### Step 7
Image uploads.

### Step 8
Public QR menu.

### Step 9
Multi-language support.

### Step 10
Feedback.

### Step 11
Analytics.

### Step 12
3D viewer.

### Step 13
AR support.

### Step 14
QR management.

### Step 15
Production hardening.

### Step 16
Pilot deployment.

---

# 35. First Pilot Objective

Do NOT aim for 1,000 restaurants.

Target:

**5 restaurants.**

For each restaurant:

- Create their real menu.
- Add real photographs.
- Add several 3D models.
- Generate QR codes.
- Deploy them physically.
- Observe customers.
- Collect restaurant-owner feedback.
- Measure actual usage.

The objective is to discover whether the product is useful enough to become a paid recurring service.

---

# 36. 90-Day Objective

At the end of the first 90 days, the desired outcome is:

- Working production MVP
- 5–10 pilot restaurants
- Real customer usage
- Real analytics
- Real feedback
- Tested 3D/AR workflow
- Measured model-production cost
- Initial pricing tested
- At least some restaurants willing to pay
- Clear list of product changes for V2

The goal is **validation**, not maximum feature count.

---

# 37. Long-Term Product Direction

If the MVP demonstrates strong demand, possible future features include:

- Online ordering
- Table ordering
- Payments
- POS integrations
- Kitchen integration
- Reservation management
- Loyalty
- Offers
- Customer profiles
- Personalized recommendations
- Restaurant CRM
- Advanced analytics
- AI menu optimization
- Automated 3D model generation

These should be driven by validated restaurant problems, not added simply because they are technically possible.

---

# 38. Core Strategic Principle

SilvyOS should not position itself as:

> "An AR menu company."

The stronger positioning is:

> **"A digital dining experience platform that helps restaurants present their food better, understand customer behavior, and improve the customer experience."**

AR/3D is a differentiator within that platform.

---

# 39. Final Instruction to the AI Builder

Build this product incrementally.

Do not attempt to generate the entire application in one pass.

For every phase:

1. Implement.
2. Run tests.
3. Verify the result.
4. Fix errors.
5. Document the change.
6. Only then continue.

Prioritize:

**Security → correctness → performance → usability → visual polish → advanced features.**

The purpose of this project is not to demonstrate how much code an AI can generate.

The purpose is to create a product that a real restaurant will pay for and continue using.

**Build for the first real restaurant, while keeping the architecture capable of supporting thousands.**
