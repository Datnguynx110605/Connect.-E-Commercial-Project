using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.Entities;
using Connect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Persistences
{
    public class UnitOfWork:IUnitOfWork
    {
        private readonly ConnectDbContext _context;
        private IDbContextTransaction? _transaction;
        public IRepository<User, int> Users { get; }
        public IRepository<Product, int> Products { get; }
        public IRepository<Category, int> Categories { get; }
        public IRepository<Order, int> Orders { get; }
        public IRepository<OrderItem, int> OrderItems { get; }
        public IRepository<RefreshToken, int> RefreshTokens { get; }
        public IRepository<Cart, int> Carts { get; }
        public IRepository<Coupon, int> Coupons { get; }
        public IRepository<Review, int> Reviews { get; }
        public IRepository<Payment, int> Payments { get; }

        public UnitOfWork(ConnectDbContext context)
        {
            _context = context;

            Users = new GenericRepository<User, int>(_context);
            Products = new GenericRepository<Product, int>(_context);
            Categories = new GenericRepository<Category, int>(_context);
            Orders = new GenericRepository<Order, int>(_context);
            OrderItems = new GenericRepository<OrderItem, int>(_context);
            RefreshTokens = new GenericRepository<RefreshToken, int>(_context);
            Carts = new GenericRepository<Cart, int>(_context);
            Coupons = new GenericRepository<Coupon, int>(_context);
            Reviews = new GenericRepository<Review, int>(_context);
            Payments = new GenericRepository<Payment, int>(_context);
        }

        public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_transaction != null) return;

            _transaction = await _context.Database
                .BeginTransactionAsync(cancellationToken);
        }

        public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_transaction == null) return;

            try
            {
                await _context.SaveChangesAsync(cancellationToken);
                await _transaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await RollbackTransactionAsync(cancellationToken);
                throw;
            }
            finally
            {
                await DisposeTransactionAsync();
            }
        }

        public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_transaction == null) return;

            await _transaction.RollbackAsync(cancellationToken);
            await DisposeTransactionAsync();
        }

        private async Task DisposeTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}

