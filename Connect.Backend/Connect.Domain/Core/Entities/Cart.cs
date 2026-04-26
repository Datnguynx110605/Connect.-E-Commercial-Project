using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Core.Entities
{
    public class Cart
    {
        public int CartID { get; private set; }
        public int UserID { get; private set; }
        public int ProductID { get; private set; }
        public Amount CartQuantity { get; private set; }
        public Currency CartUnitPrice { get; private set; }
        public Currency CartTotalPrice { get; private set; }
        public DateTime CreatedAt { get; private set; }
        private Cart() { }
        private Cart(int userID, int productID, Amount quantity, Currency unitPrice)
        {
            UserID = userID;
            ProductID = productID;
            CartQuantity = quantity;
            CartUnitPrice = unitPrice;
            CreatedAt = DateTime.UtcNow;
        }

        public static Cart CreateCart(int userID, int productID, Amount quantity, Currency unitPrice)
        {
            if(userID <= 0)
                throw new DomainExceptions(
                   message: "UserID is invalid",
                   code: "INVALID-USERID",
                   metadata: new Dictionary<string, object>
                   {
                        { "USERID", userID }
                   });

            if(productID <= 0)
                throw new DomainExceptions(
                   message: "ProductID is invalid",
                   code: "INVALID-PRODUCTID",
                   metadata: new Dictionary<string, object>
                   {
                        { "PRODUCTID", productID }
                   });

            var cart = new Cart(userID, productID, quantity, unitPrice);
            cart.AddToCart(quantity, unitPrice);

            return cart;
        }

        private void AddToCart(Amount quantity, Currency unitPrice)
        {
            if (quantity.Value > 10)
                throw new DomainExceptions(
                    message: "Cart quantity is limited",
                    code: "LIMITED-QUANTITY",
                    metadata: new Dictionary<string, object>
                    { 
                        { "Quantity", CartQuantity }
                    });

            CartQuantity = quantity;
            CartTotalPrice = unitPrice * quantity;
        }

        public void IncreaseCartAmount()
        {
            if (CartQuantity.Value > 10)
                throw new DomainExceptions(
                   message: "Cart quantity is limited",
                   code: "LIMITED-QUANTITY",
                   metadata: new Dictionary<string, object>
                   {
                       { "Quantity", CartQuantity}
                   });

            Amount quantity = Amount.Create(1);

            CartQuantity += quantity;
            CartTotalPrice = CartUnitPrice * quantity;
        }

        public void ReduceCartAmount()
        {
            if (CartQuantity.Value == 0 )
                throw new DomainExceptions(
                   message: "Cart quantity is empty ",
                   code: "EMPTY-QUANTITY",
                   metadata: new Dictionary<string, object>
                   {
                       { "Quantity", CartQuantity}
                   });

            Amount quantity = Amount.Create(1);

            CartQuantity -= quantity;
            CartTotalPrice = CartUnitPrice * quantity;
        }
    }
}
