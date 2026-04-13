using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Queries.GetAllUsers
{
    internal sealed class GetAllUsersHandler : IRequestHandler<GetAllUsersQuery, IEnumerable<UserDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllUsersHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<IEnumerable<UserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
        {
            var user = await unitOfWork.Users.GetAllNoTrackingAsync(cancellationToken);
            if (user == null)
                throw new Exception("User not found");

            return user.Select(x => new UserDto
            {
                UserName = x.UserName.Value,
                Email = x.Email.Value,
                PhoneNumber = x.PhoneNumber.Value,
                Address = x.Address
            });
        }
    }
}
