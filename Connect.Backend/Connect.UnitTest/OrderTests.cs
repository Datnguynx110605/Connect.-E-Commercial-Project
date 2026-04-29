using Connect.Domain.Common;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.Enums;
using Connect.Domain.Core.ValueObjects;
using Connect.Domain.Events.OrderEvents;
using FluentAssertions;
using Xunit;

namespace Connect.Domain.Tests.Entities;

public class OrderTests
{
    // ── Shared helpers ────────────────────────────────────────────────────────

    private static OrderItem Item(int productID = 1, decimal price = 10_000_000m, int qty = 1) =>
        OrderItem.CreateOrderItem(productID, Currency.Create(price), Amount.Create(qty));

    private static Order PlaceOrder(
        int              userID       = 1,
        int?             couponID     = null,
        ShippingMethod   shipping     = ShippingMethod.Fast,
        PaymentMethod    payment      = PaymentMethod.Cash,
        IEnumerable<OrderItem>? items = null,
        decimal          discount     = 0m)
    {
        var orderItems = items ?? [Item()];
        return Order.CreateOrder(userID, couponID, shipping, payment, orderItems, Currency.Create(discount));
    }

    // ── CreateOrder ───────────────────────────────────────────────────────────

    [Fact]
    public void CreateOrder_WithValidData_ShouldSucceed()
    {
        var order = PlaceOrder();
        order.Should().NotBeNull();
        order.OrderStatus.Should().Be(OrderStatus.Pending);
        order.UserID.Should().Be(1);
    }

    [Fact]
    public void CreateOrder_ShouldRaiseOrderPlacedEvent()
    {
        var order = PlaceOrder();
        order.DomainEvents.Should().ContainSingle()
             .Which.Should().BeOfType<OrderPlacedEvent>();
    }

    [Fact]
    public void CreateOrder_WithInvalidUserID_ShouldThrowDomainException()
    {
        var act = () => PlaceOrder(userID: 0);
        act.Should().Throw<DomainExceptions>()
           .WithMessage("User id is invalid")
           .And.Code.Should().Be("INVALID-USERID");
    }

    [Fact]
    public void CreateOrder_WithNegativeUserID_ShouldThrowDomainException()
    {
        var act = () => PlaceOrder(userID: -1);
        act.Should().Throw<DomainExceptions>().WithMessage("User id is invalid");
    }

    [Fact]
    public void CreateOrder_WithEmptyOrderItems_ShouldThrowDomainException()
    {
        var act = () => PlaceOrder(items: []);
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Order item is required")
           .And.Code.Should().Be("REQUIRED-ORDERITEM");
    }

    [Fact]
    public void CreateOrder_WithCashPayment_ShouldSetPaymentStatusUnpaid()
    {
        var order = PlaceOrder(payment: PaymentMethod.Cash);
        order.OrderPaymentStatus.Should().Be(PaymentStatus.Unpaid);
    }

    [Fact]
    public void CreateOrder_WithOnlineBankingPayment_ShouldSetPaymentStatusPending()
    {
        var order = PlaceOrder(payment: PaymentMethod.OnlineBanking);
        order.OrderPaymentStatus.Should().Be(PaymentStatus.Pending);
    }

    [Fact]
    public void CreateOrder_WithVNPAYPayment_ShouldSetPaymentStatusPending()
    {
        var order = PlaceOrder(payment: PaymentMethod.VNPAY);
        order.OrderPaymentStatus.Should().Be(PaymentStatus.Pending);
    }

    // ── CalculateTotalPrice / Shipping fees ────────────────────────────────────

    [Fact]
    public void CreateOrder_WithFastShipping_ShouldAddFastFee()
    {
        // One item: 10_000_000. Fast fee: 50_000
        var order = PlaceOrder(shipping: ShippingMethod.Fast, items: [Item(price: 10_000_000m)]);
        order.OrderTotalItemPrice.Value.Should().Be(10_050_000m);
    }

    [Fact]
    public void CreateOrder_WithSuperFastShipping_ShouldAddSuperFastFee()
    {
        // One item: 10_000_000. SuperFast fee: 80_000
        var order = PlaceOrder(shipping: ShippingMethod.SuperFast, items: [Item(price: 10_000_000m)]);
        order.OrderTotalItemPrice.Value.Should().Be(10_080_000m);
    }

