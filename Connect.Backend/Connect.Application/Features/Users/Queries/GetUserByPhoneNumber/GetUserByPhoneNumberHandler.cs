using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Queries.GetUserByPhoneNumber
{
    internal sealed class GetUserByPhoneNumberHandler : IRequestHandler<GetUserByPhoneNumberQuery, UserDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetUserByPhoneNumberHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<UserDto> Handle(GetUserByPhoneNumberQuery request, CancellationToken cancellationToken)
        {
            PhoneNumber phoneNumber = PhoneNumber.Create(request.PhoneNumber);
            var user = await unitOfWork.Users.FirstOrDefaultNoTrackingAsync(x => x.PhoneNumber == phoneNumber, cancellationToken);
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
