using Connect.Domain.Common;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using Connect.Domain.Events.UserEvents;
using FluentAssertions;
using Xunit;

namespace Connect.Domain.Tests.Entities;

public class UserTests
{
    // ── Shared helpers ────────────────────────────────────────────────────────

    private const string ValidHash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/AwHAb.bm5nCrfVS5G";

    private static User BuildUser(
        string name     = "johndoe",
        string email    = "john@example.com",
        string phone    = "0912345678",
        string password = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/AwHAb.bm5nCrfVS5G",
        string address  = "123 Main St",
        string provider = "") =>
        User.CreateUserProfile(
            UserName.Create(name),
            Email.Create(email),
            PhoneNumber.Create(phone),
            PasswordHash.Create(password),
            address,
            provider);

    // ── CreateUserProfile ─────────────────────────────────────────────────────

    [Fact]
    public void CreateUserProfile_WithValidData_ShouldCreateUser()
    {
        var user = BuildUser();
        user.Should().NotBeNull();
        user.UserName.Value.Should().Be("johndoe");
        user.Email.Value.Should().Be("john@example.com");
        user.Role.Should().Be("Customer");
    }

    [Fact]
    public void CreateUserProfile_WithEmptyAddress_ShouldThrowDomainException()
    {
        var act = () => BuildUser(address: "");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Address must be required")
           .And.Code.Should().Be("REQUIRED-ADDRESS");
    }

    [Fact]
    public void CreateUserProfile_WithWhitespaceAddress_ShouldThrowDomainException()
    {
        var act = () => BuildUser(address: "   ");
        act.Should().Throw<DomainExceptions>().WithMessage("Address must be required");
    }

    [Fact]
    public void CreateUserProfile_ShouldRaiseUserRegisterEvent()
    {
        var user = BuildUser();
        user.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<UserRegisterEvent>();
    }

    [Fact]
    public void CreateUserProfile_RegisterEvent_ShouldContainEmailAndName()
    {
        var user = BuildUser(name: "alice", email: "alice@test.com");
        var evt  = user.DomainEvents.OfType<UserRegisterEvent>().Single();
        evt.UserName.Value.Should().Be("alice");
        evt.UserEmail.Value.Should().Be("alice@test.com");
    }

    // ── CreateOAuthUserProfile ────────────────────────────────────────────────

    [Fact]
    public void CreateOAuthUserProfile_WithValidProvider_ShouldCreateUser()
    {
        var user = User.CreateOAuthUserProfile(
            UserName.Create("googleuser"),
            Email.Create("guser@gmail.com"),
            "Google");

        user.Should().NotBeNull();
        user.OAuthProviderName.Should().Be("Google");
        user.PasswordHash.Should().BeNull();
    }

    [Fact]
    public void CreateOAuthUserProfile_WithEmptyProvider_ShouldThrowDomainException()
    {
        var act = () => User.CreateOAuthUserProfile(
            UserName.Create("googleuser"),
            Email.Create("guser@gmail.com"),
            "");
        act.Should().Throw<DomainExceptions>()
           .WithMessage("OAuth provider cannot be empty.")
           .And.Code.Should().Be("REQUIRED-OAUTHPROVIDER");
    }

    [Fact]
    public void CreateOAuthUserProfile_ShouldRaiseUserRegisterEvent()
    {
        var user = User.CreateOAuthUserProfile(
            UserName.Create("oauthuser"),
            Email.Create("oauth@example.com"),
            "GitHub");
        user.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<UserRegisterEvent>();
    }

    // ── UpdateUserProfile ─────────────────────────────────────────────────────

    [Fact]
    public void UpdateUserProfile_WithValidData_ShouldUpdateFields()
    {
        var user = BuildUser();
        user.ClearDomainEvents();

        user.UpdateUserProfile(
            UserName.Create("janedoe"),
            Email.Create("jane@example.com"),
            PhoneNumber.Create("0987654321"),
            "456 New Address");

        user.UserName.Value.Should().Be("janedoe");
        user.Email.Value.Should().Be("jane@example.com");
        user.Address.Should().Be("456 New Address");
    }

    [Fact]
    public void UpdateUserProfile_WithEmptyAddress_ShouldThrowDomainException()
    {
        var user = BuildUser();
        var act  = () => user.UpdateUserProfile(
            UserName.Create("janedoe"),
            Email.Create("jane@example.com"),
            PhoneNumber.Create("0987654321"),
            "");
        act.Should().Throw<DomainExceptions>().WithMessage("Address must be required");
    }

    // ── UpdateUserPassword ────────────────────────────────────────────────────

    [Fact]
    public void UpdateUserPassword_WithNewHash_ShouldUpdatePassword()
    {
        var user    = BuildUser();
        // A different valid BCrypt hash
        var newHash = "$2b$12$abcdefghijklmnopqrstuuVGliJnJmEp9GQdEn9gG7bFkAkAkAkAkA";
        user.UpdateUserPassword(PasswordHash.Create(newHash));
        user.PasswordHash!.Value.Should().Be(newHash);
    }

    [Fact]
    public void UpdateUserPassword_WithSameHash_ShouldThrowDomainException()
    {
        var user = BuildUser();
        var act  = () => user.UpdateUserPassword(PasswordHash.Create(ValidHash));
        act.Should().Throw<DomainExceptions>()
           .WithMessage("New password must not be matched to the old password")
           .And.Code.Should().Be("INVALID-PASSWORDHASH");
    }

    // ── ClearDomainEvents ─────────────────────────────────────────────────────

    [Fact]
    public void ClearDomainEvents_ShouldEmptyTheEventList()
    {
        var user = BuildUser();
        user.DomainEvents.Should().NotBeEmpty();
        user.ClearDomainEvents();
        user.DomainEvents.Should().BeEmpty();
    }
}
