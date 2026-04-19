using Connect.Domain.Core.Entities;
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
            builder.ToTable("PaymentTransactions");
            builder.HasKey(t => t.PaymentID);

            builder.Property(t => t.OrderID).IsRequired();
            builder.Property(t => t.PaymentGatewayID).HasMaxLength(50);
            builder.Property(t => t.TotalAmount).HasPrecision(18, 2);
            builder.Property(t => t.ErrorCode).HasMaxLength(10);

            builder.HasIndex(t => t.OrderID);
        }
    }
}
