namespace GreenSolution.Core.DTOs.Order
{
    public class CreateOrderRequest
    {
        public string ReceiverName { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string? Notes { get; set; }
    }
}
