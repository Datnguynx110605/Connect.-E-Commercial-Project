using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Data.Configurations
{
    internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");

            builder.HasKey(u => u.UserID);

            builder.Property(u => u.UserID)
                .ValueGeneratedOnAdd();

            builder.Property(u => u.UserName)
                .HasConversion(
                    v => v.Value,
                    v => UserName.Create(v))
                .HasColumnName("UserName")
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(u => u.Email)
                .HasConversion(
                    v => v.Value,
                    v => Email.Create(v))
                .HasColumnName("Email")
                .HasMaxLength(100)
                .IsRequired();

            builder.HasIndex(u => u.Email)
                .IsUnique();

            builder.Property(u => u.PhoneNumber)
                .HasConversion(
                    v => v.Value,
                    v => PhoneNumber.Create(v))
                .HasColumnName("PhoneNumber")
                .HasMaxLength(10)
                .IsRequired();

            builder.Property(u => u.PasswordHash)
                .HasConversion(
                    v => v.Value,
                    v => PasswordHash.Create(v))
                .HasColumnName("PasswordHash")
                .HasMaxLength(60)
                .IsRequired();

            builder.Property(u => u.Address)
                .HasColumnName("Address")
                .HasMaxLength(300)
                .IsRequired();

            builder.Property(u => u.Role)
                .HasColumnName("Role")
                .HasMaxLength(20)
                .IsRequired()
                .HasDefaultValue("Customer");

            builder.Property(u => u.CreatedAt)
                .HasColumnName("CreatedAt")
                .IsRequired();

            builder.HasMany<RefreshToken>()
                .WithOne()
                .HasForeignKey(rt => rt.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany<Cart>()
                .WithOne()
                .HasForeignKey(c => c.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany<Order>()
                .WithOne()
                .HasForeignKey(o => o.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany<Review>()
                .WithOne()
                .HasForeignKey(r => r.UserID)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
