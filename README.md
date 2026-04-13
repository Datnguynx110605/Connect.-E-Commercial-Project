# 🚀 Connect.

Connect. is a production-oriented e-commerce platform for Apple devices, engineered with a strong emphasis on architectural integrity, domain isolation, and long-term maintainability.

The system is built on top of Clean Architecture, combined with Domain-Driven Design (DDD) and CQRS, to enforce strict separation of concerns and ensure that business logic remains fully encapsulated and protected from external dependencies.

At its core, the platform adopts a Rich Domain Model, where domain entities enforce business invariants and behaviors, while the application layer acts strictly as an orchestration layer.

Developed over 4 months, this project reflects a deliberate focus on scalable system design, testability, and real-world backend engineering practices.

---

# 👤 Authors

Dat Nguyen (datnguynx)

---

# ⚙️ Deployment

## 🔧 Back-End (Visual Studio)
	
### Projects
	
	Connect.API			
	Connect.Application			
	Connect.Domain		
	Connect.Infrastructure
	
### Configuration
	
	Update ConnectionString in appsettings.json:
		
	"ConnectionStrings": {
	"DefaultConnection": "your_database_connection"
	}
	
### Environment Setup
	
- Set Connect.API as Startup Project
  
- Open NuGet Package Manager Console
  
- Set Connect.Infrastructure as Default Project
	
### Database Migration
	
	Add-Migration InitialCreate	
	Update-Database
		
### Run Application
		
	Run Connect.API
			
## 💻 Front-End (Visual Studio Code)
	
### Projects
		
	Connect.AdminPanel			
	Connect.UI
				
### Run Admin Panel
		
	cd Connect.AdminPanel
	npm run dev
				
### Run User Interface
		
	cd Connect.UI		
	npm run dev

---

# 🧰 Tech Stack

## 🖥️ Back-End
		
- Framework: .NET 10.0
		
- Architecture: RESTful API
		
- Database: SQL
		
- Security: JWT (JSON Web Token)
	
## 🌐 Front-End
	
- Framework: React (Next.js)
		
- Language: JavaScript
		
- Styling: TailwindCSS

---

# 📦 Packages

## 🗄️ Data Access & ORM
	
- EntityFrameworkCore
		
- EntityFrameworkCore.SqlServer

## 🧠 Application & Architecture
	
- MediatR → Enables CQRS and decouples request handling
		
- FluentValidation → Provides structured validation pipeline
		
## 🔐 Authentication & Security
	
- Microsoft.IdentityModel.Tokens → JWT handling
		
- BCrypt.Net-Next → Secure password hashing
	
## 🌍 Web & API
	
- Microsoft.AspNetCore.Http.Abstractions → HTTP abstractions
		
- SignalR → Real-time communication support
	
## 📊 Logging & Monitoring
	
- Serilog → Structured logging for observability

---
		
# 🏗️ System Operation

## 🧩 Architecture Overview
	
The system follows Clean Architecture, enforcing strict separation between layers:
	
							Layer													Responsibility
																										
							Connect.API	Presentation 								(HTTP entry point, controllers)
																										
							Connect.Application										Use case orchestration, request handling
																										
							Connect.Domain											Core business logic, rules, invariants
																										
							Connect.Infrastructure									Data persistence, external services
	
															
## ✔️ Key Guarantees
	
- Framework independence
		
- High testability
		
- Controlled inward dependency flow
		
## 🎯 Design Principles
	
### 🧠 Domain-Driven Design (DDD)
		
- Business logic is fully encapsulated in Connect.Domain
			
- Domain layer is isolated from external concerns
			
- Application layer acts purely as an orchestrator
	
### 🧱 SOLID Principles
	
- Enforced across all layers to ensure:
	
- Maintainability
			
- Extensibility
			
- Clear abstraction boundaries
			
- Low coupling

---

# 📌 Connect.Domain

Core business logic lives here

## 🔍 Modeling Approach

- Rich Domain Model
		
- Behavior-driven entities
		
- Business invariants enforced at domain level
	
## 🧱 Common Building Blocks

