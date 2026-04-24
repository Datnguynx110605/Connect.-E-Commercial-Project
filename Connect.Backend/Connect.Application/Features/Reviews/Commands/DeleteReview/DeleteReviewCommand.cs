using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Commands.DeleteReview
{
    public sealed record DeleteReviewCommand:IRequest<string>
    {
        public int ReviewID { get; init; }
    }
}
