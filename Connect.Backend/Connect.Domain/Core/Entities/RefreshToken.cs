using Connect.Domain.Common;
using System;
using System.Collections.Generic;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace Connect.Domain.Core.Entities
{
    public class RefreshToken
    {
        public int RefreshTokenID { get; private set; }
        public int UserID { get; private set; }
        public string RefreshTokens { get; private set; }
        public DateTime ExpiryDate { get; private set; }
        public bool IsRevoked { get; private set; }
        public DateTime CreatedAt { get; private set; }
        private RefreshToken() { }
        private RefreshToken(int userID)
        {
            UserID = userID;
            RefreshTokens = GenerateRefreshToken();
            ExpiryDate = DateTime.UtcNow.AddDays(7);
            IsRevoked = false;
            CreatedAt = DateTime.UtcNow;
        }

        public static RefreshToken CreateRefreshToken(int userID)
        {
            if(userID <= 0)
                throw new DomainExceptions(
                    message: "UserID is invalid",
                    code: "INVALID-USERID",
                    metadata: new Dictionary<string, object>
                    {
                        { "USERID", userID }
                    });

            return new RefreshToken(userID);
        }

        private static string GenerateRefreshToken()
        {
            byte[] randomBytes = new byte[64];
            using RandomNumberGenerator rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        public void VerifyRefreshToken()
        {
            if(ExpiryDate < DateTime.UtcNow)
                throw new DomainExceptions(
                    message: "RefreshToken is expired",
                    code: "EXPIRE-RFRESHTOKEN");

            if(IsRevoked)
                throw new DomainExceptions(
                    message: "RefreshToken is no longer active",
                    code: "INVALID-RFRESHTOKEN");
        }

        public void RevokeRefreshToken()
        {
            if (IsRevoked) return;
            IsRevoked = true;
        }
    }
}
