using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Connect.Domain.Tests.ValueObjects;

public class CurrencyTests
{
    // ── Create ────────────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithZero_ShouldSucceed()
    {
        Currency.Create(0).Value.Should().Be(0);
    }

    [Fact]
    public void Create_WithPositiveDecimal_ShouldSucceed()
    {
        Currency.Create(99999.99m).Value.Should().Be(99999.99m);
    }

    [Fact]
    public void Create_WithNegativeValue_ShouldThrowDomainException()
    {
        var act = () => Currency.Create(-0.01m);
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Currency is invalid")
           .And.Code.Should().Be("INVALID-CURRENCY");
    }

    // ── Addition ──────────────────────────────────────────────────────────────

    [Fact]
    public void Addition_TwoCurrencies_ShouldReturnSum()
    {
        var a = Currency.Create(100_000m);
        var b = Currency.Create(50_000m);
        (a + b).Value.Should().Be(150_000m);
    }

    // ── Subtraction ───────────────────────────────────────────────────────────

    [Fact]
    public void Subtraction_LargerMinusSmaller_ShouldSucceed()
    {
        var a = Currency.Create(200_000m);
        var b = Currency.Create(30_000m);
        (a - b).Value.Should().Be(170_000m);
    }

    [Fact]
    public void Subtraction_ResultIsNegative_ShouldThrowDomainException()
    {
        var a = Currency.Create(10m);
        var b = Currency.Create(20m);
        var act = () => { var _ = a - b; };
        act.Should().Throw<DomainExceptions>().WithMessage("Currency is invalid");
    }

    // ── Multiply by Amount ─────────────────────────────────────────────────────

    [Fact]
    public void Multiply_ByAmount_ShouldReturnProduct()
    {
        var price = Currency.Create(25_000m);
        var qty   = Amount.Create(4);
        (price * qty).Value.Should().Be(100_000m);
    }

    [Fact]
    public void Multiply_ByZeroAmount_ShouldReturnZero()
    {
        var price = Currency.Create(25_000m);
        var qty   = Amount.Create(0);
        (price * qty).Value.Should().Be(0m);
    }

    // ── Multiply by decimal ────────────────────────────────────────────────────

    [Fact]
    public void Multiply_ByDecimal_ShouldRoundToZeroDecimalPlaces()
    {
        var price = Currency.Create(33_333m);
        // 33333 * 0.1 = 3333.3 → rounded to 3333
        (price * 0.1m).Value.Should().Be(3_333m);
    }

    // ── Comparison operators ──────────────────────────────────────────────────

    [Fact]
    public void LessThanOrEqual_ShouldReturnTrue_WhenSmaller()
    {
        Currency.Create(5m).Should().Match<Currency>(c => c <= Currency.Create(10m));
    }

    [Fact]
    public void LessThanOrEqual_ShouldReturnTrue_WhenEqual()
    {
        Currency.Create(10m).Should().Match<Currency>(c => c <= Currency.Create(10m));
    }

    [Fact]
    public void GreaterThanOrEqual_ShouldReturnTrue_WhenLarger()
    {
        Currency.Create(10m).Should().Match<Currency>(c => c >= Currency.Create(5m));
    }

    // ── Equality ──────────────────────────────────────────────────────────────

    [Fact]
    public void TwoCurrenciesWithSameValue_ShouldBeEqual()
    {
        Currency.Create(500m).Should().Be(Currency.Create(500m));
    }

    // ── ToString ──────────────────────────────────────────────────────────────

    [Fact]
    public void ToString_ShouldContainVND()
    {
        Currency.Create(100_000m).ToString().Should().Contain("VND");
    }
}
