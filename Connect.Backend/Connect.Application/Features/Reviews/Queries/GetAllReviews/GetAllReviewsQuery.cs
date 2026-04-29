using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Queries.GetAllReviews
{
    public sealed record GetAllReviewsQuery(int Page = 1, int PageSize = 10): IRequest<PagedResult<ReviewDto>>
    {
    }
}
