# SilvyOS — Digital Restaurant Menu Platform

Welcome to the **SilvyOS Digital Dining** codebase. This repository contains the Next.js bare-bones structural template and platform core engineered according to [`SilvyOS_Digital_Restaurant_Platform_Build_Spec.md`](./SilvyOS_Digital_Restaurant_Platform_Build_Spec.md).

---

## 1. Architectural Philosophy & Core Principles

Before adding features, all engineers must align on the core tenets:

1. **Customer-First & Fast**: Public customer menus require **no account**, **no app download**, and **no phone/email gates**. Load times are paramount.
2. **Multi-Tenant Isolation**: Every database query and administrative action **must** strictly enforce tenant boundaries (`user -> restaurant_id -> requested resource`). Never trust client-supplied tenant identifiers.
3. **AR as an Enhancement, Not a Blocker**: Dishes must render flawlessly with standard food photography and fallback 3D views. Customers must never be stranded if their device lacks WebXR or LiDAR capabilities.
4. **Stable QR Infrastructure**: Public menu URLs remain perpetual (`/r/{restaurant-slug}`). Menu edits (pricing, availability, description, photos) reflect immediately without requiring physical QR reprinting.
5. **Clean Separation of Concerns**: Keep business logic inside feature domain services (`src/features/*`), database/Prisma plumbing isolated (`src/database/*`), and UI components modular (`src/components/*`).

---

## 2. Standardized Folder Structure

```text
Digital-Dining/
├── prisma/
│   └── schema.prisma             # PostgreSQL schema with full tenant models
├── public/                       # Static public assets (logos, fallback images)
│   └── uploads/                  # Local development media storage
├── src/
│   ├── app/                      # Next.js App Router (pages & API endpoints)
│   │   ├── api/
│   │   │   ├── analytics/events/ # Public & session telemetry ingestion
│   │   │   ├── auth/             # Login / Logout session management
│   │   │   ├── categories/       # Category CRUD endpoints
│   │   │   ├── dishes/           # Dish CRUD, image & 3D model upload handlers
│   │   │   ├── feedback/         # Public customer feedback submissions
│   │   │   ├── menu/[slug]/      # Public customer menu DTO resolution
│   │   │   └── restaurants/      # Restaurant profiles, analytics & management
│   │   ├── dashboard/            # Restaurant Owner admin web application
│   │   ├── r/[slug]/             # Customer-facing mobile-first digital menu
│   │   ├── globals.css           # Tailwind base styles and mobile layout tokens
│   │   └── layout.tsx            # Global HTML wrapper and viewport metadata
│   ├── components/
│   │   ├── common/               # Atomic design system (Button, Card, Badge, Input)
│   │   ├── customer/             # Mobile menu UI (CategoryNav, DishCard, DishModal, AR)
│   │   └── layout/               # Shell wrappers (CustomerLayout, DashboardLayout, Sidebar)
│   ├── database/
│   │   ├── db.ts                 # Prisma Client singleton
│   │   └── mock-data/            # Seed data and mock tenant fixtures
│   ├── features/                 # Domain Services & Business Logic Stubs
│   │   ├── analytics/            # Analytics ingestion & dashboard calculation
│   │   ├── ar/                   # 3D model validation (.glb/.gltf) & AR capability checks
│   │   ├── auth/                 # Credential validation & session resolution
│   │   ├── feedback/             # Feedback persistence & spam throttling
│   │   ├── menu/                 # Category & Dish CRUD, availability toggles
│   │   ├── qr/                   # QR code generation & URL routing
│   │   └── restaurants/          # Restaurant profile & public menu aggregation
│   ├── middleware/
│   │   ├── auth-guard.ts         # Role-based access control (RBAC)
│   │   ├── rate-limiter.ts       # In-memory sliding window rate limiter
│   │   └── tenant-context.ts     # Multi-tenant security assertions (Rule 7)
│   ├── services/
│   │   └── storage/              # Media upload abstraction (S3 / R2 / local)
│   ├── types/                    # Domain models, API responses & TypeScript contracts
│   └── utils/
│       ├── api-response.ts       # Standardized JSON response helpers
│       ├── currency.ts           # Localized currency formatting
│       ├── language.ts           # Fallback-aware multi-language resolver
│       ├── locking.ts            # Concurrency mutual exclusion locking infrastructure
│       └── validation.ts         # Zod schemas for server-side validation
└── tests/
    └── unit/                     # Unit test suites (tenant isolation, locking, utils)
```

---

## 3. Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **pnpm**
- **PostgreSQL** instance (optional for initial mock stub testing)

### Installation
```bash
# Clone the repository
git clone https://github.com/Shreyal-JS/Digital-Dining.git
cd Digital-Dining

# Install project dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### Running the Development Server
```bash
npm run dev
```

Visit the following entry points in your browser:
- **Landing Hub**: [http://localhost:3000](http://localhost:3000)
- **Live Pilot Customer Menu**: [http://localhost:3000/r/olive-grove](http://localhost:3000/r/olive-grove)
- **Restaurant Management Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 4. Code Quality & Linting Gates

Maintain high standards at all times. Before creating a pull request or merging code, execute the quality check gate:

```bash
# Run type checks
npm run typecheck

# Run ESLint validation
npm run lint

# Run unit tests
npm test

# Run all checks at once
npm run check:all
```

---

## 5. Development Guidelines & Golden Rules

Per Section 29 of the Build Spec:

1. **Server-Side Validation**: Validate all request payloads using Zod (`src/utils/validation.ts`). Never trust browser input.
2. **Tenant Isolation**: Always call `assertTenantOwnership(context, targetRestaurantId)` on protected endpoints.
3. **No Mock Data in Production Paths**: When connecting real database repositories to replace stubs in `src/features/*`, maintain the exact interface contracts (`IMenuService`, `IRestaurantService`, `IAuthService`, etc.).
4. **Asset Validation**: 3D models must be strictly verified for format (`.glb`, `.gltf`) and maximum file size prior to cloud persistence.
5. **Incremental Progress**: Implement features according to the 16-step build order in the build specification.
