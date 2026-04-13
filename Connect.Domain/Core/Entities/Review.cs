using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Core.Entities
{
    public class Review:AggregateRoot
    {
        public int ReviewID { get; private set; }
        public int UserID { get; private set; }
        public int ProductID { get; private set; }
        public Amount Rating { get; private set; }
        public string Body { get; private set; }
        public DateTime CreatedAt { get; private set; }
        private Review() { }
        private Review(int userID,int productID, Amount rate, string body)
        {
            UserID = userID;
            ProductID = productID;
            Rating = rate;
            Body = body;
            CreatedAt = DateTime.UtcNow;
        }

        public static Review CreateReview(int userID,int productID, Amount rate, string body)
        {
            if (userID <= 0)
                throw new DomainExceptions(
                    message: "UserID is invalid",
                    code: "INVALID-USERID",
                    metadata: new Dictionary<string, object>
                    {
                        { "UserID", userID }
                    });

            if (productID <= 0)
                throw new DomainExceptions(
                    message: "ProductID is invalid",
                    code: "INVALID-ProductID",
                    metadata: new Dictionary<string, object>
                    {
                        { "ProductID", productID }
                    });

            if(string.IsNullOrWhiteSpace(body))
                throw new DomainExceptions(
                    message: "Review body is required",
                    code: "REQUIRED-REVIEWBODY",
                    metadata: new Dictionary<string, object>
                    {
                        { "REVIEWBODY", body }
                    });

            if(body.Length < 5 || body.Length > 300)
                throw new DomainExceptions(
                    message: "Review body is invalid",
                    code: "INVALID-REVIEWBODY",
                    metadata: new Dictionary<string, object>
                    {
                        { "REVIEWBODY", body }
                    });

            return new Review(userID, productID, rate, body);
        }

        public void UpdateReview(Amount rate, string body)
        {
            if (body.Length < 5 || body.Length > 300)
                throw new DomainExceptions(
                    message: "Review body is invalid",
                    code: "INVALID-REVIEWBODY",
                    metadata: new Dictionary<string, object>
                    {
                        { "REVIEWBODY", body }
                    });

            Rating = rate;
            Body = body;
        }
    }
}
