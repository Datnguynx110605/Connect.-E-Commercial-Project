**Carts**

GET /api/Carts/getall-cart  //Authorize (Roles = "Admin")

**Categories**

GET /api/Categories/getall-category 

GET /api/Categories/{id}/get-categorybyid

POST /api/Categories/create-category  //Authorize (Roles = "Admin")

***Request body***

{
  "categoryName": "string"
}

PUT /api/Categories/{id}/update-category  //Authorize (Roles = "Admin")

***Request body***

{
  "categoryID": 0,
  "categoryName": "string"
}

DELETE /api/Categories/{id}/delete-category  //Authorize (Roles = "Admin")

**Coupons**

GET /api/Coupons/getall-coupons  //Authorize (Roles = "Admin")

GET /api/Coupons/{id}/get-couponbyid  

POST /api/Coupons/create-coupon  // Authorize (Roles = "Admin")

***Request body***

{
  "couponCode": "string",
  "discountAmount": 0,
  "couponQuantity": 0,
  "mimimumPriceRequired": 0,
  "expiryDate": "2026-04-26T21:41:11.274Z"
}

PATCH /api/Coupons/{id}/update-expiry-date  // Authorize (Roles = "Admin")

***Request body***

{
  "couponID": 0,
  "expiryDate": "2026-04-26T21:41:38.311Z"
}

PATCH /api/Coupons/{id}/update-quantity    // Authorize (Roles = "Admin")

***Request body***

{
  "couponID": 0,
  "couponQuantity": 0
}

**Order**

GET /api/Orders/getall-order   // Authorize (Roles = "Admin")

PATCH /api/Orders/{id}/cancel-order   // Authorize (Roles = "Admin")  

PATCH /api/Orders/{id}/update-statustoshipping   // Authorize (Roles = "Admin")

***Request body***

{
  "orderID": 0,
  "orderStatus": "string"
}  

PATCH /api/Orders/{id}/update-statustocomplete   // Authorize (Roles = "Admin")

***Request body***

{
  "orderID": 0,
  "orderStatus": "string"
}     

PATCH /api/Orders/{id}/markas-paid   // Authorize (Roles = "Admin")

***Request body***

{
  "orderID": 0,
  "orderPaymentStatus": "string"
}

**Payments**

GET /api/Payments/getall-payment   // Authorize (Roles = "Admin")

**Products**

GET /api/Products/getall-product   // Authorize (Roles = "Admin")

GET /api/Products/{id}/get-productbydetail  

GET /api/Products/{id}/get-productbycategory //CategoryID not ProductID

POST /api/Products/create-product   // Authorize (Roles = "Admin")  //FormData

***Request body***

CategoryID
integer($int32)

ProductName
string

Description
string

OriginalPrice
number($double)

FinalPrice
number($double)

Stock
integer($int32)

Ram
integer($int32)

Rom
integer($int32)

Color
string

ImageURL
array<string>

PATCH /api/Products/{id}/update-stock   // Authorize (Roles = "Admin")  

***Request body***

{
  "productID": 0,
  "stock": 0
}

PATCH /api/Products/{id}/update-image   // Authorize (Roles = "Admin")  //FormData

***Request body***

ProductID
integer($int32)

ImageURL
array<string>

DELETE /api/Products/{id}/delete-product   // Authorize (Roles = "Admin")  

**Reviews**

GET /api/Reviews/getall-review   // Authorize (Roles = "Admin")  

GET /api/Reviews/{productId}/get-reviewbyproduct   

**Users**

GET /api/Users/getall-user






