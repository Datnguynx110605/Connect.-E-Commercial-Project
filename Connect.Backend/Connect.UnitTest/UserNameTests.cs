using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Connect.Domain.Tests.ValueObjects;

public class UserNameTests
{
    [Fact]
    public void Create_WithValidLowercaseName_ShouldSucceed()
    {
        var name = UserName.Create("johndoe");
        name.Value.Should().Be("johndoe");
    }

    [Theory]
    [InlineData("abc")]       // minimum 3 chars
    [InlineData("abcdefghij")] // 10 chars
    public void Create_WithLengthInRange_ShouldSucceed(string value)
    {
        var act = () => UserName.Create(value);
        act.Should().NotThrow();
    }

    [Fact]
    public void Create_TooShort_ShouldThrowDomainException()
    {
        var act = () => UserName.Create("ab");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("User name is invalid")
           .And.Code.Should().Be("INVALID-USERNAME");
    }

    [Fact]
    public void Create_TooLong_ShouldThrowDomainException()
    {
        var act = () => UserName.Create(new string('a', 31));
        act.Should().Throw<DomainExceptions>().WithMessage("User name is invalid");
    }

    [Fact]
    public void Create_WithUppercaseLetters_ShouldThrowDomainException()
    {
        var act = () => UserName.Create("JohnDoe");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("User name must only contain lowercase letters")
           .And.Code.Should().Be("INVALID-USERNAME");
    }

    [Fact]
    public void Create_WithDigits_ShouldThrowDomainException()
    {
        var act = () => UserName.Create("john123");
        act.Should().Throw<DomainExceptions>().WithMessage("User name must only contain lowercase letters");
    }

    [Fact]
    public void Create_WithSpaces_ShouldThrowDomainException()
    {
        var act = () => UserName.Create("john doe");
        act.Should().Throw<DomainExceptions>();
    }

    [Fact]
    public void Create_WithEmptyString_ShouldThrowDomainException()
    {
        var act = () => UserName.Create("");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("User name must be required")
           .And.Code.Should().Be("REQUIRED-USERNAME");
    }

    [Fact]
    public void Equality_SameValue_ShouldBeEqual()
    {
        UserName.Create("alice").Should().Be(UserName.Create("alice"));
    }
}
