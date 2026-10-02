# SilvyOS Digital Dining — Features & Progress Tracker

> **Status Tracking Document for Development Team**  
> **Source Specification:** [`SilvyOS_Digital_Restaurant_Platform_Build_Spec.md`](./SilvyOS_Digital_Restaurant_Platform_Build_Spec.md)  
> **Current Branch:** `feature/menu--dashboard-mockups`  
> **Last Updated:** October 2026  

---

### Legend
- `[x]` **Completed**: Fully implemented, tested, or verified in the codebase.
- `[/]` **In Progress**: Actively under development in the current sprint/branch.
- `[ ]` **Pending**: Planned feature ready to be picked up in subsequent steps.

---

## Progress Overview

| Module / Feature Area | Status | Progress | Notes |
| :--- | :---: | :---: | :--- |
| **1. Architecture & Core Foundation** | ✅ Completed | 100% | Next.js 14 App Router, TypeScript, Tailwind, Vitest |
| **2. Multi-Tenant Database Schema** | 🔄 In Progress | 80% | Prisma schema complete; DB migration & connection pending |
| **3. Authentication & RBAC** | 🔄 In Progress | 65% | Domain stubs, middleware & API done; real session & UI pending |
| **4. Multi-Tenant Security & Isolation** | ✅ Completed | 90% | Tenant guards, locking, rate limiting & Zod schemas active |
| **5. Customer Mobile Menu (`/r/[slug]`)** | 🔄 In Progress | 85% | Core diner flow, layout, modals working; search/filters pending |
| **6. 3D Viewer & Augmented Reality (AR)** | 🔄 In Progress | 75% | Validation & `<model-viewer>` AR working; USDZ pipeline pending |
| **7. Media & Asset Storage Service** | 🔄 In Progress | 60% | Local filesystem storage active; S3/R2 cloud driver pending |
| **8. Menu & Category Management (API/Logic)** | ✅ Completed | 90% | Domain service stubs & full REST CRUD routes active |
| **9. Restaurant Owner Dashboard (UI)** | 🔄 In Progress | 80% | Overview, Menu Dishes, Feedback, and Analytics pages done |
| **10. Dynamic QR Code Infrastructure** | 🔄 In Progress | 50% | Route architecture & stubs done; SVG/PNG generator pending |
| **11. Customer Feedback & Reviews** | ✅ Completed | 95% | Feedback modal, spam throttling, admin feed & replies done |
| **12. Telemetry & Analytics Engine** | ✅ Completed | 95% | Telemetry routes, KPI strip, time series, heatmap & funnel done |
| **13. Multi-Language & Localization** | 🔄 In Progress | 75% | Translation schema, fallback utils & UI switcher done |
| **14. Restaurant Profile & Settings** | 🔄 In Progress | 50% | Schema & API active; dashboard settings UI pending |
| **15. Automated Testing & Quality Gates** | 🔄 In Progress | 60% | Unit tests passing (11/11); Integration & E2E tests pending |
| **16. Production Readiness & CI/CD** | ⏳ Pending | 20% | Environment configs set; containerization & CI pending |

---

## Detailed Feature Breakdown

### 1. Project Architecture & Foundation (Spec Step 1)
- [x] Next.js 14 App Router with TypeScript initialization
- [x] Tailwind CSS configured with mobile dining design tokens & color palette
- [x] Standardized modular directory structure (`src/features`, `src/components`, `src/middleware`, `src/utils`)
- [x] Vitest unit test runner setup with TypeScript compilation
- [x] ESLint & Prettier code quality toolchain
- [x] Unified JSON API response envelope helper (`api-response.ts`)
- [x] Core domain TypeScript interfaces and data contracts (`src/types/index.ts`)

---

