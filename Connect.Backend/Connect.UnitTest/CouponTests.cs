using Connect.Domain.Common;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Connect.Domain.Tests.Entities;

public class CouponTests
{
    // ── Shared factory ────────────────────────────────────────────────────────

    private static Coupon BuildCoupon(
        string   code           = "SAVE10",
        decimal  discount       = 10_000m,
        int      quantity       = 5,
        decimal  minimumPrice   = 50_000m,
        DateTime? expiryDate   = null) =>
        Coupon.CreateCoupon(
            Code.Create(code),
            Currency.Create(discount),
            Amount.Create(quantity),
            Currency.Create(minimumPrice),
            expiryDate ?? DateTime.UtcNow.AddDays(30));

    // ── CreateCoupon ──────────────────────────────────────────────────────────

    [Fact]
    public void CreateCoupon_WithValidData_ShouldSucceed()
    {
        var coupon = BuildCoupon();
        coupon.Should().NotBeNull();
        coupon.CouponCode.Value.Should().Be("SAVE10");
        coupon.DiscountAmount.Value.Should().Be(10_000m);
        coupon.CouponQuantity.Value.Should().Be(5);
    }

    // ── UpdateCouponQuantity ──────────────────────────────────────────────────

    [Fact]
    public void UpdateCouponQuantity_ShouldIncreaseQuantity()
    {
        var coupon = BuildCoupon(quantity: 5);
        coupon.UpdateCouponQuantity(Amount.Create(10));
        coupon.CouponQuantity.Value.Should().Be(15);
    }

    // ── UpdateCouponExpiryDate ────────────────────────────────────────────────

    [Fact]
    public void UpdateCouponExpiryDate_WithFutureDate_ShouldSucceed()
    {
        var coupon  = BuildCoupon();
        var newDate = DateTime.UtcNow.AddDays(60);
        coupon.UpdateCouponExpiryDate(newDate);
        coupon.ExpiryDate.Should().Be(newDate);
    }

    [Fact]
    public void UpdateCouponExpiryDate_WithPastDate_ShouldThrowDomainException()
    {
        var coupon = BuildCoupon();
        var act    = () => coupon.UpdateCouponExpiryDate(DateTime.UtcNow.AddDays(-1));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("ExpiryDate is invalid")
           .And.Code.Should().Be("INVALID-EXPIRYDATE");
    }

    [Fact]
    public void UpdateCouponExpiryDate_WithExactlyNow_ShouldThrowDomainException()
    {
        var coupon = BuildCoupon();
        // DateTime.UtcNow.AddDays(-1) < UtcNow: use a clearly past date
        var act    = () => coupon.UpdateCouponExpiryDate(DateTime.UtcNow.AddSeconds(-1));
        act.Should().Throw<DomainExceptions>();
    }

    // ── UseCoupon (via VerifyCoupon) ──────────────────────────────────────────

    [Fact]
    public void UseCoupon_WithValidConditions_ShouldDecrementQuantityByOne()
    {
        var coupon = BuildCoupon(quantity: 3, discount: 10_000m, minimumPrice: 50_000m);
        coupon.UseCoupon(Currency.Create(100_000m));
        coupon.CouponQuantity.Value.Should().Be(2);
    }

    [Fact]
    public void UseCoupon_WhenExpired_ShouldThrowDomainException()
    {
        var coupon = BuildCoupon(expiryDate: DateTime.UtcNow.AddDays(-1));
        var act    = () => coupon.UseCoupon(Currency.Create(100_000m));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Coupon is expired")
           .And.Code.Should().Be("EXPIRED-COUPON");
    }

    [Fact]
    public void UseCoupon_WhenQuantityIsZero_ShouldThrowDomainException()
    {
        var coupon = BuildCoupon(quantity: 0);
        var act    = () => coupon.UseCoupon(Currency.Create(100_000m));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Coupon is out of quantity")
           .And.Code.Should().Be("OUTOFQUANTITY-COUPON");
    }

    [Fact]
    public void UseCoupon_WhenTotalBelowMinimumRequired_ShouldThrowDomainException()
    {
        var coupon = BuildCoupon(minimumPrice: 200_000m);
        // Total is 100_000 < 200_000 minimum
        var act    = () => coupon.UseCoupon(Currency.Create(100_000m));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Coupon condition is not match")
           .And.Code.Should().Be("UNUSABLE-COUPON");
    }

    [Fact]
    public void UseCoupon_WhenDiscountExceedsTotal_ShouldThrowDomainException()
    {
        // discount = 50_000, total = 30_000 → discount > total
        var coupon = BuildCoupon(discount: 50_000m, minimumPrice: 10_000m);
        var act    = () => coupon.UseCoupon(Currency.Create(30_000m));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Discount amount is higher than total amount")
           .And.Code.Should().Be("UNUSABLE-COUPON");
    }

    [Fact]
    public void UseCoupon_UsedMultipleTimes_ShouldDecrementEachTime()
    {
        var coupon = BuildCoupon(quantity: 3, discount: 10_000m, minimumPrice: 50_000m);
        coupon.UseCoupon(Currency.Create(100_000m));
        coupon.UseCoupon(Currency.Create(100_000m));
        coupon.CouponQuantity.Value.Should().Be(1);
    }

    [Fact]
    public void UseCoupon_AfterLastUse_ShouldThrowOnNextUse()
    {
        var coupon = BuildCoupon(quantity: 1, discount: 10_000m, minimumPrice: 50_000m);
        coupon.UseCoupon(Currency.Create(100_000m)); // uses last stock
        var act = () => coupon.UseCoupon(Currency.Create(100_000m));
        act.Should().Throw<DomainExceptions>().WithMessage("Coupon is out of quantity");
    }
}
