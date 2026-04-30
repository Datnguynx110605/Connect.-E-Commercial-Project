using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Data.Configurations
{
    internal sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            builder.ToTable("Products");

            builder.HasKey(p => p.ProductID);

            builder.Property(p => p.ProductID)
                .ValueGeneratedOnAdd();

            builder.Property(p => p.CategoryID)
                .IsRequired();

            builder.Property(p => p.ProductName)
                .HasConversion(
                    v => v.Value,
                    v => ProductName.Create(v))
                .HasColumnName("ProductName")
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(p => p.Description)
                .HasColumnName("Description")
                .HasMaxLength(10000)
                .IsRequired();

            builder.Property(p => p.OriginalPrice)
                .HasConversion(
                    v => v.Value,
                    v => Currency.Create(v))
                .HasColumnName("OriginalPrice")
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(p => p.FinalPrice)
                .HasConversion(
                    v => v.Value,
                    v => Currency.Create(v))
                .HasColumnName("FinalPrice")
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(p => p.Stock)
                .HasConversion(
                    v => v.Value,
                    v => Amount.Create(v))
                .HasColumnName("Stock")
                .IsRequired();

            builder.Property(p => p.Ram)
                .HasConversion(
                    v => v.Value,
                    v => Amount.Create(v))
                .HasColumnName("Ram")
                .IsRequired();

            builder.Property(p => p.Rom)
                .HasConversion(
                    v => v.Value,
                    v => Amount.Create(v))
                .HasColumnName("Rom")
                .IsRequired();

            builder.Property(p => p.Color)
                .HasColumnName("Color")
                .HasMaxLength(15)
                .IsRequired();

            // List<string> stored as JSON column
            builder.Property(p => p.ImageURL)
                .HasConversion(
                    v => string.Join("||", v),
                    v => v.Split("||", StringSplitOptions.RemoveEmptyEntries).ToList())
                .HasColumnName("ImageURL")
                .IsRequired();

            builder.Property(p => p.ProductStatus)
                .HasConversion<string>()
                .HasColumnName("ProductStatus")
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(p => p.CreatedAt)
                .HasColumnName("CreatedAt")
                .IsRequired();

            // Relationships
            builder.HasOne<Category>()
                .WithMany()
                .HasForeignKey(p => p.CategoryID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany<Review>()
                .WithOne()
                .HasForeignKey(r => r.ProductID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany<Cart>()
                .WithOne()
                .HasForeignKey(c => c.ProductID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