### 2. Multi-Tenant Database Layer (Spec Step 2)
- [x] `Restaurant` root tenant model with slug, branding, contact, and language fields
- [x] `User` model with RBAC roles (`RESTAURANT_ADMIN`, `RESTAURANT_STAFF`, `SUPER_ADMIN`)
- [x] `Category` model with display order and active status
- [x] `Dish` model with nutritional fields, dietary types, and 3D/AR flags
- [x] Multi-language translation models (`RestaurantTranslation`, `CategoryTranslation`, `DishTranslation`)
- [x] `QrCode` model for tracking identifiers and stable destinations
- [x] `Feedback` model for diner ratings and dish-specific comments
- [x] `AnalyticsEvent` model with session and JSON metadata indexing
- [ ] PostgreSQL database instance provisioning (Docker / Supabase / Neon)
- [ ] Execution of initial Prisma migrations (`npx prisma migrate dev`)
- [ ] Database seed script for pilot restaurants and demo menus
- [ ] Prisma repository services replacing in-memory stubs

---

### 3. Authentication & Authorization (Spec Step 3)
- [x] Authentication service contracts (`IAuthService`)
- [x] Credential validation logic with role checking
- [x] Token generation & session resolution infrastructure
- [x] Role-Based Access Control (RBAC) middleware guard (`auth-guard.ts`)
- [x] API endpoint: `POST /api/auth/login`
- [x] API endpoint: `POST /api/auth/logout`
- [ ] Secure HttpOnly cookie session management
- [ ] Password hashing via `bcrypt` / `argon2`
- [ ] Restaurant Admin Login UI page (`/dashboard/login`)
- [ ] Staff invitation & password reset workflow
- [ ] Super Admin platform management role access

---

### 4. Multi-Tenant Security & Resilience
- [x] Strict tenant ownership validation middleware (`assertTenantOwnership`)
- [x] Request payload validation via Zod schemas (`src/utils/validation.ts`)
- [x] Sliding-window in-memory rate limiting middleware (`rate-limiter.ts`)
- [x] Asynchronous concurrency mutex locking mechanism (`locking.ts`)
- [x] Unit test validation for tenant data isolation
- [ ] Distributed Redis rate limiter for multi-server production deployment
- [ ] CSRF token protection on sensitive administrative actions
- [ ] Audit logging for administrative menu edits and credential updates

---

### 5. Customer-Facing Mobile Menu — `/r/[slug]` (Spec Step 8)
- [x] Zero-barrier customer entry (no login, no app download, no phone/email gate)
- [x] Mobile-first responsive dining shell (`CustomerLayout`)
- [x] Restaurant branding header (logo, name, currency badge)
- [x] Sticky horizontal category navigation tabs (`CategoryNav`)
- [x] Dish card presentation (`DishCard`) with price, photo, and dietary badges
- [x] Dish detail popup modal (`DishModal`) with portion, ingredients, and allergen info
- [x] Fallback food photography handling when photos are unavailable
- [x] Multi-language switching dropdown in header
- [x] Customer feedback modal trigger button
- [x] Public menu API data resolver: `GET /api/menu/[slug]`
- [/] Instant search bar for filtering dishes by name or ingredient
- [ ] Dietary preference quick-filters (Vegetarian, Vegan, Gluten-Free)
- [ ] Out-of-stock / unavailable dish visual indicator (non-clickable / badge)
- [ ] Performance caching (SWR / React Server Components revalidation)

---

### 6. Interactive 3D & Augmented Reality (Spec Steps 12 & 13)
- [x] Server-side 3D model format validation (`.glb`, `.gltf`)
- [x] File size enforcement (max 15MB web threshold)
- [x] Interactive 3D viewer modal (`ArViewerModal`) using Google `<model-viewer>`
- [x] Mobile AR launch support via WebXR and mobile browser intent
- [x] AR-to-3D-to-2D graceful fallback (AR is never a dead end)
- [x] Dedicated 3D/AR badge on dish cards and detail modals
- [x] Model upload endpoint: `POST /api/dishes/[id]/model`
- [ ] iOS QuickLook `.usdz` format automatic conversion or dual-upload support
- [ ] 3D model asset optimization & Draco texture compression pipeline
- [ ] Camera framing and lighting presets for food photogrammetry

---

