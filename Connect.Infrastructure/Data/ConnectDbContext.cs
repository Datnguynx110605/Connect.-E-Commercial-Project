using Connect.Application.Features.Orders.Commands.CreateOrder;
using Connect.Domain.Common;
using Connect.Domain.Core.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Data
{
    public class ConnectDbContext : DbContext
    {
        private readonly IPublisher publisher;
        public ConnectDbContext(DbContextOptions<ConnectDbContext> options, IPublisher _publisher): base(options)
        {
            publisher = _publisher;
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<Coupon> Coupons { get; set; }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var domainEvents = ChangeTracker.Entries<AggregateRoot>()
                .Select(e => e.Entity)
                .Where(e => e.DomainEvents.Any())
                .SelectMany(e =>
                {
                    var events = e.DomainEvents.ToList();
                    e.ClearDomainEvents();
                    return events;
                })
                .ToList();

            var result = await base.SaveChangesAsync(cancellationToken);        

            foreach (var domainEvent in domainEvents)
            {
                var notificationType = typeof(DomainEventNotification<>).MakeGenericType(domainEvent.GetType());

                var notification = Activator.CreateInstance(notificationType, domainEvent);
                await publisher.Publish(notification!, cancellationToken);
            }

            return result;
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ConnectDbContext).Assembly);
            base.OnModelCreating(modelBuilder);
        }
    }
}
