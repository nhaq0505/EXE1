using Microsoft.EntityFrameworkCore;
using GreenSolution.Core.Entities;

namespace GreenSolution.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Farm> Farms { get; set; } = null!;
        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<MealPlan> MealPlans { get; set; } = null!;
        public DbSet<MealPlanIngredient> MealPlanIngredients { get; set; } = null!;
        public DbSet<Cart> Carts { get; set; } = null!;
        public DbSet<CartItem> CartItems { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.Property(u => u.Id).ValueGeneratedNever();
                entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.PasswordHash).IsRequired();
                entity.Property(u => u.Phone).HasMaxLength(20);
                entity.Property(u => u.Address).HasMaxLength(500);
                entity.Property(u => u.RefreshToken).HasMaxLength(500);
                entity.Property(u => u.Role).HasConversion<string>();
            });

            // Farm configuration
            modelBuilder.Entity<Farm>(entity =>
            {
                entity.HasKey(f => f.Id);
                entity.Property(f => f.Id).ValueGeneratedNever();
                entity.Property(f => f.Name).IsRequired().HasMaxLength(200);
                entity.Property(f => f.Location).IsRequired().HasMaxLength(250);

                entity.HasOne(f => f.Owner)
                    .WithOne(u => u.Farm)
                    .HasForeignKey<Farm>(f => f.OwnerId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Product configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Id).ValueGeneratedNever();
                entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
                entity.Property(p => p.Category).IsRequired().HasMaxLength(100);
                entity.Property(p => p.Unit).IsRequired().HasMaxLength(50);
                entity.Property(p => p.Price).HasPrecision(18, 2);

                entity.HasOne(p => p.Farm)
                    .WithMany(f => f.Products)
                    .HasForeignKey(p => p.FarmId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // MealPlan configuration
            modelBuilder.Entity<MealPlan>(entity =>
            {
                entity.HasKey(mp => mp.Id);
                entity.Property(mp => mp.Id).ValueGeneratedNever();
                entity.Property(mp => mp.Title).IsRequired().HasMaxLength(200);
                entity.Property(mp => mp.TargetAudience).IsRequired().HasMaxLength(100);
                entity.Property(mp => mp.TotalPrice).HasPrecision(18, 2);

                // Convert list of strings to semicolon-separated strings in DB
                entity.Property(mp => mp.Dishes)
                    .HasConversion(
                        v => string.Join(';', v),
                        v => v.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList()
                    );

                entity.Property(mp => mp.Features)
                    .HasConversion(
                        v => string.Join(';', v),
                        v => v.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList()
                    );
            });

            // MealPlanIngredient configuration (Many-to-Many)
            modelBuilder.Entity<MealPlanIngredient>(entity =>
            {
                entity.HasKey(mpi => new { mpi.MealPlanId, mpi.ProductId });

                entity.HasOne(mpi => mpi.MealPlan)
                    .WithMany(mp => mp.MealPlanIngredients)
                    .HasForeignKey(mpi => mpi.MealPlanId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(mpi => mpi.Product)
                    .WithMany(p => p.MealPlanIngredients)
                    .HasForeignKey(mpi => mpi.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Cart configuration (One-to-One with User)
            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Id).ValueGeneratedNever();

                entity.HasOne(c => c.User)
                    .WithOne(u => u.Cart)
                    .HasForeignKey<Cart>(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // CartItem configuration
            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.HasKey(ci => ci.Id);

                entity.HasOne(ci => ci.Cart)
                    .WithMany(c => c.CartItems)
                    .HasForeignKey(ci => ci.CartId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ci => ci.Product)
                    .WithMany(p => p.CartItems)
                    .HasForeignKey(ci => ci.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Order configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(o => o.Id);
                entity.Property(o => o.Id).ValueGeneratedNever();
                entity.Property(o => o.TotalAmount).HasPrecision(18, 2);
                entity.Property(o => o.ShippingAddress).IsRequired().HasMaxLength(500);
                entity.Property(o => o.PhoneNumber).IsRequired().HasMaxLength(20);
                entity.Property(o => o.ReceiverName).IsRequired().HasMaxLength(200);
                entity.Property(o => o.Notes).HasMaxLength(1000);
                entity.Property(o => o.CheckoutUrl).HasMaxLength(2000);
                entity.Property(o => o.Status).HasConversion<string>();
                entity.Property(o => o.PaymentStatus).HasConversion<string>();

                entity.HasOne(o => o.User)
                    .WithMany(u => u.Orders)
                    .HasForeignKey(o => o.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // OrderItem configuration
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(oi => oi.Id);
                entity.Property(oi => oi.Price).HasPrecision(18, 2);
                entity.Property(oi => oi.ProductName).IsRequired().HasMaxLength(200);

                entity.HasOne(oi => oi.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(oi => oi.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(oi => oi.Product)
                    .WithMany(p => p.OrderItems)
                    .HasForeignKey(oi => oi.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
