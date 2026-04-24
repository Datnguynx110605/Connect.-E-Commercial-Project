using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Queries.GetAllReviews
{
    public sealed record GetAllReviewsQuery:IRequest<IEnumerable<ReviewDto>>
    {
    }
}
