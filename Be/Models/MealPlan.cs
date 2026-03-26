using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GreenSolution.API.Models
{
    public class MealPlan : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        public string Dishes { get; set; } // JSON String: ["Gà hấp", "Canh bí"]

        [MaxLength(200)]
        public string TargetAudience { get; set; }

        public int Calories { get; set; }

        public string Features { get; set; } // JSON String: ["Zero Waste"]

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        public virtual ICollection<MealPlanIngredient> MealPlanIngredients { get; set; } = new List<MealPlanIngredient>();
    }
}
