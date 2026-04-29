using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Queries.GetAllUsers
{
    internal sealed class GetAllUsersHandler : IRequestHandler<GetAllUsersQuery, PagedResult<UserDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllUsersHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<PagedResult<UserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
        {
            var (items, total) = await unitOfWork.Users.GetPagedAsync(request.Page, request.PageSize, cancellationToken: cancellationToken);
            if (!items.Any())
                throw new Exception("No users found");

            return new PagedResult<UserDto>
            {
                Items = items.Select(x => new UserDto
                {
                    UserName = x.UserName.Value,
                    Email = x.Email.Value,
                    PhoneNumber = x.PhoneNumber?.Value,
                    Address = x.Address,
                    OAuthProviderName = x.OAuthProviderName,
                    CreatedAt = x.CreatedAt
                }).ToList(),
                TotalCount = total,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
