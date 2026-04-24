using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Queries.GetReviewByProduct
{
    public sealed record GetReviewByProductQuery:IRequest<ReviewDto>
    {
        public int ProductID { get; init; }
    }
}
