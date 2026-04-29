using Connect.Domain.Common;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Connect.Domain.Tests.Entities;

// ─── OrderItem ────────────────────────────────────────────────────────────────

public class OrderItemTests
{
    [Fact]
    public void CreateOrderItem_WithValidData_ShouldSucceed()
    {
        var item = OrderItem.CreateOrderItem(1, Currency.Create(500_000m), Amount.Create(3));
        item.ProductID.Should().Be(1);
        item.UnitPrice.Value.Should().Be(500_000m);
        item.Quantity.Value.Should().Be(3);
    }

    [Fact]
    public void CreateOrderItem_TotalPrice_ShouldBeUnitPriceTimesQuantity()
    {
        var item = OrderItem.CreateOrderItem(1, Currency.Create(200_000m), Amount.Create(4));
        item.OrderItemTotalPrice.Value.Should().Be(800_000m);
    }

    [Fact]
    public void CreateOrderItem_WithZeroProductID_ShouldThrowDomainException()
    {
        var act = () => OrderItem.CreateOrderItem(0, Currency.Create(100_000m), Amount.Create(1));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Product id is invalid")
           .And.Code.Should().Be("INVALID-PRODUCTID");
    }

    [Fact]
    public void CreateOrderItem_WithNegativeProductID_ShouldThrowDomainException()
    {
        var act = () => OrderItem.CreateOrderItem(-1, Currency.Create(100_000m), Amount.Create(1));
        act.Should().Throw<DomainExceptions>().WithMessage("Product id is invalid");
    }
}

// ─── Review ───────────────────────────────────────────────────────────────────

public class ReviewTests
{
    [Fact]
    public void CreateReview_WithValidData_ShouldSucceed()
    {
        var review = Review.CreateReview(1, 10, Amount.Create(5), "This product is amazing!");
        review.Should().NotBeNull();
        review.Rating.Value.Should().Be(5);
        review.Body.Should().Be("This product is amazing!");
    }

    [Fact]
    public void CreateReview_WithInvalidUserID_ShouldThrowDomainException()
    {
        var act = () => Review.CreateReview(0, 1, Amount.Create(5), "Great product!");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("UserID is invalid")
           .And.Code.Should().Be("INVALID-USERID");
    }

    [Fact]
    public void CreateReview_WithInvalidProductID_ShouldThrowDomainException()
    {
        var act = () => Review.CreateReview(1, 0, Amount.Create(5), "Great product!");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("ProductID is invalid")
           .And.Code.Should().Be("INVALID-ProductID");
    }

    [Fact]
    public void CreateReview_WithEmptyBody_ShouldThrowDomainException()
    {
        var act = () => Review.CreateReview(1, 1, Amount.Create(5), "");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Review body is required")
           .And.Code.Should().Be("REQUIRED-REVIEWBODY");
    }

    [Fact]
    public void CreateReview_WithWhitespaceBody_ShouldThrowDomainException()
    {
        var act = () => Review.CreateReview(1, 1, Amount.Create(4), "   ");
        act.Should().Throw<DomainExceptions>().WithMessage("Review body is required");
    }

    [Fact]
    public void CreateReview_WithBodyExceeding2000Chars_ShouldThrowDomainException()
    {
        var act = () => Review.CreateReview(1, 1, Amount.Create(3), new string('A', 2001));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Review body is invalid")
           .And.Code.Should().Be("INVALID-REVIEWBODY");
    }

    [Fact]
    public void CreateReview_WithExactly2000Chars_ShouldSucceed()
    {
        var act = () => Review.CreateReview(1, 1, Amount.Create(3), new string('A', 2000));
        act.Should().NotThrow();
    }

    // ── UpdateReview ──────────────────────────────────────────────────────────

    [Fact]
    public void UpdateReview_WithValidBody_ShouldUpdateFields()
    {
        var review = Review.CreateReview(1, 1, Amount.Create(4), "Initial review text here");
        review.UpdateReview(Amount.Create(5), "Updated review text");
        review.Rating.Value.Should().Be(5);
        review.Body.Should().Be("Updated review text");
    }

    [Fact]
    public void UpdateReview_WithBodyTooShort_ShouldThrowDomainException()
    {
        var review = Review.CreateReview(1, 1, Amount.Create(4), "Initial review text here");
        var act    = () => review.UpdateReview(Amount.Create(3), "Bad");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Review body is invalid")
           .And.Code.Should().Be("INVALID-REVIEWBODY");
    }

    [Fact]
    public void UpdateReview_WithBodyExceeding300Chars_ShouldThrowDomainException()
    {
        var review = Review.CreateReview(1, 1, Amount.Create(4), "Initial review text here");
        var act    = () => review.UpdateReview(Amount.Create(3), new string('A', 301));
        act.Should().Throw<DomainExceptions>().WithMessage("Review body is invalid");
    }

    [Fact]
    public void UpdateReview_WithExactly5Chars_ShouldSucceed()
    {
        var review = Review.CreateReview(1, 1, Amount.Create(4), "Initial review text here");
        var act    = () => review.UpdateReview(Amount.Create(5), "Hello");
        act.Should().NotThrow();
    }

    [Fact]
    public void UpdateReview_WithExactly300Chars_ShouldSucceed()
    {
        var review = Review.CreateReview(1, 1, Amount.Create(4), "Initial review text here");
        var act    = () => review.UpdateReview(Amount.Create(5), new string('A', 300));
        act.Should().NotThrow();
    }
}

// ─── RefreshToken ─────────────────────────────────────────────────────────────

