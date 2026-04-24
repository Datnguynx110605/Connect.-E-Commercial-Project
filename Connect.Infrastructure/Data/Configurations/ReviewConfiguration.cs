using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Data.Configurations
{
    internal sealed class ReviewConfiguration : IEntityTypeConfiguration<Review>
    {
        public void Configure(EntityTypeBuilder<Review> builder)
        {
            builder.ToTable("Reviews");

            builder.HasKey(r => r.ReviewID);

            builder.Property(r => r.ReviewID)
                .ValueGeneratedOnAdd();

            builder.Property(r => r.UserID)
                .IsRequired();

            builder.Property(r => r.ProductID)
                .IsRequired();

            builder.Property(r => r.Rating)
                .HasConversion(
                    v => v.Value,
                    v => Amount.Create(v))
                .HasColumnName("Rating")
                .IsRequired();

            builder.Property(r => r.Body)
                .HasColumnName("Body")
                .HasMaxLength(2000)
                .IsRequired();

            builder.Property(r => r.CreatedAt)
                .HasColumnName("CreatedAt")
                .IsRequired();

            builder.HasIndex(r => new { r.UserID, r.ProductID })
                .IsUnique();
        }
    }
}
