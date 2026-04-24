================ API_References ===============

API base URL: https://localhost:7240/

** Carts

GET /api/Carts/me  //Authorize

POST /api/Carts  //Authorize

***Request body***

{
  "productID": 0,
  "quantity": 0
}

PATCH /api/Carts/{id}/reduce  //Authorize

***Request body***

{
  "productID": 0,
  "quantity": 0
}

DELETE /api/Carts/{id}  //Authorize

** Categories

GET /api/Categories

GET /api/Categories/{id}

** Coupons

GET /api/Coupons

GET /api/Coupons/{id}

** Orders

GET /api/Orders/history  //Authorize

PATCH /api/Orders/{id}/cancel  //Authorize

** Payments

POST /api/Payments/create-url  //Authorize

** Products

GET /api/Products

GET /api/Products/{id}

** Reviews

GET /api/Reviews/product/{productId}

POST /api/Reviews  //Authorize

***Request body***

{
  "productID": 0,
  "rating": 0,
  "body": "string"
}

PUT /api/Reviews/{id}  //Authorize

***Request body***

{
  "reviewID": 0,
  "rating": 0,
  "body": "string"
}

** Users

POST /api/Users/check-email

***Request body***

{
  "email": "string"
}

POST /api/Users/verify-email

POST /api/Users/register

***Request body***

{
  "userName": "string",
  "phoneNumber": "string",
  "password": "string",
  "address": "string"
}

POST /api/Users/login

***Request body***

{
  "email": "string",
  "password": "string"
}

POST /api/Users/refresh-token

***Request body***

{
  "userID": 0,
  "refreshToken": "string"
}

POST /api/Users/forget-passwod  //Authorize

***Request body***

{
  "newPasswordHash": "string"
}

GET /api/Users/profile  //Authorize

PUT /api/Users/profile  //Authorize

***Request body***

{
  "userName": "string",
  "email": "string",
  "phoneNumber": "string",
  "address": "string"
}

DELETE /api/Users/profile  //Authorize

PUT /api/Uses/change-password  //Authorize

***Request body***

{
  "oldPassword": "string",
  "password": "string"
}