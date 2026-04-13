using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Core.Entities
{
    public class OrderItem
    {
        public int ProductID { get; private set; }
        public Currency UnitPrice { get; private set; }
        public Amount Quantity { get; private set; }
        public Currency OrderItemTotalPrice => UnitPrice * Quantity;
        private OrderItem() { }
        private OrderItem(int productID, Currency unitPrice, Amount quantity)
        {
            ProductID = productID;
            UnitPrice = unitPrice;
            Quantity = quantity;
        }

        public static OrderItem CreateOrderItem(int productID, Currency unitPrice, Amount quantity)
        {
            if (productID <= 0)
                throw new DomainExceptions(
                    message: "Product id is invalid",
                    code: "INVALID-PRODUCTID",
                    metadata: new Dictionary<string, object>
                    {
                        { "PRODUCTID", productID }
                    });

            return new OrderItem(productID, unitPrice, quantity);
        }
    }
}