- DomainException
		
- Handles domain rule violations
		
- AggregateRoot
		
- Manages domain events lifecycle
		
- DomainEvent
		
- Unique ID
		
- Creation timestamp
	
## 🧬 Core Elements

### 🧾 Value Objects
	
- Ensure data validity at construction time
	
- UserName, Email, PasswordHash, PhoneNumber
				
- ProductName, CategoryName
				
- Currency, Amount, Code
		
### 🔢 Enums
		
- ProductStatus
			
- PaymentStatus
			
- OrderStatus
			
- ShippingMethod
			
- PaymentMethod
	
### 🧱 Entities
		
- User
			
- Product
			
- Category
			
- Coupon
			
- Cart
			
- Order
			
- OrderItem
			
- Review
			
- RefreshToken
			
## ⚡ Domain Events
		
- OrderPlacedEvent
			
- OrderCancelEvent
			
- OrderPaidEvent
			
- UserRegisteredEvent
			
- UserChangedPasswordEvent
			
- UserUpdateProfileEvent
			
## 🔑 Key Characteristics
		
- Value Objects enforce invariants
			
- Static Factory Methods ensure valid creation
			
- Domain Events enable decoupled side-effects
			
- No external dependencies

---

# 📌 Connect.Application

Coordinates use cases and workflows

## 🎯 Responsibilities
		
- Orchestrate layer interactions
			
- Validate inputs
			
- Handle authentication/authorization
			
- Use Repository + Unit of Work
	
## 🧠 Architectural Patterns
		
### CQRS
			
- Commands → mutate state
			
- Queries → read-only
			
### MediatR
			
- Decouples request handling
			
- Centralized dispatching
	
## ⚙️ Features
		
### 👤 User
			
- Commands: RegisterUser, LoginUser, CreateNewRefreshToken, UpdateUserProfile, ChangeUserPassword, DeleteProfile
				
- Queries: GetAllUsers, GetUserProfile
			
### 📦 Product
			
- Commands: CreateProduct, UpdateProductStock, UpdateProductImage, DeleteProduct
				
- Queries: GetAllProducts, GetProductDetail
		
### 🗂️ Category
			
- Commands: CreateCategory, UpdateCategoryName
				
- Queries: GetAllCategories, GetSpecificCategory
		
### 🎟️ Coupon
			
- Commands: CreateCoupon, UpdateCouponExpiryDate, UpdateCouponQuantity
				
- Queries: GetAllCoupons, GetSpecificCoupon
		
### 🧾 Order
			
- Commands: CreateOrder, CancelOrder, UpdateOrderStatusToShipping, UpdateOrderStatusToCompleted, MarkAsPaid
				
- Queries: GetAllOrders, GetOrderHistory
			
### 🛒 Cart
			
- Commands: AddToCart, RemoveCart, ReduceCartAmount
				
- Queries: GetAllCarts, GetUserCart
		
### ⭐ Review
			
- Commands: CreateReview, UpdateReview, DeleteReview
				
- Queries: GetAllReviews, GetReviewByProduct
		
## 📤 DTOs
		
- No direct exposure of domain entities
			
- Strict separation between layers
		
## 🔌 Interfaces
		
- JWT Generator
			
- Password Hasher
			
- Current User Identity
			
- Repository / Unit of Work

---
		
# 📌 Connect.Infrastructure

Handles all external interactions

## 🗄️ Data Layer
		
- MyAppDbContext
			
- Entity mapping
			
- Database schema definition
		
## 💾 Persistence
		
- Repository Pattern
			
- Unit of Work
			
### Guarantees:
				
- Transaction consistency
				
- Atomic operations
				
- Controlled data access
			
## ⚙️ Services
		
- Token generation
			
- Password hashing
			
- User identity resolution

## 🔐 Security
		
- Centralized security configuration

---

# 🎯 Final Impression

- This project demonstrates:
		
- Strong understanding of Clean Architecture
		
- Practical application of DDD + Rich Domain Model
		
- Proper use of CQRS + MediatR
		
- Clear separation of concerns and maintainable system design
