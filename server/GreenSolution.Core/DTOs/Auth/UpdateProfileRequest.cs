namespace GreenSolution.Core.DTOs.Auth
{
    public class UpdateProfileRequest
    {
        public string Name { get; set; } = null!;
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }
}
