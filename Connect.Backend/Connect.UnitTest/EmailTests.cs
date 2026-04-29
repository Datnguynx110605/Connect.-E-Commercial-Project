using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Connect.Domain.Tests.ValueObjects;

public class EmailTests
{
    [Fact]
    public void Create_WithValidEmail_ShouldSucceed()
    {
        var email = Email.Create("user@example.com");
        email.Value.Should().Be("user@example.com");
    }

    [Fact]
    public void Create_WithLeadingAndTrailingSpaces_ShouldTrimValue()
    {
        var email = Email.Create("  user@example.com  ");
        email.Value.Should().Be("user@example.com");
    }

    [Fact]
    public void Create_WithNullOrEmpty_ShouldThrowDomainException()
    {
        var act = () => Email.Create("");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("EMAIL must be required")
           .And.Code.Should().Be("REQUIRED-EMAIL");
    }

    [Fact]
    public void Create_WithWhiteSpaceOnly_ShouldThrowDomainException()
    {
        var act = () => Email.Create("   ");
        act.Should().Throw<DomainExceptions>().WithMessage("EMAIL must be required");
    }

    [Fact]
    public void Create_WithoutAtSign_ShouldThrowDomainException()
    {
        var act = () => Email.Create("userexample.com");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Email is invalid")
           .And.Code.Should().Be("INVALID-EMAIL");
    }

    [Fact]
    public void Equality_SameEmail_ShouldBeEqual()
    {
        Email.Create("a@b.com").Should().Be(Email.Create("a@b.com"));
    }

    [Fact]
    public void ToString_ShouldReturnEmailString()
    {
        Email.Create("hello@world.io").ToString().Should().Be("hello@world.io");
    }
}