### 7. Media & Storage Pipeline (Spec Step 7)
- [x] Storage service abstraction interface (`IStorageService`)
- [x] Local filesystem storage implementation (`LocalStorageService`)
- [x] Dish photo upload endpoint: `POST /api/dishes/[id]/image`
- [x] Mime-type and file size validation (JPEG, PNG, WebP up to 5MB)
- [ ] Cloud object storage driver (AWS S3 or Cloudflare R2)
- [ ] Automated image compression and responsive thumbnail generation (WebP / AVIF)
- [ ] Restaurant logo and brand banner upload endpoints

---

### 8. Menu & Category Management (Spec Steps 5 & 6)
- [x] Category domain service (`IMenuService` / `MenuServiceStub`)
- [x] Dish domain service (`IMenuService` / `MenuServiceStub`)
- [x] API endpoint: `GET /api/restaurants/[id]/categories`
- [x] API endpoint: `POST /api/restaurants/[id]/categories`
- [x] API endpoint: `PATCH /api/categories/[id]`
- [x] API endpoint: `DELETE /api/categories/[id]`
- [x] API endpoint: `GET /api/restaurants/[id]/dishes`
- [x] API endpoint: `POST /api/restaurants/[id]/dishes`
- [x] API endpoint: `PATCH /api/dishes/[id]`
- [x] API endpoint: `DELETE /api/dishes/[id]`
- [x] Instant dish availability toggle API logic
- [ ] Category drag-and-drop display order reordering API
- [ ] Bulk dish availability toggle (e.g. marking whole category out of stock)

---

### 9. Restaurant Owner Dashboard UI (Spec Section 7)
- [x] Dashboard master layout (`DashboardLayout` & `Sidebar`)
- [x] Dashboard Overview page (`/dashboard`) with real-time KPI cards
- [x] Top viewed dishes ranking table
- [x] Quick actions toolbar
- [x] Menu Dishes management page (`/dashboard/menu`)
  - [x] Dual-view architecture: Card Grid view (with 3D status chip) and Data Table view
  - [x] Instant availability toggle switch per dish ("In Stock" / "86'd")
  - [x] Quick inline price editing with instant server persistence
  - [x] Category grouping with display order adjustment handles
  - [x] Slide-over "Add / Edit Dish" drawer with basic details, dietary chips, photo upload, and 3D dropzone
  - [x] In-browser 3D & Augmented Reality diagnostic preview modal
  - [x] Dish duplicate and delete actions with confirmation
  - [x] Live kitchen sync tip banner and toast notification feedback
- [/] Categories management page (`/dashboard/categories`)
  - [ ] Category listing with dish counters
  - [ ] Add/Edit category dialog
  - [ ] Display order arrangement
  - [ ] Delete category handling
- [ ] QR Code generator & download page (`/dashboard/qr-codes`)
- [x] Customer Feedback reviews management page (`/dashboard/feedback`)
- [x] Detailed Analytics & Reports page (`/dashboard/analytics`)
- [ ] Restaurant Profile & branding settings page (`/dashboard/profile`)

---

### 10. QR Code Infrastructure (Spec Step 14)
- [x] QR code domain service stub (`IQrService` / `QrServiceStub`)
- [x] Stable public menu URL structure (`/r/[slug]`)
- [x] Guaranteed perpetual QR code routing (menu edits require zero reprinting)
- [ ] Server-side vector SVG and high-res PNG QR code generator
- [ ] Table-specific QR identifier generation (`/r/[slug]?table=5`)
- [ ] Branded QR code export with restaurant logo embedded
- [ ] Printable table tent / sticker print templates download

---

### 11. Customer Feedback System (Spec Step 10)
- [x] Feedback domain service stub (`IFeedbackService` / `FeedbackServiceStub`)
- [x] Customer feedback modal UI (`FeedbackModal`) with 1–5 star ratings
- [x] Optional dish-level review association
- [x] Anti-spam sliding window throttling on submissions
- [x] API endpoint: `POST /api/feedback`
- [x] API endpoint: `GET /api/restaurants/[id]/feedback`
- [x] Dashboard Feedback management UI feed (`/dashboard/feedback`)
- [x] Filter reviews by search keywords, rating, time range, dish, and 3D/AR experience
- [x] Staff replies and internal kitchen notes logging (`POST /api/restaurants/[id]/feedback/[feedbackId]/reply`)
- [x] Dish Sentiment Highlights widget (Top Praised dishes vs. Needs Kitchen Attention)
- [x] Client-side CSV report export generator

