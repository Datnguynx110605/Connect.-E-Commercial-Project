using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Data.Configurations
{
    internal sealed class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            builder.ToTable("OrderItems");

            builder.HasKey("OrderID", nameof(OrderItem.ProductID));

            builder.Property(oi => oi.ProductID)
                .IsRequired();

            builder.Property(oi => oi.UnitPrice)
                .HasConversion(
                    v => v.Value,
                    v => Currency.Create(v))
                .HasColumnName("UnitPrice")
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(oi => oi.Quantity)
                .HasConversion(
                    v => v.Value,
                    v => Amount.Create(v))
                .HasColumnName("Quantity")
                .IsRequired();

            builder.Ignore(oi => oi.OrderItemTotalPrice);

            builder.HasOne<Product>()
                .WithMany()
                .HasForeignKey(oi => oi.ProductID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
