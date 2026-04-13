    using Connect.Domain.Common;
    using Connect.Domain.Core.Enums;
    using Connect.Domain.Core.ValueObjects;
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Runtime.Intrinsics.Arm;
    using System.Text;
    using System.Text.RegularExpressions;

    namespace Connect.Domain.Core.Entities
    {
        public class Product
        {
            public int ProductID { get; private set; }
            public int CategoryID { get; private set; }
            public ProductName ProductName { get; private set; }
            public string Description { get; private set; }
            public Currency OriginalPrice { get; private set; }
            public Currency FinalPrice { get; private set; }
            public Amount Stock { get; private set; }
            public Amount Ram { get; private set; }
            public Amount Rom { get; private set; }
            public string Color { get; private set; }
            public List<string> ImageURL { get; private set; }
            public ProductStatus ProductStatus { get; private set; }
            public DateTime CreatedAt { get; private set; }
            private Product() { }
            private Product(int categoryID, ProductName name, string description,
            Currency originalPrice, Currency finalPrice, Amount stock, Amount ram, Amount rom, string color, List<string> imageURL, ProductStatus status)
            {
                CategoryID = categoryID;
                ProductName = name;
                Description = description;
                OriginalPrice = originalPrice;
                FinalPrice = finalPrice;
                Stock = stock;
                Ram = ram;
                Rom = rom;
                Color = color;
                ImageURL = imageURL;
                ProductStatus = status;
                CreatedAt = DateTime.UtcNow;
            }

            public static Product CreateProduct(int categoryID, ProductName name, string description,
            Currency originalPrice, Currency finalPrice, Amount stock, Amount ram, Amount rom, string color, List<string> imageURL, ProductStatus status)
            {
                if (string.IsNullOrWhiteSpace(description))
                    throw new DomainExceptions(
                        message: "Description must be required",
                        code: "REQUIRED-DESCRIPTION",
                        metadata: new Dictionary<string, object>
                        {
                            { "DESCRIPTION", description }
                        });

                if (description.Length > 200 || description.Length < 50)
                    throw new DomainExceptions(
                        message: "Description is invalid",
                        code: "INVALID-DESCRIPTION",
                        metadata: new Dictionary<string, object>
                        {
                            { "DESCRIPTION", description }
                        });

                if(finalPrice.Value > originalPrice.Value)
                    throw new DomainExceptions(
                        message: "Price is invalid",
                        code: "INVALID-PRICE");

                if (Regex.IsMatch(description, @"[<>{}\[\]\\|^~`]"))
                    throw new DomainExceptions(
                        message: "Description must not have special character",
                        code: "INVALID-DESCRIPTION",
                        metadata: new Dictionary<string, object>
                        {
                            { "DESCRIPTION", description }
                        });

                if (imageURL == null || imageURL.Count == 0)
                    throw new DomainExceptions(
                        message: "ImageURL must be required",
                        code: "REQUIRED-IMAGE",
                        metadata: new Dictionary<string, object>
                        {
                            { "IMAGE", imageURL }
                        });

                if (string.IsNullOrWhiteSpace(color))
                    throw new DomainExceptions(
                        message: "Color must be required",
                        code: "REQUIRED-COLOR",
                        metadata: new Dictionary<string, object>
                        {
                            { "COLOR", color }
                        });

                if(ram.Value > rom.Value)
                    throw new DomainExceptions(
                        message: "Value is invalid",
                        code: "INVALID-VALUE");

                if (color.Length > 15)
                    throw new DomainExceptions(
                        message: "Color is invalid",
                        code: "INVALID-COLOR",
                        metadata: new Dictionary<string, object>
                        {
                            { "COLOR", color }
                        });

                if(!Enum.IsDefined(typeof(ProductStatus), status))
                    throw new DomainExceptions(
                        message: "Product status is invalid",
                        code: "INVALID-STATUS");

                return new Product(categoryID, name, description.Trim(), originalPrice, finalPrice, stock, ram, rom, color, imageURL, status);
            }

            private void MarkProductStock()
            {
                if (Stock.Value == 0)
                {
                    ProductStatus = ProductStatus.OutOfStock;
                }
                else ProductStatus = ProductStatus.InStock;
            }
            
            public void AddToStock(Amount quantity)
            {
                Stock += quantity;
                MarkProductStock();
            }

            public void RemoveFromStock(Amount quantity)
            {
                if (ProductStatus == ProductStatus.OutOfStock)
                    throw new DomainExceptions(message: "Product is already out of stock", code: "OUTOFSTOCK-PRODUCT");

                Stock -= quantity;
                MarkProductStock();
            }

            public void UpdateProductFinalPrice(Currency finalPrice)
            {
            if (finalPrice.Value > OriginalPrice.Value)
                throw new DomainExceptions(
                    message: "Price is invalid",
                    code: "INVALID-PRICE",
                    metadata: new Dictionary<string, object>
                    {
                        { "FINALPRICE", finalPrice }
                    });

                FinalPrice = finalPrice;
            }

            public void UpdateProductImage(List<string> imageURL)
            {
                if (imageURL == null || imageURL.Count == 0)
                    throw new DomainExceptions(
                        message: "ImageURL must be required",
                        code: "REQUIRED-IMAGE",
                        metadata: new Dictionary<string, object>
                        {
                                { "IMAGE", imageURL }
                        });

                ImageURL = imageURL;
            }
        }
    }
