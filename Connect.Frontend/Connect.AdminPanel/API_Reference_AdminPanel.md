# Connect. API Reference — Admin Panel

> All endpoints are relative to the base URL: `https://localhost:7240`
>
> **Authentication:** Every admin endpoint requires a valid JWT Bearer token with `role = Admin`.
> ```
> Authorization: Bearer <accessToken>
> ```
> Tokens expire in 10 minutes. Use `POST /api/users/refresh-token` to rotate the token pair.
>
> **How to become Admin:** There is currently no API endpoint for role promotion. Execute the following SQL directly on the database:
> ```sql
> UPDATE Users SET Role = 'Admin' WHERE UserID = <target_user_id>;
> ```
>
> **Pagination:** All list endpoints accept `?page=1&pageSize=10` query parameters (max pageSize: 50).
>
> **Error format:**
> ```json
> { "title": "...", "status": 4xx, "detail": "...", "instance": "/api/..." }
> ```

---

## Table of Contents

- [Users](#users)
- [Products](#products)
- [Categories](#categories)
- [Coupons](#coupons)
- [Carts](#carts)
- [Orders](#orders)
- [Payments](#payments)
- [Real-Time Notifications (SignalR)](#real-time-notifications-signalr)
- [Background Jobs (Hangfire)](#background-jobs-hangfire)
- [Common Response Models](#common-response-models)

---

## Users

### Get All Users

`GET /api/users/getall-user` 🔑 *Admin*

Returns a paginated list of all registered users.

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
      "userName": "johndoe",
      "email": "john@example.com",
      "phoneNumber": "0912345678",
      "address": "123 Nguyen Hue, District 1, Ho Chi Minh City",
      "oAuthProviderName": null,
      "createdAt": "2026-01-10T08:00:00Z"
    },
    {
      "userName": "googleuser",
      "email": "guser@gmail.com",
      "phoneNumber": null,
      "address": null,
      "oAuthProviderName": "Google",
      "createdAt": "2026-02-20T10:30:00Z"
    }
  ],
  "totalCount": 150,
  "page": 1,
  "pageSize": 10,
  "totalPages": 15,
  "hasNext": true,
  "hasPrevious": false
}
```

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |

---

### Get User by Username

`GET /api/users/get-userbyusername?userName={userName}` 🔑 *Admin*

Looks up a specific user by their username.

**Query Parameters**

| Parameter | Required | Description |
|---|---|---|
| `userName` | Yes | Exact username to search (lowercase letters only) |

**Response `200 OK`**
```json
{
  "userName": "johndoe",
  "email": "john@example.com",
  "phoneNumber": "0912345678",
  "address": "123 Nguyen Hue, District 1, Ho Chi Minh City",
  "oAuthProviderName": null,
  "createdAt": "2026-01-10T08:00:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |

---

### Get User by Email

`GET /api/users/get-userbyemail?email={email}` 🔑 *Admin*

Looks up a specific user by their email address.

**Query Parameters**

| Parameter | Required | Description |
|---|---|---|
| `email` | Yes | Exact email address to search |

**Response `200 OK`**
```json
{
  "userName": "johndoe",
  "email": "john@example.com",
  "phoneNumber": "0912345678",
  "address": "123 Nguyen Hue, District 1, Ho Chi Minh City",
  "oAuthProviderName": null,
  "createdAt": "2026-01-10T08:00:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |

---

### Get User by Phone Number

`GET /api/users/get-userbyphonenumber?phoneNumber={phoneNumber}` 🔑 *Admin*

Looks up a specific user by their phone number.

**Query Parameters**

| Parameter | Required | Description |
|---|---|---|
| `phoneNumber` | Yes | Exact 10-digit phone number to search |

**Response `200 OK`**
```json
{
  "userName": "johndoe",
  "email": "john@example.com",
  "phoneNumber": "0912345678",
  "address": "123 Nguyen Hue, District 1, Ho Chi Minh City",
  "oAuthProviderName": null,
  "createdAt": "2026-01-10T08:00:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |

---

## Products

### Create Product

`POST /api/products/create-product` 🔑 *Admin*

Creates a new product. Accepts `multipart/form-data` (for future file upload support; currently `ImageURL` is a list of URL strings).

**Content-Type:** `multipart/form-data`

**Request Body (form fields)**

| Field | Type | Rules |
|---|---|---|
| `categoryID` | `int` | Must be > 0 and reference an existing category |
| `productName` | `string` | 5–100 chars, unicode letters/digits/spaces/hyphens/pipes only |
| `description` | `string` | 50–10,000 chars, no `< > { } [ ] \ \| ^ ~ \`` characters |
| `originalPrice` | `decimal` | > 0 |
| `finalPrice` | `decimal` | > 0 and ≤ `originalPrice` |
| `stock` | `int` | > 0 |
| `ram` | `int` | 1–30, must be ≤ `rom` |
| `rom` | `int` | 1–7000, must be ≥ `ram` |
| `color` | `string` | Non-empty, max 15 chars |
| `imageURL` | `List<string>` | Non-empty list of image URL strings |

**Example Request (JSON equivalent)**
```json
{
  "categoryID": 2,
  "productName": "iPhone 15 Pro Max",
  "description": "The most advanced iPhone ever made, featuring the A17 Pro chip, titanium design, and a 48MP main camera system with 5x optical zoom...",
  "originalPrice": 30000000.00,
  "finalPrice": 27000000.00,
  "stock": 50,
  "ram": 8,
  "rom": 256,
  "color": "Black Titanium",
  "imageURL": [
    "https://cdn.example.com/iphone15pm-1.jpg",
    "https://cdn.example.com/iphone15pm-2.jpg"
  ]
}
```

**Response `201 Created`**
```json
{
  "productID": 1,
  "categoryID": 2,
  "productName": "iPhone 15 Pro Max",
  "description": "The most advanced iPhone ever made...",
  "originalPrice": 30000000.00,
  "finalPrice": 27000000.00,
  "stock": 50,
  "ram": 8,
  "rom": 256,
  "color": "Black Titanium",
  "imageURL": [
    "https://cdn.example.com/iphone15pm-1.jpg",
    "https://cdn.example.com/iphone15pm-2.jpg"
  ],
  "productStatus": "InStock",
  "createdAt": "2026-04-30T09:00:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed (name/description format, price rules, RAM > ROM, etc.) |
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `404` | Category not found |
| `422` | Domain rule violation (finalPrice > originalPrice, RAM > ROM, etc.) |

---

### Update Product Stock

`PATCH /api/products/{id}/update-stock` 🔑 *Admin*

Adds stock to an existing product. This is an **additive** operation — the provided value is added to the current stock, not set as the new stock. Product status is automatically updated to `InStock` after addition.

**Request Body**
```json
{
  "stock": 25
}
```

**Field Rules**

| Field | Rules |
|---|---|
| `stock` | Integer > 0 |

**Response `200 OK`**
```json
{
  "productID": 1,
  "categoryID": 2,
  "productName": "iPhone 15 Pro Max",
  "description": "The most advanced iPhone ever made...",
  "originalPrice": 30000000.00,
  "finalPrice": 27000000.00,
  "stock": 75,
  "ram": 8,
  "rom": 256,
  "color": "Black Titanium",
  "imageURL": ["https://cdn.example.com/iphone15pm-1.jpg"],
  "productStatus": "InStock",
  "createdAt": "2026-04-30T09:00:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed (stock ≤ 0) |
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `404` | Product not found |

---

### Update Product Image

`PATCH /api/products/{id}/update-image` 🔑 *Admin*

Replaces the product's image URL list entirely.

**Content-Type:** `multipart/form-data`

**Request Body (form fields)**

| Field | Type | Rules |
|---|---|---|
| `imageURL` | `List<string>` | Non-empty list of image URL strings |

**Example Request (JSON equivalent)**
```json
{
  "imageURL": [
    "https://cdn.example.com/new-image-1.jpg",
    "https://cdn.example.com/new-image-2.jpg"
  ]
}
```

**Response `200 OK`**
```json
{
  "productID": 1,
  "categoryID": 2,
  "productName": "iPhone 15 Pro Max",
  "description": "The most advanced iPhone ever made...",
  "originalPrice": 30000000.00,
  "finalPrice": 27000000.00,
  "stock": 75,
  "ram": 8,
  "rom": 256,
  "color": "Black Titanium",
  "imageURL": [
    "https://cdn.example.com/new-image-1.jpg",
    "https://cdn.example.com/new-image-2.jpg"
  ],
  "productStatus": "InStock",
  "createdAt": "2026-04-30T09:00:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | imageURL is null or empty |
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `404` | Product not found |

---

### Delete Product

`DELETE /api/products/{id}/delete-product` 🔑 *Admin*

Permanently deletes a product.

> ⚠️ Products with existing order items cannot be deleted (FK restrict constraint on `OrderItems`). Products with cart items also cannot be deleted (FK restrict constraint on `Carts`). Remove those first or archive the product instead.

**Response `204 No Content`**

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `404` | Product not found |
| `409` | Product has associated order items or cart items (FK constraint) |

---

## Categories

### Create Category

`POST /api/categories/create-category` 🔑 *Admin*

Creates a new product category. Category names must be unique.

**Request Body**
```json
{
  "categoryName": "Smartphones"
}
```

**Field Rules**

| Field | Rules |
|---|---|
| `categoryName` | 2–20 chars, no special characters (`\W`) |

**Response `201 Created`**
```json
{
  "categoryID": 1,
  "categoryName": "Smartphones"
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed (too short/long, special characters) |
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `409` | Category name already exists |

---

### Update Category Name

`PUT /api/categories/{id}/update-category` 🔑 *Admin*

Updates an existing category's name. The new name must also be unique.

**Request Body**
```json
{
  "categoryName": "Mobile Phones"
}
```

**Field Rules**

| Field | Rules |
|---|---|
| `categoryName` | 2–20 chars, no special characters |

**Response `200 OK`**
```json
{
  "categoryID": 1,
  "categoryName": "Mobile Phones"
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed |
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `404` | Category not found |
| `409` | New category name already exists |

---

### Delete Category

`DELETE /api/categories/{id}/delete-category` 🔑 *Admin*

Permanently deletes a category.

> ⚠️ Categories with associated products cannot be deleted (FK restrict constraint). Reassign or delete all products under this category first.

**Response `204 No Content`**

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `404` | Category not found |
| `409` | Category has associated products |

---

## Coupons

### Create Coupon

`POST /api/coupons/create-coupon` 🔑 *Admin*

Creates a new discount coupon. Coupon codes must be unique.

**Request Body**
```json
{
  "couponCode": "SAVE10K",
  "discountAmount": 10000.00,
  "couponQuantity": 100,
  "mimimumPriceRequired": 200000.00,
  "expiryDate": "2026-12-31T23:59:59Z"
}
```

**Field Rules**

| Field | Rules |
|---|---|
| `couponCode` | 5–12 chars, must contain at least one digit |
| `discountAmount` | > 0 and ≤ 100 *(note: validated as ≤ 100 by FluentValidation — treat as percentage-style cap; actual VND enforcement is done in domain)* |
| `couponQuantity` | Integer > 0 |
| `mimimumPriceRequired` | > 0 |
| `expiryDate` | Any valid future DateTime |

> **Note on `discountAmount`:** The FluentValidation rule caps it at 100. The domain enforces that at usage time the discount cannot exceed the order total. For VND amounts greater than 100, the current validator will reject them. This appears to be a design inconsistency — the domain treats `discountAmount` as a `Currency` (VND), while the validator treats it as a percentage cap.

**Response `201 Created`**
```json
{
  "couponID": 1,
  "couponCode": "SAVE10K",
  "discountAmount": 10000.00,
  "couponQuantity": 100,
  "minimumPriceRequired": 200000.00,
  "expiryDate": "2026-12-31T23:59:59Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed |
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `409` | Coupon code already exists |
| `422` | Domain rule violation |

---

### Update Coupon Expiry Date

`PATCH /api/coupons/{id}/update-expiry-date` 🔑 *Admin*

Updates the expiry date of an existing coupon. The new date must be in the future.

**Request Body**
```json
{
  "expiryDate": "2027-06-30T23:59:59Z"
}
```

**Response `200 OK`**
```json
{
  "couponID": 1,
  "couponCode": "SAVE10K",
  "discountAmount": 10000.00,
  "couponQuantity": 100,
  "minimumPriceRequired": 200000.00,
  "expiryDate": "2027-06-30T23:59:59Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `404` | Coupon not found |
| `422` | New expiry date is in the past |

---

### Update Coupon Quantity

`PATCH /api/coupons/{id}/update-quantity` 🔑 *Admin*

Adds to the coupon's remaining quantity. This is an **additive** operation — the provided value is added to the current quantity, not set as the new quantity.

**Request Body**
```json
{
  "couponQuantity": 50
}
```

**Field Rules**

| Field | Rules |
|---|---|
| `couponQuantity` | Integer > 0 |

**Response `200 OK`**
```json
{
  "couponID": 1,
  "couponCode": "SAVE10K",
  "discountAmount": 10000.00,
  "couponQuantity": 150,
  "minimumPriceRequired": 200000.00,
  "expiryDate": "2026-12-31T23:59:59Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `400` | Validation failed (quantity ≤ 0) |
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `404` | Coupon not found |

---

## Carts

### Get All Carts

`GET /api/carts/getall-cart` 🔑 *Admin*

Returns a paginated list of all cart items across all users. Useful for inventory planning and user behaviour analysis.

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
      "cartID": 1,
      "userID": 3,
      "productID": 5,
      "cartQuantity": 2,
      "cartUnitPrice": 27000000.00,
      "cartTotalPrice": 54000000.00
    },
    {
      "cartID": 2,
      "userID": 7,
      "productID": 12,
      "cartQuantity": 1,
      "cartUnitPrice": 15000000.00,
      "cartTotalPrice": 15000000.00
    }
  ],
  "totalCount": 84,
  "page": 1,
  "pageSize": 10,
  "totalPages": 9,
  "hasNext": true,
  "hasPrevious": false
}
```

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |

---

## Orders

### Get All Orders

`GET /api/orders/getall-order` 🔑 *Admin*

Returns a paginated list of all orders across all users.

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
    },
    {
      "orderID": 43,
      "userID": 3,
      "couponID": 1,
      "orderTotalItems": 1,
      "orderTotalItemPrice": 27080000.00,
      "orderFinalPrice": 17080000.00,
      "orderShippingMethod": "SuperFast",
      "orderPaymentMethod": "VNPAY",
      "orderPaymentStatus": "Paid",
      "orderStatus": "Shipping",
      "orderItems": [
        { "productID": 8, "unitPrice": 27000000.00, "quantity": 1 }
      ],
      "createdAt": "2026-04-30T15:00:00Z"
    }
  ],
  "totalCount": 320,
  "page": 1,
  "pageSize": 10,
  "totalPages": 32,
  "hasNext": true,
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

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |

---

### Get Order by ID

`GET /api/orders/get-orderbyid?id={orderId}` 🔑 *Admin*

Returns the full details of a single order by its ID.

**Query Parameters**

| Parameter | Required | Description |
|---|---|---|
| `id` | Yes | The order ID to retrieve |

**Response `200 OK`**
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

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `404` | Order not found |

---

### Update Order Status to Shipping

`PATCH /api/orders/{id}/update-statustoshipping` 🔑 *Admin*

Advances an order's status to `Shipping`. Cannot be applied to cancelled orders.

**Valid Transitions:**

```
Pending ──► Shipping
Processing ──► Shipping
```

> `Processing` status exists in the enum but no transition currently sets it, so in practice the order moves directly from `Pending` to `Shipping`.

**Request Body**
```json
{
  "orderStatus": "Shipping"
}
```

**Response `200 OK`**
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
  "orderStatus": "Shipping",
  "orderItems": [
    { "productID": 5, "unitPrice": 27000000.00, "quantity": 2 }
  ],
  "createdAt": "2026-04-30T14:30:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `404` | Order not found |
| `422` | Order is already `Cancelled` |

---

### Update Order Status to Completed

`PATCH /api/orders/{id}/update-statustocompleted` 🔑 *Admin*

Marks an order as `Completed`. Requires that the order is NOT cancelled and payment status is NOT `Unpaid`. Triggers the order completion email via background job.

**Valid State Requirements:**

| Requirement | Value |
|---|---|
| `orderStatus` | Must NOT be `Cancelled` |
| `orderPaymentStatus` | Must NOT be `Unpaid` |

**Request Body**
```json
{
  "orderStatus": "Completed"
}
```

**Response `200 OK`**
```json
{
  "orderID": 42,
  "userID": 1,
  "couponID": null,
  "orderTotalItems": 2,
  "orderTotalItemPrice": 54050000.00,
  "orderFinalPrice": 54050000.00,
  "orderShippingMethod": "Fast",
  "orderPaymentMethod": "OnlineBanking",
  "orderPaymentStatus": "Paid",
  "orderStatus": "Completed",
  "orderItems": [
    { "productID": 5, "unitPrice": 27000000.00, "quantity": 2 }
  ],
  "createdAt": "2026-04-30T14:30:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `404` | Order not found |
| `422` | Order is `Cancelled` or `orderPaymentStatus` is `Unpaid` |

---

### Mark Order as Paid (Manual)

`PATCH /api/orders/{id}/markas-paid` 🔑 *Admin*

Manually marks an order's payment status as `Paid`. Use this for Cash orders or manual payment confirmation. Does **not** trigger the `OrderPaidEvent` — use this only for administrative overrides.

> For VNPAY payments, `PaymentStatus` is set automatically via the `/api/payments/vnpay-callback` endpoint, which also raises the `OrderPaidEvent` and sends the payment bill email.

**Valid State Requirements:**

| Requirement | Value |
|---|---|
| `orderPaymentStatus` | Must NOT already be `Paid` |
| `orderStatus` | Must NOT be `Cancelled` |

**Request Body**
```json
{
  "orderPaymentStatus": "Paid"
}
```

**Response `200 OK`**
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
  "orderPaymentStatus": "Paid",
  "orderStatus": "Pending",
  "orderItems": [
    { "productID": 5, "unitPrice": 27000000.00, "quantity": 2 }
  ],
  "createdAt": "2026-04-30T14:30:00Z"
}
```

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |
| `404` | Order not found |
| `409` | Order is already `Paid` |
| `422` | Order is `Cancelled` |

---

## Payments

### Get All Payments

`GET /api/payments/getall-payment` 🔑 *Admin*

Returns a paginated list of all VNPAY payment records. Only payments processed through the VNPAY gateway appear here; cash payments are tracked only via `orderPaymentStatus`.

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
      "paymentID": 14087654321,
      "orderID": 43,
      "paymentType": "VNPAY",
      "transactionID": 987654321098,
      "bankingInfo": "VCB",
      "totalAmount": 17080000.00,
      "isPaidSuccess": true,
      "paidAt": "2026-04-30T15:05:33Z"
    },
    {
      "paymentID": 14087654322,
      "orderID": 45,
      "paymentType": "VNPAY",
      "transactionID": 987654321099,
      "bankingInfo": "TCB",
      "totalAmount": 5450000.00,
      "isPaidSuccess": true,
      "paidAt": "2026-04-30T16:12:07Z"
    }
  ],
  "totalCount": 87,
  "page": 1,
  "pageSize": 10,
  "totalPages": 9,
  "hasNext": true,
  "hasPrevious": false
}
```

**Field Descriptions**

| Field | Description |
|---|---|
| `paymentID` | External VNPAY payment ID (not database-generated) |
| `orderID` | The Connect. order this payment is linked to |
| `paymentType` | Payment type string from VNPAY (e.g., `"VNPAY"`) |
| `transactionID` | VNPAY internal transaction ID |
| `bankingInfo` | Bank code used (e.g., `"VCB"`, `"TCB"`) |
| `totalAmount` | Amount paid in VND (parsed from VNPAY callback `vnp_Amount / 100`) |
| `isPaidSuccess` | Always `true` in the database (failed payments are not persisted) |
| `paidAt` | UTC timestamp from VNPAY callback |

**Error Responses**

| Status | When |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user is not Admin |

---

## Real-Time Notifications (SignalR)

Admin clients automatically join the `admins` SignalR group upon connection. All operational notifications are pushed to this group in real time.

**Hub URL:** `https://localhost:7240/hubs/notifications`

**Connection (Backend — Redis backplane required at `localhost:6379`):**

```typescript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl('https://localhost:7240/hubs/notifications', {
    accessTokenFactory: () => localStorage.getItem('accessToken') ?? '',
  })
  .withAutomaticReconnect()
  .build();

// Subscribe to all admin notifications
connection.on('ReceiveNotification', (dto: NotificationDto) => {
  console.log(`[${dto.type}] ${dto.title}: ${dto.body}`);
});

await connection.start();
```

**NotificationDto Shape**

```typescript
interface NotificationDto {
  id: string;           // UUID string
  type: string;         // See notification types below
  title: string;
  body: string;
  createdAt: string;    // ISO 8601 UTC
  payload: unknown | null;
}
```

### Notification Types

#### `low_stock`

Triggered when a product's stock drops to **≤ 5 units** during order placement.

```json
{
  "id": "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
  "type": "low_stock",
  "title": "Low stock warning",
  "body": "iPhone 15 Pro Max has 4 units remaining.",
  "createdAt": "2026-04-30T14:31:02Z",
  "payload": null
}
```

---

#### `order_placed`

Triggered when a customer successfully places a new order.

```json
{
  "id": "3f2504e0-4f89-11d3-9a0c-0305e82c3302",
  "type": "order_placed",
  "title": "New order received",
  "body": "Order : 42 was placed from User : 1 — Shipping method : Fast - Payment method : Cash - Total amount of money: 54050000",
  "createdAt": "2026-04-30T14:30:01Z",
  "payload": null
}
```

---

#### `order_cancelled`

Triggered when a customer cancels a Pending order.

```json
{
  "id": "3f2504e0-4f89-11d3-9a0c-0305e82c3303",
  "type": "order_cancelled",
  "title": "Order cancelled",
  "body": "Order : 42 by User : 1 was cancelled. - Order status: Cancelled",
  "createdAt": "2026-04-30T15:10:22Z",
  "payload": null
}
```

---

#### `payment_success`

Triggered when a VNPAY payment callback is processed successfully.

```json
{
  "id": "3f2504e0-4f89-11d3-9a0c-0305e82c3304",
  "type": "payment_success",
  "title": "Payment successfully",
  "body": "User 3 paid successfully Order 43 - payment method : VNPAY - total amount of money : 17080000",
  "createdAt": "2026-04-30T15:05:35Z",
  "payload": null
}
```

---

## Background Jobs (Hangfire)

The Hangfire dashboard is available in Development at `http://localhost:5198/hangfire`. It shows all enqueued, processing, succeeded, and failed background jobs.

### Jobs Enqueued by Admin-Triggered Actions

| Action | Job Enqueued |
|---|---|
| Order status → `Completed` | `IEmailService.SendOrderCompletedAsync(userID, orderID, orderStatus)` |
| Manual `MarkAsPaid` (admin route) | No email job — use with caution |

### Jobs Enqueued by Domain Events (Visible in Hangfire)

| Domain Event | Jobs Enqueued |
|---|---|
| `UserRegisterEvent` | `SendWelcomeEmailAsync(email, userName)` |
| `OrderPlacedEvent` | `SendOrderConfirmationAsync(userID, orderID, totalPrice, shipMethod, payMethod)` + `NotifyOrderPlacedAsync(...)` |
| `OrderCancelledEvent` | `SendOrderCancelledAsync(userID, orderID, orderStatus)` + `NotifyOrderCancelledAsync(...)` |
| `OrderPaidEvent` | `SendPaymentSuccessBillEmailAsync(userID, orderID, totalPrice, payStatus)` + `NotifyPaymentCompletedAsync(...)` |
| `OrderCompletedEvent` | `SendOrderCompletedAsync(userID, orderID, orderStatus)` |

### Retry Policy

Hangfire uses its default retry policy: **10 automatic retries** with exponential back-off. Failed jobs are visible in the Hangfire dashboard and can be re-queued manually.

---

## Complete Order Lifecycle Reference

The following table shows the full order state machine from an admin's perspective:

```
                          ┌─────────────────────────────────────────────────────┐
                          │                  ORDER LIFECYCLE                     │
                          └─────────────────────────────────────────────────────┘

  Created by Customer
         │
         ▼
   ┌─────────────┐    PATCH /{id}/cancel-order    ┌──────────────┐
   │   Pending   │  ─────────────────────────────► │  Cancelled   │
   └─────────────┘     (Customer or Admin)          └──────────────┘
         │
         │  PATCH /{id}/update-statustoshipping (Admin)
         ▼
   ┌─────────────┐
   │  Shipping   │
   └─────────────┘
         │
         │  PATCH /{id}/update-statustocompleted (Admin)
         │  [Requires: paymentStatus ≠ Unpaid]
         ▼
   ┌─────────────┐
   │  Completed  │   ──► Triggers SendOrderCompletedEmail (Hangfire)
   └─────────────┘


  Payment Status (independent axis):

  Cash Orders:      Unpaid ──► Paid  (via PATCH /{id}/markas-paid by Admin)
  VNPAY Orders:     Pending ──► Paid  (via GET /payments/vnpay-callback, automatic)
  OnlineBanking:    Pending ──► Paid  (via PATCH /{id}/markas-paid by Admin)
```

---

## Common Response Models

### PagedResult\<T\>

```json
{
  "items": [...],
  "totalCount": 320,
  "page": 1,
  "pageSize": 10,
  "totalPages": 32,
  "hasNext": true,
  "hasPrevious": false
}
```

### OrderDto (Full)

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
    {
      "productID": 5,
      "unitPrice": 27000000.00,
      "quantity": 2
    }
  ],
  "createdAt": "2026-04-30T14:30:00Z"
}
```

### ProductDto (Full)

```json
{
  "productID": 1,
  "categoryID": 2,
  "productName": "iPhone 15 Pro Max",
  "description": "The most advanced iPhone ever made...",
  "originalPrice": 30000000.00,
  "finalPrice": 27000000.00,
  "stock": 50,
  "ram": 8,
  "rom": 256,
  "color": "Black Titanium",
  "imageURL": [
    "https://cdn.example.com/img1.jpg",
    "https://cdn.example.com/img2.jpg"
  ],
  "productStatus": "InStock",
  "createdAt": "2026-04-30T09:00:00Z"
}
```

### PaymentDto (Full)

```json
{
  "paymentID": 14087654321,
  "orderID": 43,
  "paymentType": "VNPAY",
  "transactionID": 987654321098,
  "bankingInfo": "VCB",
  "totalAmount": 17080000.00,
  "isPaidSuccess": true,
  "paidAt": "2026-04-30T15:05:33Z"
}
```

### CouponDto (Full)

```json
{
  "couponID": 1,
  "couponCode": "SAVE10K",
  "discountAmount": 10000.00,
  "couponQuantity": 100,
  "minimumPriceRequired": 200000.00,
  "expiryDate": "2026-12-31T23:59:59Z"
}
```

### CategoryDto

```json
{
  "categoryID": 1,
  "categoryName": "Smartphones"
}
```

### CartDto

```json
{
  "cartID": 1,
  "userID": 3,
  "productID": 5,
  "cartQuantity": 2,
  "cartUnitPrice": 27000000.00,
  "cartTotalPrice": 54000000.00
}
```

### UserDto

```json
{
  "userName": "johndoe",
  "email": "john@example.com",
  "phoneNumber": "0912345678",
  "address": "123 Nguyen Hue, District 1, Ho Chi Minh City",
  "oAuthProviderName": null,
  "createdAt": "2026-01-10T08:00:00Z"
}
```
