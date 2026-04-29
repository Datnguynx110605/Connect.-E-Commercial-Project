using Connect.Application.Interfaces.Persistences;
using Connect.Infrastructure.Data.MyDbContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace Connect.Infrastructure.Persistences
{
    public class GenericRepository<T, TKey> : IRepository<T, TKey> where T : class
    {
        protected readonly ConnectDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public GenericRepository(ConnectDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<(IReadOnlyList<T> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 50);

            IQueryable<T> query = _dbSet.AsNoTracking();

            int totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        public async Task<T?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default)
        {

            return await _dbSet.FindAsync(new object[] { id! }, cancellationToken);
        }

        public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .FirstOrDefaultAsync(predicate, cancellationToken);
        }

        public async Task<T?> FirstOrDefaultNoTrackingAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(predicate, cancellationToken);
        }

        public async Task<IEnumerable<T>> WhereAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Where(predicate)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<T>> WhereNoTrackingAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(predicate)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .AnyAsync(predicate, cancellationToken);
        }

        public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
        {
            await _dbSet.AddAsync(entity, cancellationToken);
        }

        public void Update(T entity)
        {
            _dbSet.Update(entity);
        }

        public void Remove(T entity)
        {
            _dbSet.Remove(entity);
        }

        public async Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
        {
            await _dbSet.AddRangeAsync(entities, cancellationToken);
        }

        public void UpdateRange(IEnumerable<T> entities)
        {
            _dbSet.UpdateRange(entities);
        }

        public void RemoveRange(IEnumerable<T> entities)
        {
            _dbSet.RemoveRange(entities);
        }
    }
}
