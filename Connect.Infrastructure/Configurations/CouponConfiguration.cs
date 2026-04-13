using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Configurations
{
    internal sealed class CouponConfiguration : IEntityTypeConfiguration<Coupon>
    {
        public void Configure(EntityTypeBuilder<Coupon> builder)
        {
            builder.ToTable("Coupons");

            builder.HasKey(c => c.CouponID);

            builder.Property(c => c.CouponID)
                .ValueGeneratedOnAdd();

            builder.Property(c => c.CouponCode)
                .HasConversion(
                    v => v.Value,
                    v => Code.Create(v))
                .HasColumnName("CouponCode")
                .HasMaxLength(12)
                .IsRequired();

            builder.HasIndex(c => c.CouponCode)
                .IsUnique();

            builder.Property(c => c.DiscountAmount)
                .HasConversion(
                    v => v.Value,
                    v => Currency.Create(v))
                .HasColumnName("DiscountAmount")
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(c => c.CouponQuantity)
                .HasConversion(
                    v => v.Value,
                    v => Amount.Create(v))
                .HasColumnName("CouponQuantity")
                .IsRequired();

            builder.Property(c => c.ExpiryDate)
                .HasColumnName("ExpiryDate")
                .IsRequired();

            builder.Property(c => c.CreatedAt)
                .HasColumnName("CreatedAt")
                .IsRequired();
        }
    }
}