    /// <summary>
    /// Known bug: Standard shipping applies BOTH 30_000 AND 80_000 due to missing else-if.
    /// This test documents the ACTUAL (buggy) behaviour so it fails immediately when the bug is fixed.
    /// </summary>
    [Fact]
    public void CreateOrder_WithStandardShipping_BuggyBehaviourAdds110000()
    {
        var order = PlaceOrder(shipping: ShippingMethod.Standard, items: [Item(price: 10_000_000m)]);
        // BUG: should be 10_030_000 but is 10_110_000 (30_000 + 80_000)
        order.OrderTotalItemPrice.Value.Should().Be(10_110_000m,
            because: "Standard shipping currently applies both 30k and 80k fees (known bug)");
    }

    [Fact]
    public void CreateOrder_WithCoupon_ShouldSubtractDiscount()
    {
        var order = PlaceOrder(couponID: 1, shipping: ShippingMethod.Fast,
                               items: [Item(price: 10_000_000m)], discount: 500_000m);
        // Total items + shipping = 10_050_000; final = 10_050_000 - 500_000 = 9_550_000
        order.OrderFinalPrice.Value.Should().Be(9_550_000m);
    }

    [Fact]
    public void CreateOrder_WithoutCoupon_FinalPriceShouldEqualTotalItemPrice()
    {
        var order = PlaceOrder(couponID: null, shipping: ShippingMethod.Fast,
                               items: [Item(price: 10_000_000m)]);
        order.OrderFinalPrice.Value.Should().Be(order.OrderTotalItemPrice.Value);
    }

    [Fact]
    public void CreateOrder_MultipleItems_ShouldSumCorrectly()
    {
        var items = new[] { Item(1, 5_000_000m, 2), Item(2, 1_000_000m, 3) };
        // 5M * 2 + 1M * 3 = 13M; Fast = +50k → 13_050_000
        var order = PlaceOrder(shipping: ShippingMethod.Fast, items: items);
        order.OrderTotalItemPrice.Value.Should().Be(13_050_000m);
    }

    // ── CancelOrder ───────────────────────────────────────────────────────────

    [Fact]
    public void CancelOrder_WhenPending_ShouldSetStatusToCancelled()
    {
        var order = PlaceOrder();
        order.ClearDomainEvents();
        order.CancelOrder();
        order.OrderStatus.Should().Be(OrderStatus.Cancelled);
    }

    [Fact]
    public void CancelOrder_ShouldRaiseOrderCancelledEvent()
    {
        var order = PlaceOrder();
        order.ClearDomainEvents();
        order.CancelOrder();
        order.DomainEvents.Should().ContainSingle()
             .Which.Should().BeOfType<OrderCancelledEvent>();
    }

    [Fact]
    public void CancelOrder_WhenAlreadyShipping_ShouldThrowDomainException()
    {
        var order = PlaceOrder();
        order.ClearDomainEvents();
        order.MarkOrderStatusToShipping();
        var act = () => order.CancelOrder();
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Order is already shipped")
           .And.Code.Should().Be("UNABLE-CANCELORDER");
    }

    [Fact]
    public void CancelOrder_WhenAlreadyCancelled_ShouldThrowDomainException()
    {
        var order = PlaceOrder();
        order.ClearDomainEvents();
        order.CancelOrder();
        var act = () => order.CancelOrder();
        act.Should().Throw<DomainExceptions>().WithMessage("Order is already shipped");
    }

    // ── MarkOrderStatusToShipping ─────────────────────────────────────────────

    [Fact]
    public void MarkOrderStatusToShipping_WhenPending_ShouldSetToShipping()
    {
        var order = PlaceOrder();
        order.MarkOrderStatusToShipping();
        order.OrderStatus.Should().Be(OrderStatus.Shipping);
    }

    [Fact]
    public void MarkOrderStatusToShipping_WhenCancelled_ShouldThrowDomainException()
    {
        var order = PlaceOrder();
        order.ClearDomainEvents();
        order.CancelOrder();
        var act = () => order.MarkOrderStatusToShipping();
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Order is cancelled")
           .And.Code.Should().Be("INVALID-STATUS");
    }

    // ── MarkOrderStatusToCompleted ────────────────────────────────────────────

    [Fact]
    public void MarkOrderStatusToCompleted_WhenShippingAndPaid_ShouldSetCompleted()
    {
        var order = PlaceOrder(payment: PaymentMethod.OnlineBanking);
        order.MarkOrderStatusToShipping();
        order.MarkAsPaid();
        order.MarkOrderStatusToCompleted();
        order.OrderStatus.Should().Be(OrderStatus.Completed);
    }

    [Fact]
    public void MarkOrderStatusToCompleted_ShouldRaiseOrderCompletedEvent()
    {
        var order = PlaceOrder(payment: PaymentMethod.OnlineBanking);
        order.MarkOrderStatusToShipping();
        order.MarkAsPaid();
        order.ClearDomainEvents();
        order.MarkOrderStatusToCompleted();
        order.DomainEvents.Should().ContainSingle()
             .Which.Should().BeOfType<OrderCompletedEvent>();
    }

