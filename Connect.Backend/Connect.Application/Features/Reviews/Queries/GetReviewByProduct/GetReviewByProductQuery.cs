using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Queries.GetReviewByProduct
{
    public sealed record GetReviewByProductQuery(int Page = 1, int PageSize = 10):IRequest<PagedResult<ReviewDto>>
    {
        public int ProductID { get; init; }
    }
}