public class RefreshTokenTests
{
    [Fact]
    public void CreateRefreshToken_WithValidUserID_ShouldSucceed()
    {
        var token = RefreshToken.CreateRefreshToken(1);
        token.Should().NotBeNull();
        token.UserID.Should().Be(1);
        token.IsRevoked.Should().BeFalse();
        token.RefreshTokens.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void CreateRefreshToken_ExpiryDateShouldBe7DaysFromNow()
    {
        var token = RefreshToken.CreateRefreshToken(1);
        token.ExpiryDate.Should().BeCloseTo(DateTime.UtcNow.AddDays(7), precision: TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void CreateRefreshToken_TokenShouldBeBase64Encoded()
    {
        var token = RefreshToken.CreateRefreshToken(1);
        var act   = () => Convert.FromBase64String(token.RefreshTokens);
        act.Should().NotThrow();
    }

    [Fact]
    public void CreateRefreshToken_TwoTokens_ShouldBeDifferent()
    {
        var t1 = RefreshToken.CreateRefreshToken(1);
        var t2 = RefreshToken.CreateRefreshToken(1);
        t1.RefreshTokens.Should().NotBe(t2.RefreshTokens);
    }

    [Fact]
    public void CreateRefreshToken_WithZeroUserID_ShouldThrowDomainException()
    {
        var act = () => RefreshToken.CreateRefreshToken(0);
        act.Should().Throw<DomainExceptions>()
           .WithMessage("UserID is invalid")
           .And.Code.Should().Be("INVALID-USERID");
    }

    [Fact]
    public void CreateRefreshToken_WithNegativeUserID_ShouldThrowDomainException()
    {
        var act = () => RefreshToken.CreateRefreshToken(-5);
        act.Should().Throw<DomainExceptions>().WithMessage("UserID is invalid");
    }

    // ── VerifyRefreshToken ────────────────────────────────────────────────────

    [Fact]
    public void VerifyRefreshToken_WhenValid_ShouldNotThrow()
    {
        var token = RefreshToken.CreateRefreshToken(1);
        var act   = () => token.VerifyRefreshToken();
        act.Should().NotThrow();
    }

    [Fact]
    public void VerifyRefreshToken_WhenRevoked_ShouldThrowDomainException()
    {
        var token = RefreshToken.CreateRefreshToken(1);
        token.RevokeRefreshToken();
        var act = () => token.VerifyRefreshToken();
        act.Should().Throw<DomainExceptions>()
           .WithMessage("RefreshToken is no longer active")
           .And.Code.Should().Be("INVALID-RFRESHTOKEN");
    }

    // ── RevokeRefreshToken ────────────────────────────────────────────────────

    [Fact]
    public void RevokeRefreshToken_ShouldSetIsRevokedTrue()
    {
        var token = RefreshToken.CreateRefreshToken(1);
        token.RevokeRefreshToken();
        token.IsRevoked.Should().BeTrue();
    }

    [Fact]
    public void RevokeRefreshToken_CalledTwice_ShouldBeIdempotent()
    {
        var token = RefreshToken.CreateRefreshToken(1);
        token.RevokeRefreshToken();
        var act = () => token.RevokeRefreshToken();
        act.Should().NotThrow();
        token.IsRevoked.Should().BeTrue();
    }
}

// ─── Category ─────────────────────────────────────────────────────────────────

public class CategoryTests
{
    [Fact]
    public void CreateCategory_WithValidName_ShouldSucceed()
    {
        var category = Category.CreateCategory(CategoryName.Create("Smartphones"));
        category.Should().NotBeNull();
        category.CategoryName.Value.Should().Be("Smartphones");
    }

    [Fact]
    public void UpdateCategoryName_ShouldChangeName()
    {
        var category = Category.CreateCategory(CategoryName.Create("Phones"));
        category.UpdateCategoryName(CategoryName.Create("Tablets"));
        category.CategoryName.Value.Should().Be("Tablets");
    }
}

// ─── Payment ──────────────────────────────────────────────────────────────────

public class PaymentTests
{
    [Fact]
    public void CreatePayment_WithValidData_ShouldSucceed()
    {
        var payment = Payment.CreatePayment(
            paymentID:   123456789L,
            orderID:     1,
            paymentType: "VNPAY",
            transactionID: 987654321L,
            bankingInfo: "VIETCOMBANK",
            totalAmount: Currency.Create(500_000m),
            isSuccess:   true,
            paidAt:      DateTime.UtcNow);

        payment.Should().NotBeNull();
        payment.PaymentID.Should().Be(123456789L);
        payment.IsPaidSuccess.Should().BeTrue();
    }

    [Fact]
    public void CreatePayment_WithZeroOrderID_ShouldThrowDomainException()
    {
        var act = () => Payment.CreatePayment(
            paymentID:     1L,
            orderID:       0,
            paymentType:   "VNPAY",
            transactionID: 1L,
            bankingInfo:   "BANK",
            totalAmount:   Currency.Create(100m),
            isSuccess:     true,
            paidAt:        DateTime.UtcNow);
        act.Should().Throw<DomainExceptions>()
           .WithMessage("OrderID is invalid")
           .And.Code.Should().Be("INVALID-ORDERID");
    }

    [Fact]
    public void CreatePayment_WithNegativeOrderID_ShouldThrowDomainException()
    {
        var act = () => Payment.CreatePayment(
            paymentID:     1L,
            orderID:       -1,
            paymentType:   "VNPAY",
            transactionID: 1L,
            bankingInfo:   "BANK",
            totalAmount:   Currency.Create(100m),
            isSuccess:     true,
            paidAt:        DateTime.UtcNow);
        act.Should().Throw<DomainExceptions>().WithMessage("OrderID is invalid");
    }
}
