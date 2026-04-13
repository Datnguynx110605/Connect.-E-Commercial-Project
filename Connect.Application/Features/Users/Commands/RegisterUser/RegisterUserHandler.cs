using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.RegisterUser
{
    internal sealed class RegisterUserHandler : IRequestHandler<RegisterUserCommand, UserDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IPasswordService passwordService;
        public RegisterUserHandler(IUnitOfWork _unitOfWork, IPasswordService _passwordService)
        {
            unitOfWork = _unitOfWork;
            passwordService = _passwordService;
        }

        public async Task<UserDto> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            bool emailExist = await unitOfWork.Users.AnyAsync(x => x.Email.Value == request.Email, cancellationToken);
            if (emailExist)
                throw new Exception("Email already exists");

            string hashedPassword = passwordService.Hash(request.Password);

            UserName name = UserName.Create(request.UserName);
            Email email = Email.Create(request.Email);
            PhoneNumber phone = PhoneNumber.Create(request.PhoneNumber);
            PasswordHash passwordHashed = PasswordHash.Create(hashedPassword);
            string address = request.Address;

            User user = User.CreateUserProfile(name, email, phone, passwordHashed, address);

            await unitOfWork.Users.AddAsync(user, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new UserDto
            {
                UserName = user.UserName.Value,
                Email = user.Email.Value,
                PhoneNumber = user.PhoneNumber.Value,
                Address=user.Address,
                CreatedAt=user.CreatedAt
            };
        }
    }
}
