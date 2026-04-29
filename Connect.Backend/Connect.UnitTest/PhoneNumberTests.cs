using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Connect.Domain.Tests.ValueObjects;

public class PhoneNumberTests
{
    [Fact]
    public void Create_WithValid10DigitNumber_ShouldSucceed()
    {
        var phone = PhoneNumber.Create("0912345678");
        phone.Value.Should().Be("0912345678");
    }

    [Fact]
    public void Create_WithEmptyString_ShouldThrowDomainException()
    {
        var act = () => PhoneNumber.Create("");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Phone number must be required")
           .And.Code.Should().Be("REQUIRED-PHONENUMBER");
    }

    [Fact]
    public void Create_With9Digits_ShouldThrowDomainException()
    {
        var act = () => PhoneNumber.Create("091234567");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Phone number is invalid")
           .And.Code.Should().Be("INVALID-PHONENUMBER");
    }

    [Fact]
    public void Create_With11Digits_ShouldThrowDomainException()
    {
        var act = () => PhoneNumber.Create("09123456789");
        act.Should().Throw<DomainExceptions>().WithMessage("Phone number is invalid");
    }

    [Fact]
    public void Create_WithSpecialCharacters_ShouldThrowDomainException()
    {
        var act = () => PhoneNumber.Create("091-234567");
        act.Should().Throw<DomainExceptions>().WithMessage("Phone number is invalid");
    }

    [Fact]
    public void Create_WithLetters_ShouldThrowDomainException()
    {
        var act = () => PhoneNumber.Create("091abc5678");
        act.Should().Throw<DomainExceptions>().WithMessage("Phone number is invalid");
    }

    [Fact]
    public void Equality_SameNumber_ShouldBeEqual()
    {
        PhoneNumber.Create("0912345678").Should().Be(PhoneNumber.Create("0912345678"));
    }
}
