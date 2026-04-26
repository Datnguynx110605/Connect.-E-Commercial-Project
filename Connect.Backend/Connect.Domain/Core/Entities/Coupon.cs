using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Core.Entities
{
    public class Coupon
    {
        public int CouponID { get; private set; }
        public Code CouponCode { get; private set; }
        public Currency DiscountAmount { get; private set; }
        public Amount CouponQuantity { get; private set; }
        public Currency MinimumPriceRequired { get; private set; }
        public DateTime ExpiryDate { get; private set; }
        public DateTime CreatedAt { get; private set; }
        private Coupon() { }
        private Coupon(Code code, Currency amount, Amount quantity, Currency minimumRequired, DateTime date)
        {
            CouponCode = code;
            DiscountAmount = amount;
            CouponQuantity = quantity;
            MinimumPriceRequired = minimumRequired;
            ExpiryDate = date;
            CreatedAt = DateTime.UtcNow;
        }

        public static Coupon CreateCoupon(Code code, Currency amount, Amount quantity, Currency minimumRequired, DateTime date)
        {
            return new Coupon(code, amount, quantity, minimumRequired, date);
        }

        public void UpdateCouponQuantity(Amount quantity)
        {
            CouponQuantity += quantity;
        }

        public void RemoveCouponStock(Amount quantity)
        {
            CouponQuantity -= quantity;
        }

        public void UpdateCouponExpiryDate(DateTime expiryDate)
        {
            if(expiryDate < DateTime.UtcNow)
                throw new DomainExceptions(
                   message: "ExpiryDate is invalid",
                   code: "INVALID-EXPIRYDATE",
                   metadata: new Dictionary<string, object>
                   {
                        { "INVALID", ExpiryDate }
                   });
            ExpiryDate = expiryDate;
        }

        private void VerifyCoupon(Currency totalItemPrice)
        {
            if(ExpiryDate < DateTime.UtcNow)
                throw new DomainExceptions(
                   message: "Coupon is expired",
                   code: "EXPIRED-COUPON",
                   metadata: new Dictionary<string, object>
                   {
                        { "EXPIRED", ExpiryDate }
                   });

            if(CouponQuantity.Value == 0)
                throw new DomainExceptions(
                   message: "Coupon is out of quantity",
                   code: "OUTOFQUANTITY-COUPON",
                   metadata: new Dictionary<string, object>
                   {
                        { "QUANTITY", CouponQuantity }
                   });

            if (totalItemPrice.Value < MinimumPriceRequired.Value)
                throw new DomainExceptions(
                   message: "Coupon condition is not match",
                   code: "UNUSABLE-COUPON",
                   metadata: new Dictionary<string, object>
                   {
                        { "MINIMUNPRICE", MinimumPriceRequired }
                   });

            if(DiscountAmount.Value > totalItemPrice.Value)
                throw new DomainExceptions(
                   message: "Discount amount is higher than total amount",
                   code: "UNUSABLE-COUPON");
        }

        public void UseCoupon(Currency totalItemPrice)
        {
            VerifyCoupon(totalItemPrice);
            Amount quantity = Amount.Create(1);
            RemoveCouponStock(quantity);
        }
    }
}
