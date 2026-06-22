namespace GreenSolution.Core.Entities
{
    public class Cart
    {
        public string Id { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public User User { get; set; } = null!;

        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
