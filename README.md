# Connect. E-Commerce

> A production-grade full-stack e-commerce platform — Clean Architecture backend in .NET 10 paired with a React 19 frontend, enforcing business rules at the type level through Domain-Driven Design, CQRS, and a rich domain model.

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![EF Core](https://img.shields.io/badge/EF%20Core-10.0-7B3F9E)](https://learn.microsoft.com/ef/)
[![MediatR](https://img.shields.io/badge/MediatR-14.1-0078D4)](https://github.com/jbogard/MediatR)
[![FluentValidation](https://img.shields.io/badge/FluentValidation-12.1-e74c3c)](https://docs.fluentvalidation.net/)
[![Hangfire](https://img.shields.io/badge/Hangfire-1.8-2ecc71)](https://www.hangfire.io/)
[![Serilog](https://img.shields.io/badge/Serilog-10.0-blue)](https://serilog.net/)
[![xUnit](https://img.shields.io/badge/xUnit-2.9-brightgreen)](https://xunit.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

**Connect.** is a fully self-contained e-commerce platform covering the complete commerce lifecycle — user registration with email verification, product browsing, cart management, order placement, coupon redemption, online payment via VNPAY, transactional email delivery, real-time admin notifications via SignalR, and Google OAuth2 sign-in. The backend is a serious reference implementation of Clean Architecture, DDD, and CQRS in .NET 10. The frontend is a production-quality React SPA with a typed API client that mirrors every backend contract.

The codebase enforces a strict no-anemic-model policy: every business rule lives inside the domain, every value is validated at the point of construction, and every side effect is decoupled through domain events and Hangfire background jobs.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Solution Structure](#solution-structure)
- [Frontend — React SPA](#frontend--react-spa)
- [Domain Model](#domain-model)
- [Application Layer — CQRS](#application-layer--cqrs)
- [Infrastructure Layer](#infrastructure-layer)
- [API Layer](#api-layer)
- [Key Flows](#key-flows)
- [Database Schema](#database-schema)
- [Unit Tests](#unit-tests)
- [Observability](#observability)
- [Configuration Reference](#configuration-reference)
- [Getting Started](#getting-started)
- [Design Decisions](#design-decisions)
- [Known Limitations & Future Work](#known-limitations--future-work)
- [Author](#author)
- [License](#license)

---

## Architecture Overview

Connect. is organized as a four-layer Clean Architecture backend paired with a React frontend. Backend layer dependencies always point inward — outer layers depend on inner layers, never the reverse.

```
┌──────────────────────────────────────────────────────────────────┐
│                    Connect.Frontend (React SPA)                  │
│   Pages · Components · API Client · AppContext · TailwindCSS     │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTP / SignalR
┌───────────────────────────▼──────────────────────────────────────┐
│                        Connect.API                               │
│   Controllers · Middleware · DI Wiring · Swagger · Serilog       │
└───────────────────────────┬──────────────────────────────────────┘
                            │ references
┌───────────────────────────▼──────────────────────────────────────┐
│                    Connect.Application                           │
│   CQRS Handlers · DTOs · FluentValidation · Pipeline Behaviors   │
│   MediatR Requests · Service Interfaces (abstractions only)      │
└──────────┬─────────────────────────────────────────┬────────────┘
           │ references                              │ references
┌──────────▼──────────┐               ┌──────────────▼────────────┐
│   Connect.Domain    │               │  Connect.Infrastructure   │
│  Entities · AggRoots│               │  EF Core · JWT · BCrypt   │
│  Value Objects      │◄──────────────│  MailKit · VNPAY · Hangfire│
│  Domain Events      │  references   │  SignalR · Redis · OAuth2  │
│  Business Rules     │               │                           │
└─────────────────────┘               └───────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Connect.Frontend** | React 19 + TypeScript SPA. Provides the complete customer-facing shopping experience: browsing, cart, checkout, order history, authentication, profile, and real-time notifications via SignalR. |
| **Connect.Domain** | The heart of the system. Contains all entities, value objects, domain events, enumerations, and business invariants. Zero framework dependencies — plain C# targeting `net10.0`. |
| **Connect.Application** | Orchestrates the domain. Houses all CQRS commands and queries (via MediatR), FluentValidation validators, DTO definitions, and `interface` contracts for every external dependency. References `Connect.Domain` only. |
| **Connect.Infrastructure** | Implements every interface defined in `Connect.Application`. Houses the EF Core `DbContext`, entity configurations, generic repository, Unit of Work, JWT, BCrypt, MailKit, Hangfire, VNPAY, ASP.NET Core Data Protection, OAuth2, and SignalR with a Redis backplane. |
| **Connect.API** | The entry point. Wires together the DI container, middleware pipeline, Swagger/OpenAPI, JWT Bearer authentication, rate limiting, CORS, and controller mapping. Contains no business logic. |
| **Connect.UnitTest** | xUnit + FluentAssertions test project covering all domain value objects and aggregate roots. |

---

## Solution Structure

```
Connect.sln
│
├── Connect.Domain/
│   ├── Common/
│   │   ├── AggregateRoot.cs          # Base class with domain event collection
│   │   ├── DomainEvent.cs            # Abstract record with EventID + CreatedAt
│   │   └── DomainExceptions.cs       # Typed exception with Code + Metadata
│   ├── Core/
│   │   ├── Entities/
│   │   │   ├── User.cs               # AggregateRoot — identity, registration, profile
│   │   │   ├── Order.cs              # AggregateRoot — lifecycle, pricing, events
│   │   │   ├── OrderItem.cs          # Owned by Order
│   │   │   ├── Product.cs            # Stock management, image, pricing rules
│   │   │   ├── Cart.cs               # Price-snapshotted cart item
│   │   │   ├── Coupon.cs             # Expiry, stock, minimum-price enforcement
│   │   │   ├── Review.cs             # AggregateRoot — per-user-per-product
│   │   │   ├── Payment.cs            # Immutable VNPAY payment record
│   │   │   ├── Category.cs
│   │   │   └── RefreshToken.cs       # Cryptographic token with 7-day lifetime
│   │   ├── Enums/
│   │   │   ├── OrderStatus.cs        # Pending, Processing, Shipping, Completed, Cancelled
│   │   │   ├── PaymentStatus.cs      # Unpaid, Pending, Paid
│   │   │   ├── PaymentMethod.cs      # Cash, OnlineBanking, VNPAY
│   │   │   ├── ShippingMethod.cs     # Standard, Fast, SuperFast
│   │   │   └── ProductStatus.cs      # InStock, OutOfStock
│   │   └── ValueObjects/
│   │       ├── Amount.cs             # int ≥ 0, operators +/-
│   │       ├── Currency.cs           # decimal ≥ 0, operators +/-/*/comparisons
│   │       ├── Email.cs              # non-empty, must contain @
│   │       ├── UserName.cs           # 3–30 chars, ^[a-z]+$ only
│   │       ├── PhoneNumber.cs        # exactly 10 chars, digits only
│   │       ├── PasswordHash.cs       # exactly 60 chars, BCrypt prefix validation
│   │       ├── ProductName.cs        # 5–100 chars, unicode letters/numbers/spaces/-|
│   │       ├── CategoryName.cs       # 2–20 chars, no special characters
│   │       └── Code.cs               # 5–12 chars, must contain at least one digit
│   └── Events/
│       ├── UserEvents/UserRegisterEvent.cs
│       └── OrderEvents/
│           ├── OrderPlacedEvent.cs
│           ├── OrderCancelledEvent.cs
│           ├── OrderPaidEvent.cs
│           └── OrderCompletedEvent.cs
│
├── Connect.Application/
│   ├── Commons/
│   │   ├── Behaviors/
│   │   │   ├── LoggingBehavior.cs    # [START]/[END]/[SLOW]/[FAILURE] pipeline logging
│   │   │   └── ValidationBehavior.cs # Concurrent FluentValidation, throws on failures
│   │   ├── DomainEventNotification.cs
│   │   └── DTOs/                     # CartDto, CategoryDto, CouponDto, NotificationDto,
│   │                                 # OrderDto, OrderItemDto, PagedResult<T>, PaymentDto,
│   │                                 # ProductDto, RefreshTokenDto, ReviewDto, UserDto
│   ├── Features/
│   │   ├── Carts/     Commands: AddToCart, IncreaseCartAmount, ReduceCartAmount, RemoveCart
│   │   │              Queries:  GetAllCarts, GetUserCart
│   │   ├── Categories/Commands: CreateCategory, UpdateCategoryName, DeleteCategory
│   │   │              Queries:  GetAllCategories, GetSpecificCategory
│   │   ├── Coupons/   Commands: CreateCoupon, UpdateCouponExpiryDate, UpdateCouponQuantity
│   │   │              Queries:  GetAllCoupons, GetSpecificCoupon
│   │   ├── Orders/    Commands: CreateOrder, CancelOrder, MarkAsPaid,
│   │   │                        UpdateOrderStatusToShipping, UpdateOrderStatusToCompleted
│   │   │              Queries:  GetAllOrders, GetOrderById, GetOrderHistory
│   │   ├── Payments/  Commands: CreatePayment, ProcessPaymentCallback
│   │   │              Queries:  GetAllPayments
│   │   ├── Products/  Commands: CreateProduct, UpdateProductStock,
│   │   │                        UpdateProductImage, DeleteProduct
│   │   │              Queries:  GetAllProducts, GetProductDetail, GetProductByCategory,
│   │   │                        GetProductByRAM, GetProductByROM, GetProductByColor,
│   │   │                        GetProductByPriceRange
│   │   ├── Reviews/   Commands: CreateReview, UpdateReview, DeleteReview
│   │   │              Queries:  GetAllReviews, GetReviewByProduct
│   │   └── Users/     Commands: CheckEmail, VerifyEmail, RegisterUser, LoginUser,
│   │                            RefreshToken, ForgetPassword, UpdateUserProfile,
│   │                            UpdateUserPassword, DeleteUserProfile,
│   │                            GetSignInWithURL, ProcessOAuthCallback
│   │                  Queries:  GetAllUsers, GetUserProfile, GetUserByEmail,
│   │                            GetUserByUserName, GetUserByPhoneNumber
│   ├── Interfaces/
│   │   ├── Persistences/IRepository.cs, IUnitOfWork.cs
│   │   └── Services/
│   │       ├── ICurrentUserService.cs
│   │       ├── IEmailService.cs
│   │       ├── IEmailVerificationService.cs
│   │       ├── IJWTService.cs
│   │       ├── INotificationService.cs
│   │       ├── IPasswordService.cs
│   │       ├── IPaymentGateway.cs
│   │       └── IOAuth2Service.cs
│   └── DependencyInjection.cs
│
├── Connect.Infrastructure/
│   ├── Data/
│   │   ├── Configurations/           # One IEntityTypeConfiguration<T> per entity
│   │   └── MyDbContext/ConnectDbContext.cs  # SaveChangesAsync dispatches domain events
│   ├── Hub/NotificationHub.cs        # Typed SignalR hub; user-{id} + admins groups
│   ├── Persistences/
│   │   ├── GenericRepository.cs      # Paged, filter, tracking/no-tracking queries
│   │   └── UnitOfWork.cs             # Transaction management with auto-rollback
│   ├── Services/
│   │   ├── CurrentUserService.cs     # Reads UserID + Role from JWT claims
│   │   ├── EmailService.cs           # MailKit SMTP, HTML email templates
│   │   ├── EmailVerificationService.cs  # ASP.NET Data Protection time-limited tokens
│   │   ├── JWTService.cs             # HS256, 10-minute access tokens
│   │   ├── NotificationService.cs    # SignalR push to admins group
│   │   ├── OAuth2Service.cs          # Google OAuth2 via OAuth2.Client library
│   │   ├── PasswordService.cs        # BCrypt work factor 12
│   │   └── PaymentGateway.cs         # VNPAY.NET client wrapper
│   ├── Settings/JWTSetting.cs, EmailSettings.cs
│   ├── Migrations/                   # EF Core migration history
│   └── DependencyInjection.cs
│
├── Connect.API/
│   ├── Controllers/
│   │   ├── APIController.cs          # Abstract base: Problem helpers (404/409/403/422/400)
│   │   ├── CartsController.cs
│   │   ├── CategoriesController.cs
│   │   ├── CouponsController.cs
│   │   ├── OrdersController.cs
│   │   ├── PaymentsController.cs
│   │   ├── ProductsController.cs
│   │   ├── ReviewsController.cs
│   │   └── UsersController.cs
│   ├── Middlewares/
│   │   ├── CorrelationMiddleware.cs  # X-Correlation-Id read or generate
│   │   ├── RequestLoggingMiddleware.cs  # Method+Path on entry, StatusCode+ms on exit
│   │   ├── ExceptionMiddleware.cs    # Global catch → 500 JSON { title, status, traceId }
│   │   └── PerformanceMiddleware.cs  # LogWarning if request > 1000ms
│   ├── DependencyInjection.cs        # JWT, Swagger, RateLimiter, CORS
│   ├── MiddlewareExtensions.cs
│   └── Program.cs
│
├── Connect.UnitTest/
│   ├── AmountTests.cs
│   ├── CartTests.cs
│   ├── CouponTests.cs
│   ├── CurrencyTests.cs
│   ├── EmailTests.cs
│   ├── OrderTests.cs
│   ├── OtherEntityTests.cs           # OrderItem, Review, RefreshToken, Category, Payment
│   ├── OtherValueObjectTests.cs      # PasswordHash, ProductName, CategoryName, Code
│   ├── PhoneNumberTests.cs
│   ├── ProductTests.cs
│   ├── UserNameTests.cs
│   └── UserTests.cs
│
└── Connect.Frontend/Connect.UI/
    ├── src/
    │   ├── api/                      # Typed API client (one file per resource)
    │   │   ├── client.ts             # Base fetch wrapper, Bearer injection, auto-refresh
    │   │   ├── types.ts              # All DTO & request type definitions
    │   │   └── [users|products|categories|coupons|carts|orders|reviews|payments].ts
    │   ├── components/               # Header, Footer, Layout, ProductCard
    │   ├── context/AppContext.tsx    # Global auth + local cart state
    │   ├── data/mock.ts              # formatVND utility
    │   └── pages/
    │       ├── Landing.tsx, Home.tsx, Products.tsx, ProductDetail.tsx
    │       ├── Cart.tsx, Checkout.tsx, CheckoutSuccess.tsx
    │       ├── MyOrders.tsx, Auth.tsx, Profile.tsx
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

---

## Frontend — React SPA

The frontend is a single-page application built with React 19, TypeScript 5.8, Vite 6, TailwindCSS v4, and React Router v7. It runs on `http://localhost:3000` in development and proxies API calls to `https://localhost:7240`.

### Pages & Routing

| Route | Page | Auth Required | Description |
|---|---|---|---|
| `/` | `Landing` | No | Hero splash screen with entry CTA |
| `/home` | `Home` | No | Product grid + category nav + hero banner |
| `/products` | `Products` | No | Filterable product listing with sidebar |
| `/product/:id` | `ProductDetail` | No | Full product info, images, reviews |
| `/cart` | `Cart` | No | Local cart management with quantity controls |
| `/checkout` | `Checkout` | Yes | Shipping/payment/coupon selection + order submission |
| `/checkout-success` | `CheckoutSuccess` | Yes | Post-order confirmation screen |
| `/orders` | `MyOrders` | Yes | Order history with inline cancellation |
| `/auth` | `Auth` | No | Login + 3-step email-verified registration + Google OAuth |
| `/verify-email` | `Auth` | No | Landing point for email verification link |
| `/profile` | `Profile` | Yes | Profile editing, password change, account deletion |

### AppContext — Global State

`AppContext` provides application-wide state via React Context:

**Auth state:** `user: UserDto | null` rehydrated from stored JWT on mount via `getProfile()`. `setUser(user)` after login or profile update. `logout()` clears token storage and resets all state.

**Local cart state:** Managed in React state, synced to the backend on every `addToCart` call. The authoritative source at checkout is the backend cart fetched fresh at order time.

| Method | Description |
|---|---|
| `addToCart(item, qty?)` | Adds or increments item; caps at 10; silently syncs to backend if logged in |
| `removeFromCart(productID)` | Removes item by productID |
| `updateQuantity(productID, qty)` | Sets quantity; caps at 10; ignores values ≤ 0 |
| `clearCart()` | Empties the cart (called after successful order creation) |

---

## Domain Model

### Aggregates & Entities

#### `User` — AggregateRoot

The central identity entity. Owns the registration event, profile data, and downstream relationships (orders, cart items, reviews, refresh tokens).

| Method | Behavior |
|---|---|
| `CreateUserProfile(...)` | Static factory. Validates address non-empty, constructs user, raises `UserRegisterEvent`. Note: UserID in the event is `0` at raise-time — event handler re-fetches by email. |
| `CreateOAuthUserProfile(...)` | Creates OAuth user (null phone, null password hash, null address). Validates provider string is non-empty. Raises `UserRegisterEvent`. |
| `UpdateUserProfile(...)` | Validates address before updating all profile fields atomically. |
| `UpdateUserPassword(PasswordHash)` | Guards against setting the same password using record equality. |

---

#### `Order` — AggregateRoot

The most complex aggregate. Owns its `OrderItem` collection as a read-only list.

| Method | Behavior |
|---|---|
| `CreateOrder(...)` | Validates userID > 0, validates enum memberships, validates orderItems non-empty, calculates total price, raises `OrderPlacedEvent`. |
| `CalculateTotalPrice(couponID, discountAmount)` | Sums OrderItem totals, adds shipping fee, subtracts coupon discount. **Known bug:** Standard shipping adds both 30,000 and 80,000 VND due to a missing `else if`. |
| `CancelOrder()` | Only from `Pending`. Sets `Cancelled`, raises `OrderCancelledEvent`. |
| `MarkAsPaid()` | Guards double-payment and cancelled orders. Sets `PaymentStatus = Paid`. Does NOT raise an event (admin manual payment path). |
| `MarkAsPaidForPaymentGateway(bool)` | Validates success flag, guards double-payment and cancelled orders. Sets `PaymentStatus = Paid`, raises `OrderPaidEvent`. |
| `MarkOrderStatusToShipping()` | Cannot transition a cancelled order to Shipping. |
| `MarkOrderStatusToCompleted()` | Requires payment status ≠ Unpaid and order status ≠ Cancelled. Raises `OrderCompletedEvent`. |
| `IntitalizePaymentStatus()` | Cash → `Unpaid`; all other payment methods → `Pending`. |

**Shipping fees:**

| Method | Fee (VND) |
|---|---|
| `Standard` | 30,000 *(+ bug: also adds 80,000)* |
| `Fast` | 50,000 |
| `SuperFast` | 80,000 |

---

#### `Product`

| Method | Behavior |
|---|---|
| `CreateProduct(...)` | Validates description (50–10,000 chars, no `<>{}\[\]\\|^~\``), `finalPrice ≤ originalPrice`, non-empty `imageURL`, color length ≤ 15, `ram ≤ rom`. |
| `AddToStock(Amount)` | Increments stock, calls `MarkProductStock()`. |
| `RemoveFromStock(Amount)` | Guards against out-of-stock, decrements stock, calls `MarkProductStock()`. |
| `UpdateProductFinalPrice(Currency)` | Guards `finalPrice ≤ originalPrice`. |
| `UpdateProductImage(List<string>)` | Guards against null/empty list. |
| `MarkProductStock()` | Private. Sets `ProductStatus = OutOfStock` when `Stock.Value == 0`. |

---

#### `Cart`

| Method | Behavior |
|---|---|
| `CreateCart(...)` | Validates `userID > 0`, `productID > 0`. Enforces quantity ≤ 10. Calculates `CartTotalPrice = unitPrice * quantity`. |
| `IncreaseCartAmount()` | Guards quantity ≤ 10 before incrementing by 1. |
| `ReduceCartAmount()` | Guards quantity > 0 before decrementing by 1. |

---

#### `Coupon`

| Method | Behavior |
|---|---|
| `CreateCoupon(...)` | Factory constructor. |
| `UseCoupon(totalItemPrice)` | Calls `VerifyCoupon()` (checks expiry, stock > 0, total ≥ minimum, discount ≤ total), then decrements stock by 1. |
| `UpdateCouponQuantity(Amount)` | Adds to `CouponQuantity`. |
| `UpdateCouponExpiryDate(DateTime)` | Rejects past dates. |

---

#### `Review` — AggregateRoot

One review per user per product, enforced at the database level via a unique composite index on `(UserID, ProductID)`.

- **Creation:** body 1–2,000 chars, non-empty.
- **Update:** body must be 5–300 chars (stricter than creation).

---

#### `Payment` — `sealed`

Immutable record of a VNPAY payment transaction. `PaymentID` is set from VNPAY (never database-generated). `ProcessPaymentCallbackHandler` checks for existing `PaymentID` before creating for idempotency.

---

#### `RefreshToken`

64-byte cryptographically random token (Base64), 7-day expiry, revocation support. `VerifyRefreshToken()` throws if expired OR revoked. `RevokeRefreshToken()` is idempotent.

---

### Value Objects

All value objects are `sealed record` with a private constructor. The only way to obtain an instance is through the static `Create(...)` factory, which throws `DomainExceptions` for invalid input — invalid value objects cannot exist in memory.

| Value Object | Underlying Type | Validation Rules |
|---|---|---|
| `Amount` | `int` | `value >= 0`. Operators: `+`, `-`. |
| `Currency` | `decimal` | `value >= 0`. Operators: `+`, `-`, `* Amount`, `* decimal` (rounds to 0 dp). Comparisons: `<=`, `>=`. |
| `Email` | `string` | Non-empty, must contain `@`. Trimmed on creation. |
| `UserName` | `string` | 3–30 chars, must match `^[a-z]+$`. |
| `PhoneNumber` | `string` | Exactly 10 chars, no `\W`, no `[a-z]`. |
| `PasswordHash` | `string` | Exactly 60 chars, must match BCrypt prefix `^\$2[aby]\$\d{2}\$`. |
| `ProductName` | `string` | 5–100 chars, allows `\p{L}\p{N}\s\-\|`. |
| `CategoryName` | `string` | 2–20 chars, no `\W`. |
| `Code` | `string` | 5–12 chars, must contain at least one digit. |

---

### Domain Events

Events are plain C# records inheriting `DomainEvent` (auto-generated `EventID` + `CreatedAt`). Raised inside aggregates, stored in a private list, cleared and dispatched by `ConnectDbContext.SaveChangesAsync` after the DB write.

| Event | Raised In | Handler | Effect |
|---|---|---|---|
| `UserRegisterEvent` | `User` constructor | `UserRegisteredEventHandler`, `UserVerifiedByOAuthEventHandler` | Enqueues welcome email job |
| `OrderPlacedEvent` | `Order.CreateOrder` | `CreatedOrderEventHandler` | Enqueues confirmation email + notifies admins via SignalR |
| `OrderCancelledEvent` | `Order.CancelOrder` | `CancelledOrderEventHandler` | Enqueues cancellation email + notifies admins via SignalR |
| `OrderPaidEvent` | `Order.MarkAsPaidForPaymentGateway` | `OrderPaidEventHandler` | Enqueues payment bill email + notifies admins via SignalR |
| `OrderCompletedEvent` | `Order.MarkOrderStatusToCompleted` | `OrderCompletedEventHandler` | Enqueues completion email |

---

### Business Rules & Invariants

| Rule | Enforced In |
|---|---|
| Cart quantity per item ≤ 10 | `Cart.AddToCart`, `Cart.IncreaseCartAmount` |
| Cart quantity cannot go below 0 | `Cart.ReduceCartAmount` |
| Final price must not exceed original price | `Product.CreateProduct`, `Product.UpdateProductFinalPrice` |
| RAM value must not exceed ROM value | `Product.CreateProduct` |
| Coupons cannot be used after expiry | `Coupon.VerifyCoupon` |
| Coupons cannot be used with zero stock | `Coupon.VerifyCoupon` |
| Coupon order total must meet minimum price | `Coupon.VerifyCoupon` |
| Discount cannot exceed order total | `Coupon.VerifyCoupon` |
| Coupon expiry date cannot be set to the past | `Coupon.UpdateCouponExpiryDate` |
| Orders can only be cancelled from Pending status | `Order.CancelOrder` |
| Cancelled orders cannot be marked as Shipping | `Order.MarkOrderStatusToShipping` |
| Unpaid or cancelled orders cannot be completed | `Order.MarkOrderStatusToCompleted` |
| Already-paid orders cannot be paid again | `Order.MarkAsPaid`, `Order.MarkAsPaidForPaymentGateway` |
| Passwords cannot be updated to the same value | `User.UpdateUserPassword` |
| Refresh tokens have a fixed 7-day lifetime | `RefreshToken` constructor |
| Revoked tokens cannot be used | `RefreshToken.VerifyRefreshToken` |
| OAuth provider string cannot be empty | `User.CreateOAuthUserProfile` |

---

## Application Layer — CQRS

Every operation is modeled as either a **Command** (mutates state, returns a DTO) or a **Query** (reads state). MediatR `ISender` is the only dependency in controllers.

### Pipeline Behaviors

#### `LoggingBehavior<TRequest, TResponse>`

Wraps every MediatR handler. Logs `[START]` with serialized payload, uses `Stopwatch` for duration, logs `[END]` on success, `[SLOW]` warning if > 500ms, `[FAILURE]` with exception details.

#### `ValidationBehavior<TRequest, TResponse>`

Runs all `IValidator<TRequest>` concurrently via `Task.WhenAll`. Aggregates all failures and throws `FluentValidation.ValidationException` if any exist. Short-circuits before the handler if no validators are registered.

### Service Interfaces

| Interface | Purpose |
|---|---|
| `IUnitOfWork` | Repository access + `BeginTransactionAsync` / `CommitTransactionAsync` / `RollbackTransactionAsync` |
| `IRepository<T, TKey>` | Generic CRUD: `GetPagedAsync`, `GetByIdAsync`, `FirstOrDefaultAsync`, `WhereAsync`, `AnyAsync`, `AddAsync`, `Update`, `Remove`, `AddRangeAsync`, `UpdateRange`, `RemoveRange` |
| `ICurrentUserService` | `UserID` and `Role` from the current HTTP context JWT claims |
| `IJWTService` | HS256 JWT access token generation |
| `IPasswordService` | BCrypt hash and verify |
| `IEmailVerificationService` | Generate and unprotect time-limited tokens (`email-verification` 30min, `registration-session` 15min) |
| `IEmailService` | Send transactional HTML emails via MailKit SMTP |
| `IPaymentGateway` | Create VNPAY payment URL and parse VNPAY callback |
| `INotificationService` | Push real-time notifications to SignalR `admins` group |
| `IOAuth2Service` | Google OAuth2 login link generation and callback processing |

---

## Infrastructure Layer

### Persistence & EF Core

`ConnectDbContext` inherits `DbContext` and exposes 10 `DbSet<T>` properties. All configuration is done through `IEntityTypeConfiguration<T>` classes — no data annotations on domain entities.

**Key EF Core configuration details:**

| Entity | Notable Config |
|---|---|
| `User` | Unique index on `Email`. Cascade delete → RefreshTokens, Carts, Reviews. Restrict delete from Orders. |
| `Order` | `CouponID` nullable FK with `SetNull`. Cascade delete → `OrderItems`. |
| `OrderItem` | Composite PK on `(OrderID, ProductID)`. `OrderItemTotalPrice` is `Ignored` (computed property). |
| `Product` | `ImageURL` stored as `\|\|`-delimited string via value converter. |
| `Review` | Unique composite index on `(UserID, ProductID)`. |
| `Payment` | `PaymentID` is `ValueGeneratedNever()` — set from VNPAY response. |
| `RefreshToken` | Unique index on `Token`. Default value `false` for `IsRevoked`. |
| `Category` | Unique index on `CategoryName`. |
| `Coupon` | Unique index on `CouponCode`. |

**Domain event dispatch in `SaveChangesAsync`:**

```
1. Collect events from all tracked AggregateRoot entities
2. ClearDomainEvents() on each aggregate
3. base.SaveChangesAsync() — persist to DB
4. Foreach event: MediatR.Publish(DomainEventNotification<T>)
```

Events are cleared **before** saving to prevent re-entrant dispatch.

---

### Unit of Work & Repository

`UnitOfWork` wraps a single `ConnectDbContext` and provides typed `IRepository<T, TKey>` instances for all 10 entities. `CommitTransactionAsync` calls `SaveChangesAsync` + `CommitAsync` inside a try/catch that automatically rolls back and disposes on failure.

---

### Authentication — JWT

`JWTService.GenerateAccessToken(User)` produces a signed HS256 JWT with claims `sub` (UserID), `email`, `role`, and `jti`. Tokens expire in **10 minutes**. Refresh token rotation provides session continuity with a 7-day window via `/api/users/refresh-token`.

---

### Password Hashing — BCrypt

`PasswordService` wraps `BCrypt.Net-Next` with work factor **12** (~250ms per hash). The `PasswordHash` value object validates BCrypt format at construction, making it impossible to accidentally store raw passwords.

---

### Email Delivery — MailKit & Hangfire

`EmailService` sends HTML transactional emails via SMTP (StartTLS, port 587). All email sends are enqueued as **Hangfire background jobs** inside domain event handlers — the business transaction never fails because of email unavailability.

| Email Method | Trigger | Template |
|---|---|---|
| `SendEmailVerificationAsync` | `CheckEmailHandler` | Verification link with 30-min expiry |
| `SendWelcomeEmailAsync` | `UserRegisterEvent` handler | Welcome + feature list |
| `SendOrderConfirmationAsync` | `OrderPlacedEvent` handler | Order summary with totals |
| `SendOrderCancelledAsync` | `OrderCancelledEvent` handler | Cancellation confirmation |
| `SendPaymentSuccessBillEmailAsync` | `OrderPaidEvent` handler | Payment receipt |
| `SendOrderCompletedAsync` | `OrderCompletedEvent` handler | Completion notice with review CTA |

---

### Payment Gateway — VNPAY

`PaymentGateway` wraps the `VNPAY.NET` NuGet client. `CreatePaymentUrl` embeds the OrderID in the description as `ORDER:{orderId}`. `ParseCallback` extracts the OrderID from the callback description and throws `InvalidOperationException` if the prefix does not match. On VNPAY callback success, the API redirects to `http://localhost:3000/myorder`.

---

### Email Verification — Data Protection

Two time-limited `ITimeLimitedDataProtector` instances with distinct purpose strings prevent token cross-use:

```
"email-verification"    → 30-minute lifetime → embedded in email verification link
"registration-session"  → 15-minute lifetime → returned after link click, used during /register
```

This stateless chain proves email ownership without any database table or cleanup jobs.

---

### Google OAuth2

`OAuth2Service` wraps the `OAuth2.Client` library with a `GoogleClient`. The flow:

1. `GET /api/users/get-oauthauthurl` — redirects client to Google OAuth consent screen.
2. Google redirects back to `GET /api/users/oauth-callback` with `?code=...`.
3. `ProcessOAuthCallbackHandler` exchanges the code for user info, creates or retrieves the user, issues JWT + refresh token, and redirects to `http://localhost:3000/home`.

---

### Real-Time Notifications — SignalR & Redis

`NotificationHub` is a typed SignalR hub (`Hub<INotificationClient>`) organizing connected clients into:

- **`user-{userID}`** — per-user group (populated from `sub` JWT claim on connect)
- **`admins`** — populated when the `role` claim equals `Admin`

`NotificationService` pushes `NotificationDto` payloads to the `admins` group.

```csharp
public sealed record NotificationDto(
    string Id,
    string Type,
    string Title,
    string Body,
    DateTime CreatedAt,
    object? Payload = null);
```

| Notification Type | Trigger | Message |
|---|---|---|
| `low_stock` | Product stock drops to ≤ 5 during order placement | Product name + remaining units |
| `order_placed` | Order successfully created | OrderID, UserID, shipping/payment method, total |
| `order_cancelled` | Order cancelled by customer | OrderID, UserID, new status |
| `payment_success` | VNPAY callback processed | UserID, OrderID, payment method, total |

**Redis backplane** — `AddStackExchangeRedis("localhost:6379")` fans notifications across multiple API instances.

---

## API Layer

### Middleware Pipeline

```
Request
  │
  ▼  1. CorrelationMiddleware       — X-Correlation-Id (read or generate)
  │
  ▼  2. RequestLoggingMiddleware    — logs Method+Path on entry, StatusCode+ms on exit
  │
  ▼  3. ExceptionMiddleware         — all uncaught exceptions → 500 JSON
  │
  ▼  4. PerformanceMiddleware       — LogWarning if request > 1,000ms
  │
  ▼  5. Authentication / Authorization
  │
  ▼  6. Rate Limiter                — global 100 req/min; login 5 req/2 min sliding window
  │
  ▼  7. Controllers
```

### Authentication & Authorization

JWT Bearer authentication validates issuer, audience, lifetime, and HS256 signing key. CORS allows `http://localhost:3000` with credentials.

| Role | Assigned | Access |
|---|---|---|
| `Customer` | Default on registration / OAuth | Own cart, orders, reviews, profile |
| `Admin` | Manual DB assignment | All admin endpoints + SignalR `admins` group |

### Rate Limiting

| Policy | Limit | Window |
|---|---|---|
| Global | 100 requests | 1 minute (fixed window, per user/IP) |
| `LoginPolicy` | 5 requests | 2 minutes (sliding window, per IP) |

---

## Key Flows

### User Registration Flow

```
Client → POST /check-email (email)
  → Email.Create() validates format
  → AnyAsync checks uniqueness
  → Generate 30-min verification token
  → Send verification email via Hangfire
  → 200 OK

Client clicks email link → POST /verify-email (verificationToken)
  → Unprotect token ("email-verification")
  → Generate 15-min registration session token
  → 200 { RegistrationSessionToken }

Client → POST /register (sessionToken, userName, phone, password, address)
  → Unprotect session token ("registration-session") → recovers verified email
  → Hash password (BCrypt cost 12)
  → User.CreateUserProfile(...)
  → SaveChangesAsync() → dispatch UserRegisterEvent
  → Hangfire.Enqueue(SendWelcomeEmail)
  → 201 UserDto
```

### Order Placement Flow

```
Client → POST /orders (items, couponID?, shippingMethod, paymentMethod)
  → Verify user identity
  → Load all products by IDs
  → Load coupon (if provided)
  → foreach item: product.RemoveFromStock(qty)
     if stock ≤ 5: Hangfire.Enqueue(NotifyLowStock)
  → coupon.UseCoupon(totalItemPrice) [validates + decrements stock]
  → Order.CreateOrder(..., discountAmount)
     → CalculateTotalPrice (items sum + shipping fee - discount)
     → RaiseDomainEvent(OrderPlacedEvent)
  → BeginTransactionAsync()
  → Save products + coupon + order
  → CommitTransactionAsync()
     → dispatch OrderPlacedEvent
     → Hangfire.Enqueue(SendOrderConfirmationEmail)
     → Hangfire.Enqueue(NotifyOrderPlaced → SignalR admins)
  → 201 OrderDto
```

### Payment Flow

```
Client → POST /payments/create-paymenturl (orderID)
  → Verify user owns the order
  → PaymentGateway.CreatePaymentUrl(orderID, amount)
     embeds "ORDER:{orderId}" in description
  → 200 { PaymentUrl }

Client redirects to VNPAY → pays → VNPAY calls:
GET /api/payments/vnpay-callback (VNPAY query params)
  → PaymentGateway.ParseCallback(request)
     extracts OrderID from description prefix
  → AnyAsync(paymentID) idempotency check
  → Payment.CreatePayment(...)
  → order.MarkAsPaidForPaymentGateway(true)
     → RaiseDomainEvent(OrderPaidEvent)
  → CommitTransactionAsync()
     → dispatch OrderPaidEvent
     → Hangfire.Enqueue(SendPaymentBillEmail)
     → Hangfire.Enqueue(NotifyPaymentCompleted → SignalR admins)
  → Redirect http://localhost:3000/myorder
```

### Domain Event Dispatch Flow

```
1. handler calls aggregate.SomeMethod()
     → RaiseDomainEvent(new SomeEvent(...))  [in-memory list]

2. unitOfWork.CommitTransactionAsync()
     → _context.SaveChangesAsync()
         a. Collect DomainEvents from all tracked AggregateRoots
         b. ClearDomainEvents() on each
         c. base.SaveChangesAsync()  [actual DB write]
         d. foreach event:
              MediatR.Publish(DomainEventNotification<T>)
              → EventHandler.Handle(notification)
                   → backgroundJobClient.Enqueue<IEmailService>(...)
                   → backgroundJobClient.Enqueue<INotificationService>(...)
                                         ↑
                               SignalR push executed by Hangfire worker
```

---

## Database Schema

```
Users ──┬──► RefreshTokens
        ├──► Carts ─────────────────────────────► Products
        ├──► Reviews ───────────────────────────► Products
        └──► Orders ──► Coupons (nullable, SetNull)
                   └──► OrderItems ─────────────► Products

Categories ──► Products

Payments (standalone, OrderID FK index only)
```

**Key constraints:**

- `Users.Email` — unique index
- `RefreshTokens.Token` — unique index
- `Categories.CategoryName` — unique index
- `Coupons.CouponCode` — unique index
- `Reviews.(UserID, ProductID)` — unique composite index
- `Payment.PaymentID` — `ValueGeneratedNever()` (external VNPAY ID)
- `OrderItems.(OrderID, ProductID)` — composite primary key
- `Product.ImageURL` — `||`-delimited string via value converter

---

## Unit Tests

`Connect.UnitTest` uses xUnit 2.9 and FluentAssertions 6.12. All tests target `Connect.Domain` only — no framework or infrastructure dependencies.

| Test File | Coverage |
|---|---|
| `AmountTests.cs` | Create, addition, subtraction (including negative result), equality, ToString |
| `CurrencyTests.cs` | Create, +/-, multiply by Amount/decimal, comparisons, equality, ToString |
| `EmailTests.cs` | Create, trimming, missing @, empty, equality |
| `UserNameTests.cs` | Create, length bounds, lowercase-only enforcement |
| `PhoneNumberTests.cs` | Create, length, special chars, letters |
| `OtherValueObjectTests.cs` | PasswordHash (BCrypt prefix), ProductName (chars), CategoryName, Code (digit required) |
| `UserTests.cs` | CreateUserProfile, CreateOAuthUserProfile, UpdateProfile, UpdatePassword, domain events |
| `CartTests.cs` | CreateCart, quantity cap, IncreaseCartAmount, ReduceCartAmount |
| `CouponTests.cs` | CreateCoupon, UseCoupon (expired, out-of-stock, below min, discount > total), UpdateExpiryDate |
| `ProductTests.cs` | CreateProduct (all validation paths), AddToStock, RemoveFromStock, UpdateFinalPrice, UpdateImage |
| `OrderTests.cs` | CreateOrder, shipping fee calculation (including documented bug), CancelOrder, MarkAsPaid, MarkAsPaidForPaymentGateway, MarkToShipping, MarkToCompleted, domain events |
| `OtherEntityTests.cs` | OrderItem, Review, RefreshToken, Category, Payment |

Run all tests:

```bash
dotnet test Connect.Backend/Connect.UnitTest
```

---

## Observability

### Serilog + Seq

Bootstrapped in `Program.cs` before `WebApplication.CreateBuilder`:

```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();
```

Log level overrides suppress noisy framework logs (`Microsoft.*`, `System.Net.Http.HttpClient`). In Development, the Seq dashboard opens automatically on app start.

### MediatR Logging

`LoggingBehavior` adds pipeline-level structured log entries:

```
[START] Handling CreateOrderCommand | Payload: { ... }
[END]   CreateOrderCommand completed in 142ms
[SLOW]  CreateOrderCommand completed in 612ms — exceeded threshold of 500ms
[FAILURE] CreateOrderCommand failed after 38ms | Error: Product not found
```

### Performance Monitoring

| Layer | Threshold | Log Level | Scope |
|---|---|---|---|
| `PerformanceMiddleware` | 1,000ms | Warning | Full HTTP request |
| `LoggingBehavior` | 500ms | Warning | MediatR handler only |

---

## Configuration Reference

| Section | Key | Default | Description |
|---|---|---|---|
| `ConnectionStrings` | `Default` | — | SQL Server connection string (also used by Hangfire) |
| `Jwt` | `SecretKey` | — | HS256 signing key (minimum 256 bits recommended) |
| `Jwt` | `Issuer` | `Connect.API` | JWT `iss` claim |
| `Jwt` | `Audience` | `Connect.Client` | JWT `aud` claim |
| `Jwt` | `ExpiryMinutes` | `60` | Config value (code uses 10 min hardcoded in `JWTService`) |
| `Email` | `Host` | `smtp.gmail.com` | SMTP hostname |
| `Email` | `Port` | `587` | SMTP port (StartTLS) |
| `Email` | `Username` | — | SMTP auth username (Gmail address) |
| `Email` | `Password` | — | SMTP app password (16-char Google App Password) |
| `Email` | `FromName` | `Connect.` | `From:` display name |
| `VNPAY` | `TmnCode` | — | Merchant terminal code |
| `VNPAY` | `HashSecret` | — | HMAC hash secret |
| `VNPAY` | `CallbackUrl` | — | Publicly accessible callback URL |
| `VNPAY` | `BaseUrl` | sandbox URL | VNPAY payment page base URL |
| `VNPAY` | `Version` | `2.1.0` | API version |
| `VNPAY` | `OrderType` | `other` | Order type classification |
| `GoogleOAuth2` | `client_id` | — | Google OAuth2 client ID |
| `GoogleOAuth2` | `client_secret` | — | Google OAuth2 client secret |
| `GoogleOAuth2` | `redirect_uris` | — | Array of allowed redirect URIs |
| `GoogleOAuth2` | `scopes` | — | Array of OAuth2 scopes |

---

## Getting Started

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download/dotnet/10.0) | 10.0+ | Required |
| [Node.js](https://nodejs.org/) | 20.0+ | Required for frontend |
| SQL Server | 2019+ | Express / LocalDB works for dev |
| Redis | 7.0+ | Required for SignalR backplane |
| [Seq](https://datalust.co/seq) | Latest | Optional — structured log viewer |
| VNPAY Sandbox Account | — | Optional — payment testing only |
| Gmail App Password | — | Optional — email testing only |
| Google Cloud OAuth2 App | — | Optional — Google sign-in only |

### 1. Clone the Repository

```bash
git clone https://github.com/datnguynx110605/connect-ecommerce.git
cd connect-ecommerce
```

### 2. Configure Backend Secrets

```bash
cd Connect.Backend/Connect.API

dotnet user-secrets set "ConnectionStrings:Default" \
  "Server=localhost;Database=ConnectDb;Trusted_Connection=True;TrustServerCertificate=True;"

dotnet user-secrets set "Jwt:SecretKey" "your-minimum-32-character-secret-key-here"

dotnet user-secrets set "Email:Username" "your@gmail.com"
dotnet user-secrets set "Email:Password" "your-16-char-app-password"

dotnet user-secrets set "VNPAY:TmnCode"     "your-tmn-code"
dotnet user-secrets set "VNPAY:HashSecret"  "your-hash-secret"
dotnet user-secrets set "VNPAY:CallbackUrl" "https://localhost:7240/api/payments/vnpay-callback"

# Optional: Google OAuth2
dotnet user-secrets set "GoogleOAuth2:client_id"     "your-client-id"
dotnet user-secrets set "GoogleOAuth2:client_secret"  "your-client-secret"
```

### 3. Apply Database Migrations

```bash
dotnet ef database update \
  --project Connect.Backend/Connect.Infrastructure \
  --startup-project Connect.Backend/Connect.API
```

### 4. Start Redis

```bash
# Docker (recommended)
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### 5. (Optional) Start Seq

```bash
docker run --name seq -d -e ACCEPT_EULA=Y -p 5341:80 datalust/seq:latest
```

### 6. Run the Backend

```bash
dotnet run --project Connect.Backend/Connect.API
```

| URL | Purpose |
|---|---|
| `http://localhost:5198` | Swagger UI (root path in Development) |
| `http://localhost:5198/hangfire` | Hangfire dashboard |
| `http://localhost:5341` | Seq log viewer |
| `https://localhost:7240/hubs/notifications` | SignalR hub endpoint |

### 7. Run the Frontend

```bash
cd Connect.Frontend/Connect.UI
npm install
npm run dev
# → http://localhost:3000
```

### 8. Run Unit Tests

```bash
dotnet test Connect.Backend/Connect.UnitTest
```

---

## Design Decisions

**Why a typed API client layer instead of a generated SDK?** Hand-authored API modules allow fine-grained control over Bearer injection, 401 auto-refresh, anonymous vs. authenticated calls, and `FormData` handling for multipart uploads. One function per endpoint keeps contracts immediately readable.

**Why local cart state synced to the backend?** The local cart gives instant UI feedback without a round-trip on every click. The backend cart is authoritative at checkout — `Checkout.tsx` fetches the backend cart fresh before order creation and falls back to local state if the backend returns empty.

**Why SignalR with Redis over polling?** Zero polling overhead for admin dashboards. Redis backplane means notifications work correctly across horizontally scaled API instances. The `admins` group model ensures only privileged clients receive sensitive operational data.

**Why Clean Architecture?** The domain and application layers have zero framework dependencies — they can be unit-tested without spinning up a database, HTTP server, or any external service. Infrastructure implementations can be swapped (e.g., PostgreSQL, Mailgun) without touching business logic.

**Why DDD tactical patterns?** The e-commerce domain has genuine complexity: inventory management, pricing rules, order lifecycle transitions, coupon validity, payment status synchronization. Aggregates with private constructors and factory methods make invalid states unrepresentable.

**Why CQRS via MediatR?** Not for performance (no read/write DB split here), but for structural clarity. Every operation is a named, typed, discoverable object. Cross-cutting concerns (validation, logging) are registered once in the pipeline.

**Why Data Protection for email tokens?** Provides cryptographically isolated purpose strings — a `registration-session` token cannot be used as an `email-verification` token. Entirely stateless with no database table or cleanup jobs.

**Why Hangfire for emails and notifications?** Background jobs decouple side effects from business transactions. If SMTP or SignalR is temporarily unavailable, Hangfire retries automatically. The business transaction never fails because of email or notification infrastructure.

**Why BCrypt cost 12?** ~250ms per hash makes brute-force attacks impractical even with a leaked database, while being imperceptible to users at normal login frequency.

---

## Known Limitations & Future Work

**Bug — Shipping fee double-application:** `Order.CalculateTotalPrice` has a missing `else if` for `SuperFast`. Standard orders are charged 30,000 + 80,000 VND instead of 30,000 VND. The unit test `CreateOrder_WithStandardShipping_BuggyBehaviourAdds110000` documents this explicitly.

**Bug — `UserRegisterEvent` fires with UserID = 0:** `UserRegisterEvent` is raised inside the `User` constructor before EF Core assigns a database ID. `SendWelcomeEmailAsync` re-fetches by email value in the event payload (workaround), but `UserID = 0` is misleading. The event should be raised after the first `SaveChangesAsync`.

**Missing — `ValidationException` → 400 mapping:** `ExceptionMiddleware` returns `500` for all unhandled exceptions. `FluentValidation.ValidationException` should map to `400`, `DomainExceptions` to `422`, and `UnauthorizedAccessException` to `403`.

**Missing — SignalR client integration in the frontend:** `NotificationHub` is fully implemented on the backend. The React frontend does not yet include a SignalR connection or notification UI. Wiring `@microsoft/signalr` into `AppContext` and rendering a toast/badge for admin users is the natural next step.

**Missing — Pagination metadata in frontend:** All `GetAll*` handlers return `PagedResult<T>` with `TotalPages`, `HasNext`, `HasPrevious` — but the frontend does not yet render pagination controls.

**Missing — Product filtering (frontend sidebar):** `WhereAsync` exists in the repository and product filter query handlers are implemented, but the frontend sidebar filters (category, price range, RAM, ROM, color) are currently display-only.

**Missing — Unit and Integration Tests for Application/Infrastructure:** Test projects only cover the domain layer. Application handler tests and integration tests (using `WebApplicationFactory`) would significantly improve confidence.

**Missing — Admin role assignment API:** Promoting a user to `Admin` requires a direct database update (`UPDATE Users SET Role = 'Admin' WHERE UserID = X`). A `POST /api/users/{id}/role` endpoint restricted to existing admins is the clean solution.

**Improvement — `OrderCompletedEvent` dispatch:** `Order.MarkOrderStatusToCompleted()` calls `RaiseDomainEvent(new OrderCompletedEvent(...))` — the event and handler exist, and the completion email will be sent correctly.

**Improvement — `OrderStatus.Processing`:** The enum value `Processing = 1` exists but no transition implements it. Inserting `Processing` between `Pending` and `Shipping` would provide more granular order tracking.

**Improvement — OAuth2 callback creates duplicate users:** `ProcessOAuthCallbackHandler` always calls `AddAsync` without checking for existing email. Returning the existing user on subsequent OAuth logins instead of throwing a DB duplicate-key error is required for production use.

---

## Author

**datnguynx110605** — Built as a portfolio-grade reference implementation of full-stack Clean Architecture, Domain-Driven Design, CQRS, and real-time notifications in .NET 10 + React 19.

---

## License

MIT © datnguynx110605
