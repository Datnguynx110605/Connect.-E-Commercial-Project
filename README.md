# Connect. E-Commerce

> A production-grade full-stack e-commerce platform — Clean Architecture backend in .NET 10 paired with a React 19 frontend, enforcing business rules at the type level through Domain-Driven Design, CQRS, and a rich domain model.

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![EF Core](https://img.shields.io/badge/EF%20Core-10.0-7B3F9E?logo=microsoftsqlserver&logoColor=white)](https://learn.microsoft.com/ef/)
[![MediatR](https://img.shields.io/badge/MediatR-14.1-0078D4)](https://github.com/jbogard/MediatR)
[![FluentValidation](https://img.shields.io/badge/FluentValidation-12.1-e74c3c)](https://docs.fluentvalidation.net/)
[![Hangfire](https://img.shields.io/badge/Hangfire-1.8-2ecc71)](https://www.hangfire.io/)
[![Serilog](https://img.shields.io/badge/Serilog-10.0-blue)](https://serilog.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

**Connect.** is a fully self-contained e-commerce platform covering the complete commerce lifecycle — user registration, product browsing, cart management, order placement, coupon redemption, online payment via VNPAY, transactional email delivery, and real-time admin notifications. The backend is a serious reference implementation of Clean Architecture, DDD, and CQRS in .NET. The frontend is a production-quality React SPA with a typed API client that mirrors every backend contract.

The codebase enforces a strict no-anemic-model policy: every business rule lives inside the domain, every value is validated at the point of construction, and every side effect is decoupled through domain events and background jobs.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Solution Structure](#solution-structure)
- [Frontend — React SPA](#frontend--react-spa)
  - [Pages & Routing](#pages--routing)
  - [API Client Layer](#api-client-layer)
  - [AppContext — Global State](#appcontext--global-state)
  - [Component Library](#component-library)
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
  - [Real-Time Notifications — SignalR & Redis](#real-time-notifications--signalr--redis)
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
  - [Real-Time Notification Flow](#real-time-notification-flow)
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

Connect. is organized as a four-layer Clean Architecture backend paired with a React frontend. Backend layer dependencies always point inward — outer layers know about inner layers, never the reverse.

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
│  Domain Events      │  references   │  SignalR · Redis · Services│
│  Business Rules     │               │                           │
└─────────────────────┘               └───────────────────────────┘
```

### Layer Responsibilities

**`Connect.Frontend`** — A React 19 + TypeScript SPA with TailwindCSS v4 and React Router v7. Provides the complete customer-facing shopping experience: browsing, cart, checkout, order history, authentication, and profile management. Communicates with the backend exclusively via a typed API client layer and subscribes to real-time notifications via SignalR.

**`Connect.Domain`** — The heart of the system. Contains all entities, value objects, domain events, enumerations, and business invariants. Has zero framework dependencies — plain C# targeting `net10.0`. No EF Core attributes, no ASP.NET concerns, no NuGet packages.

**`Connect.Application`** — Orchestrates the domain. Houses all CQRS commands and queries (via MediatR), FluentValidation validators, DTO definitions, and `interface` contracts for every external dependency. References `Connect.Domain` only.

**`Connect.Infrastructure`** — Implements every interface defined in `Connect.Application`. Houses the EF Core `DbContext`, all entity configurations, the generic repository, Unit of Work, JWT token generation, BCrypt password hashing, MailKit SMTP delivery, Hangfire job scheduling, VNPAY gateway integration, ASP.NET Core Data Protection for email tokens, and SignalR with a Redis backplane for real-time notifications.

**`Connect.API`** — The entry point. Wires together the DI container, registers the middleware pipeline, configures Swagger/OpenAPI, sets up JWT Bearer authentication, and maps controllers. Contains no business logic.

---

## Solution Structure

```
Connect.sln
│
├── Connect.Domain/
│   ├── Common/
│   │   ├── AggregateRoot.cs
│   │   ├── DomainEvent.cs
│   │   └── DomainExceptions.cs
│   ├── Core/
│   │   ├── Entities/
│   │   │   ├── User.cs, Order.cs, OrderItem.cs, Product.cs
│   │   │   ├── Cart.cs, Coupon.cs, Review.cs, Payment.cs
│   │   │   ├── Category.cs, RefreshToken.cs
│   │   ├── Enums/
│   │   │   ├── OrderStatus.cs, PaymentStatus.cs, PaymentMethod.cs
│   │   │   ├── ShippingMethod.cs, ProductStatus.cs
│   │   └── ValueObjects/
│   │       ├── Amount.cs, Currency.cs, Email.cs, UserName.cs
│   │       ├── PhoneNumber.cs, PasswordHash.cs, ProductName.cs
│   │       ├── CategoryName.cs, Code.cs
│   └── Events/
│       ├── UserEvents/UserRegisterEvent.cs
│       └── OrderEvents/
│           ├── OrderPlacedEvent.cs, OrderCancelledEvent.cs
│           ├── OrderPaidEvent.cs, OrderCompletedEvent.cs
│
├── Connect.Application/
│   ├── Commons/Behaviors/
│   │   ├── LoggingBehavior.cs
│   │   └── ValidationBehavior.cs
│   ├── Commons/DomainEventNotification.cs
│   ├── DTOs/
│   │   ├── CartDto.cs, CategoryDto.cs, CouponDto.cs
│   │   ├── NotificationDto.cs, OrderDto.cs, OrderItemDto.cs
│   │   ├── PaymentDto.cs, ProductDto.cs, RefreshTokenDto.cs
│   │   ├── ReviewDto.cs, UserDto.cs
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
│   │   ├── Persistences/IRepository.cs, IUnitOfWork.cs
│   │   └── Services/
│   │       ├── ICurrentUserService.cs, IEmailService.cs
│   │       ├── IEmailVerificationService.cs, IJWTService.cs
│   │       ├── INotificationService.cs, IPasswordService.cs
│   │       └── IPaymentGateway.cs
│   └── DependencyInjection.cs
│
├── Connect.Infrastructure/
│   ├── Data/Configurations/          # One IEntityTypeConfiguration<T> per entity
│   ├── Data/MyDbContext/ConnectDbContext.cs
│   ├── Hub/NotificationHub.cs        # SignalR hub + INotificationClient interface
│   ├── Persistences/GenericRepository.cs, UnitOfWork.cs
│   ├── Services/
│   │   ├── CurrentUserService.cs
│   │   ├── EmailService.cs
│   │   ├── EmailVerificationService.cs
│   │   ├── JWTService.cs
│   │   ├── NotificationService.cs    # SignalR push to admin/user groups
│   │   ├── PasswordService.cs
│   │   └── PaymentGateway.cs
│   ├── Settings/JWTSetting.cs, EmailSetting.cs
│   └── DependencyInjection.cs
│
├── Connect.API/
│   ├── Controllers/
│   │   ├── APIController.cs, CartsController.cs, CategoriesController.cs
│   │   ├── CouponsController.cs, OrdersController.cs, PaymentsController.cs
│   │   ├── ProductsController.cs, ReviewsController.cs, UsersController.cs
│   ├── Middlewares/
│   │   ├── CorrelationMiddleware.cs, RequestLoggingMiddleware.cs
│   │   ├── ExceptionMiddleware.cs, PerformanceMiddleware.cs
│   ├── DependencyInjection.cs
│   ├── MiddlewareExtensions.cs
│   └── Program.cs
│
└── Connect.Frontend/Connect.UI/
    ├── src/
    │   ├── api/                      # Typed API client (one file per resource)
    │   │   ├── client.ts             # Base fetch wrapper, token storage, auto-refresh
    │   │   ├── types.ts              # All DTO & request type definitions
    │   │   ├── users.ts, products.ts, categories.ts
    │   │   ├── coupons.ts, carts.ts, orders.ts
    │   │   ├── reviews.ts, payments.ts
    │   │   └── index.ts              # Barrel export
    │   ├── components/
    │   │   ├── Header.tsx, Footer.tsx, Layout.tsx, ProductCard.tsx
    │   ├── context/AppContext.tsx    # Global user auth + local cart state
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

The frontend is a single-page application built with React 19, TypeScript 5.8, Vite 6, TailwindCSS v4, and React Router v7. It runs on `http://localhost:3000` in development and communicates with the backend at `https://localhost:7240`.

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
| `/auth` | `Auth` | No | Login + 3-step email-verified registration |
| `/verify-email` | `Auth` | No | Landing point for email verification link |
| `/profile` | `Profile` | Yes | Profile editing, password change, account deletion |

### API Client Layer

All API communication is handled through a typed client in `src/api/`. Every resource has its own file; all types are centralized in `types.ts`; everything is re-exported from `index.ts`.

**Base client** (`client.ts`) provides:

- Automatic `Bearer` token injection from `localStorage`
- **401 auto-retry** — on a 401 response the client attempts a token refresh and replays the original request transparently
- `tokenStorage` helper — saves/reads/clears `accessToken`, `refreshToken`, and `userID` from `localStorage`
- `ApiError` class with `status`, `traceId`, and `message` for structured error handling

```typescript
// Example usage
import { getAllProducts, addToCart, login } from '../api';

const products = await getAllProducts();        // anonymous
const cart    = await addToCart({ productID: 1, quantity: 1, userID }); // authenticated
const { user, tokens } = await login({ email, password });
```

**Resource modules:**

| Module | Key exports |
|---|---|
| `users.ts` | `checkEmail`, `verifyEmail`, `register`, `login`, `refreshToken`, `forgetPassword`, `getProfile`, `updateProfile`, `changePassword`, `deleteProfile`, `logout` |
| `products.ts` | `getAllProducts`, `getProductById`, `createProduct`, `updateProductStock`, `updateProductImage`, `deleteProduct` |
| `categories.ts` | `getAllCategories`, `getCategoryById`, `createCategory`, `updateCategory`, `deleteCategory` |
| `coupons.ts` | `getAllCoupons`, `getCouponById`, `createCoupon`, `updateCouponExpiryDate`, `updateCouponQuantity` |
| `carts.ts` | `getMyCart`, `addToCart`, `reduceCartItem`, `removeCartItem`, `getAllCarts` |
| `orders.ts` | `getOrderHistory`, `createOrder`, `cancelOrder`, `getAllOrders`, `markOrderAsShipping`, `markOrderAsCompleted`, `markOrderAsPaid` |
| `reviews.ts` | `getAllReviews`, `getReviewsByProduct`, `createReview`, `updateReview`, `deleteReview` |
| `payments.ts` | `createPaymentUrl`, `redirectToVNPAY`, `getAllPayments` |

### AppContext — Global State

`AppContext` (`src/context/AppContext.tsx`) provides application-wide state via React Context:

**Auth state:**
- `user: UserDto | null` — the current authenticated user (rehydrated from the stored JWT on mount via `getProfile()`)
- `isLoadingUser: boolean` — prevents flash of unauthenticated content on first render
- `setUser(user)` — used after login or profile update
- `logout()` — clears `tokenStorage` and resets all state

**Local cart state:**

The cart is managed locally in React state (not persisted to `localStorage`) and synced to the backend silently on every `addToCart` call. This means the cart survives page navigation within a session but resets on refresh — the authoritative source for checkout is the backend cart fetched fresh at order time.

| Method | Description |
|---|---|
| `addToCart(item, quantity?)` | Adds or increments item; caps at 10; silently syncs to backend if logged in |
| `removeFromCart(productID)` | Removes item by productID |
| `updateQuantity(productID, qty)` | Sets quantity; caps at 10; ignores values ≤ 0 |
| `clearCart()` | Empties the cart (called after successful order creation) |

**LocalCartItem shape:**

```typescript
type LocalCartItem = {
  productID: number;
  productName: string;
  finalPrice: number;
  imageURL: string;
  color: string;
  ram: number;
  rom: number;
  quantity: number;
};
```

### Component Library

| Component | Description |
|---|---|
| `Layout` | Wraps every page with `Header` + `Footer`; accepts `showFooter` prop |
| `Header` | Sticky nav with search bar, location display, cart badge, user avatar/login CTA |
| `Footer` | Contact info, policy links, social icons |
| `ProductCard` | Product thumbnail with price, specs, add-to-cart button, out-of-stock state |

---

## Domain Model

The domain model is the most important part of this codebase. Everything else exists to serve it.

### Aggregates & Entities

#### `User` — AggregateRoot

The central identity entity. Owns the registration event, profile data, and all relationships downstream (orders, cart items, reviews, refresh tokens).

**Key behaviors:**
- `CreateUserProfile(...)` — static factory. Validates address is non-empty, then constructs and immediately raises `UserRegisterEvent`. The UserID in the event will be `0` at raise-time because EF Core has not yet assigned a database ID — this is a known nuance; the event handler re-fetches the user by email.
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

`CalculateTotalPrice(Currency discountAmount)` — sums all `OrderItem.OrderItemTotalPrice` values, subtracts the discount, then applies the shipping fee. **Note:** There is a logic defect — the `if/else if/else` chain for shipping fees applies both the `Standard` branch AND the final `else` branch when `ShippingMethod` is `Standard`. Standard orders are charged 30,000 + 80,000 VND. This is a known issue.

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

---

#### `Cart`

A price-snapshotted cart item. When a product's price changes, existing cart items retain the price from when they were added.

**Key behaviors:**
- `CreateCart(...)` — validates `userID > 0`, `productID > 0`, then calls `AddToCart`.
- `ReduceCartAmount(Amount)` — guards against reducing when quantity is already 0, then subtracts and recalculates `CartTotalPrice`.

---

#### `Coupon`

A discount code with expiry enforcement, stock tracking, and atomic `UseCoupon()` behavior.

**Key behaviors:**
- `UseCoupon()` — calls `VerifyCoupon()` (checks expiry and stock > 0), then decrements stock by exactly 1.
- `UpdateCouponExpiryDate(DateTime)` — rejects past dates.

---

#### `Review` — AggregateRoot

One review per user per product, enforced at the database level via a unique composite index on `(UserID, ProductID)`.

**Validation:**
- Creation: body must be 1–2,000 chars, non-empty.
- Updates: body must be 5–300 chars (stricter on update than creation).

---

#### `Payment` — `sealed`

An immutable record of a completed payment transaction. Created exclusively from a VNPAY callback. Idempotency: `ProcessPaymentCallbackHandler` checks for an existing `Payment` with the same `PaymentID` before creating a new one.

---

#### `RefreshToken`

A cryptographically random 64-byte token (Base64 encoded) with a 7-day expiry and revocation support.

**Key behaviors:**
- `CreateRefreshToken(int userID)` — generates token on construction via `RandomNumberGenerator`.
- `VerifyRefreshToken()` — throws if expired OR if revoked.
- `RevokeRefreshToken()` — idempotent (returns early if already revoked).

---

### Value Objects

All value objects are `sealed record` with a private constructor. The only way to obtain an instance is through the static `Create(...)` factory, which throws `DomainExceptions` for invalid input — it is impossible to have an invalid value object in memory.

| Value Object | Type | Rules |
|---|---|---|
| `Amount` | `int` | `value >= 0`. Operators: `+`, `-`. |
| `Currency` | `decimal` | `value >= 0`. Operators: `+`, `-`, `* Amount`, `* decimal` (rounds to 0 decimal places). |
| `Email` | `string` | Non-empty, must contain `@`. Trimmed on creation. |
| `UserName` | `string` | 3–30 chars, must match `^[a-z]+$` (lowercase letters only). |
| `PhoneNumber` | `string` | Exactly 10 chars, no `\W` characters, no `[a-z]` letters. |
| `PasswordHash` | `string` | Exactly 60 chars, must match BCrypt prefix `^\$2[aby]\$\d{2}\$`. |
| `ProductName` | `string` | 5–100 chars, allows `\p{L}\p{N}\s\-\|`. |
| `CategoryName` | `string` | 2–20 chars, no `\W` characters. |
| `Code` | `string` | 5–12 chars, must contain at least one digit. |

---

### Enumerations

```csharp
enum OrderStatus   { Pending=0, Processing=1, Shipping=2, Completed=3, Cancelled=4 }
enum PaymentStatus { Unpaid=0, Pending=1, Paid=2 }
enum PaymentMethod { Cash=0, OnlineBanking=1, VNPAY=2 }
enum ShippingMethod{ Standard=0, Fast=1, SuperFast=2 }
enum ProductStatus { InStock=0, OutOfStock=1 }
```

---

### Domain Events

Domain events are plain C# records inheriting `DomainEvent` (carries auto-generated `EventID` + `CreatedAt`). Events are raised inside `AggregateRoot.RaiseDomainEvent`, stored in a private list, and dispatched after `SaveChangesAsync` inside `ConnectDbContext`.

| Event | Raised In | Handler | Effect |
|---|---|---|---|
| `UserRegisterEvent` | `User` constructor | `UserRegisteredEventHandler` | Enqueues welcome email job |
| `OrderPlacedEvent` | `Order.CreateOrder` | `CreatedOrderEventHandler` | Enqueues confirmation email + notifies admins via SignalR |
| `OrderCancelledEvent` | `Order.CancelOrder` | `CancelledOrderEventHandler` | Enqueues cancellation email + notifies admins via SignalR |
| `OrderPaidEvent` | `Order.MarkAsPaidForPaymentGateway` | `OrderPaidEventHandler` | Enqueues payment bill email + notifies admins via SignalR |
| `OrderCompletedEvent` | `Order.MarkOrderStatusToCompleted` *(event class exists; `RaiseDomainEvent` not yet called)* | `OrderCompletedEventHandler` | Would enqueue completion email |

---

### Business Rules & Invariants

These rules are enforced at the domain level and cannot be bypassed by the application or API layers:

| Rule | Enforced In |
|---|---|
| Cart quantity per item ≤ 10 | `Cart.AddToCart` |
| Cart quantity cannot go below 0 | `Amount` subtraction |
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
| Product description must be 50–2,000 chars | `Product.CreateProduct` |

---

## Application Layer — CQRS

Every operation is modeled as either a **Command** (mutates state, returns a DTO) or a **Query** (reads state, returns a DTO or collection). MediatR `ISender` is the only dependency in controllers.

### Pipeline Behaviors

Two `IPipelineBehavior<TRequest, TResponse>` implementations wrap every command and query:

#### `LoggingBehavior<TRequest, TResponse>`

- Logs `[START]` with request type name and full serialized payload
- Uses `Stopwatch` to measure execution duration
- Logs `[END]` on success; `[SLOW]` warning if duration exceeds **500ms**; `[FAILURE]` with exception details on error

#### `ValidationBehavior<TRequest, TResponse>`

- Runs all `IValidator<TRequest>` implementations concurrently via `Task.WhenAll`
- Aggregates all failures and throws `FluentValidation.ValidationException` if any exist
- Short-circuits before the handler if no validators are registered

---

### Feature Modules

Each feature follows an identical structure: `Command.cs` / `CommandValidation.cs` / `CommandHandler.cs` / optional `EventHandler.cs` in the Commands folder, mirrored by `Query.cs` / `QueryHandler.cs` in Queries.

---

### Service Interfaces

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
| `INotificationService` | Push real-time notifications via SignalR |

---

## Infrastructure Layer

### Persistence & EF Core

`ConnectDbContext` inherits `DbContext` and exposes 10 `DbSet<T>` properties. All configuration is done through `IEntityTypeConfiguration<T>` classes — no data annotations on domain entities.

**Key configuration details by entity:**

| Entity | Notable Config |
|---|---|
| `User` | Unique index on `Email`. Cascade delete to RefreshTokens, Carts, Reviews. Restrict delete from Orders. |
| `Order` | `CouponID` is nullable FK with `SetNull` on delete. Cascade delete to `OrderItems`. |
| `OrderItem` | Composite PK on `(OrderID, ProductID)`. `OrderItemTotalPrice` is `Ignored`. |
| `Product` | `ImageURL` stored as `\|\|`-delimited string. |
| `Review` | Unique composite index on `(UserID, ProductID)`. |
| `Payment` | `PaymentID` is `ValueGeneratedNever()` — set from VNPAY. |
| `RefreshToken` | Unique index on `Token`. Default value `false` for `IsRevoked`. |

**Domain event dispatch in `SaveChangesAsync`:**

```csharp
// 1. Collect events from all tracked aggregates (before save)
// 2. base.SaveChangesAsync() — persist to DB
// 3. Publish each event via MediatR (after successful save)
```

Events are cleared before saving to prevent re-entrant dispatch.

---

### Unit of Work & Repository

`IUnitOfWork` provides a single-session view over the entire database with transaction control. `CommitTransactionAsync` wraps `SaveChangesAsync` + `CommitAsync` in a try/catch that automatically rolls back and disposes the transaction on failure.

---

### Authentication — JWT

`JWTService.GenerateAccessToken(User user)` produces a signed HS256 JWT with claims `sub` (UserID), `email`, `role`, and `jti`. Tokens expire in **10 minutes**. Refresh token rotation handles session continuity with a 7-day window.

---

### Password Hashing — BCrypt

`PasswordService` wraps `BCrypt.Net-Next` with work factor **12** (~250ms per hash). The `PasswordHash` value object validates BCrypt format, preventing raw passwords from being accidentally stored.

---

### Email Delivery — MailKit & Hangfire

`EmailService` sends HTML transactional emails via SMTP (StartTLS, port 587) using MailKit. All email sends are enqueued as Hangfire background jobs inside domain event handlers — the business transaction never fails because of email unavailability.

| Method | Trigger |
|---|---|
| `SendOrderConfirmationAsync` | Order placed |
| `SendOrderCancelledAsync` | Order cancelled |
| `SendPaymentSuccessBillEmailAsync` | Payment marked paid |
| `SendOrderCompletedAsync` | Order completed |
| `SendEmailVerificationAsync` | Registration started |
| `SendWelcomeEmailAsync` | Registration completed |

---

### Payment Gateway — VNPAY

`PaymentGateway` wraps the `VNPAY.NET` NuGet client. `CreatePaymentUrl` embeds the OrderID in the description as `ORDER:{orderId}`. `ParseCallback` extracts the OrderID from the callback and throws `InvalidOperationException` if the description prefix does not match.

The callback controller redirects to `/payment/success?orderId={id}` on success and `/payment/failed?code={code}` on failure.

---

### Email Verification — Data Protection

Two time-limited `IDataProtector` instances with distinct purpose strings:

```
"email-verification"    → 30-minute lifetime → sent in verification link
"registration-session"  → 15-minute lifetime → returned after link click
```

This two-step chain proves email ownership without storing anything in the database.

---

### Real-Time Notifications — SignalR & Redis

`NotificationHub` is a typed SignalR hub (`Hub<INotificationClient>`) that organizes connected clients into two groups:

- **`user-{userID}`** — per-user group, populated from the `sub` JWT claim on connect
- **`admins`** — populated when the `role` claim equals `Admin`

`NotificationService` implements `INotificationService` and calls `hub.Clients.Group(AdminGroup).ReceiveNotification(dto)` to push structured `NotificationDto` payloads.

```csharp
public sealed record NotificationDto(
    string Id,
    string Type,
    string Title,
    string Body,
    DateTime CreatedAt,
    object? Payload = null);
```

**Notification types pushed to the `admins` group:**

| Type | Trigger | Message |
|---|---|---|
| `low_stock` | Product stock drops to ≤ 5 during order placement | Product name + remaining units |
| `order_placed` | Order successfully created | OrderID, UserID, shipping/payment method, total |
| `order_cancelled` | Order cancelled by customer | OrderID, UserID, new status |
| `payment_success` | VNPAY callback processed successfully | UserID, OrderID, payment method, total |

**Redis backplane** — SignalR uses `AddStackExchangeRedis("localhost:6379")` so notifications are fanned out across multiple API server instances. Ensure Redis is running before starting the API.

**Frontend connection** (to be wired in future work):

```typescript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl('/hubs/notifications', {
    accessTokenFactory: () => tokenStorage.getAccess() ?? '',
  })
  .build();

connection.on('ReceiveNotification', (dto) => {
  console.log(dto.type, dto.title, dto.body);
});

await connection.start();
```

---

## API Layer

### Middleware Pipeline

Executes in this exact order on every request:

```
Request
  │
  ▼
1. CorrelationMiddleware       — X-Correlation-Id header (read or generate)
  │
  ▼
2. RequestLoggingMiddleware    — logs Method + Path on entry, StatusCode + ms on exit
  │
  ▼
3. ExceptionMiddleware         — catches all exceptions → 500 JSON { title, status, traceId }
  │
  ▼
4. PerformanceMiddleware       — LogWarning if ElapsedMs > 1,000ms
  │
  ▼
5. Authentication / Authorization
  │
  ▼
6. Rate Limiter                — global 100 req/min; login 5 req/2 min sliding window
  │
  ▼
7. Controllers
```

---

### Authentication & Authorization

JWT Bearer authentication validates issuer, audience, lifetime, and HS256 signing key. CORS allows `http://localhost:3000` (frontend dev server) with credentials.

| Role | Assigned | Access |
|---|---|---|
| `Customer` | Default on registration | Own cart, orders, reviews, profile |
| `Admin` | Manual DB assignment | All admin endpoints + SignalR `admins` group |

---

### API Endpoints Reference

#### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/check-email` | Anonymous | Validates uniqueness, sends verification link |
| `POST` | `/verify-email` | Anonymous | Exchanges verification token for session token |
| `POST` | `/register` | Anonymous | Creates user account |
| `POST` | `/login` | Anonymous | Returns `{ accessToken, refreshToken }` |
| `POST` | `/refresh-token` | — | Rotates refresh token pair |
| `POST` | `/forget-passwod` | Anonymous | Resets password via session token *(note: typo in route)* |
| `GET` | `/` | Admin | Lists all users |
| `GET` | `/profile` | Authenticated | Gets own profile |
| `PUT` | `/profile` | Authenticated | Updates own profile |
| `PUT` | `/change-password` | Authenticated | Changes own password |
| `DELETE` | `/profile` | Authenticated | Deletes own account |

#### Products — `/api/products`

| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/` | Anonymous |
| `GET` | `/{id}` | Anonymous |
| `POST` | `/` | Admin (multipart/form-data) |
| `PATCH` | `/{id}/stock` | Admin |
| `PATCH` | `/{id}/image` | Admin |
| `DELETE` | `/{id}` | Admin |

#### Orders — `/api/orders`

| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/` | Admin |
| `GET` | `/history` | Authenticated |
| `POST` | `/` | Authenticated |
| `PATCH` | `/{id}/cancel` | Authenticated |
| `PATCH` | `/{id}/shipping` | Admin |
| `PATCH` | `/{id}/completed` | Admin |
| `PATCH` | `/{id}/paid` | Admin |

#### Carts — `/api/carts`

| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/` | Admin |
| `GET` | `/me` | Authenticated |
| `POST` | `/` | Authenticated |
| `PATCH` | `/{id}/reduce` | Authenticated |
| `DELETE` | `/{id}` | Authenticated |

#### Categories — `/api/categories`

| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/`, `/{id}` | Anonymous |
| `POST` | `/` | Admin |
| `PUT` | `/{id}` | Admin |
| `DELETE` | `/{id}` | Admin |

#### Coupons — `/api/coupons`

| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/`, `/{id}` | Authenticated |
| `POST` | `/` | Admin |
| `PATCH` | `/{id}/expiry-date`, `/{id}/quantity` | Admin |

#### Reviews — `/api/reviews`

| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/`, `/product/{productId}` | Anonymous |
| `POST` | `/` | Authenticated |
| `PUT` | `/{id}` | Authenticated |
| `DELETE` | `/{id}` | Authenticated |

#### Payments — `/api/payments`

| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/` | Admin |
| `POST` | `/create-url` | Authenticated |
| `GET` | `/vnpay-callback` | Anonymous (VNPAY redirect) |

#### SignalR Hub — `/hubs/notifications`

Clients connect with a valid JWT. On connect, the hub adds the client to their user group and, if admin, to the `admins` group. The client must handle the `ReceiveNotification(NotificationDto)` event.

---

## Key Flows

### User Registration Flow

```
Client                    API                   Services               DB
  │                        │                        │                   │
  ├─ POST /check-email ────►│                        │                   │
  │                        ├── Email.Create()        │                   │
  │                        │               AnyAsync(email) ─────────────►
  │                        │◄──────────────────────────────── false ─────┤
  │                        ├── GenerateVerificationToken(30 min)         │
  │                        ├── SendEmailVerificationAsync() ─────────────►
  │◄─ 200 OK ──────────────┤                        │                   │
  │                        │                        │                   │
  │  [User clicks email link]
  │                        │                        │                   │
  ├─ POST /verify-email ───►│                        │                   │
  │  { verificationToken } ├── UnprotectToken("email-verification")      │
  │                        ├── GenerateRegistrationSessionToken(15 min)  │
  │◄─ 200 { sessionToken } ┤                        │                   │
  │                        │                        │                   │
  ├─ POST /register ───────►│                        │                   │
  │  { sessionToken, ... } ├── UnprotectToken("registration-session")   │
  │                        ├── Hash(password) [BCrypt cost 12]          │
  │                        ├── User.CreateUserProfile(...)              │
  │                        │   └── RaiseDomainEvent(UserRegisterEvent)  │
  │                        ├── SaveChangesAsync() ───────────────────────►
  │                        │   └── dispatch UserRegisterEvent           │
  │                        │       └── Hangfire.Enqueue(SendWelcomeEmail)►
  │◄─ 201 UserDto ─────────┤                        │                   │
```

### Order Placement Flow

```
Client            API                Application           Domain            DB
  │                │                      │                   │               │
  ├─ POST /orders ─►│                      │                   │               │
  │                ├── CreateOrderCommand ─►                   │               │
  │                │                      ├── AnyAsync(userID) ───────────────►
  │                │                      ├── WhereAsync(productIDs) ─────────►
  │                │                      ├── FirstOrDefault(couponID) ───────►
  │                │                      ├── coupon.UseCoupon()              │
  │                │                      ├── foreach item:                   │
  │                │                      │   ├── product.RemoveFromStock(qty)│
  │                │                      │   └── if stock ≤ 5:              │
  │                │                      │       Hangfire.Enqueue(NotifyLowStock)
  │                │                      ├── Order.CreateOrder(...)          │
  │                │                      │   └── RaiseDomainEvent(OrderPlaced)│
  │                │                      ├── BeginTransactionAsync() ────────►
  │                │                      ├── CommitTransactionAsync() ───────►
  │                │                      │   └── dispatch OrderPlacedEvent   │
  │                │                      │       ├── Hangfire.Enqueue(Email) ►
  │                │                      │       └── SignalR → admins group  │
  │◄─ 201 OrderDto ┤◄─────────────────────┤                   │               │
```

### Order Cancellation Flow

```
Client              API              Application           DB
  │                  │                    │                  │
  ├─ PATCH /{id}/cancel ►│                │                  │
  │                  ├── CancelOrderCommand ►                │
  │                  │                    ├── GetByIdAsync(orderID) ──────────►
  │                  │                    ├── Check currentUser == order.UserID
  │                  │                    ├── BeginTransactionAsync() ─────────►
  │                  │                    ├── product.AddToStock(qty) each item│
  │                  │                    ├── order.CancelOrder()              │
  │                  │                    │   └── RaiseDomainEvent(Cancelled)  │
  │                  │                    ├── CommitTransactionAsync() ─────────►
  │                  │                    │   └── dispatch OrderCancelledEvent  │
  │                  │                    │       ├── Hangfire.Enqueue(Email)  ►
  │                  │                    │       └── SignalR → admins group   │
  │◄─ 200 OrderDto ──┤◄───────────────────┤                  │
```

### Payment Flow

```
Client               API                       VNPAY
  │                   │                           │
  ├─ POST /payments/create-url ►│                  │
  │                   ├── PaymentGateway.CreatePaymentUrl() ───────────────►
  │◄─ 200 { paymentUrl } ┤                        │
  │                   │                           │
  ├─ [Redirect to paymentUrl] ──────────────────────────────────────────────►
  │                   │◄── GET /vnpay-callback ────────────────────────────── │
  │                   ├── ParseCallback → ProcessPaymentCallbackCommand       │
  │                   │   ├── AnyAsync(paymentID) [idempotency check]         │
  │                   │   ├── Payment.CreatePayment(...)                      │
  │                   │   ├── order.MarkAsPaidForPaymentGateway(true)         │
  │                   │   │   └── RaiseDomainEvent(OrderPaidEvent)            │
  │                   │   └── CommitTransaction → dispatch event              │
  │                   │       ├── Hangfire.Enqueue(SendPaymentBillEmail)      │
  │                   │       └── SignalR → admins group (payment_success)    │
  │◄─ Redirect /payment/success ┤                 │
```

### Domain Event Dispatch Flow

```
Handler
  │
  ├── aggregate.SomeMethod()
  │   └── RaiseDomainEvent(new SomeEvent(...))    ← in-memory list
  │
  ├── unitOfWork.CommitTransactionAsync()
  │   └── _context.SaveChangesAsync()
  │       ├── [1] Collect DomainEvents from all tracked AggregateRoots
  │       │       ClearDomainEvents() on each
  │       ├── [2] base.SaveChangesAsync()         ← actual DB write
  │       └── [3] foreach event:
  │               MediatR.Publish(DomainEventNotification<T>)
  │               └── EventHandler.Handle(notification)
  │                   ├── backgroundJobClient.Enqueue<IEmailService>(...)
  │                   └── backgroundJobClient.Enqueue<INotificationService>(...)
  │                                               ↑
  │                                     SignalR push executed by Hangfire
```

### Real-Time Notification Flow

```
Hangfire Worker
  │
  ├── INotificationService.NotifyOrderPlacedAsync(orderID, userID, ...)
  │   └── NotificationService.NotifyOrderPlacedAsync(...)
  │       └── hub.Clients.Group("admins")
  │           .ReceiveNotification(new NotificationDto(
  │               Id:    Guid.NewGuid().ToString(),
  │               Type:  "order_placed",
  │               Title: "New order received",
  │               Body:  "Order: {id} from User: {uid} — ...",
  │               CreatedAt: DateTime.UtcNow
  │           ))
  │
  └── [All connected Admin clients receive the notification in real-time]
```

---

## Database Schema

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
│ ImageURL (||sep) │  └─────────────────┘        │   UNIQ       │
│ ProductStatus    │                             │ DiscountAmount
│ CreatedAt        │                             │ CouponQuantity
└──────────────────┘                             │ ExpiryDate   │
                                                 │ CreatedAt    │
                                                 └──────────────┘
```

---

## Observability

### Serilog + Seq

Serilog is bootstrapped in `Program.cs` before `WebApplication.CreateBuilder` returns:

```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();
```

Log level overrides suppress noisy framework logs (`Microsoft.*`, `System.Net.Http.HttpClient`). In Development, the Seq dashboard opens automatically on app start.

### MediatR Logging

`LoggingBehavior` adds a pipeline-level layer:

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
| `ConnectionStrings` | `Default` | — | SQL Server (also used by Hangfire) |
| `Jwt` | `SecretKey` | — | HS256 signing key (min 256 bits) |
| `Jwt` | `Issuer` | `Connect.API` | JWT `iss` claim |
| `Jwt` | `Audience` | `Connect.Client` | JWT `aud` claim |
| `Jwt` | `ExpiryMinutes` | `60` | Access token lifetime *(code uses 10 min hardcoded)* |
| `Email` | `Host` | `smtp.gmail.com` | SMTP hostname |
| `Email` | `Port` | `587` | SMTP port (StartTLS) |
| `Email` | `Username` | — | SMTP auth username |
| `Email` | `Password` | — | SMTP app password |
| `Email` | `FromName` | `Connect.` | `From:` display name |
| `VNPAY` | `TmnCode` | — | Merchant terminal code |
| `VNPAY` | `HashSecret` | — | HMAC hash secret |
| `VNPAY` | `CallbackUrl` | — | Publicly accessible callback URL |
| `VNPAY` | `BaseUrl` | sandbox URL | VNPAY payment page |
| `VNPAY` | `Version` | `2.1.0` | API version |
| `VNPAY` | `OrderType` | `other` | Order type classification |

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

### 1. Clone the Repository

```bash
git clone https://github.com/datnguynx110605/connect-ecommerce.git
cd connect-ecommerce
```

### 2. Configure the Backend

```bash
cd Connect.Backend/Connect.API

dotnet user-secrets set "ConnectionStrings:Default" \
  "Server=localhost;Database=ConnectDb;Trusted_Connection=True;TrustServerCertificate=True;"
dotnet user-secrets set "Jwt:SecretKey" "your-minimum-32-character-secret-key-here"
dotnet user-secrets set "Email:Username" "your@gmail.com"
dotnet user-secrets set "Email:Password" "your-16-char-app-password"
dotnet user-secrets set "VNPAY:TmnCode"    "your-tmn-code"
dotnet user-secrets set "VNPAY:HashSecret" "your-hash-secret"
dotnet user-secrets set "VNPAY:CallbackUrl" "https://localhost:7240/api/payments/vnpay-callback"
```

### 3. Apply Database Migrations

```bash
dotnet ef database update \
  --project Connect.Backend/Connect.Infrastructure \
  --startup-project Connect.Backend/Connect.API
```

### 4. Start Redis

```bash
# Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Or with Redis CLI: redis-server
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

### 7. Run the Frontend

```bash
cd Connect.Frontend/Connect.UI
npm install
npm run dev
```

The SPA is served at `http://localhost:3000` and proxies API calls to `https://localhost:7240`.

---

## Design Decisions

### Why a React SPA frontend?

The frontend demonstrates that the API is complete and correct — every endpoint, auth flow, and error state is exercised by real UI code. The typed API client layer (`src/api/`) also serves as living documentation of every request/response shape.

### Why a typed API client layer instead of a generated SDK?

Hand-authored API modules in `src/api/` allow fine-grained control over token injection, auto-refresh logic, anonymous vs. authenticated calls, and FormData handling (for multipart product uploads). They are also kept intentionally thin — one function per endpoint — so the contracts are immediately readable without code generation tooling.

### Why local cart state synced to the backend?

The local cart gives instant UI feedback without a round-trip on every click. The backend cart is the authoritative source at checkout time — `Checkout.tsx` fetches the backend cart fresh before order creation and falls back to the local state if the backend cart is empty or returns an error. This makes the checkout resilient to session gaps.

### Why SignalR over polling or webhooks for admin notifications?

SignalR keeps admin dashboards in sync with zero polling overhead. The Redis backplane means notifications work correctly across horizontally scaled API instances. The `admins` group model ensures only privileged clients receive sensitive operational data (low stock, payment events), while the `user-{id}` group is reserved for future per-user notifications.

### Why Clean Architecture over a simpler layered approach?

The domain and application layers have zero framework dependencies — they can be unit-tested without spinning up a database, HTTP server, or any external service. Infrastructure implementations can be swapped (e.g., PostgreSQL, Mailgun) without touching business logic.

### Why DDD tactical patterns?

The e-commerce domain has genuine complexity: inventory management, pricing rules, order lifecycle transitions, coupon validity, payment status synchronization. Aggregates with private constructors and factory methods make invalid states unrepresentable.

### Why CQRS via MediatR?

Not for performance (no read/write DB split), but for structural clarity. Every operation is a named, typed, discoverable object. Cross-cutting concerns (validation, logging) are registered once in a pipeline behavior.

### Why Data Protection for email tokens?

Data Protection provides cryptographically isolated purpose strings — a `registration-session` token cannot be used as an `email-verification` token. It is entirely stateless with no database table, cleanup jobs, or extra DB queries.

### Why Hangfire for email and notification delivery?

Background jobs decouple side effects from business transactions. If the SMTP server or SignalR hub is temporarily unavailable, Hangfire retries the job automatically. The business transaction (order creation, cancellation) never fails because of email or notification infrastructure.

### Why BCrypt cost 12?

~250ms per hash makes brute-force attacks impractical even with a leaked database, while being imperceptible to users at login frequency.

---

## Known Limitations & Future Work

**Bug — Shipping fee double-application:**
`Order.CalculateTotalPrice` has a missing `else if` for `SuperFast`. Standard orders are charged 30,000 + 80,000 VND instead of 30,000 VND.

**Bug — `UserRegisterEvent` fires with UserID = 0:**
`UserRegisterEvent` is raised inside the `User` constructor before EF Core assigns a database ID. `SendWelcomeEmailAsync` re-fetches by `UserID = 0`, which always fails. The event should be raised after the first `SaveChangesAsync`, or the handler should re-fetch by the email in the event payload.

**Missing — `ValidationException` → 400 mapping:**
`ExceptionMiddleware` currently returns `500` for all unhandled exceptions. `FluentValidation.ValidationException` should map to `400`, `DomainExceptions` to `422`, and `UnauthorizedAccessException` to `403`.

**Missing — SignalR client integration in the frontend:**
`NotificationHub` is fully implemented on the backend. The React frontend does not yet include a SignalR connection or notification UI. Wiring `@microsoft/signalr` into `AppContext` and rendering a toast/badge for admin users is the natural next step.

**Missing — Pagination:**
All `GetAll*` handlers return the entire table. Cursor-based or offset pagination is required for production use.

**Missing — Product filtering and search:**
`WhereAsync` exists in the repository but no product handler uses it. Category, price-range, RAM, and ROM filters on the frontend sidebar are currently display-only.

**Missing — Unit and Integration Tests:**
No test projects exist. The domain and application layers are highly testable in isolation.

**Missing — Admin role assignment API:**
Promoting a user to `Admin` requires a direct database update. A `POST /api/users/{id}/role` endpoint restricted to existing admins is the clean solution.

**Improvement — `OrderCompletedEvent` dispatch:**
`Order.MarkOrderStatusToCompleted()` never calls `RaiseDomainEvent`. Adding that call would complete the event chain and trigger the completion email.

**Improvement — `OrderStatus.Processing`:**
The enum value exists but no transition implements it. Inserting `Processing` between `Pending` and `Shipping` would provide more granular order tracking.

---

## Author

**datnguynx110605** — Built as a portfolio-grade reference implementation of full-stack Clean Architecture, Domain-Driven Design, CQRS, and real-time notifications in .NET 10 + React 19.

---

## License

MIT © datnguynx110605

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
