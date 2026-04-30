# Connect. API Reference — User / Customer

> All endpoints are relative to the base URL: `https://localhost:7240`
>
> **Authentication:** Authenticated endpoints require a valid JWT Bearer token in the `Authorization` header.
> ```
> Authorization: Bearer <accessToken>
> ```
> Tokens expire in 10 minutes. Use `POST /api/users/refresh-token` to obtain a new pair.
>
> **Pagination:** All list endpoints accept `?page=1&pageSize=10` query parameters.
>
> **Error format:**
> ```json
> { "title": "...", "status": 4xx, "detail": "...", "instance": "/api/..." }
> ```

---

## Table of Contents

- [Authentication & Users](#authentication--users)
- [Products](#products)
- [Categories](#categories)
- [Coupons](#coupons)
- [Cart](#cart)
- [Orders](#orders)
- [Reviews](#reviews)
- [Payments](#payments)
- [Real-Time Notifications (SignalR)](#real-time-notifications-signalr)

---

## Authentication & Users

### Check Email & Send Verification

`POST /api/users/check-email`

Validates that the email is not already registered and sends a verification email containing a time-limited link (30 minutes).

**Request Body**
```json
{
  "email": "user@example.com"
}
```

**Response `200 OK`**
```json
{
  "message": "Verification email sent. Please check your inbox."
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed (empty or invalid email format) |
| `409` | Email already registered |

---

### Verify Email

`POST /api/users/verify-email`

Exchanges the email verification token (from the link) for a short-lived registration session token (15 minutes). This token is required to complete registration.

**Request Body**
```json
{
  "verificationToken": "CfDJ8..."
}
```

**Response `200 OK`**
```json
{
  "registrationSessionToken": "CfDJ8..."
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Token is missing, expired, or invalid |

---

### Register

`POST /api/users/register`

Creates a new user account. Requires the `registrationSessionToken` obtained from `/verify-email`. Triggers a welcome email via background job.

**Request Body**
```json
{
  "registrationSessionToken": "CfDJ8...",
  "userName": "johndoe",
  "phoneNumber": "0912345678",
  "password": "MyPass123",
  "address": "123 Nguyen Hue, District 1, Ho Chi Minh City"
}
```

**Field Rules**

| Field | Rules |
|---|---|
| `userName` | 3–30 chars, lowercase letters only (`^[a-z]+$`) |
| `phoneNumber` | Exactly 10 digits |
| `password` | 5–30 chars |
| `address` | Min 10 chars |

**Response `201 Created`**
```json
{
  "userName": "johndoe",
  "email": "user@example.com",
  "phoneNumber": "0912345678",
  "address": "123 Nguyen Hue, District 1, Ho Chi Minh City",
  "oAuthProviderName": null,
  "createdAt": "2026-04-30T13:00:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed or session token expired/invalid |
| `409` | Username or email already exists |

---

### Login

`POST /api/users/login`

Authenticates a user with email and password. Returns a JWT access token and a refresh token.

> ⚠️ Rate limited: **5 requests per 2 minutes** per IP address.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "MyPass123"
}
```

**Response `200 OK`**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "base64encodedtoken..."
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed |
| `401` | Email or password is incorrect |
| `429` | Rate limit exceeded |

---

### Google OAuth2 Sign In

`GET /api/users/get-oauthauthurl`

Redirects the client to the Google OAuth2 consent screen.

**Response `302 Redirect`** → Google OAuth2 URL

---

### Google OAuth2 Callback

`GET /api/users/oauth-callback?code=...`

Handled automatically by Google redirect. Exchanges the authorization code for user info, creates the user account (if new), issues JWT + refresh token, and redirects to the frontend.

**Response `302 Redirect`** → `http://localhost:3000/home`

---

### Refresh Token

`POST /api/users/refresh-token`

Rotates the refresh token pair. The old refresh token is revoked and a new access token + refresh token pair is returned.

**Request Body**
```json
{
  "userID": 1,
  "refreshToken": "base64encodedtoken..."
}
```

**Response `200 OK`**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "newbase64token..."
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed |
| `401` | Refresh token not found, expired, or revoked |

---

### Forget Password

`POST /api/users/forget-password`

Resets the account password using a valid registration session token (obtained via the email verification flow).

**Request Body**
```json
{
  "registrationSessionToken": "CfDJ8...",
  "newPasswordHash": "NewPass456"
}
```

**Field Rules**

| Field | Rules |
|---|---|
| `newPasswordHash` | 5–15 chars |

**Response `200 OK`**
```json
"Update password successfully"
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed or token expired/invalid |
| `404` | User not found |

---

### Get My Profile

`GET /api/users/get-profile` 🔒 *Authenticated*

Returns the profile of the currently authenticated user.

**Response `200 OK`**
```json
{
  "userName": "johndoe",
  "email": "user@example.com",
  "phoneNumber": "0912345678",
  "address": "123 Nguyen Hue, District 1, Ho Chi Minh City",
  "oAuthProviderName": null,
  "createdAt": "2026-04-30T13:00:00Z"
}
```

---

### Update Profile

`PUT /api/users/update-profile` 🔒 *Authenticated*

Updates the authenticated user's profile.

**Request Body**
```json
{
  "userName": "janedoe",
  "email": "jane@example.com",
  "phoneNumber": "0987654321",
  "address": "456 Le Loi, District 1, Ho Chi Minh City"
}
```

**Field Rules**

| Field | Rules |
|---|---|
| `userName` | 5–10 chars, lowercase letters only |
| `email` | Valid email format |
| `phoneNumber` | Exactly 10 digits |
| `address` | Min 10 chars |

**Response `200 OK`**
```json
{
  "userName": "janedoe",
  "email": "jane@example.com",
  "phoneNumber": "0987654321",
  "address": "456 Le Loi, District 1, Ho Chi Minh City",
  "oAuthProviderName": null,
  "createdAt": "2026-04-30T13:00:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed |
| `422` | Address is empty |

---

### Change Password

`PUT /api/users/change-password` 🔒 *Authenticated*

Changes the authenticated user's password.

**Request Body**
```json
{
  "oldPassword": "MyPass123",
  "password": "NewPass456"
}
```

**Field Rules**

| Field | Rules |
|---|---|
| `password` | 5–15 chars |

**Response `200 OK`**
```json
"Update password successfully"
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed |
| `422` | Old password does not match, or new password is the same as old |

---

### Delete Profile

`DELETE /api/users/delete-profile` 🔒 *Authenticated*

Permanently deletes the authenticated user's account. All cascade-deleted data: refresh tokens, cart items, reviews.

**Response `204 No Content`**

---

## Products

### Get All Products

`GET /api/products/getall-product`

Returns a paginated list of all products.

**Query Parameters**

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `pageSize` | `10` | Items per page (max 50) |

**Response `200 OK`**
```json
{
  "items": [
    {
      "productID": 1,
      "categoryID": 2,
      "productName": "iPhone 15 Pro Max",
      "description": "The most advanced iPhone ever...",
      "originalPrice": 30000000.00,
      "finalPrice": 27000000.00,
      "stock": 50,
      "ram": 8,
      "rom": 256,
      "color": "Black Titanium",
      "imageURL": ["https://cdn.example.com/img1.jpg", "https://cdn.example.com/img2.jpg"],
      "productStatus": "InStock",
      "createdAt": "2026-01-15T08:00:00Z"
    }
  ],
  "totalCount": 120,
  "page": 1,
  "pageSize": 10,
  "totalPages": 12,
  "hasNext": true,
  "hasPrevious": false
}
```

---

### Get Product Detail

`GET /api/products/{id}/get-productdetail`

Returns full details for a single product.

**Response `200 OK`**
```json
{
  "productID": 1,
  "categoryID": 2,
  "productName": "iPhone 15 Pro Max",
  "description": "The most advanced iPhone ever...",
  "originalPrice": 30000000.00,
  "finalPrice": 27000000.00,
  "stock": 50,
  "ram": 8,
  "rom": 256,
  "color": "Black Titanium",
  "imageURL": ["https://cdn.example.com/img1.jpg"],
  "productStatus": "InStock",
  "createdAt": "2026-01-15T08:00:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `404` | Product not found |

---

### Get Products by Category

`GET /api/products/get-product-bycategory?id={categoryId}&page=1&pageSize=10`

Returns a paginated list of products filtered by category ID.

**Response `200 OK`** — Same structure as Get All Products.

---

### Get Products by RAM

`GET /api/products/get-product-byram?ram={ram}&page=1&pageSize=10`

Returns products filtered by exact RAM value (GB).

**Response `200 OK`** — Same structure as Get All Products.

---

### Get Products by ROM

`GET /api/products/get-product-byrom?rom={rom}&page=1&pageSize=10`

Returns products filtered by exact ROM/storage value (GB).

**Response `200 OK`** — Same structure as Get All Products.

---

### Get Products by Color

`GET /api/products/get-product-bycolor?color={color}&page=1&pageSize=10`

Returns products filtered by exact color string.

**Response `200 OK`** — Same structure as Get All Products.

---

### Get Products by Price Range

`GET /api/products/get-product-pricerange?from={from}&to={to}&page=1&pageSize=10`

Returns products where `finalPrice` falls within the given range.

**Response `200 OK`** — Same structure as Get All Products.

---

## Categories

### Get All Categories

`GET /api/categories/getall-category`

**Response `200 OK`**
```json
{
  "items": [
    { "categoryID": 1, "categoryName": "Smartphones" },
    { "categoryID": 2, "categoryName": "Laptops" }
  ],
  "totalCount": 2,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

---

### Get Category by ID

`GET /api/categories/{id}/get-categorybyid`

**Response `200 OK`**
```json
{
  "categoryID": 1,
  "categoryName": "Smartphones"
}
```

**Error Responses**

| Status | When |
|---|---|
| `404` | Category not found |

---

## Coupons

### Get All Coupons

`GET /api/coupons/getall-coupon` 🔒 *Authenticated*

**Response `200 OK`**
```json
{
  "items": [
    {
      "couponID": 1,
      "couponCode": "SAVE10K",
      "discountAmount": 10000.00,
      "couponQuantity": 50,
      "minimumPriceRequired": 100000.00,
      "expiryDate": "2026-12-31T23:59:59Z"
    }
  ],
  "totalCount": 5,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

---

### Get Coupon by ID

`GET /api/coupons/{id}/get-couponbyid` 🔒 *Authenticated*

**Response `200 OK`**
```json
{
  "couponID": 1,
  "couponCode": "SAVE10K",
  "discountAmount": 10000.00,
  "couponQuantity": 50,
  "minimumPriceRequired": 100000.00,
  "expiryDate": "2026-12-31T23:59:59Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `404` | Coupon not found |

---

## Cart

### Get My Cart

`GET /api/carts/get-mycart` 🔒 *Authenticated*

Returns all cart items belonging to the authenticated user.

**Response `200 OK`**
```json
{
  "items": [
    {
      "cartID": 10,
      "userID": 1,
      "productID": 5,
      "cartQuantity": 2,
      "cartUnitPrice": 27000000.00,
      "cartTotalPrice": 54000000.00
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

---

### Add Item to Cart

`POST /api/carts/addto-cart` 🔒 *Authenticated*

Adds a product to the authenticated user's cart. Quantity is capped at 10.

**Request Body**
```json
{
  "productID": 5,
  "quantity": 2
}
```

**Field Rules**

| Field | Rules |
|---|---|
| `quantity` | 1–10 |

**Response `201 Created`**
```json
{
  "cartID": 10,
  "userID": 1,
  "productID": 5,
  "cartQuantity": 2,
  "cartUnitPrice": 27000000.00,
  "cartTotalPrice": 54000000.00
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed |
| `404` | Product not found |
| `422` | Quantity exceeds limit (> 10) |

---

### Increase Cart Item Amount

`PATCH /api/carts/{id}/increase-cartamount` 🔒 *Authenticated*

Increments the quantity of a specific cart item by 1.

**Response `200 OK`**
```json
{
  "cartID": 10,
  "userID": 1,
  "productID": 5,
  "cartQuantity": 3,
  "cartUnitPrice": 27000000.00,
  "cartTotalPrice": 81000000.00
}
```

**Error Responses**

| Status | When |
|---|---|
| `403` | Cart item belongs to another user |
| `404` | Cart item not found |
| `422` | Quantity already at limit (10) |

---

### Reduce Cart Item Amount

`PATCH /api/carts/{id}/reduce-cartamount` 🔒 *Authenticated*

Decrements the quantity of a specific cart item by 1.

**Response `200 OK`**
```json
{
  "cartID": 10,
  "userID": 1,
  "productID": 5,
  "cartQuantity": 1,
  "cartUnitPrice": 27000000.00,
  "cartTotalPrice": 27000000.00
}
```

**Error Responses**

| Status | When |
|---|---|
| `403` | Cart item belongs to another user |
| `404` | Cart item not found |

---

### Remove Cart Item

`DELETE /api/carts/{id}/delete-cart` 🔒 *Authenticated*

Removes a specific cart item.

**Response `200 OK`**
```json
"Cart is removed"
```

**Error Responses**

| Status | When |
|---|---|
| `403` | Cart item belongs to another user |
| `404` | Cart item not found |

---

## Orders

### Get Order History

`GET /api/orders/get-orderhistory` 🔒 *Authenticated*

Returns the authenticated user's order history, paginated.

**Response `200 OK`**
```json
{
  "items": [
    {
      "orderID": 42,
      "userID": 1,
      "couponID": null,
      "orderTotalItems": 2,
      "orderTotalItemPrice": 54050000.00,
      "orderFinalPrice": 54050000.00,
      "orderShippingMethod": "Fast",
      "orderPaymentMethod": "Cash",
      "orderPaymentStatus": "Unpaid",
      "orderStatus": "Pending",
      "orderItems": [
        {
          "productID": 5,
          "unitPrice": 27000000.00,
          "quantity": 2
        }
      ],
      "createdAt": "2026-04-30T14:30:00Z"
    }
  ],
  "totalCount": 3,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

**Enum Values**

| Field | Possible Values |
|---|---|
| `orderStatus` | `Pending`, `Processing`, `Shipping`, `Completed`, `Cancelled` |
| `orderPaymentStatus` | `Unpaid`, `Pending`, `Paid` |
| `orderShippingMethod` | `Standard`, `Fast`, `SuperFast` |
| `orderPaymentMethod` | `Cash`, `OnlineBanking`, `VNPAY` |

---

### Create Order

`POST /api/orders/create-order` 🔒 *Authenticated*

Places a new order. Stock is immediately decremented. Triggers order confirmation email and admin notification.

**Request Body**
```json
{
  "items": [
    { "productID": 5, "unitPrice": 27000000.00, "quantity": 2 }
  ],
  "couponID": 1,
  "orderShippingMethod": 1,
  "orderPaymentMethod": 0
}
```

**Enum Values for Request**

| Field | Value |
|---|---|
| `orderShippingMethod` | `0` = Standard, `1` = Fast, `2` = SuperFast |
| `orderPaymentMethod` | `0` = Cash, `1` = OnlineBanking, `2` = VNPAY |

**Shipping Fees**

| Method | Fee |
|---|---|
| Standard | 30,000 VND *(+ known bug: also adds 80,000 VND)* |
| Fast | 50,000 VND |
| SuperFast | 80,000 VND |

**Coupon Application:** If `couponID` is provided, the coupon's `discountAmount` is subtracted from the order total after shipping. The coupon must not be expired, must have stock, the order total must meet `minimumPriceRequired`, and the discount must not exceed the total.

**Response `201 Created`**
```json
{
  "orderID": 42,
  "userID": 1,
  "couponID": 1,
  "orderTotalItems": 1,
  "orderTotalItemPrice": 27050000.00,
  "orderFinalPrice": 17050000.00,
  "orderShippingMethod": "Fast",
  "orderPaymentMethod": "Cash",
  "orderPaymentStatus": "Unpaid",
  "orderStatus": "Pending",
  "orderItems": [
    { "productID": 5, "unitPrice": 27000000.00, "quantity": 1 }
  ],
  "createdAt": "2026-04-30T14:30:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed (empty items, invalid quantity/unitPrice) |
| `404` | Product(s) or coupon not found |
| `422` | Coupon expired, out of stock, minimum price not met, or discount exceeds total |

---

### Cancel Order

`PATCH /api/orders/{id}/cancel-order` 🔒 *Authenticated*

Cancels an order. Only allowed when `orderStatus = Pending`. Stock is restored for all order items. Triggers cancellation email and admin notification.

**Response `200 OK`**
```json
{
  "orderID": 42,
  "userID": 1,
  "couponID": null,
  "orderTotalItems": 1,
  "orderTotalItemPrice": 27050000.00,
  "orderFinalPrice": 27050000.00,
  "orderShippingMethod": "Fast",
  "orderPaymentMethod": "Cash",
  "orderPaymentStatus": "Unpaid",
  "orderStatus": "Cancelled",
  "orderItems": [
    { "productID": 5, "unitPrice": 27000000.00, "quantity": 1 }
  ],
  "createdAt": "2026-04-30T14:30:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `403` | Order belongs to another user |
| `404` | Order not found |
| `422` | Order is not in Pending status |

---

## Reviews

### Get All Reviews

`GET /api/reviews/getall-review`

**Response `200 OK`**
```json
{
  "items": [
    {
      "reviewID": 7,
      "userID": 1,
      "productID": 5,
      "rating": 5,
      "body": "Absolutely amazing phone, highly recommend!",
      "createdAt": "2026-04-15T10:00:00Z"
    }
  ],
  "totalCount": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5,
  "hasNext": true,
  "hasPrevious": false
}
```

---

### Get Reviews by Product

`GET /api/reviews/{productId}/get-reviewbyproduct`

**Response `200 OK`** — Same structure as Get All Reviews.

---

### Create Review

`POST /api/reviews/create-review` 🔒 *Authenticated*

Submits a review for a product. One review per user per product (enforced by unique DB index).

**Request Body**
```json
{
  "productID": 5,
  "rating": 5,
  "body": "Absolutely amazing phone, highly recommend!"
}
```

**Field Rules**

| Field | Rules |
|---|---|
| `rating` | Integer > 0 |
| `body` | 5–2,000 chars |

**Response `201 Created`**
```json
{
  "reviewID": 7,
  "userID": 1,
  "productID": 5,
  "rating": 5,
  "body": "Absolutely amazing phone, highly recommend!",
  "createdAt": "2026-04-30T14:45:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed |
| `404` | Product not found |
| `409` | User has already reviewed this product |

---

### Update Review

`PUT /api/reviews/{id}/update-review` 🔒 *Authenticated*

Updates an existing review. Only the review's author can update it.

**Request Body**
```json
{
  "rating": 4,
  "body": "Still great, but battery could be better."
}
```

**Field Rules**

| Field | Rules |
|---|---|
| `rating` | Integer > 0 |
| `body` | 5–300 chars (stricter than create) |

**Response `200 OK`**
```json
{
  "reviewID": 7,
  "userID": 1,
  "productID": 5,
  "rating": 4,
  "body": "Still great, but battery could be better.",
  "createdAt": "2026-04-30T14:45:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed |
| `403` | Review belongs to another user |
| `404` | Review not found |

---

### Delete Review

`DELETE /api/reviews/{id}/delete-review` 🔒 *Authenticated*

Deletes a review. Only the review's author can delete it.

**Response `204 No Content`**

**Error Responses**

| Status | When |
|---|---|
| `403` | Review belongs to another user |
| `404` | Review not found |

---

## Payments

### Create VNPAY Payment URL

`POST /api/payments/create-paymenturl` 🔒 *Authenticated*

Generates a VNPAY payment URL for an existing order. The user is redirected to this URL to complete payment.

**Request Body**
```json
{
  "orderID": 42
}
```

**Response `200 OK`**
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=..."
}
```

**Error Responses**

| Status | When |
|---|---|
| `403` | Order belongs to another user |
| `404` | Order not found |

---

### VNPAY Payment Callback

`GET /api/payments/vnpay-callback` *(Called automatically by VNPAY)*

This endpoint is called by VNPAY's servers after payment. Do not call this endpoint directly. On success, the user is redirected to `http://localhost:3000/myorder`.

**On Success:** Creates a `Payment` record, calls `order.MarkAsPaidForPaymentGateway(true)`, triggers payment bill email and admin notification.

**Redirect on Success** → `http://localhost:3000/myorder`

**Redirect on Failure** → `/payment/failed?code={code}`

---

## Real-Time Notifications (SignalR)

Connect to the SignalR hub to receive real-time notifications. Users currently receive notifications if connected as admin. Future work includes per-user notifications.

**Hub URL:** `https://localhost:7240/hubs/notifications`

**Frontend Connection Example**

```typescript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl('https://localhost:7240/hubs/notifications', {
    accessTokenFactory: () => localStorage.getItem('accessToken') ?? '',
  })
  .withAutomaticReconnect()
  .build();

connection.on('ReceiveNotification', (dto) => {
  console.log(dto.type, dto.title, dto.body);
});

await connection.start();
```

**Notification DTO**
```json
{
  "id": "guid-string",
  "type": "order_placed",
  "title": "New order received",
  "body": "Order : 42 was placed from User : 1 — Shipping method : Fast - Payment method : Cash - Total amount of money: 27050000",
  "createdAt": "2026-04-30T14:30:00Z",
  "payload": null
}
```

---

## Common Response Models

### PagedResult\<T\>

```json
{
  "items": [...],
  "totalCount": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5,
  "hasNext": true,
  "hasPrevious": false
}
```

### UserDto

```json
{
  "userName": "johndoe",
  "email": "user@example.com",
  "phoneNumber": "0912345678",
  "address": "123 Main St",
  "oAuthProviderName": null,
  "createdAt": "2026-04-30T13:00:00Z"
}
```

### OrderDto

```json
{
  "orderID": 42,
  "userID": 1,
  "couponID": null,
  "orderTotalItems": 2,
  "orderTotalItemPrice": 54050000.00,
  "orderFinalPrice": 54050000.00,
  "orderShippingMethod": "Fast",
  "orderPaymentMethod": "Cash",
  "orderPaymentStatus": "Unpaid",
  "orderStatus": "Pending",
  "orderItems": [
    { "productID": 5, "unitPrice": 27000000.00, "quantity": 2 }
  ],
  "createdAt": "2026-04-30T14:30:00Z"
}
```

### ProductDto

```json
{
  "productID": 1,
  "categoryID": 2,
  "productName": "iPhone 15 Pro Max",
  "description": "The most advanced iPhone...",
  "originalPrice": 30000000.00,
  "finalPrice": 27000000.00,
  "stock": 50,
  "ram": 8,
  "rom": 256,
  "color": "Black Titanium",
  "imageURL": ["https://cdn.example.com/img1.jpg"],
  "productStatus": "InStock",
  "createdAt": "2026-01-15T08:00:00Z"
}
```

### ReviewDto

```json
{
  "reviewID": 7,
  "userID": 1,
  "productID": 5,
  "rating": 5,
  "body": "Amazing product!",
  "createdAt": "2026-04-30T14:45:00Z"
}
```

### CartDto

```json
{
  "cartID": 10,
  "userID": 1,
  "productID": 5,
  "cartQuantity": 2,
  "cartUnitPrice": 27000000.00,
  "cartTotalPrice": 54000000.00
}
```

### CouponDto

```json
{
  "couponID": 1,
  "couponCode": "SAVE10K",
  "discountAmount": 10000.00,
  "couponQuantity": 50,
  "minimumPriceRequired": 100000.00,
  "expiryDate": "2026-12-31T23:59:59Z"
}
```