using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace Connect.Application.Interfaces.Persistences
{
    public interface IRepository<T, TKey> where T : class
    {
        Task<IEnumerable<T>> GetAllNoTrackingAsync(CancellationToken cancellationToken = default);

        Task<T?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default);

        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
        Task<T?> FirstOrDefaultNoTrackingAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

        Task<IEnumerable<T>> WhereAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> WhereNoTrackingAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

        Task AddAsync(T entity, CancellationToken cancellationToken = default);
        void Update(T entity);
        void Remove(T entity);

        Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
        void UpdateRange(IEnumerable<T> entities);
        void RemoveRange(IEnumerable<T> entities);
    }
}
