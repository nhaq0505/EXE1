using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GreenSolution.API.Models
{
    public class Product : BaseEntity
    {
        [Required]
        public Guid FarmId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        public string Image { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [MaxLength(100)]
        public string Category { get; set; }

        [MaxLength(50)]
        public string Unit { get; set; }

        public int Stock { get; set; }

        public bool IsActive { get; set; } = true;

        [ForeignKey("FarmId")]
        public virtual Farm Farm { get; set; }

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public virtual ICollection<MealPlanIngredient> MealPlanIngredients { get; set; } = new List<MealPlanIngredient>();
    }
}