    [Fact]
    public void MarkOrderStatusToCompleted_WhenUnpaid_ShouldThrowDomainException()
    {
        var order = PlaceOrder(payment: PaymentMethod.Cash); // starts Unpaid
        order.MarkOrderStatusToShipping();
        var act = () => order.MarkOrderStatusToCompleted();
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Order is unpaid or cancelled")
           .And.Code.Should().Be("INVALID-STATUS");
    }

    [Fact]
    public void MarkOrderStatusToCompleted_WhenCancelled_ShouldThrowDomainException()
    {
        var order = PlaceOrder(payment: PaymentMethod.OnlineBanking);
        order.ClearDomainEvents();
        order.CancelOrder();
        var act = () => order.MarkOrderStatusToCompleted();
        act.Should().Throw<DomainExceptions>().WithMessage("Order is unpaid or cancelled");
    }

    // ── MarkAsPaid (admin manual) ─────────────────────────────────────────────

    [Fact]
    public void MarkAsPaid_WhenPending_ShouldSetPaid()
    {
        var order = PlaceOrder(payment: PaymentMethod.OnlineBanking);
        order.MarkAsPaid();
        order.OrderPaymentStatus.Should().Be(PaymentStatus.Paid);
    }

    [Fact]
    public void MarkAsPaid_WhenAlreadyPaid_ShouldThrowDomainException()
    {
        var order = PlaceOrder(payment: PaymentMethod.OnlineBanking);
        order.MarkAsPaid();
        var act = () => order.MarkAsPaid();
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Order is already paid")
           .And.Code.Should().Be("PAID-ORDER");
    }

    [Fact]
    public void MarkAsPaid_WhenCancelled_ShouldThrowDomainException()
    {
        var order = PlaceOrder(payment: PaymentMethod.OnlineBanking);
        order.ClearDomainEvents();
        order.CancelOrder();
        var act = () => order.MarkAsPaid();
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Order is already cancelled")
           .And.Code.Should().Be("CANCELLED-ORDER");
    }

    // ── MarkAsPaidForPaymentGateway ───────────────────────────────────────────

    [Fact]
    public void MarkAsPaidForPaymentGateway_WithSuccess_ShouldSetPaidAndRaiseEvent()
    {
        var order = PlaceOrder(payment: PaymentMethod.VNPAY);
        order.ClearDomainEvents();
        order.MarkAsPaidForPaymentGateway(true);
        order.OrderPaymentStatus.Should().Be(PaymentStatus.Paid);
        order.DomainEvents.Should().ContainSingle()
             .Which.Should().BeOfType<OrderPaidEvent>();
    }

    [Fact]
    public void MarkAsPaidForPaymentGateway_WithFailure_ShouldThrowDomainException()
    {
        var order = PlaceOrder(payment: PaymentMethod.VNPAY);
        var act   = () => order.MarkAsPaidForPaymentGateway(false);
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Order has not been paid or paid failed")
           .And.Code.Should().Be("FAILED-PAID");
    }

    [Fact]
    public void MarkAsPaidForPaymentGateway_WhenAlreadyPaid_ShouldThrowDomainException()
    {
        var order = PlaceOrder(payment: PaymentMethod.VNPAY);
        order.MarkAsPaidForPaymentGateway(true);
        order.ClearDomainEvents();
        var act = () => order.MarkAsPaidForPaymentGateway(true);
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Order is already paid")
           .And.Code.Should().Be("PAID-ORDER");
    }

    [Fact]
    public void MarkAsPaidForPaymentGateway_WhenCancelled_ShouldThrowDomainException()
    {
        var order = PlaceOrder(payment: PaymentMethod.VNPAY);
        order.ClearDomainEvents();
        order.CancelOrder();
        var act = () => order.MarkAsPaidForPaymentGateway(true);
        act.Should().Throw<DomainExceptions>()
           .WithMessage("Order is already cancelled")
           .And.Code.Should().Be("CANCELLED-ORDER");
    }

    // ── OrderItems collection ─────────────────────────────────────────────────

    [Fact]
    public void CreateOrder_OrderItemsCollection_ShouldBeReadOnly()
    {
        var order = PlaceOrder(items: [Item(1), Item(2), Item(3)]);
        order.OrderItems.Count.Should().Be(3);
        order.OrderItems.Should().BeAssignableTo<IReadOnlyCollection<OrderItem>>();
    }
}
