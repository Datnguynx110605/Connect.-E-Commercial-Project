using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Connect.Domain.Tests.ValueObjects;

public class AmountTests
{
    // ── Create ────────────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithZero_ShouldSucceed()
    {
        var amount = Amount.Create(0);
        amount.Value.Should().Be(0);
    }

    [Fact]
    public void Create_WithPositiveValue_ShouldSucceed()
    {
        var amount = Amount.Create(42);
        amount.Value.Should().Be(42);
    }

    [Fact]
    public void Create_WithNegativeValue_ShouldThrowDomainException()
    {
        var act = () => Amount.Create(-1);
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Amount is invalid")
           .And.Code.Should().Be("INVALID-AMOUNT");
    }

    // ── Addition ──────────────────────────────────────────────────────────────

    [Fact]
    public void Addition_TwoAmounts_ShouldReturnSum()
    {
        var a = Amount.Create(5);
        var b = Amount.Create(3);
        var result = a + b;
        result.Value.Should().Be(8);
    }

    [Fact]
    public void Addition_WithZero_ShouldReturnSameValue()
    {
        var a = Amount.Create(7);
        var zero = Amount.Create(0);
        (a + zero).Value.Should().Be(7);
    }

    // ── Subtraction ───────────────────────────────────────────────────────────

    [Fact]
    public void Subtraction_ResultIsPositive_ShouldSucceed()
    {
        var a = Amount.Create(10);
        var b = Amount.Create(3);
        var result = a - b;
        result.Value.Should().Be(7);
    }

    [Fact]
    public void Subtraction_ResultIsZero_ShouldSucceed()
    {
        var a = Amount.Create(5);
        var b = Amount.Create(5);
        (a - b).Value.Should().Be(0);
    }

    [Fact]
    public void Subtraction_ResultIsNegative_ShouldThrowDomainException()
    {
        var a = Amount.Create(2);
        var b = Amount.Create(5);
        var act = () => { var _ = a - b; };
        act.Should().Throw<DomainExceptions>().WithMessage("Amount is invalid");
    }

    // ── Equality (record semantics) ────────────────────────────────────────────

    [Fact]
    public void TwoAmountsWithSameValue_ShouldBeEqual()
    {
        Amount.Create(10).Should().Be(Amount.Create(10));
    }

    [Fact]
    public void TwoAmountsWithDifferentValues_ShouldNotBeEqual()
    {
        Amount.Create(10).Should().NotBe(Amount.Create(11));
    }

    // ── ToString ──────────────────────────────────────────────────────────────

    [Fact]
    public void ToString_ShouldReturnStringRepresentationOfValue()
    {
        Amount.Create(99).ToString().Should().Be("99");
    }
}
