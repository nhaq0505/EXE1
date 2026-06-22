namespace GreenSolution.Core.Entities
{
    public class OrderItem
    {
        public int Id { get; set; }
        public string OrderId { get; set; } = null!;
        public Order Order { get; set; } = null!;

        public string ProductId { get; set; } = null!;
        public Product Product { get; set; } = null!;

        public string ProductName { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