---

### 12. Telemetry & Analytics Engine (Spec Step 11)
- [x] Telemetry ingestion endpoint: `POST /api/analytics/events`
- [x] Client-side auto-tracking for:
  - [x] `menu_view` on initial diner load
  - [x] `dish_view` on dish card modal open
  - [x] `ar_launch` on virtual dish inspection
  - [x] `category_view` on category tab switch
  - [x] `language_change` on language dropdown selection
- [x] Aggregated metrics calculation service (`AnalyticsServiceStub`)
- [x] Metrics endpoint: `GET /api/restaurants/[id]/analytics`
- [x] Overview KPI summary cards (Menu Views, Unique Diners, AR Launches, Avg Rating)
- [x] Dedicated analytics dashboard page (`/dashboard/analytics`)
  - [x] Executive KPI summary strip (Scans & sessions, AR engagement rate, AR order conversion lift, dwell time)
  - [x] Dual-line/stacked time series chart (Gross QR scans vs 3D/AR activations over 7D/30D/90D)
  - [x] Peak dining time rush heatmap (7-day × hourly scan density matrix)
  - [x] Dish Performance & AR Impact comparative matrix with view-through rates
  - [x] AR vs. Static 2D Photo conversion benchmark card (+26.4% lift)
  - [x] Dine-in table zone and device/hardware telemetry breakdown (iOS QuickLook vs Android SceneViewer)
  - [x] Category flow funnel & post-meal drop-off analysis (Starters → Mains → Desserts → Drinks)
  - [x] Client-side CSV analytics report exporter

---

### 13. Multi-Language & Localization (Spec Step 9)
- [x] Multi-language database models (`DishTranslation`, etc.)
- [x] Fallback language resolver utility (`src/utils/language.ts`)
- [x] Unit test coverage for multilingual fallback resolution
- [x] Diner UI language selector in mobile menu header
- [x] Public menu API multilingual response querying (`?lang=hi`)
- [ ] Dashboard translation management editor for dish names & descriptions
- [ ] Support for initial languages: English (`en`), Hindi (`hi`), Marathi (`mr`), Spanish (`es`)

---

### 14. Restaurant Profile & Brand Settings (Spec Step 4)
- [x] Restaurant service stub (`RestaurantServiceStub`)
- [x] API endpoint: `GET /api/restaurants/[id]`
- [x] API endpoint: `PATCH /api/restaurants/[id]`
- [ ] Restaurant profile dashboard UI page (`/dashboard/profile`)
- [ ] Logo & banner image upload
- [ ] Business details form (address, phone, email, opening hours)
- [ ] Currency selector (USD, EUR, INR, GBP, etc.)
- [ ] Supported languages selector

---

### 15. Testing & Quality Assurance (Spec Section 30)
- [x] Tenant isolation unit tests (`tests/unit/tenant-isolation.test.ts`)
- [x] Multi-language fallback unit tests (`tests/unit/language.test.ts`)
- [x] Rate limiting sliding window unit tests (`tests/unit/rate-limiter.test.ts`)
- [x] Concurrency locking unit tests (`tests/unit/locking.test.ts`)
- [ ] API integration tests with mock database
- [ ] End-to-End (E2E) customer diner journey test (Open -> Category -> Dish -> AR -> Feedback)
- [ ] End-to-End (E2E) restaurant admin test (Login -> Create Dish -> Toggle Availability -> QR)
- [ ] Security boundary penetration test (Cross-tenant access forbidden)

---

### 16. Production Hardening & Cloud Infrastructure (Spec Steps 15 & 16)
- [x] Environment variable template (`.env.example`)
- [ ] Dockerfile & Docker Compose setup for local containerized dev
- [ ] CI/CD pipeline (GitHub Actions for linting, typechecks, and tests)
- [ ] Production database backup automation
- [ ] Sentry / OpenTelemetry error monitoring integration
- [ ] Pilot onboarding checklist for the first 5 test restaurants
