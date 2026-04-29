using Connect.Domain.Common;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.Enums;
using Connect.Domain.Core.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Connect.Domain.Tests.Entities;

public class ProductTests
{
    // ── Shared factory ────────────────────────────────────────────────────────

    private static readonly List<string> DefaultImages = ["https://example.com/img1.jpg"];

    private static Product BuildProduct(
        int      categoryID    = 1,
        string   name          = "iPhone 15 Pro Max",
        string?  description   = null,
        decimal  originalPrice = 30_000_000m,
        decimal  finalPrice    = 25_000_000m,
        int      stock         = 100,
        int      ram           = 8,
        int      rom           = 256,
        string   color         = "Black",
        List<string>? images   = null) =>
        Product.CreateProduct(
            categoryID,
            ProductName.Create(name),
            description ?? new string('A', 100), // 100-char valid description
            Currency.Create(originalPrice),
            Currency.Create(finalPrice),
            Amount.Create(stock),
            Amount.Create(ram),
            Amount.Create(rom),
            color,
            images ?? DefaultImages);

    // ── CreateProduct ─────────────────────────────────────────────────────────

    [Fact]
    public void CreateProduct_WithValidData_ShouldSucceed()
    {
        var product = BuildProduct();
        product.Should().NotBeNull();
        product.ProductStatus.Should().Be(ProductStatus.InStock);
        product.Stock.Value.Should().Be(100);
    }

    [Fact]
    public void CreateProduct_WithEmptyDescription_ShouldThrowDomainException()
    {
        var act = () => BuildProduct(description: "");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Description must be required")
           .And.Code.Should().Be("REQUIRED-DESCRIPTION");
    }

    [Fact]
    public void CreateProduct_WithDescriptionTooShort_ShouldThrowDomainException()
    {
        var act = () => BuildProduct(description: new string('A', 49));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Description is invalid")
           .And.Code.Should().Be("INVALID-DESCRIPTION");
    }

    [Fact]
    public void CreateProduct_WithDescriptionTooLong_ShouldThrowDomainException()
    {
        var act = () => BuildProduct(description: new string('A', 2001));
        act.Should().Throw<DomainExceptions>().WithMessage("Description is invalid");
    }

    [Theory]
    [InlineData("Contains a < tag")]
    [InlineData("Contains a > tag")]
    [InlineData("Contains {braces}")]
    [InlineData("Contains [brackets]")]
    [InlineData("Contains \\backslash")]
    [InlineData("Contains | pipe char")]
    public void CreateProduct_WithSpecialCharsInDescription_ShouldThrowDomainException(string badPart)
    {
        // Pad to ≥50 chars
        var description = badPart.PadRight(60, 'X');
        var act = () => BuildProduct(description: description);
        act.Should().Throw<DomainExceptions>().WithMessage("Description must not have special character");
    }

    [Fact]
    public void CreateProduct_WhenFinalPriceExceedsOriginal_ShouldThrowDomainException()
    {
        var act = () => BuildProduct(originalPrice: 10_000_000m, finalPrice: 11_000_000m);
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Price is invalid")
           .And.Code.Should().Be("INVALID-PRICE");
    }

    [Fact]
    public void CreateProduct_WhenFinalPriceEqualsOriginal_ShouldSucceed()
    {
        var act = () => BuildProduct(originalPrice: 10_000_000m, finalPrice: 10_000_000m);
        act.Should().NotThrow();
    }

    [Fact]
    public void CreateProduct_WithNullImages_ShouldThrowDomainException()
    {
        var act = () => BuildProduct(images: null!);
        act.Should().Throw<DomainExceptions>()
           .WithMessage("ImageURL must be required")
           .And.Code.Should().Be("REQUIRED-IMAGE");
    }

    [Fact]
    public void CreateProduct_WithEmptyImageList_ShouldThrowDomainException()
    {
        var act = () => BuildProduct(images: []);
        act.Should().Throw<DomainExceptions>().WithMessage("ImageURL must be required");
    }

    [Fact]
    public void CreateProduct_WithEmptyColor_ShouldThrowDomainException()
    {
        var act = () => BuildProduct(color: "");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Color must be required")
           .And.Code.Should().Be("REQUIRED-COLOR");
    }

