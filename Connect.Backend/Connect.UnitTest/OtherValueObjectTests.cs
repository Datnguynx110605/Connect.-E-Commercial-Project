using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Connect.Domain.Tests.ValueObjects;

// ─── PasswordHash ─────────────────────────────────────────────────────────────

public class PasswordHashTests
{
    // A valid BCrypt hash (cost 12, $2b$ prefix, exactly 60 chars)
    private const string ValidHash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/AwHAb.bm5nCrfVS5G";

    [Fact]
    public void Create_WithValidBCryptHash_ShouldSucceed()
    {
        var hash = PasswordHash.Create(ValidHash);
        hash.Value.Should().Be(ValidHash);
    }

    [Fact]
    public void Create_WithEmptyString_ShouldThrowDomainException()
    {
        var act = () => PasswordHash.Create("");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("PasswordHash must be required")
           .And.Code.Should().Be("REQUIRED-PASSWORDHASH");
    }

    [Fact]
    public void Create_WithWrongLength_ShouldThrowDomainException()
    {
        var act = () => PasswordHash.Create("tooshort");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("PasswordHash is invalid")
           .And.Code.Should().Be("INVALID-PASSWORDHASH");
    }

    [Fact]
    public void Create_With60CharsButInvalidPrefix_ShouldThrowDomainException()
    {
        // 60 chars, but doesn't start with $2[aby]$xx$
        var invalid = new string('x', 60);
        var act = () => PasswordHash.Create(invalid);
        act.Should().Throw<DomainExceptions>().WithMessage("PasswordHash is invalid");
    }

    [Fact]
    public void Equality_SameHash_ShouldBeEqual()
    {
        PasswordHash.Create(ValidHash).Should().Be(PasswordHash.Create(ValidHash));
    }
}

// ─── ProductName ──────────────────────────────────────────────────────────────

public class ProductNameTests
{
    [Fact]
    public void Create_WithValidName_ShouldSucceed()
    {
        var name = ProductName.Create("iPhone 15 Pro Max");
        name.Value.Should().Be("iPhone 15 Pro Max");
    }

    [Fact]
    public void Create_WithEmptyString_ShouldThrowDomainException()
    {
        var act = () => ProductName.Create("");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Product name must be required")
           .And.Code.Should().Be("REQUIRED-PRODUCTNAME");
    }

    [Fact]
    public void Create_TooShort_ShouldThrowDomainException()
    {
        var act = () => ProductName.Create("Mac");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Product name is invalid")
           .And.Code.Should().Be("INVALID-PRODUCTNAME");
    }

    [Fact]
    public void Create_TooLong_ShouldThrowDomainException()
    {
        var act = () => ProductName.Create(new string('a', 101));
        act.Should().Throw<DomainExceptions>().WithMessage("Product name is invalid");
    }

    [Theory]
    [InlineData("iPhone@15")]
    [InlineData("Galaxy#S24")]
    [InlineData("Pixel!7")]
    public void Create_WithDisallowedSpecialChars_ShouldThrowDomainException(string value)
    {
        var act = () => ProductName.Create(value);
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Product name must not have special character");
    }

    [Theory]
    [InlineData("iPhone 15 Pro")]      // spaces allowed
    [InlineData("Galaxy S24-Ultra")]   // hyphens allowed
    [InlineData("Pixel 7 | Lite")]     // pipe allowed
    public void Create_WithAllowedChars_ShouldSucceed(string value)
    {
        var act = () => ProductName.Create(value);
        act.Should().NotThrow();
    }
}

// ─── CategoryName ─────────────────────────────────────────────────────────────

public class CategoryNameTests
{
    [Fact]
    public void Create_WithValidName_ShouldSucceed()
    {
        var name = CategoryName.Create("Smartphones");
        name.Value.Should().Be("Smartphones");
    }

    [Fact]
    public void Create_TooShort_ShouldThrowDomainException()
    {
        var act = () => CategoryName.Create("A");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Category name is invalid")
           .And.Code.Should().Be("INVALID-CATEGORYNAME");
    }

    [Fact]
    public void Create_TooLong_ShouldThrowDomainException()
    {
        var act = () => CategoryName.Create(new string('a', 21));
        act.Should().Throw<DomainExceptions>().WithMessage("Category name is invalid");
    }

    [Fact]
    public void Create_WithSpecialCharacters_ShouldThrowDomainException()
    {
        var act = () => CategoryName.Create("Phones&Tablets");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Category name must not have special character")
           .And.Code.Should().Be("INVALID-CATEGORYNAME");
    }

    [Fact]
    public void Create_WithEmptyString_ShouldThrowDomainException()
    {
        var act = () => CategoryName.Create("");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Category name must be required")
           .And.Code.Should().Be("REQUIRED-CATEGORYNAME");
    }

    [Fact]
    public void Equality_SameName_ShouldBeEqual()
    {
        CategoryName.Create("Laptops").Should().Be(CategoryName.Create("Laptops"));
    }
}

// ─── Code ─────────────────────────────────────────────────────────────────────

public class CodeTests
{
    [Fact]
    public void Create_WithValidCode_ShouldSucceed()
    {
        var code = Code.Create("SAVE10");
        code.Value.Should().Be("SAVE10");
    }

    [Fact]
    public void Create_WithEmptyString_ShouldThrowDomainException()
    {
        var act = () => Code.Create("");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Code must be required")
           .And.Code.Should().Be("REQUIRED-CODE");
    }

    [Fact]
    public void Create_TooShort_ShouldThrowDomainException()
    {
        var act = () => Code.Create("A1B");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Code is invalid")
           .And.Code.Should().Be("INVALID-CODE");
    }

    [Fact]
    public void Create_TooLong_ShouldThrowDomainException()
    {
        var act = () => Code.Create("ABCDEFGHIJ123");
        act.Should().Throw<DomainExceptions>().WithMessage("Code is invalid");
    }

    [Fact]
    public void Create_WithNoDigit_ShouldThrowDomainException()
    {
        var act = () => Code.Create("ABCDE");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Code must have number")
           .And.Code.Should().Be("INVALID-CODE");
    }

    [Fact]
    public void Create_WithAtLeastOneDigit_ShouldSucceed()
    {
        var act = () => Code.Create("PROMO1");
        act.Should().NotThrow();
    }

    [Fact]
    public void Equality_SameCode_ShouldBeEqual()
    {
        Code.Create("DEAL99").Should().Be(Code.Create("DEAL99"));
    }
}
