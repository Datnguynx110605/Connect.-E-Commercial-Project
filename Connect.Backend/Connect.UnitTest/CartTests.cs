using Connect.Domain.Common;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Connect.Domain.Tests.Entities;

public class CartTests
{
    // ── CreateCart ────────────────────────────────────────────────────────────

    [Fact]
    public void CreateCart_WithValidData_ShouldSucceed()
    {
        var cart = Cart.CreateCart(1, 10, Amount.Create(2), Currency.Create(25_000m));
        cart.Should().NotBeNull();
        cart.UserID.Should().Be(1);
        cart.ProductID.Should().Be(10);
        cart.CartQuantity.Value.Should().Be(2);
        cart.CartTotalPrice.Value.Should().Be(50_000m);
    }

    [Fact]
    public void CreateCart_WithInvalidUserID_ShouldThrowDomainException()
    {
        var act = () => Cart.CreateCart(0, 1, Amount.Create(1), Currency.Create(10_000m));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("UserID is invalid")
           .And.Code.Should().Be("INVALID-USERID");
    }

    [Fact]
    public void CreateCart_WithNegativeUserID_ShouldThrowDomainException()
    {
        var act = () => Cart.CreateCart(-5, 1, Amount.Create(1), Currency.Create(10_000m));
        act.Should().Throw<DomainExceptions>().WithMessage("UserID is invalid");
    }

    [Fact]
    public void CreateCart_WithInvalidProductID_ShouldThrowDomainException()
    {
        var act = () => Cart.CreateCart(1, 0, Amount.Create(1), Currency.Create(10_000m));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("ProductID is invalid")
           .And.Code.Should().Be("INVALID-PRODUCTID");
    }

    [Fact]
    public void CreateCart_WithQuantityExceeding10_ShouldThrowDomainException()
    {
        var act = () => Cart.CreateCart(1, 1, Amount.Create(11), Currency.Create(10_000m));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Cart quantity is limited")
           .And.Code.Should().Be("LIMITED-QUANTITY");
    }

    [Fact]
    public void CreateCart_WithExactly10Quantity_ShouldSucceed()
    {
        var act = () => Cart.CreateCart(1, 1, Amount.Create(10), Currency.Create(10_000m));
        act.Should().NotThrow();
    }

    // ── ReduceCartAmount ──────────────────────────────────────────────────────

    [Fact]
    public void ReduceCartAmount_WhenQuantityIsPositive_ShouldDecrementByOne()
    {
        var cart = Cart.CreateCart(1, 1, Amount.Create(3), Currency.Create(10_000m));
        cart.ReduceCartAmount();
        cart.CartQuantity.Value.Should().Be(2);
    }

    [Fact]
    public void ReduceCartAmount_WhenQuantityIsZero_ShouldThrowDomainException()
    {
        var cart = Cart.CreateCart(1, 1, Amount.Create(1), Currency.Create(10_000m));
        cart.ReduceCartAmount(); // now 0
        var act = () => cart.ReduceCartAmount(); // should throw
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Cart quantity is empty ")
           .And.Code.Should().Be("EMPTY-QUANTITY");
    }

    // ── IncreaseCartAmount ────────────────────────────────────────────────────

    [Fact]
    public void IncreaseCartAmount_WhenBelowLimit_ShouldIncrementByOne()
    {
        var cart = Cart.CreateCart(1, 1, Amount.Create(5), Currency.Create(10_000m));
        cart.IncreaseCartAmount();
        cart.CartQuantity.Value.Should().Be(6);
    }

    [Fact]
    public void IncreaseCartAmount_WhenAtLimit_ShouldThrowDomainException()
    {
        var cart = Cart.CreateCart(1, 1, Amount.Create(10), Currency.Create(10_000m));
        var act  = () => cart.IncreaseCartAmount();
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Cart quantity is limited")
           .And.Code.Should().Be("LIMITED-QUANTITY");
    }
}