    [Fact]
    public void CreateProduct_WithColorExceeding15Chars_ShouldThrowDomainException()
    {
        var act = () => BuildProduct(color: "SuperDarkMidnightBlue");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Color is invalid")
           .And.Code.Should().Be("INVALID-COLOR");
    }

    [Fact]
    public void CreateProduct_WhenRamExceedsRom_ShouldThrowDomainException()
    {
        var act = () => BuildProduct(ram: 512, rom: 256);
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Value is invalid")
           .And.Code.Should().Be("INVALID-VALUE");
    }

    [Fact]
    public void CreateProduct_WhenRamEqualsRom_ShouldSucceed()
    {
        var act = () => BuildProduct(ram: 256, rom: 256);
        act.Should().NotThrow();
    }

    // ── AddToStock / RemoveFromStock ──────────────────────────────────────────

    [Fact]
    public void AddToStock_ShouldIncreaseStock()
    {
        var product = BuildProduct(stock: 10);
        product.AddToStock(Amount.Create(5));
        product.Stock.Value.Should().Be(15);
        product.ProductStatus.Should().Be(ProductStatus.InStock);
    }

    [Fact]
    public void RemoveFromStock_ShouldDecreaseStock()
    {
        var product = BuildProduct(stock: 10);
        product.RemoveFromStock(Amount.Create(3));
        product.Stock.Value.Should().Be(7);
        product.ProductStatus.Should().Be(ProductStatus.InStock);
    }

    [Fact]
    public void RemoveFromStock_WhenStockReachesZero_ShouldMarkOutOfStock()
    {
        var product = BuildProduct(stock: 2);
        product.RemoveFromStock(Amount.Create(2));
        product.Stock.Value.Should().Be(0);
        product.ProductStatus.Should().Be(ProductStatus.OutOfStock);
    }

    [Fact]
    public void RemoveFromStock_WhenAlreadyOutOfStock_ShouldThrowDomainException()
    {
        var product = BuildProduct(stock: 1);
        product.RemoveFromStock(Amount.Create(1)); // now out of stock
        var act = () => product.RemoveFromStock(Amount.Create(1));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Product is already out of stock")
           .And.Code.Should().Be("OUTOFSTOCK-PRODUCT");
    }

    [Fact]
    public void AddToStock_AfterBeingOutOfStock_ShouldMarkInStock()
    {
        var product = BuildProduct(stock: 1);
        product.RemoveFromStock(Amount.Create(1)); // out of stock
        product.AddToStock(Amount.Create(5));
        product.ProductStatus.Should().Be(ProductStatus.InStock);
        product.Stock.Value.Should().Be(5);
    }

    // ── UpdateProductFinalPrice ────────────────────────────────────────────────

    [Fact]
    public void UpdateProductFinalPrice_WithValidPrice_ShouldSucceed()
    {
        var product = BuildProduct(originalPrice: 10_000_000m, finalPrice: 9_000_000m);
        product.UpdateProductFinalPrice(Currency.Create(8_000_000m));
        product.FinalPrice.Value.Should().Be(8_000_000m);
    }

    [Fact]
    public void UpdateProductFinalPrice_ExceedingOriginal_ShouldThrowDomainException()
    {
        var product = BuildProduct(originalPrice: 10_000_000m, finalPrice: 9_000_000m);
        var act     = () => product.UpdateProductFinalPrice(Currency.Create(11_000_000m));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Price is invalid")
           .And.Code.Should().Be("INVALID-PRICE");
    }

    // ── UpdateProductImage ────────────────────────────────────────────────────

    [Fact]
    public void UpdateProductImage_WithValidImages_ShouldSucceed()
    {
        var product   = BuildProduct();
        var newImages = new List<string> { "https://new.com/img.jpg" };
        product.UpdateProductImage(newImages);
        product.ImageURL.Should().BeEquivalentTo(newImages);
    }

    [Fact]
    public void UpdateProductImage_WithEmptyList_ShouldThrowDomainException()
    {
        var product = BuildProduct();
        var act     = () => product.UpdateProductImage([]);
        act.Should().Throw<DomainExceptions>().WithMessage("ImageURL must be required");
    }

    [Fact]
    public void UpdateProductImage_WithNull_ShouldThrowDomainException()
    {
        var product = BuildProduct();
        var act     = () => product.UpdateProductImage(null!);
        act.Should().Throw<DomainExceptions>().WithMessage("ImageURL must be required");
    }
}
