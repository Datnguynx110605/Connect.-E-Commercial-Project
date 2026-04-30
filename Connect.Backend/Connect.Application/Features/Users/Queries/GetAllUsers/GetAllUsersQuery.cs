using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Queries.GetAllUsers
{
    public sealed record GetAllUsersQuery(int Page = DefaultPagination.Page, int PageSize = DefaultPagination.PageSize) : IRequest<PagedResult<UserDto>>
    {
    }
}
