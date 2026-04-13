using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Configurations
{
    internal sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.ToTable("Categories");

            builder.HasKey(c => c.CategoryID);

            builder.Property(c => c.CategoryID)
                .ValueGeneratedOnAdd();

            builder.Property(c => c.CategoryName)
                .HasConversion(
                    v => v.Value,
                    v => CategoryName.Create(v))
                .HasColumnName("CategoryName")
                .HasMaxLength(10)
                .IsRequired();

            builder.HasIndex(c => c.CategoryName)
                .IsUnique();
        }
    }
}
