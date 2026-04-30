using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Queries.GetUserByEmail
{
    internal sealed class GetUserByEmailHandler : IRequestHandler<GetUserByEmailQuery, UserDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetUserByEmailHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<UserDto> Handle(GetUserByEmailQuery request, CancellationToken cancellationToken)
        {
            Email email = Email.Create(request.Email);
            var user = await unitOfWork.Users.FirstOrDefaultNoTrackingAsync(x => x.Email == email, cancellationToken);
            if (user == null)
                throw new Exception("No users found");

            return new UserDto
            {
                UserName = user.UserName.Value,
                Email = user.Email.Value,
                PhoneNumber = user.PhoneNumber.Value,
                Address = user.Address,
                OAuthProviderName = null,
                CreatedAt = user.CreatedAt
            };
        }
    }
}
