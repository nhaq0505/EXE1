namespace GreenSolution.Core.Entities
{
    public class CartItem
    {
        public int Id { get; set; }
        public string CartId { get; set; } = null!;
        public Cart Cart { get; set; } = null!;

        public string ProductId { get; set; } = null!;
        public Product Product { get; set; } = null!;

        public int Quantity { get; set; }
    }
}
