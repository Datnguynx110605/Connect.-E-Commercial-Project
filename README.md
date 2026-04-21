# Connect. E-Commerce API

> A production-grade ASP.NET Core 10 REST API for a full e-commerce platform — architected with Clean Architecture, Domain-Driven Design, CQRS, and a rich domain model that enforces business rules at the type level.

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![EF Core](https://img.shields.io/badge/EF%20Core-10.0-7B3F9E?logo=microsoftsqlserver&logoColor=white)](https://learn.microsoft.com/ef/)
[![MediatR](https://img.shields.io/badge/MediatR-14.1-0078D4)](https://github.com/jbogard/MediatR)
[![FluentValidation](https://img.shields.io/badge/FluentValidation-12.1-e74c3c)](https://docs.fluentvalidation.net/)
[![Hangfire](https://img.shields.io/badge/Hangfire-1.8-2ecc71)](https://www.hangfire.io/)
[![Serilog](https://img.shields.io/badge/Serilog-10.0-blue)](https://serilog.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

**Connect.** is a fully self-contained e-commerce backend that covers the complete commerce lifecycle — from user registration and product browsing through cart management, order placement, coupon redemption, online payment via VNPAY, and transactional email delivery. It is built as a serious reference implementation demonstrating how Clean Architecture, DDD tactical patterns, and CQRS work together in a real .NET application — not as a tutorial, but as production-quality code you can read, fork, and extend.

The codebase enforces a strict no-anemic-model policy: every business rule lives inside the domain, every value is validated at the point of construction, and every side effect is decoupled through domain events and background jobs.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Solution Structure](#solution-structure)
- [Domain Model](#domain-model)
  - [Aggregates & Entities](#aggregates--entities)
  - [Value Objects](#value-objects)
  - [Enumerations](#enumerations)
  - [Domain Events](#domain-events)
  - [Business Rules & Invariants](#business-rules--invariants)
- [Application Layer — CQRS](#application-layer--cqrs)
  - [Pipeline Behaviors](#pipeline-behaviors)
  - [Feature Modules](#feature-modules)
  - [Service Interfaces](#service-interfaces)
- [Infrastructure Layer](#infrastructure-layer)
  - [Persistence & EF Core](#persistence--ef-core)
  - [Unit of Work & Repository](#unit-of-work--repository)
  - [Authentication — JWT](#authentication--jwt)
  - [Password Hashing — BCrypt](#password-hashing--bcrypt)
  - [Email Delivery — MailKit & Hangfire](#email-delivery--mailkit--hangfire)
  - [Payment Gateway — VNPAY](#payment-gateway--vnpay)
  - [Email Verification — Data Protection](#email-verification--data-protection)
- [API Layer](#api-layer)
  - [Middleware Pipeline](#middleware-pipeline)
  - [Authentication & Authorization](#authentication--authorization)
  - [API Endpoints Reference](#api-endpoints-reference)
- [Key Flows](#key-flows)
  - [User Registration Flow](#user-registration-flow)
  - [Order Placement Flow](#order-placement-flow)
  - [Order Cancellation Flow](#order-cancellation-flow)
  - [Payment Flow](#payment-flow)
  - [Domain Event Dispatch Flow](#domain-event-dispatch-flow)
- [Database Schema](#database-schema)
- [Observability](#observability)
- [Configuration Reference](#configuration-reference)
- [Getting Started](#getting-started)
- [Design Decisions](#design-decisions)
- [Known Limitations & Future Work](#known-limitations--future-work)
- [Author](#author)
- [License](#license)

---

## Architecture Overview

Connect. is organized as a four-layer Clean Architecture solution. Each layer has a single, well-defined responsibility. Dependencies always point inward — outer layers know about inner layers, never the reverse.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Connect.API                              │
│   Controllers · Middleware · DI Wiring · Swagger · Serilog      │
└───────────────────────────┬─────────────────────────────────────┘
                            │ references
┌───────────────────────────▼─────────────────────────────────────┐
│                    Connect.Application                          │
│   CQRS Handlers · DTOs · FluentValidation · Pipeline Behaviors  │
│   MediatR Requests · Service Interfaces (abstractions only)     │
└──────────┬────────────────────────────────────────┬────────────┘
           │ references                             │ references
┌──────────▼──────────┐              ┌──────────────▼────────────┐
│   Connect.Domain    │              │  Connect.Infrastructure   │
│  Entities · AggRoots│              │  EF Core · JWT · BCrypt   │
│  Value Objects      │◄─────────────│  MailKit · VNPAY · Hangfire│
│  Domain Events      │  references  │  Repositories · Services  │
│  Business Rules     │              │                           │
└─────────────────────┘              └───────────────────────────┘
```

### Layer Responsibilities

**`Connect.Domain`** — The heart of the system. Contains all entities, value objects, domain events, enumerations, and business invariants. Has zero framework dependencies — it is plain C# targeting `net10.0`. No EF Core attributes, no ASP.NET concerns, no NuGet packages. This layer compiles and runs in complete isolation.

**`Connect.Application`** — Orchestrates the domain. Houses all CQRS commands and queries (via MediatR), FluentValidation validators, DTO definitions, and `interface` contracts for every external dependency. The application layer *defines* what it needs (e.g., `IEmailService`, `IUnitOfWork`) but never *implements* those contracts. It references `Connect.Domain` only.

**`Connect.Infrastructure`** — Implements every interface defined in `Connect.Application`. Houses the EF Core `DbContext`, all entity configurations, the generic repository, Unit of Work, JWT token generation, BCrypt password hashing, MailKit SMTP delivery, Hangfire job scheduling, VNPAY gateway integration, and ASP.NET Core Data Protection for email tokens.

**`Connect.API`** — The entry point. Wires together the DI container, registers the middleware pipeline, configures Swagger/OpenAPI, sets up JWT Bearer authentication, and maps controllers. Contains no business logic.

---

## Solution Structure

```
Connect.sln
│
├── Connect.Domain/
│   ├── Common/
│   │   ├── AggregateRoot.cs          # Base for event-raising aggregates
│   │   ├── DomainEvent.cs            # Abstract record with EventID + CreatedAt
│   │   └── DomainExceptions.cs       # Typed exception with Code + Metadata
│   ├── Core/
│   │   ├── Entities/
│   │   │   ├── User.cs               # AggregateRoot — raises UserRegisterEvent
│   │   │   ├── Order.cs              # AggregateRoot — raises 3 domain events
│   │   │   ├── OrderItem.cs          # Owned by Order
│   │   │   ├── Product.cs            # Stock + status management
│   │   │   ├── Cart.cs               # Price-snapshotted cart item
│   │   │   ├── Coupon.cs             # Time-limited discount with stock
│   │   │   ├── Review.cs             # AggregateRoot — one per user/product
│   │   │   ├── Payment.cs            # Sealed — immutable payment record
│   │   │   ├── Category.cs           # Simple taxonomy
│   │   │   └── RefreshToken.cs       # 7-day rotating token
│   │   ├── Enums/
│   │   │   ├── OrderStatus.cs        # Pending → Processing → Shipping → Completed | Cancelled
│   │   │   ├── PaymentStatus.cs      # Unpaid → Pending → Paid
│   │   │   ├── PaymentMethod.cs      # Cash | OnlineBanking | VNPAY
│   │   │   ├── ShippingMethod.cs     # Standard | Fast | SuperFast
│   │   │   └── ProductStatus.cs      # InStock | OutOfStock
│   │   └── ValueObjects/
│   │       ├── Amount.cs             # Non-negative int wrapper
│   │       ├── Currency.cs           # Non-negative decimal + arithmetic operators
│   │       ├── Email.cs              # Must contain @
│   │       ├── UserName.cs           # 3–30 lowercase letters only
│   │       ├── PhoneNumber.cs        # Exactly 10 digits
│   │       ├── PasswordHash.cs       # BCrypt hash format validation
│   │       ├── ProductName.cs        # 5–100 chars, restricted charset
│   │       ├── CategoryName.cs       # 2–20 word chars
│   │       └── Code.cs               # Coupon code — 5–12 chars with digit
│   └── Events/
│       ├── UserEvents/
│       │   └── UserRegisterEvent.cs
│       └── OrderEvents/
│           ├── OrderPlacedEvent.cs
│           ├── OrderCancelledEvent.cs
│           ├── OrderPaidEvent.cs
│           └── OrderCompletedEvent.cs
│
├── Connect.Application/
│   ├── Commons/
│   │   ├── Behaviors/
│   │   │   ├── LoggingBehavior.cs    # Structured request/response logging
│   │   │   └── ValidationBehavior.cs # FluentValidation pipeline gate
│   │   └── DomainEventNotification.cs # INotification wrapper for domain events
│   ├── DTOs/                          # All response/transfer shapes
│   ├── Features/
│   │   ├── Carts/     { Commands: AddToCart, ReduceCartAmount, RemoveCart }
│   │   │              { Queries:  GetAllCarts, GetUserCart }
│   │   ├── Categories/{ Commands: CreateCategory, UpdateCategoryName, DeleteCategory }
│   │   │              { Queries:  GetAllCategories, GetSpecificCategory }
│   │   ├── Coupons/   { Commands: CreateCoupon, UpdateCouponExpiryDate, UpdateCouponQuantity }
│   │   │              { Queries:  GetAllCoupons, GetSpecificCoupon }
│   │   ├── Orders/    { Commands: CreateOrder, CancelOrder, MarkAsPaid,
│   │   │                          UpdateOrderStatusToShipping, UpdateOrderStatusToCompleted }
│   │   │              { Queries:  GetAllOrders, GetOrderHistory }
│   │   ├── Payments/  { Commands: CreatePayment, ProcessPaymentCallback }
│   │   │              { Queries:  GetAllPayments }
│   │   ├── Products/  { Commands: CreateProduct, UpdateProductStock,
│   │   │                          UpdateProductImage, DeleteProduct }
│   │   │              { Queries:  GetAllProducts, GetProductDetail }
│   │   ├── Reviews/   { Commands: CreateReview, UpdateReview, DeleteReview }
│   │   │              { Queries:  GetAllReviews, GetReviewByProduct }
│   │   └── Users/     { Commands: CheckEmail, VerifyEmail, RegisterUser, LoginUser,
│   │                              RefreshToken, ForgetPassword, UpdateUserProfile,
│   │                              UpdateUserPassword, DeleteUserProfile }
│   │                  { Queries:  GetAllUsers, GetUserProfile }
│   ├── Interfaces/
│   │   ├── Persistences/
│   │   │   ├── IRepository.cs        # Generic repository contract
│   │   │   └── IUnitOfWork.cs        # Transaction + repository orchestration
│   │   └── Services/
│   │       ├── ICurrentUserService.cs
│   │       ├── IEmailService.cs
│   │       ├── IEmailVerificationService.cs
│   │       ├── IJWTService.cs
│   │       ├── IPasswordService.cs
│   │       └── IPaymentGateway.cs
│   └── DependencyInjection.cs
│
├── Connect.Infrastructure/
│   ├── Configurations/               # One IEntityTypeConfiguration<T> per entity
│   ├── Data/
│   │   └── ConnectDbContext.cs       # EF Core context + domain event dispatch
│   ├── Persistences/
│   │   ├── GenericRepository.cs
│   │   └── UnitOfWork.cs
│   ├── Services/
│   │   ├── CurrentUserService.cs     # Reads UserID + Role from JWT claims
│   │   ├── EmailService.cs           # MailKit SMTP + HTML templates
│   │   ├── EmailVerificationService.cs # Data Protection token generation
│   │   ├── JWTService.cs             # HS256 access token generation
│   │   ├── PasswordService.cs        # BCrypt wrapping
│   │   └── PaymentGateway.cs         # VNPAY.NET client wrapper
│   ├── Settings/
│   │   ├── JWTSetting.cs
│   │   └── EmailSettings.cs
│   └── DependencyInjection.cs
│
└── Connect.API/
    ├── Controllers/
    │   ├── APIController.cs           # Abstract base with ISender
    │   ├── CartsController.cs
    │   ├── CategoriesController.cs
    │   ├── CouponsController.cs
    │   ├── OrdersController.cs
    │   ├── PaymentsController.cs
    │   ├── ProductsController.cs
    │   ├── ReviewsController.cs
    │   └── UsersController.cs
    ├── Middlewares/
    │   ├── CorrelationMiddleware.cs
    │   ├── RequestLoggingMiddleware.cs
    │   ├── ExceptionMiddleware.cs
    │   └── PerformanceMiddleware.cs
    ├── DependencyInjection.cs         # JWT auth, Swagger, CORS
    ├── MiddlewareExtensions.cs
    └── Program.cs
```

---

## Domain Model

The domain model is the most important part of this codebase. Everything else exists to serve it.

### Aggregates & Entities

#### `User` — AggregateRoot

The central identity entity. Owns the registration event, profile data, and all relationships downstream (orders, cart items, reviews, refresh tokens).

**Key behaviors:**
- `CreateUserProfile(...)` — static factory. Validates address is non-empty, then constructs and immediately raises `UserRegisterEvent`. The UserID in the event will be `0` at raise-time because EF Core has not yet assigned a database ID — this is a known nuance; the event handler re-fetches the user by ID.
- `UpdateUserProfile(...)` — validates address before updating all fields atomically.
- `UpdateUserPassword(PasswordHash pass)` — guards against setting the same password by comparing `PasswordHash` records directly (record equality on the value).

**Database relationships:**
- `HasMany<RefreshToken>` — cascade delete
- `HasMany<Cart>` — cascade delete
- `HasMany<Order>` — restrict delete (orders must be managed explicitly)
- `HasMany<Review>` — cascade delete

---

#### `Order` — AggregateRoot

The most complex aggregate. Owns its `OrderItem` collection as a read-only list backed by a private `List<OrderItem>`. Enforces all order lifecycle transitions.

**Key behaviors:**

`CreateOrder(...)` — validates `userID > 0`, validates `ShippingMethod` and `PaymentMethod` enum membership, validates `orderItems` is non-empty, constructs the order, calls `CalculateTotalPrice`, and raises `OrderPlacedEvent`.

`CalculateTotalPrice(Currency discountAmount)` — sums all `OrderItem.OrderItemTotalPrice` values, subtracts the discount, then applies the shipping fee. **Note:** There is a logic defect in the current implementation — the `if/else if/else` chain for shipping fees applies both the `Standard` branch AND the final `else` branch when `ShippingMethod` is `Standard` (missing `else if` for the third branch). Standard orders are charged 30,000 + 80,000 VND. This is a known issue.

`CancelOrder()` — only allowed from `OrderStatus.Pending`. Sets status to `Cancelled`, raises `OrderCancelledEvent`.

`MarkAsPaid()` — guards against double-payment (throws if already `Paid`) and against paying a cancelled order. Sets `PaymentStatus = Paid`, raises `OrderPaidEvent`.

`MarkOrderStatusToShipping()` — cannot transition a cancelled order to shipping.

`MarkOrderStatusToCompleted()` — requires payment status to not be `Unpaid` and order to not be `Cancelled`.

`IntitalizePaymentStatus()` — called in the constructor. Cash orders start `Unpaid`; all online payment methods start `Pending`.

**Shipping fees:**

| Method | Fee (VND) |
|---|---|
| `Standard` | 30,000 |
| `Fast` | 50,000 |
| `SuperFast` | 80,000 |

---

#### `Product`

Manages its own stock lifecycle and enforces domain rules on product data quality.

**Key behaviors:**
- `CreateProduct(...)` — validates description length (50–2,000 chars), no special characters (`[<>{}\[\]\\|^~\`]`), `finalPrice ≤ originalPrice`, non-empty `imageURL`, color length (≤ 15 chars), `ram ≤ rom`.
- `AddToStock(Amount)` / `RemoveFromStock(Amount)` — mutate `Stock` and call `MarkProductStock()` to automatically sync `ProductStatus`.
- `MarkProductStock()` — private. Sets `ProductStatus = OutOfStock` when `Stock.Value == 0`, otherwise `InStock`.
- `UpdateProductFinalPrice(Currency)` — prevents setting final price above original.
- `UpdateProductImage(List<string>)` — requires non-empty list.

---

#### `Cart`

A price-snapshotted cart item. When a product's price changes, existing cart items retain the price from when they were added — they are not re-evaluated against the live product price.

**Key behaviors:**
- `CreateCart(...)` — validates `userID > 0`, `productID > 0`, then calls `AddToCart`.
- `AddToCart(Amount, Currency)` — **Note:** checks `CartQuantity.Value > 10` before adding. But `CartQuantity` is uninitialized (default `Amount`) at this point in `CreateCart`, making this guard unreachable on creation. It would only be meaningful if `AddToCart` were called on an existing cart instance.
- `ReduceCartAmount(Amount)` — guards against reducing when quantity is already 0, then subtracts and recalculates `CartTotalPrice`.

---

#### `Coupon`

A discount code with expiry enforcement, stock tracking, and atomic `UseCoupon()` behavior.

**Key behaviors:**
- `UseCoupon()` — calls `VerifyCoupon()` (checks expiry and stock > 0), then decrements stock by exactly 1.
- `UpdateCouponExpiryDate(DateTime)` — rejects past dates.
- `VerifyCoupon()` — private guard. Throws typed `DomainExceptions` with distinct codes: `EXPIRED-COUPON` and `OUTOFQUANTITY-COUPON`.

---

#### `Review` — AggregateRoot

One review per user per product, enforced at the database level via a unique composite index on `(UserID, ProductID)`.

**Validation:**
- Creation: body must be 1–2,000 chars, non-empty.
- Updates: body must be 5–300 chars (stricter on update than creation).

---

#### `Payment` — `sealed`

An immutable record of a completed payment transaction. Created exclusively from a VNPAY callback. The `sealed` modifier signals that this entity is final — no inheritance, no extension.

**Idempotency:** The `ProcessPaymentCallbackHandler` checks for an existing `Payment` with the same `PaymentID` before creating a new one, making the callback endpoint safe to call multiple times (as VNPAY may retry).

---

#### `RefreshToken`

A cryptographically random 64-byte token (Base64 encoded, 88 chars) with a 7-day expiry and revocation support.

**Key behaviors:**
- `CreateRefreshToken(int userID)` — generates token on construction via `RandomNumberGenerator`.
- `VerifyRefreshToken()` — throws if expired OR if revoked.
- `RevokeRefreshToken()` — idempotent (returns early if already revoked).

---

### Value Objects

All value objects are `sealed record` with a private constructor. The only way to obtain an instance is through the static `Create(...)` factory, which throws `DomainExceptions` for invalid input. This means **it is impossible to have an invalid value object in memory**.

Value objects use C# record equality — two `Email` records with the same `.Value` are structurally equal. This is used in `User.UpdateUserPassword` to reject unchanged passwords.

| Value Object | Type | Rules |
|---|---|---|
| `Amount` | `int` | `value >= 0`. Operators: `+`, `-`. |
| `Currency` | `decimal` | `value >= 0`. Operators: `+`, `-`, `* Amount`, `* decimal` (rounds to 0 decimal places). |
| `Email` | `string` | Non-empty, must contain `@`. Trimmed on creation. |
| `UserName` | `string` | 3–30 chars, must match `^[a-z]+$` (lowercase letters only, no digits or spaces). |
| `PhoneNumber` | `string` | Exactly 10 chars, no `\W` (non-word) characters, no `[a-z]` letters. |
| `PasswordHash` | `string` | Exactly 60 chars, must match BCrypt prefix `^\$2[aby]\$\d{2}\$`. |
| `ProductName` | `string` | 5–100 chars, allows `\p{L}\p{N}\s\-\|` (Unicode letters, digits, whitespace, hyphen, pipe). |
| `CategoryName` | `string` | 2–20 chars, no `\W` characters (word chars only — `[a-zA-Z0-9_]`). |
| `Code` | `string` | 5–12 chars, must contain at least one digit (`\d`). |

**`Currency` arithmetic operators** are designed to be composable in domain calculations:

```csharp
// In Order.CalculateTotalPrice:
Currency total = items
    .Select(x => x.OrderItemTotalPrice)   // Currency * Amount
    .Aggregate(Currency.Create(0), (sum, next) => sum + next);

total -= discountAmount;
total += shippingFee;
```

---

### Enumerations

```csharp
// Order lifecycle
enum OrderStatus  { Pending=0, Processing=1, Shipping=2, Completed=3, Cancelled=4 }

// Payment lifecycle
enum PaymentStatus { Unpaid=0, Pending=1, Paid=2 }

// How the customer pays
enum PaymentMethod { Cash=0, OnlineBanking=1, VNPAY=2 }

// Shipping tier (affects fee)
enum ShippingMethod { Standard=0, Fast=1, SuperFast=2 }

// Stock state (auto-managed by Product)
enum ProductStatus { InStock=0, OutOfStock=1 }
```

---

### Domain Events

Domain events are plain C# records inheriting `DomainEvent`, which carries an auto-generated `EventID` (Guid) and `CreatedAt` (UTC DateTime).

```csharp
public abstract record DomainEvent
{
    public Guid EventID { get; } = Guid.NewGuid();
    public DateTime CreatedAt { get; } = DateTime.UtcNow;
}
```

Events are **raised** inside `AggregateRoot.RaiseDomainEvent(DomainEvent)`, stored in a private `List<DomainEvent>`, exposed as `IReadOnlyCollection<DomainEvent>`, and **dispatched** after `SaveChangesAsync` inside `ConnectDbContext`.

| Event | Raised In | Payload | Handler | Effect |
|---|---|---|---|---|
| `UserRegisterEvent` | `User` constructor | `UserID`, `UserName`, `Email` | `UserRegisteredEventHandler` | Enqueues welcome email job |
| `OrderPlacedEvent` | `Order.CreateOrder` | Full `Order` reference | `CreatedOrderEventHandler` | Enqueues order confirmation email job |
| `OrderCancelledEvent` | `Order.CancelOrder` | Full `Order` reference | `CancelledOrderEventHandler` | Enqueues order cancelled email job |
| `OrderPaidEvent` | `Order.MarkAsPaid` | Full `Order` reference | `OrderPaidEventHandler` | Enqueues payment success bill email job |
| `OrderCompletedEvent` | `Order.MarkOrderStatusToCompleted` — *Note: not currently raised; the event class exists but `RaiseDomainEvent` is not called in the handler* | `OrderID`, `UserID`, `OrderStatus` | `OrderCompletedEventHandler` | Enqueues order completed email job |

---

### Business Rules & Invariants

These rules are enforced at the domain level and cannot be bypassed by the application or API layers:

| Rule | Enforced In |
|---|---|
| Cart quantity per item ≤ 10 | `Cart.AddToCart` |
| Cart quantity cannot go below 0 | `Amount` subtraction (throws if result < 0) |
| Final price must not exceed original price | `Product.CreateProduct`, `Product.UpdateProductFinalPrice` |
| RAM value must not exceed ROM value | `Product.CreateProduct` |
| Coupons cannot be used after expiry | `Coupon.VerifyCoupon` |
| Coupons cannot be used with zero stock | `Coupon.VerifyCoupon` |
| Orders can only be cancelled from Pending status | `Order.CancelOrder` |
| Cancelled orders cannot be marked as Shipping | `Order.MarkOrderStatusToShipping` |
| Unpaid or cancelled orders cannot be completed | `Order.MarkOrderStatusToCompleted` |
| Already-paid orders cannot be paid again | `Order.MarkAsPaid` |
| Passwords cannot be updated to the same value | `User.UpdateUserPassword` |
| Refresh tokens have a fixed 7-day lifetime | `RefreshToken` constructor |
| Revoked tokens cannot be used | `RefreshToken.VerifyRefreshToken` |
| Coupon expiry date cannot be set to the past | `Coupon.UpdateCouponExpiryDate` |
| Product description must be between 50–2,000 chars | `Product.CreateProduct` |
| Product description cannot contain `< > { } [ ] \ | ^ ~ \`` | `Product.CreateProduct` |

---

## Application Layer — CQRS

Every operation in the system is modeled as either a **Command** (mutates state, returns a DTO) or a **Query** (reads state, returns a DTO or collection). This strict CQRS split is enforced by convention, not the framework.

All commands and queries implement `IRequest<TResponse>` and are handled by a corresponding `IRequestHandler<TRequest, TResponse>`. The MediatR `ISender` is the only dependency in controllers — controllers know nothing about handlers, repositories, or domain entities.

### Pipeline Behaviors

Two `IPipelineBehavior<TRequest, TResponse>` implementations are registered globally and wrap **every** command and query in order:

#### `LoggingBehavior<TRequest, TResponse>`

```
[START] → Handler executes → [END] or [SLOW] or [FAILURE]
```

- Logs `[START]` with the request type name and full serialized payload before execution.
- Uses `Stopwatch` to measure execution duration.
- Logs `[END]` with duration on success.
- Logs `[SLOW]` warning if duration exceeds **500ms** — below the middleware-level 1,000ms threshold, enabling early detection of slow handlers specifically.
- Logs `[FAILURE]` with exception details, duration, and payload if the handler throws.
- Structured log fields enable filtering in Seq: `{RequestName}`, `{ElapsedMs}`, `{ThresholdMs}`, `{Request}`.

#### `ValidationBehavior<TRequest, TResponse>`

- Short-circuits immediately if no validators are registered for the request type.
- Runs all `IValidator<TRequest>` implementations **concurrently** using `Task.WhenAll`.
- Aggregates all failures across all validators.
- Throws `FluentValidation.ValidationException` with the full list of `ValidationFailure` objects if any failures exist.
- This exception is currently caught by `ExceptionMiddleware` and returned as a `500`. For a production system, `ExceptionMiddleware` would ideally distinguish `ValidationException` and return `400 Bad Request` with structured error details.

---

### Feature Modules

Each feature module follows an identical internal structure:

```
Features/
└── Orders/
    ├── Commands/
    │   ├── CreateOrder/
    │   │   ├── CreateOrderCommand.cs           IRequest<OrderDto>
    │   │   ├── CreateOrderCommandValidation.cs AbstractValidator<CreateOrderCommand>
    │   │   ├── CreateOrderHandler.cs           IRequestHandler<CreateOrderCommand, OrderDto>
    │   │   └── CreatedOrderEventHandler.cs     INotificationHandler<DomainEventNotification<OrderPlacedEvent>>
    │   ├── CancelOrder/
    │   │   ├── CancelOrderCommand.cs
    │   │   ├── CancelOrderHandler.cs
    │   │   └── CancelledOrderEventHandler.cs
    │   └── ...
    └── Queries/
        ├── GetAllOrders/
        │   ├── GetAllOrdersQuery.cs
        │   └── GetAllOrdersHandler.cs
        └── ...
```

All handlers are `internal sealed` — they are not part of the public API of the Application assembly. Commands and queries are `public sealed record` — they cross the API boundary.

---

### Service Interfaces

The Application layer defines the following contracts, all implemented in Infrastructure:

| Interface | Purpose |
|---|---|
| `IUnitOfWork` | Repository access + transaction management |
| `IRepository<T, TKey>` | Generic CRUD, query, and bulk operations |
| `ICurrentUserService` | `UserID` and `Role` from the current HTTP context |
| `IJWTService` | Access token generation |
| `IPasswordService` | Hash and verify passwords |
| `IEmailVerificationService` | Generate and unprotect time-limited tokens |
| `IEmailService` | Send transactional HTML emails |
| `IPaymentGateway` | Create payment URL and parse VNPAY callback |

---

## Infrastructure Layer

### Persistence & EF Core

`ConnectDbContext` inherits `DbContext` and exposes 10 `DbSet<T>` properties. All configuration is done through `IEntityTypeConfiguration<T>` classes — no data annotations on domain entities, keeping the domain completely framework-free.

**Value object converters** are configured inline per property:

```csharp
builder.Property(u => u.Email)
    .HasConversion(
        v => v.Value,          // Email → string (write to DB)
        v => Email.Create(v))  // string → Email (read from DB)
    .HasMaxLength(100)
    .IsRequired();
```

This means the database stores simple primitive types while the application always works with strongly-typed value objects.

**Key configuration details by entity:**

| Entity | Notable Config |
|---|---|
| `User` | Unique index on `Email`. Cascade delete to RefreshTokens, Carts, Reviews. Restrict delete from Orders. |
| `Order` | `CouponID` is nullable FK with `SetNull` on delete. Cascade delete to `OrderItems`. |
| `OrderItem` | Composite PK on `(OrderID, ProductID)`. No auto-increment ID. `OrderItemTotalPrice` is `Ignored` (computed property). |
| `Product` | `ImageURL` stored as `||`-delimited string. Cascade delete to Reviews. Restrict delete from Carts/OrderItems. |
| `Category` | Unique index on `CategoryName`. |
| `Coupon` | Unique index on `CouponCode`. |
| `Review` | Unique composite index on `(UserID, ProductID)` — enforces one review per user per product at DB level. |
| `Payment` | `PaymentID` is `ValueGeneratedNever()` — set externally from VNPAY, not auto-generated. |
| `RefreshToken` | Unique index on `Token` column. Default value `false` for `IsRevoked`. |

**Domain event dispatch in `SaveChangesAsync`:**

```csharp
public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
{
    // 1. Collect all domain events from tracked aggregates
    var domainEvents = ChangeTracker.Entries<AggregateRoot>()
        .Select(e => e.Entity)
        .Where(e => e.DomainEvents.Any())
        .SelectMany(e =>
        {
            var events = e.DomainEvents.ToList();
            e.ClearDomainEvents();   // ← Clear BEFORE save to prevent re-dispatch
            return events;
        })
        .ToList();

    // 2. Persist changes to the database
    var result = await base.SaveChangesAsync(cancellationToken);

    // 3. Publish each event via MediatR AFTER successful save
    foreach (var domainEvent in domainEvents)
    {
        var notificationType = typeof(DomainEventNotification<>)
            .MakeGenericType(domainEvent.GetType());
        var notification = Activator.CreateInstance(notificationType, domainEvent);
        await publisher.Publish(notification!, cancellationToken);
    }

    return result;
}
```

This guarantees: events are only published if the DB write succeeds. Events are cleared before saving to prevent re-entrant dispatch if `SaveChangesAsync` is called recursively.

`DomainEvent` is explicitly ignored in `OnModelCreating`:
```csharp
modelBuilder.Ignore<DomainEvent>();
```

---

### Unit of Work & Repository

`IUnitOfWork` provides a single-session view over the entire database with transaction control:

```csharp
public interface IUnitOfWork : IDisposable
{
    IRepository<User, int> Users { get; }
    IRepository<Product, int> Products { get; }
    IRepository<Category, int> Categories { get; }
    IRepository<Order, int> Orders { get; }
    IRepository<OrderItem, int> OrderItems { get; }
    IRepository<Cart, int> Carts { get; }
    IRepository<RefreshToken, int> RefreshTokens { get; }
    IRepository<Coupon, int> Coupons { get; }
    IRepository<Review, int> Reviews { get; }
    IRepository<Payment, int> Payments { get; }

    Task BeginTransactionAsync(CancellationToken ct = default);
    Task CommitTransactionAsync(CancellationToken ct = default);
    Task RollbackTransactionAsync(CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
```

`GenericRepository<T, TKey>` implements:

```csharp
Task<IEnumerable<T>> GetAllNoTrackingAsync(...)
Task<T?> GetByIdAsync(TKey id, ...)
Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, ...)
Task<T?> FirstOrDefaultNoTrackingAsync(...)
Task<IEnumerable<T>> WhereAsync(Expression<Func<T, bool>> predicate, ...)
Task<IEnumerable<T>> WhereNoTrackingAsync(...)
Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, ...)
Task AddAsync(T entity, ...)
void Update(T entity)
void Remove(T entity)
Task AddRangeAsync(IEnumerable<T> entities, ...)
void UpdateRange(IEnumerable<T> entities)
void RemoveRange(IEnumerable<T> entities)
```

`UnitOfWork.CommitTransactionAsync` wraps `SaveChangesAsync` + `CommitAsync` in a try/catch that automatically calls `RollbackTransactionAsync` on failure and always disposes the transaction.

**Transaction usage pattern** (from `CreateOrderHandler`):

```csharp
await unitOfWork.BeginTransactionAsync(cancellationToken);
unitOfWork.Products.UpdateRange(products);    // Deduct stock
if (coupon != null)
    unitOfWork.Coupons.Update(coupon);        // Decrement coupon stock
await unitOfWork.Orders.AddAsync(order, cancellationToken);
await unitOfWork.CommitTransactionAsync(cancellationToken); // Atomic commit
```

---

### Authentication — JWT

`JWTService.GenerateAccessToken(User user)` produces a signed HS256 JWT containing:

| Claim | Value |
|---|---|
| `sub` | `user.UserID.ToString()` |
| `email` | `user.Email.Value` |
| `role` | `user.Role` ("Customer" or "Admin") |
| `jti` | `Guid.NewGuid().ToString()` (unique per token) |

Tokens expire in **10 minutes**. The short lifetime is intentional — refresh token rotation handles session continuity.

JWT validation parameters:
- Validate Issuer: `Connect.API`
- Validate Audience: `Connect.Client`
- Validate Lifetime: true
- Validate Signing Key: HS256 with configured `SecretKey`

---

### Password Hashing — BCrypt

`PasswordService` wraps `BCrypt.Net-Next` with a work factor of **12** (2¹² = 4,096 iterations). This is a deliberate performance/security trade-off — BCrypt at cost 12 takes ~250ms per hash on modern hardware, which is acceptable for login but prohibitive for brute-force attacks.

The `PasswordHash` value object validates that stored hashes conform to BCrypt format (`$2a$`, `$2b$`, or `$2y$` prefix), meaning only properly hashed values can ever be assigned to a user — raw passwords cannot accidentally be stored.

---

### Email Delivery — MailKit & Hangfire

`EmailService` sends HTML transactional emails via SMTP using MailKit. All six email types use `StartTls` on port 587 and authenticate before sending.

**Email templates** are inline C# raw string literals — no external template engine. Each method has a corresponding `BuildXxxHtml(...)` static method that returns a fully-formed HTML document as a string.

| Method | Subject | Trigger |
|---|---|---|
| `SendOrderConfirmationAsync` | `Order Confirmation #N — Connect.` | Order placed |
| `SendOrderCancelledAsync` | `Order Cancelled #N | Connect.` | Order cancelled |
| `SendPaymentSuccessBillEmailAsync` | `Payment Successful — Order #N | Connect.` | Payment marked paid |
| `SendOrderCompletedAsync` | `Order is completed — Order #N | Connect.` | Order completed |
| `SendEmailVerificationAsync` | `Verify your email — Connect.` | Registration started |
| `SendWelcomeEmailAsync` | `Welcome to Connect. — User #name | Connect.` | Registration completed |

**Why Hangfire?** Email sends happen inside domain event handlers. Sending synchronously would make a business transaction (order creation, user registration) dependent on the availability of an SMTP server. Hangfire decouples the two — the event handler calls `backgroundJobClient.Enqueue<IEmailService>(...)`, which schedules the send as a background job. If the email fails, Hangfire retries it automatically. The business transaction never fails because of email.

Hangfire uses the same SQL Server connection string as the main database, storing job state in dedicated Hangfire tables.

---

### Payment Gateway — VNPAY

`PaymentGateway` is a thin wrapper over the `VNPAY.NET` NuGet client. It handles two operations:

**`CreatePaymentUrl(int orderId, decimal amount)`** — Constructs a `VnpayPaymentRequest` with the order ID embedded in the description field as `ORDER:{orderId}` and returns the redirect URL to the VNPAY checkout page. `BankCode.ANY` allows the user to select any bank.

**`ParseCallback(HttpRequest request)`** — Parses the VNPAY redirect callback, extracts the `OrderID` from the description field, and returns a `PaymentDto`. Throws `InvalidOperationException` if the description does not match the expected `ORDER:` prefix.

The callback controller (`PaymentsController.VnPayCallback`) handles two failure paths:
- `VnpayException` with signature-related message → redirects to `/payment/failed?code=SignatureInvalid`
- `VnpayException` (other) → redirects with the VNPAY response code
- `InvalidOperationException` → redirects to `/payment/failed?code=InvalidOrderId`

On success → redirects to `/payment/success?orderId={orderId}`

---

### Email Verification — Data Protection

Email verification uses ASP.NET Core Data Protection rather than JWT or database tokens. Two separate `ITimeLimitedDataProtector` instances are created with distinct purpose strings:

```
"email-verification"    → 15-minute lifetime → sent in verification link
"registration-session"  → 30-minute lifetime → returned after link click, used during register
```

This two-step token chain ensures:
1. The verification link proves the user controls the email address.
2. The session token bridges the gap between email click and form submission without storing anything in the database.
3. Tokens are cryptographically opaque — no information about the email is visible in the token.
4. Tokens cannot be reused across purposes — a `registration-session` token cannot be used as an `email-verification` token.

---

## API Layer

### Middleware Pipeline

The middleware pipeline is registered in `MiddlewareExtensions.UseCustomMiddleware()` and executes in this exact order on every request:

```
Request
  │
  ▼
┌─────────────────────────────────────────────────────┐
│ 1. CorrelationMiddleware                            │
│    Reads X-Correlation-Id header or generates Guid  │
│    Sets HttpContext.TraceIdentifier                  │
│    Appends X-Correlation-Id to response             │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 2. RequestLoggingMiddleware                         │
│    Logs: Method, Path, TraceId on entry             │
│    Logs: StatusCode, ElapsedMs, TraceId on exit     │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 3. ExceptionMiddleware                              │
│    try { await _next(context); }                    │
│    catch (Exception ex) {                           │
│      Log error with TraceId                         │
│      Return 500 JSON: { title, status, traceId }    │
│      — No stack traces, no exception details        │
│    }                                                │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 4. PerformanceMiddleware                            │
│    Stopwatch wraps entire downstream pipeline       │
│    LogWarning if ElapsedMs > 1,000ms                │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
           [Authentication / Authorization]
                      │
                      ▼
                 [Controllers]
                      │
                      ▼
              Response returned
```

The `X-Correlation-Id` header in every response allows client-side error reporting to be correlated with specific server-side log entries in Seq.

---

### Authentication & Authorization

JWT Bearer authentication is configured in `DependencyInjection.AddPresentation`. Token validation validates issuer, audience, lifetime, and signing key.

CORS is configured to allow `https://localhost:7187` (frontend) with credentials.

**Role-based authorization** uses the `role` JWT claim. Two roles exist:

| Role | Assigned | Description |
|---|---|---|
| `Customer` | Default on registration | Can manage own cart, orders, reviews, and profile. |
| `Admin` | Manual DB assignment | Full access to all admin endpoints. |

Controllers use `[Authorize(Roles = "Admin")]` for admin-only endpoints and `[Authorize]` for authenticated-user endpoints. Public endpoints use `[AllowAnonymous]`.

---

### API Endpoints Reference

All endpoints follow the pattern `api/[controller]`. The `APIController` base class injects `ISender` and exposes it as `protected readonly ISender Sender`.

#### Users — `/api/users`

| Method | Endpoint | Auth | Request Body | Response | Description |
|---|---|---|---|---|---|
| `POST` | `/check-email` | Anonymous | `{ email }` | `200 OK` | Validates email uniqueness, sends verification link |
| `POST` | `/verify-email` | Anonymous | `{ verificationToken }` | `200 { registrationSessionToken }` | Exchanges verification token for session token |
| `POST` | `/register` | Anonymous | `{ registrationSessionToken, userName, phoneNumber, password, address }` | `201 UserDto` | Creates user account |
| `POST` | `/login` | Anonymous | `{ email, password }` | `200 { accessToken, refreshToken }` | Authenticates user |
| `POST` | `/refresh-token` | — | `{ userID, refreshToken }` | `200 { accessToken, refreshToken }` | Rotates refresh token |
| `POST` | `/forget-password` | Anonymous | `{ registrationSessionToken, newPasswordHash }` | `200 string` | Resets password via session token |
| `GET` | `/` | Admin | — | `200 UserDto[]` | Lists all users |
| `GET` | `/profile` | Authenticated | — | `200 UserDto` | Gets own profile |
| `PUT` | `/profile` | Authenticated | `{ userName, email, phoneNumber, address }` | `200 UserDto` | Updates own profile |
| `PUT` | `/change-password` | Authenticated | `{ oldPassword, password }` | `200 string` | Changes own password |
| `DELETE` | `/profile` | Authenticated | — | `200 string` | Deletes own account |

#### Products — `/api/products`

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `GET` | `/` | Anonymous | Returns all products |
| `GET` | `/{id}` | Anonymous | Returns single product detail |
| `POST` | `/` | Admin | `multipart/form-data` for image URLs |
| `PATCH` | `/{id}/stock` | Admin | Adds stock quantity (additive) |
| `PATCH` | `/{id}/image` | Admin | Replaces image URL list |
| `DELETE` | `/{id}` | Admin | Removes product |

#### Orders — `/api/orders`

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `GET` | `/` | Admin | All orders system-wide |
| `GET` | `/history` | Authenticated | Current user's order (singular — see Known Issues) |
| `POST` | `/` | Authenticated | Place new order with items + optional coupon |
| `PATCH` | `/{id}/cancel` | Authenticated | Cancel pending order; stock is restored transactionally |
| `PATCH` | `/{id}/shipping` | Admin | Progress to Shipping status |
| `PATCH` | `/{id}/completed` | Admin | Mark as Completed (requires payment) |
| `PATCH` | `/{id}/paid` | Admin | Mark as Paid (for cash orders) |

#### Carts — `/api/carts`

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `GET` | `/` | Admin | All carts |
| `GET` | `/me` | Authenticated | Current user's cart |
| `POST` | `/` | Authenticated | Add product to cart |
| `PATCH` | `/{id}/reduce` | Authenticated | Reduce cart item quantity |
| `DELETE` | `/{id}` | Authenticated | Remove cart item |

#### Categories — `/api/categories`

| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/` | Anonymous |
| `GET` | `/{id}` | Anonymous |
| `POST` | `/` | Admin |
| `PUT` | `/{id}` | Admin |
| `DELETE` | `/{id}` | Admin |

#### Coupons — `/api/coupons`

| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/` | Authenticated |
| `GET` | `/{id}` | Authenticated |
| `POST` | `/` | Admin |
| `PATCH` | `/{id}/expiry-date` | Admin |
| `PATCH` | `/{id}/quantity` | Admin |

#### Reviews — `/api/reviews`

| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/` | Anonymous |
| `GET` | `/product/{productId}` | Anonymous |
| `POST` | `/` | Authenticated |
| `PUT` | `/{id}` | Authenticated |
| `DELETE` | `/{id}` | Authenticated |

#### Payments — `/api/payments`

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `GET` | `/` | Admin | All payment records |
| `POST` | `/create-url` | Authenticated | Returns VNPAY redirect URL |
| `GET` | `/vnpay-callback` | Anonymous | VNPAY callback — processes payment result |

---

## Key Flows

### User Registration Flow

```
Client                    API                   Services               DB
  │                        │                        │                   │
  ├─ POST /check-email ────►│                        │                   │
  │                        ├── Email.Create() ───────────────────────────│
  │                        │                    AnyAsync(email)──────────►
  │                        │◄────────────────────────────────── false ───┤
  │                        ├── GenerateVerificationToken(15 min) ────────►
  │                        ├── SendEmailVerificationAsync() ─────────────►
  │◄─ 200 OK ──────────────┤                        │                   │
  │                        │                        │                   │
  │  [User clicks email link — frontend receives token]
  │                        │                        │                   │
  ├─ POST /verify-email ───►│                        │                   │
  │  { verificationToken } ├── UnprotectToken("email-verification") ─────►
  │                        ├── GenerateRegistrationSessionToken(30 min) ─►
  │◄─ 200 { sessionToken } ┤                        │                   │
  │                        │                        │                   │
  ├─ POST /register ───────►│                        │                   │
  │  { sessionToken,       ├── UnprotectToken("registration-session") ───►
  │    userName, phone,    ├── Hash(password) [BCrypt cost 12] ──────────►
  │    password, address } ├── User.CreateUserProfile(...)               │
  │                        │   └── RaiseDomainEvent(UserRegisterEvent)   │
  │                        ├── SaveChangesAsync() ───────────────────────►
  │                        │   └── dispatch UserRegisterEvent            │
  │                        │       └── Hangfire.Enqueue(SendWelcomeEmail)►
  │◄─ 201 UserDto ─────────┤                        │                   │
```

---

### Order Placement Flow

```
Client            API                Application           Domain            DB
  │                │                      │                   │               │
  ├─ POST /orders ─►│                      │                   │               │
  │                ├── CreateOrderCommand ─►                   │               │
  │                │                      ├── AnyAsync(userID) ───────────────►
  │                │                      ├── WhereAsync(productIDs) ─────────►
  │                │                      ├── FirstOrDefault(couponID) ───────►
  │                │                      │                   │               │
  │                │                      ├── coupon.UseCoupon()               │
  │                │                      │   ├── VerifyCoupon() [expiry+qty]  │
  │                │                      │   └── RemoveCouponStock(-1)        │
  │                │                      │                   │               │
  │                │                      ├── foreach item:                    │
  │                │                      │   ├── product.RemoveFromStock(qty) │
  │                │                      │   └── OrderItem.CreateOrderItem()  │
  │                │                      │                   │               │
  │                │                      ├── Order.CreateOrder(...)           │
  │                │                      │   ├── CalculateTotalPrice()        │
  │                │                      │   ├── InitializePaymentStatus()    │
  │                │                      │   └── RaiseDomainEvent(OrderPlaced)│
  │                │                      │                   │               │
  │                │                      ├── BeginTransactionAsync() ────────►
  │                │                      ├── UpdateRange(products) ──────────►
  │                │                      ├── Update(coupon) ─────────────────►
  │                │                      ├── AddAsync(order) ────────────────►
  │                │                      ├── CommitTransactionAsync() ───────►
  │                │                      │   └── SaveChanges → dispatch event│
  │                │                      │       └── Hangfire.Enqueue(Email) ►
  │◄─ 201 OrderDto ┤◄─────────────────────┤                   │               │
```

---

### Order Cancellation Flow

```
Client              API              Application           DB
  │                  │                    │                  │
  ├─ PATCH /{id}/cancel ►│                │                  │
  │                  ├── CancelOrderCommand ►                │
  │                  │                    ├── AnyAsync(userID)────────────►
  │                  │                    ├── GetByIdAsync(orderID) ──────►
  │                  │                    ├── Check currentUser == order.UserID
  │                  │                    ├── WhereAsync(productIDs) ─────►
  │                  │                    ├── BeginTransactionAsync() ────►
  │                  │                    ├── foreach item:                │
  │                  │                    │   └── product.AddToStock(qty) │
  │                  │                    ├── order.CancelOrder()          │
  │                  │                    │   ├── Guard: status == Pending │
  │                  │                    │   ├── Status = Cancelled        │
  │                  │                    │   └── RaiseDomainEvent(Cancelled)
  │                  │                    ├── CommitTransactionAsync() ────►
  │                  │                    │   └── dispatch event           │
  │                  │                    │       └── Hangfire.Enqueue() ──►
  │◄─ 200 OrderDto ──┤◄───────────────────┤                  │
```

---

### Payment Flow

```
Client               API                       VNPAY
  │                   │                           │
  ├─ POST /payments/create-url ►│                  │
  │  { orderID }      ├── GetByIdAsync(orderID)    │
  │                   ├── PaymentGateway.CreatePaymentUrl()
  │                   │   └── VnpayClient.CreatePaymentUrl(request) ──────►
  │                   │◄─────────────────────────────────── { url } ───────┤
  │◄─ 200 { paymentUrl } ┤                        │
  │                   │                           │
  ├─ [Redirect to paymentUrl] ──────────────────────────────────────────────►
  │                   │                           │  [User completes payment]
  │                   │◄── GET /vnpay-callback ───────────────────────────── │
  │                   ├── PaymentGateway.ParseCallback(request)              │
  │                   ├── ProcessPaymentCallbackCommand                      │
  │                   │   ├── AnyAsync(paymentID) [idempotency check]        │
  │                   │   ├── GetByIdAsync(orderID)                          │
  │                   │   └── Payment.CreatePayment(...)                     │
  │                   │       └── AddAsync + SaveChangesAsync                │
  │◄─ Redirect /payment/success ┤                 │
```

---

### Domain Event Dispatch Flow

```
Handler (e.g. CreateOrderHandler)
  │
  ├── order.CancelOrder()
  │   └── RaiseDomainEvent(new OrderCancelledEvent(this))
  │       └── domainEvents.Add(event)         ← in-memory list on aggregate
  │
  ├── unitOfWork.CommitTransactionAsync()
  │   └── _context.SaveChangesAsync()
  │       │
  │       ├── [1] Collect: ChangeTracker.Entries<AggregateRoot>()
  │       │              → gather all DomainEvents from all tracked aggregates
  │       │              → ClearDomainEvents() on each                       
  │       │
  │       ├── [2] base.SaveChangesAsync()     ← actual DB write
  │       │
  │       └── [3] foreach domainEvent:
  │               └── MediatR.Publish(DomainEventNotification<OrderCancelledEvent>)
  │                   └── CancelledOrderEventHandler.Handle(notification)
  │                       └── backgroundJobClient.Enqueue<IEmailService>(
  │                               s => s.SendOrderCancelledAsync(...))
  │                                                   ↑
  │                                         Scheduled in Hangfire DB
  │                                         Executed by Hangfire server
  │                                         Retried automatically on failure
```

---

## Database Schema

The following tables are created by EF Core migrations. Foreign key relationships are summarized below.

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────┐
│    Users    │       │   RefreshTokens  │       │    Orders    │
│─────────────│       │─────────────────│       │──────────────│
│ UserID PK   │──┬───►│ RefreshTokenID  │       │ OrderID PK   │
│ UserName    │  │    │ UserID FK       │       │ UserID FK ───┼──► Users
│ Email UNIQ  │  │    │ Token UNIQ      │       │ CouponID FK? │
│ PhoneNumber │  │    │ ExpiryDate      │       │ OrderTotalPrice
│ PasswordHash│  │    │ IsRevoked       │       │ OrderTotalItems
│ Address     │  │    └─────────────────┘       │ ShippingMethod
│ Role        │  │                              │ PaymentMethod
│ CreatedAt   │  │    ┌─────────────────┐       │ PaymentStatus │
└─────────────┘  │    │     Carts       │       │ OrderStatus  │
                 ├───►│─────────────────│       │ CreatedAt    │
                 │    │ CartID PK       │       └──────────────┘
                 │    │ UserID FK       │               │
                 │    │ ProductID FK    │               │ 1:N
                 │    │ CartQuantity    │               ▼
                 │    │ CartUnitPrice   │       ┌──────────────────┐
                 │    │ CartTotalPrice  │       │    OrderItems     │
                 │    └─────────────────┘       │──────────────────│
                 │                              │ OrderID FK (PK)  │
                 └───►┌─────────────────┐       │ ProductID FK (PK)│
                      │    Reviews      │       │ UnitPrice        │
                      │─────────────────│       │ Quantity         │
                      │ ReviewID PK     │       └──────────────────┘
                      │ UserID FK       │
                      │ ProductID FK    │       ┌──────────────┐
                      │ Rating          │       │   Payments   │
                      │ Body            │       │──────────────│
                      │ CreatedAt       │       │ PaymentID PK │
                      │ UNIQ(UserID,    │       │   (external) │
                      │      ProductID) │       │ OrderID FK   │
                      └─────────────────┘       │ PaymentType  │
                                                │ TransactionID│
┌──────────────────┐  ┌─────────────────┐       │ BankingInfo  │
│    Products      │  │   Categories    │       │ TotalAmount  │
│──────────────────│  │─────────────────│       │ IsPaidSuccess│
│ ProductID PK     │  │ CategoryID PK   │       │ PaidAt       │
│ CategoryID FK ───┼─►│ CategoryName    │       └──────────────┘
│ ProductName      │  │   UNIQ          │
│ Description      │  └─────────────────┘       ┌──────────────┐
│ OriginalPrice    │                             │   Coupons    │
│ FinalPrice       │  ┌─────────────────┐        │──────────────│
│ Stock            │  │  Hangfire Tables│        │ CouponID PK  │
│ Ram, Rom, Color  │  │ (auto-created)  │        │ CouponCode   │
│ ImageURL (||sep) │  │─────────────────│        │   UNIQ       │
│ ProductStatus    │  │ Job             │        │ DiscountAmount
│ CreatedAt        │  │ JobQueue        │        │ CouponQuantity
└──────────────────┘  │ State           │        │ ExpiryDate   │
                      │ ...             │        │ CreatedAt    │
                      └─────────────────┘        └──────────────┘
```

---

## Observability

### Serilog

Serilog is bootstrapped at the very start of `Program.cs` before `WebApplication.CreateBuilder` returns, ensuring that startup errors are captured:

```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();

builder.Host.UseSerilog();
```

**Enrichers:** `FromLogContext()` pulls all structured properties added via `LogContext.PushProperty(...)` into every log event — this is what makes correlation IDs and request metadata available in Seq queries.

**Log level overrides** suppress noisy framework logs:

```json
"Override": {
  "Microsoft": "Warning",
  "Microsoft.AspNetCore": "Warning",
  "System.Net.Http.HttpClient": "Warning"
}
```

### Seq

Seq runs locally at `http://localhost:5341` and receives all Serilog events as structured JSON. In Development, the Seq dashboard opens automatically when the application starts:

```csharp
app.Lifetime.ApplicationStarted.Register(() => {
    Process.Start(new ProcessStartInfo {
        FileName = "http://localhost:5341",
        UseShellExecute = true
    });
});
```

Useful Seq query examples:

```
# Find all slow requests
@Properties['ElapsedMs'] > 500

# Trace a specific correlation ID
X-Correlation-Id = 'abc-123'

# All failed requests
@Level = 'Error'

# Orders placed in the last hour
@MessageTemplate like '%OrderPlaced%' and @Timestamp > Now() - 1h
```

### MediatR Logging

`LoggingBehavior` adds a second layer of observability specifically for the application pipeline:

```
[START] Handling CreateOrderCommand | Payload: { ProductID: 5, Quantity: 2 ... }
[END] CreateOrderCommand completed successfully in 142ms
[SLOW] CreateOrderCommand completed in 612ms — exceeded threshold of 500ms
[FAILURE] CreateOrderCommand failed after 38ms | Error: Product not found
```

### Performance Monitoring

Two layers of performance tracking:

| Layer | Threshold | Log Level | Scope |
|---|---|---|---|
| `PerformanceMiddleware` | 1,000ms | Warning | Full HTTP request (includes serialization, auth, middleware) |
| `LoggingBehavior` | 500ms | Warning | MediatR handler execution only |

The gap between the two thresholds allows you to distinguish slow handlers from slow serialization or middleware overhead.

---

## Configuration Reference

All configuration is loaded from `appsettings.json` and `appsettings.{Environment}.json`. Sensitive values should be stored in User Secrets (development) or environment variables / secrets management (production).

| Section | Key | Default | Description |
|---|---|---|---|
| `ConnectionStrings` | `Default` | — | SQL Server connection string (also used by Hangfire) |
| `Jwt` | `SecretKey` | — | HS256 signing key, minimum 256 bits recommended |
| `Jwt` | `Issuer` | `Connect.API` | JWT `iss` claim |
| `Jwt` | `Audience` | `Connect.Client` | JWT `aud` claim |
| `Jwt` | `ExpiryMinutes` | `60` | Access token lifetime (actual code uses 10 min hardcoded) |
| `Email` | `Host` | `smtp.gmail.com` | SMTP server hostname |
| `Email` | `Port` | `587` | SMTP port (StartTLS) |
| `Email` | `Username` | — | SMTP authentication username |
| `Email` | `Password` | — | SMTP app password (not account password) |
| `Email` | `FromName` | `Connect.` | Display name in `From:` header |
| `VNPAY` | `TmnCode` | — | VNPAY merchant terminal code |
| `VNPAY` | `HashSecret` | — | VNPAY HMAC hash secret |
| `VNPAY` | `CallbackUrl` | — | Publicly accessible callback URL |
| `VNPAY` | `BaseUrl` | sandbox URL | VNPAY payment page URL |
| `VNPAY` | `Version` | `2.1.0` | VNPAY API version |
| `VNPAY` | `OrderType` | `other` | VNPAY order type classification |
| `Frontend` | `BaseUrl` | — | Used to construct email verification link |
| `Serilog` | (various) | — | Serilog configuration section |

---

## Getting Started

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download/dotnet/10.0) | 10.0+ | Required |
| SQL Server | 2019+ | Express / LocalDB works for development |
| [Seq](https://datalust.co/seq) | Latest | Optional — structured log viewer |
| VNPAY Sandbox Account | — | Optional — only needed for payment testing |
| Gmail App Password | — | Optional — only needed for email testing |

### 1. Clone the Repository

```bash
git clone https://github.com/datnguynx110605/connect-ecommerce.git
cd connect-ecommerce
```

### 2. Configure the Application

The recommended approach is ASP.NET Core User Secrets for local development to avoid committing credentials:

```bash
cd Connect.API
dotnet user-secrets init   # Only needed once

# Database
dotnet user-secrets set "ConnectionStrings:Default" \
  "Server=localhost;Database=ConnectDb;Trusted_Connection=True;TrustServerCertificate=True;"

# JWT
dotnet user-secrets set "Jwt:SecretKey" "your-minimum-32-character-secret-key-here"

# Email (Gmail App Password — not your Google account password)
dotnet user-secrets set "Email:Username" "your@gmail.com"
dotnet user-secrets set "Email:Password" "your-16-char-app-password"

# Frontend base URL for email verification links
dotnet user-secrets set "Frontend:BaseUrl" "http://localhost:3000"

# VNPAY (optional — only if testing payments)
dotnet user-secrets set "VNPAY:TmnCode" "your-tmn-code"
dotnet user-secrets set "VNPAY:HashSecret" "your-hash-secret"
dotnet user-secrets set "VNPAY:CallbackUrl" "https://localhost:7240/api/payments/vnpay-callback"
```

Alternatively, edit `Connect.API/appsettings.json` directly (do not commit secrets):

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Database=ConnectDb;Trusted_Connection=True;"
  },
  "Jwt": {
    "SecretKey": "<your-256-bit-secret>",
    "Issuer": "Connect.API",
    "Audience": "Connect.Client",
    "ExpiryMinutes": 60
  },
  "Email": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "Username": "your@gmail.com",
    "Password": "<gmail-app-password>",
    "FromName": "Connect."
  },
  "VNPAY": {
    "TmnCode": "<vnpay-tmn-code>",
    "HashSecret": "<vnpay-hash-secret>",
    "CallbackUrl": "https://yourdomain.com/api/payments/vnpay-callback",
    "BaseUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    "Version": "2.1.0",
    "OrderType": "other"
  },
  "Frontend": {
    "BaseUrl": "https://localhost:7187"
  }
}
```

### 3. Apply Database Migrations

```bash
# From the solution root
dotnet ef database update \
  --project Connect.Infrastructure \
  --startup-project Connect.API
```

This creates the main application tables AND the Hangfire schema tables in the same database.

To add a new migration after model changes:

```bash
dotnet ef migrations add <MigrationName> \
  --project Connect.Infrastructure \
  --startup-project Connect.API
```

### 4. (Optional) Start Seq

```bash
# Using Docker
docker run --name seq -d --restart unless-stopped \
  -e ACCEPT_EULA=Y \
  -p 5341:80 \
  datalust/seq:latest
```

Or download and install [Seq for Windows](https://datalust.co/seq).

### 5. Run

```bash
dotnet run --project Connect.API
```

| URL | Purpose |
|---|---|
| `http://localhost:5198` | Swagger UI (root path) |
| `http://localhost:5198/hangfire` | Hangfire dashboard |
| `http://localhost:5341` | Seq log viewer |

> **Note:** Swagger is configured as the root path (`RoutePrefix = string.Empty`) in development, so `http://localhost:5198/` opens it directly.

### 6. First API Call — Check Email

```bash
curl -X POST http://localhost:5198/api/users/check-email \
  -H "Content-Type: application/json" \
  -d '{ "email": "your@email.com" }'
```

A verification email will be sent (or check Hangfire dashboard to see the queued job).

---

## Design Decisions

### Why Clean Architecture over a simpler layered approach?

The primary benefit here is testability and maintainability. The domain and application layers have zero framework dependencies — they can be unit-tested without spinning up a database, HTTP server, or any external service. Infrastructure implementations can be swapped (e.g., change from SQL Server to PostgreSQL) without touching any business logic.

### Why DDD tactical patterns?

The e-commerce domain has genuine complexity: inventory management, pricing rules, order lifecycle transitions, coupon validity, payment status synchronization. Pushing this logic into services or controllers creates anemic models where business rules are scattered and easy to bypass. Aggregates with private constructors and factory methods make invalid states unrepresentable.

### Why CQRS via MediatR?

Not for performance (there's no read/write DB split here), but for structural clarity. Every operation is a named, typed, discoverable object. Adding validation, logging, or other cross-cutting concerns is done once in a pipeline behavior — not repeated across every handler. The handler graph is navigable: pick any endpoint, find the corresponding `Command` or `Query`, and follow it through the codebase.

### Why Data Protection for email tokens instead of JWT or database records?

- **vs JWT:** JWTs are stateless but require careful audience/issuer scoping to prevent cross-purpose reuse. Data Protection purpose strings provide cryptographic isolation between `email-verification` and `registration-session` tokens out of the box.
- **vs database tokens:** Storing tokens in a database requires a table, cleanup jobs, and an extra DB query on every verification. Data Protection is entirely stateless — the token itself carries the payload (email address) encrypted and signed.

### Why Hangfire for email delivery?

Email delivery is an out-of-process side effect. Making it synchronous would mean: (1) the API cannot respond until the SMTP handshake completes (~200-500ms), (2) if the SMTP server is down, the user's order placement fails. Hangfire decouples the two — the job is enqueued in milliseconds, the API responds immediately, and Hangfire handles retries if the email server is temporarily unavailable.

### Why `||`-delimited strings for image URLs?

Product images are always fetched as a complete list alongside the product — there are no queries like "give me all products that have at least one image from domain X". A join table would add a DB join with no query flexibility benefit for this access pattern. The EF Core value converter keeps the domain model clean (`List<string>`) while the database column stays simple. The `||` separator was chosen because it is unlikely to appear in a URL.

### Why is `Payment` sealed?

`Payment` records are immutable facts — a payment either happened or it didn't. `sealed` signals that the entity is not designed for inheritance or extension. Combined with the `ValueGeneratedNever()` configuration (VNPAY provides the ID), this entity is intentionally constrained.

### Why BCrypt cost 12?

Cost 12 is the common production recommendation as of 2024 — it takes ~250ms to hash on modern hardware. This makes it impractical to brute-force even with a leaked database dump, while being imperceptible to users on login. Lower cost factors (10 or below) are acceptable for development where iteration speed matters more.

### Why rotate refresh tokens instead of long-lived access tokens?

10-minute access token + 7-day rotating refresh token is a standard pattern for SPAs and mobile apps. Short access token lifetime limits the window of token misuse if intercepted. Refresh token rotation (`RevokeRefreshToken` + issue new token) provides a chain of custody — each token can only be used once, making replay attacks detectable.

---

## Known Limitations & Future Work

The following issues and improvements have been identified during development:

**Bug — Shipping fee double-application:**
In `Order.CalculateTotalPrice`, the `if/else` chain for shipping fees has a logical error. When `ShippingMethod.Standard` is selected, both the `Standard` branch (30,000 VND) and the final `else` branch (80,000 VND) execute, resulting in a 110,000 VND shipping charge instead of 30,000 VND. The `else if` keyword is missing for the `SuperFast` branch.

**Bug — Order history returns single order:**
`GetOrderHistoryHandler` calls `GetByIdAsync(currentUserService.UserID)` instead of `WhereAsync(o => o.UserID == currentUserService.UserID)`. This uses the UserID as an OrderID, which will fail or return incorrect results. The intent is clearly to return all orders for the current user.

**Bug — `UserRegisterEvent` fires with UserID = 0:**
`UserRegisterEvent` is raised inside the `User` constructor before EF Core assigns a database-generated ID. The `WelcomeEmailAsync` handler re-fetches the user by `UserID`, but the ID in the event is `0`, meaning the DB lookup in `SendWelcomeEmailAsync` will always fail and log a warning.

**Missing — `ValidationException` → 400 mapping:**
`ExceptionMiddleware` catches all exceptions and returns `500`. `FluentValidation.ValidationException` should be caught and mapped to `400 Bad Request` with structured error details. Similarly, `DomainExceptions` should map to `422 Unprocessable Entity` and `UnauthorizedAccessException` should map to `403 Forbidden`.

**Missing — Pagination:**
All `GetAll*` query handlers return the entire table (`GetAllNoTrackingAsync()`). For production use, these need cursor-based or offset pagination with configurable page sizes.

**Missing — Product filtering and search:**
There are no query filters for product listings (by category, price range, stock status, etc.). `WhereAsync` and `WhereNoTrackingAsync` exist in the repository but are not wired up to any query handlers for products.

**Missing — Unit and Integration Tests:**
No test projects exist in the solution. The domain layer and application handlers are highly testable in isolation given the clean architecture — this is the highest-value area to address first.

**Missing — Admin role assignment:**
There is no API endpoint to promote a user to `Admin`. Currently this requires a direct database update. A `POST /api/users/{id}/role` endpoint restricted to existing admins would be the clean solution.

**Improvement — Idempotency on `OrderCompletedEvent`:**
`OrderCompletedEvent` is defined and has a handler, but `Order.MarkOrderStatusToCompleted()` never calls `RaiseDomainEvent`. Adding that call would complete the event chain for the order lifecycle.

**Improvement — `OrderStatus.Processing`:**
The `Processing` enum value exists but no transition to it is implemented. Inserting a `Processing` state between `Pending` and `Shipping` would provide more granular tracking.

---

## Author

**datnguynx110605** — Built as a portfolio-grade reference implementation for Clean Architecture, Domain-Driven Design, and CQRS patterns in .NET 10.

---

## License

MIT © datnguynx110605

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
