using Connect.Domain.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Data.Configurations
{
    internal sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.ToTable("RefreshTokens");

            builder.HasKey(rt => rt.RefreshTokenID);

            builder.Property(rt => rt.RefreshTokenID)
                .ValueGeneratedOnAdd();

            builder.Property(rt => rt.UserID)
                .IsRequired();

            builder.Property(rt => rt.RefreshTokens)
                .HasColumnName("Token")
                .HasMaxLength(128)
                .IsRequired();

            builder.HasIndex(rt => rt.RefreshTokens)
                .IsUnique();

            builder.Property(rt => rt.ExpiryDate)
                .HasColumnName("ExpiryDate")
                .IsRequired();

            builder.Property(rt => rt.IsRevoked)
                .HasColumnName("IsRevoked")
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(rt => rt.CreatedAt)
                .HasColumnName("CreatedAt")
                .IsRequired();
        }
    }
}
