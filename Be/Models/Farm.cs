using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace GreenSolution.API.Models
{
    public class Farm : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        public string Image { get; set; }

        public string Description { get; set; }

        [MaxLength(200)]
        public string Location { get; set; }

        public float Rating { get; set; }

        public string VideoUrl { get; set; }

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
