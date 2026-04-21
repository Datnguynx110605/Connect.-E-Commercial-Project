using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Configurations
{
    internal sealed class PaymentConfiguration: IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.ToTable("Payments");

            builder.Property(t => t.PaymentID).IsRequired();
            builder.Property(t => t.OrderID).IsRequired();
            builder.Property(t => t.PaymentType).HasMaxLength(20);
            builder.Property(t => t.TransactionID).IsRequired();
            builder.Property(t => t.BankingInfo).HasMaxLength(25);

            builder.Property(t => t.TotalAmount)
                    .HasConversion(
                       v => v.Value,
                       v => Currency.Create(v))
                    .HasPrecision(18, 2);
            builder.Property(t => t.IsPaidSuccess);
            builder.Property(t => t.PaidAt).IsRequired();

            builder.HasIndex(t => t.OrderID);
        }
    }
}
