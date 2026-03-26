using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GreenSolution.API.Constant;
using Microsoft.EntityFrameworkCore;

namespace GreenSolution.API.Models
{
    public class User : BaseEntity
    {
        

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = AppRole.Customer;

        [MaxLength(20)]
        public string PhoneNumber { get; set; }

        [MaxLength(500)]
        public string Address { get; set; }

        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
