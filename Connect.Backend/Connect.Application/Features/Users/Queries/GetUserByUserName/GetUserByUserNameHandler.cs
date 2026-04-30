using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Queries.GetUserByUserName
{
    internal sealed class GetUserByUserNameHandler : IRequestHandler<GetUserByUserNameQuery, UserDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetUserByUserNameHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<UserDto> Handle(GetUserByUserNameQuery request, CancellationToken cancellationToken)
        {
            UserName userName = UserName.Create(request.UserName);
            var user = await unitOfWork.Users.FirstOrDefaultNoTrackingAsync(x => x.UserName == userName, cancellationToken);
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
