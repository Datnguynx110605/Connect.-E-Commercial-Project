using Connect.Domain.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Xml.Linq;

namespace Connect.Application.Interfaces.Persistences
{
    public interface IUnitOfWork:IDisposable
    {
        IRepository<User, int> Users { get; }
        IRepository<Product, int> Products { get; }
        IRepository<Category, int> Categories { get; }
        IRepository<Order, int> Orders { get; }
        IRepository<OrderItem, int> OrderItems { get; }
        IRepository<Cart, int> Carts { get; }
        IRepository<RefreshToken, int> RefreshTokens { get; }
        IRepository<Coupon, int> Coupons { get; }
        IRepository<Review, int> Reviews { get; }
        IRepository<Payment, int> Payments { get; }

        Task BeginTransactionAsync(CancellationToken cancellationToken = default);
        Task CommitTransactionAsync(CancellationToken cancellationToken = default);
        Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
