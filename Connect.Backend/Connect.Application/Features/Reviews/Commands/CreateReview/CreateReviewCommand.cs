using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Commands.CreateReview
{
    public sealed record CreateReviewCommand:IRequest<ReviewDto>
    {
        public int ProductID { get; init; }
        public int Rating { get; init; }
        public string Body { get; init; }
    }
}
