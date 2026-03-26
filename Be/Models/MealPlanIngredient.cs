using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GreenSolution.API.Models
{
    public class MealPlanIngredient : BaseEntity
    {
        [Required]
        public Guid MealPlanId { get; set; }

        [Required]
        public Guid ProductId { get; set; }

        [Required]
        public float Quantity { get; set; }

        [MaxLength(50)]
        public string Unit { get; set; }

        [ForeignKey("MealPlanId")]
        public virtual MealPlan MealPlan { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; }
    }
}
