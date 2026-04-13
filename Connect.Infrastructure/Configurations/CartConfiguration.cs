using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Configurations
{
    internal sealed class CartConfiguration : IEntityTypeConfiguration<Cart>
    {
        public void Configure(EntityTypeBuilder<Cart> builder)
        {
            builder.ToTable("Carts");

            builder.HasKey(c => c.CartID);

            builder.Property(c => c.CartID)
                .ValueGeneratedOnAdd();

            builder.Property(c => c.UserID)
                .IsRequired();

            builder.Property(c => c.ProductID)
                .IsRequired();

            builder.Property(c => c.CartQuantity)
                .HasConversion(
                    v => v.Value,
                    v => Amount.Create(v))
                .HasColumnName("CartQuantity")
                .IsRequired();

            builder.Property(c => c.CartUnitPrice)
                .HasConversion(
                    v => v.Value,
                    v => Currency.Create(v))
                .HasColumnName("CartUnitPrice")
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(c => c.CartTotalPrice)
                .HasConversion(
                    v => v.Value,
                    v => Currency.Create(v))
                .HasColumnName("CartTotalPrice")
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(c => c.CreatedAt)
                .HasColumnName("CreatedAt")
                .IsRequired();
        }
    }
}
