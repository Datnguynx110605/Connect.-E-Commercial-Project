using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Commands.UpdateReview
{
    public sealed record UpdateReviewCommand:IRequest<ReviewDto>
    {
        public int ReviewID { get; init; }
        public int Rating { get; init; }
        public string Body { get; init; }
    }
}
