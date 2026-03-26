using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GreenSolution.API.Models
{
    public class Order : BaseEntity
    {
        
        [Required]
        public Guid UserId { get; set; }
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }
        [Required]
        public string Status { get; set; } = "PENDING";
        [Required]
        public string ShippingName { get; set; }
        [Required]
        public string ShippingPhone { get; set; }
        [Required]
        public string ShippingAddress { get; set; }
        
        [ForeignKey("UserId")]
        public virtual User User { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

       
        
    }
}
