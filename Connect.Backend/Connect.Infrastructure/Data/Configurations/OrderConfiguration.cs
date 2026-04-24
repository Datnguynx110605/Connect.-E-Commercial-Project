using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Data.Configurations
{
    internal sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.ToTable("Orders");

            builder.HasKey(o => o.OrderID);

            builder.Property(o => o.OrderID)
                .ValueGeneratedOnAdd();

            builder.Property(o => o.UserID)
                .IsRequired();

            builder.Property(o => o.CouponID)
                .IsRequired(false);

            builder.Property(o => o.OrderTotalPrice)
                .HasConversion(
                    v => v.Value,
                    v => Currency.Create(v))
                .HasColumnName("OrderTotalPrice")
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(o => o.OrderTotalItems)
                .HasConversion(
                    v => v.Value,
                    v => Amount.Create(v))
                .HasColumnName("OrderTotalItems")
                .IsRequired();

            builder.Property(o => o.OrderShippingMethod)
                .HasConversion<string>()
                .HasColumnName("OrderShippingMethod")
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(o => o.OrderPaymentMethod)
                .HasConversion<string>()
                .HasColumnName("OrderPaymentMethod")
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(o => o.OrderPaymentStatus)
                .HasConversion<string>()
                .HasColumnName("OrderPaymentStatus")
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(o => o.OrderStatus)
                .HasConversion<string>()
                .HasColumnName("OrderStatus")
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(o => o.CreatedAt)
                .HasColumnName("CreatedAt")
                .IsRequired();

            builder.HasMany(o => o.OrderItems)
                .WithOne()
                .HasForeignKey("OrderID")
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne<Coupon>()
                .WithMany()
                .HasForeignKey(o => o.CouponID)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
